<?php

use App\Models\User;
use App\Models\QrPrint;
use App\Models\PrintDocument;
use App\Models\PrintSession;
use App\Models\PrintJob;

test('counter payment workflow creates pending payments and releases them upon validation', function () {
    // 1. Setup shop owner and shop (QrPrint)
    $owner = User::factory()->create();
    $qrPrint = QrPrint::create([
        'user_id' => $owner->id,
        'uuid' => (string) Illuminate\Support\Str::uuid(),
        'title' => 'Test Cafe',
        'print_token' => 'test-print-cafe',
        'is_active' => true,
    ]);

    // 2. Create a document
    $doc = PrintDocument::create([
        'qr_print_id' => $qrPrint->id,
        'original_name' => 'test_invoice.pdf',
        'stored_name' => 'test-stored.pdf',
        'mime_type' => 'application/pdf',
        'file_size' => 1024,
        'disk' => 'public',
        'path' => 'print-documents/test-stored.pdf',
        'file_type' => 'pdf',
        'metadata' => ['page_count' => 2],
        'status' => 'ready',
    ]);

    // 3. Create a counter payment print session via API / simulated store
    // Let's act as guest customer to configure print jobs and create session
    $response = $this->post(route('qr-print.session.create', $qrPrint->print_token), [
        'payment_method' => 'counter',
        'files' => [
            [
                'document_id' => $doc->id,
                'copies' => 2,
                'color_mode' => 'bw',
                'paper_size' => 'A4',
                'duplex' => 'off',
            ]
        ]
    ]);

    $response->assertRedirect();
    $session = PrintSession::first();

    // Verify session state
    expect($session->payment_status)->toBe('pending');
    expect($session->print_status)->toBe('pending_payment');
    expect($session->total_amount)->toEqual(8.00); // 2 pages * 2 copies * ₹2/page (default rates)

    // Verify print job state
    $job = PrintJob::first();
    expect($job->status)->toBe('pending_payment');

    // 4. Verify print agent cannot retrieve the job (should return empty list)
    $agentResponse = $this->get('/api/print-agent/jobs?agent_id=AGENT-001');
    $agentResponse->assertOk();
    $agentJobs = $agentResponse->json('jobs');
    expect($agentJobs)->toBeEmpty();

    // 5. Shop owner logs in and collects payment
    $this->actingAs($owner);

    // Call collect-payment route
    $collectResponse = $this->post(route('dashboard.session.collect-payment', $session->id), [
        'payment_method' => 'cash',
    ]);

    $collectResponse->assertRedirect();
    
    // Refresh models from DB
    $session->refresh();
    $job->refresh();

    // Verify database values updated
    expect($session->payment_status)->toBe('paid');
    expect($session->payment_method)->toBe('cash');
    expect($session->print_status)->toBe('ready_to_print');
    expect($session->paid_by)->toBe($owner->id);
    expect($session->paid_at)->not->toBeNull();

    // Verify job is now pending
    expect($job->status)->toBe('pending');

    // 6. Verify print agent can now retrieve the job
    $agentResponse = $this->get('/api/print-agent/jobs?agent_id=AGENT-001');
    $agentJobs = $agentResponse->json('jobs');
    expect($agentJobs)->toHaveCount(1);
    expect($agentJobs[0]['uuid'])->toBe($job->uuid);
});

test('print session handles partial failures and retries correctly', function () {
    // 1. Setup shop owner, shop (QrPrint), and multiple documents
    $owner = User::factory()->create();
    $qrPrint = QrPrint::create([
        'user_id' => $owner->id,
        'uuid' => (string) Illuminate\Support\Str::uuid(),
        'title' => 'Test Cafe',
        'print_token' => 'test-print-cafe-2',
        'is_active' => true,
    ]);

    $doc1 = PrintDocument::create([
        'qr_print_id' => $qrPrint->id,
        'original_name' => 'doc1.pdf',
        'stored_name' => 'stored1.pdf',
        'mime_type' => 'application/pdf',
        'file_size' => 1024,
        'disk' => 'public',
        'path' => 'print-documents/stored1.pdf',
        'file_type' => 'pdf',
        'metadata' => ['page_count' => 1],
        'status' => 'ready',
    ]);

    $doc2 = PrintDocument::create([
        'qr_print_id' => $qrPrint->id,
        'original_name' => 'doc2.pdf',
        'stored_name' => 'stored2.pdf',
        'mime_type' => 'application/pdf',
        'file_size' => 1024,
        'disk' => 'public',
        'path' => 'print-documents/stored2.pdf',
        'file_type' => 'pdf',
        'metadata' => ['page_count' => 1],
        'status' => 'ready',
    ]);

    // 2. Create session with 2 files (online payment to make them active immediately)
    $response = $this->post(route('qr-print.session.create', $qrPrint->print_token), [
        'payment_method' => 'online',
        'files' => [
            [
                'document_id' => $doc1->id,
                'copies' => 1,
                'color_mode' => 'bw',
                'paper_size' => 'A4',
                'duplex' => 'off',
            ],
            [
                'document_id' => $doc2->id,
                'copies' => 1,
                'color_mode' => 'bw',
                'paper_size' => 'A4',
                'duplex' => 'off',
            ]
        ]
    ]);

    $response->assertRedirect();
    $session = PrintSession::orderBy('id', 'desc')->first();
    expect($session->total_files)->toBe(2);
    expect($session->status)->toBe('pending_payment');

    // Confirm payment via PaymentManagerService
    app(\App\Services\PaymentManagerService::class)->recordOnlineSuccess($session, [
        'order_id' => 'ord_multi_test_123',
        'order_amount' => 4.00,
        'payment_method' => 'online',
    ], 'cashfree');
    $session->refresh();
    expect($session->status)->toBe('ready');

    // 3. Print Agent claims both jobs (sets status to printing)
    $agentResponse = $this->get('/api/print-agent/jobs?agent_id=AGENT-001');
    $agentResponse->assertOk();
    
    $session->refresh();
    expect($session->status)->toBe('printing');
    expect($session->print_status)->toBe('printing');

    // Get the two print jobs
    $jobs = PrintJob::where('print_session_id', $session->id)->get();
    expect($jobs)->toHaveCount(2);

    $job1 = $jobs[0];
    $job2 = $jobs[1];

    // 4. Job 1 succeeds, Job 2 fails
    $completeResponse = $this->post("/api/print-agent/jobs/{$job1->id}/complete");
    $completeResponse->assertOk();

    $session->refresh();
    expect($session->status)->toBe('printing'); // still has failed/printing files

    $failResponse = $this->post("/api/print-agent/jobs/{$job2->id}/failed", [
        'error_message' => 'Printer error',
    ]);
    $failResponse->assertOk();

    $session->refresh();
    // Verify session enters partial_failed status
    expect($session->status)->toBe('partial_failed');
    expect($session->print_status)->toBe('partial_failed');
    expect($session->completed_files)->toBe(1);
    expect($session->failed_files)->toBe(1);

    // 5. Retry the failed Job 2 from Dashboard
    $this->actingAs($owner);
    $retryResponse = $this->post(route('dashboard.job.retry', $job2->id));
    $retryResponse->assertRedirect();

    // Verify session resets status back to printing
    $session->refresh();
    $job2->refresh();

    expect($job2->status)->toBe('pending');
    expect($session->status)->toBe('printing');
    expect($session->print_status)->toBe('printing');
});

test('online payment session starts pending and activates print jobs only after server payment confirmation', function () {
    $owner = User::factory()->create();
    $qrPrint = QrPrint::create([
        'user_id' => $owner->id,
        'uuid' => (string) Illuminate\Support\Str::uuid(),
        'title' => 'Test Cyber Point',
        'print_token' => 'test-upi-cafe',
        'is_active' => true,
    ]);

    $doc = PrintDocument::create([
        'qr_print_id' => $qrPrint->id,
        'original_name' => 'test_upi_doc.pdf',
        'stored_name' => 'test-upi.pdf',
        'mime_type' => 'application/pdf',
        'file_size' => 2048,
        'disk' => 'public',
        'path' => 'print-documents/test-upi.pdf',
        'file_type' => 'pdf',
        'metadata' => ['page_count' => 3],
        'status' => 'ready',
    ]);

    $response = $this->post(route('qr-print.session.create', $qrPrint->print_token), [
        'payment_method' => 'upi',
        'files' => [
            [
                'document_id' => $doc->id,
                'copies' => 1,
                'color_mode' => 'bw',
                'paper_size' => 'A4',
                'duplex' => 'off',
            ]
        ]
    ]);

    $response->assertRedirect();
    $session = PrintSession::orderBy('id', 'desc')->first();
    expect($session->payment_method)->toBe('upi');
    expect($session->payment_status)->toBe('pending');
    expect($session->print_status)->toBe('pending_payment');
    expect($session->status)->toBe('pending_payment');
    expect($session->total_amount)->toEqual(6.00); // 3 pages * 1 copy * 2.00

    $job = PrintJob::where('print_session_id', $session->id)->first();
    expect($job->status)->toBe('pending_payment');
    expect($job->payment_method)->toBe('upi');

    // Verify print agent CANNOT pull the job yet
    $agentResponse = $this->get('/api/print-agent/jobs?agent_id=AGENT-001');
    $agentResponse->assertOk();
    $agentJobs = $agentResponse->json('jobs');
    expect(collect($agentJobs)->pluck('uuid'))->not->toContain($job->uuid);

    // Simulate server payment confirmation via PaymentManagerService
    app(\App\Services\PaymentManagerService::class)->recordOnlineSuccess($session, [
        'order_id' => 'ord_test_123',
        'cf_order_id' => '998877',
        'order_amount' => 6.00,
        'payment_method' => 'upi',
    ], 'cashfree');

    $session->refresh();
    $job->refresh();

    expect($session->payment_status)->toBe('paid');
    expect($session->print_status)->toBe('ready_to_print');
    expect($job->status)->toBe('pending');

    // Verify print agent CAN now retrieve the job
    $agentResponse = $this->get('/api/print-agent/jobs?agent_id=AGENT-001');
    $agentResponse->assertOk();
    $agentJobs = $agentResponse->json('jobs');
    expect(collect($agentJobs)->pluck('uuid'))->toContain($job->uuid);
});

test('shop owner can configure payment gateway provider and UPI settings', function () {
    $owner = User::factory()->create();
    $role = \App\Models\Role::firstOrCreate(['name' => 'SHOP OWNER', 'guard_name' => 'web']);
    $owner->assignRole($role);

    $qrPrint = QrPrint::create([
        'user_id' => $owner->id,
        'uuid' => (string) Illuminate\Support\Str::uuid(),
        'title' => 'Test Cafe Settings',
        'print_token' => 'test-cafe-settings',
        'is_active' => true,
    ]);

    $this->actingAs($owner);

    $response = $this->post(route('shop.settings.payment.update'), [
        'online_payment_enabled' => true,
        'counter_payment_enabled' => true,
        'show_currency' => true,
        'currency_symbol' => '₹',
        'payment_modes' => ['cash', 'upi', 'card', 'wallet'],
        'gateway_provider' => 'razorpay',
        'upi_id' => 'abcshop@okhdfcbank',
        'merchant_name' => 'ABC Print Point',
        'default_online_submode' => 'upi',
        'api_key_id' => 'rzp_live_testkey123',
        'secret_key' => 'secret_test_key_456',
        'webhook_secret' => 'whsec_test_789',
        'webhook_url' => 'http://localhost/api/payment/webhook/' . $qrPrint->uuid,
    ]);

    $response->assertRedirect();
    $setting = \App\Models\ShopSetting::where('qr_print_id', $qrPrint->id)->first();
    expect($setting)->not->toBeNull();
    expect($setting->gateway_provider)->toBe('razorpay');
    expect($setting->upi_id)->toBe('abcshop@okhdfcbank');
    expect($setting->merchant_name)->toBe('ABC Print Point');
    expect($setting->default_online_submode)->toBe('upi');
    expect($setting->api_key_id)->toBe('rzp_live_testkey123');
});
