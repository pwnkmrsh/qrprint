<?php

use App\Models\Payment;
use App\Models\Printer;
use App\Models\PrintDocument;
use App\Models\PrintJob;
use App\Models\PrintSession;
use App\Models\QrPrint;
use App\Models\ShopSetting;
use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

test('super admin can view and update global cashfree and general settings', function () {
    \App\Models\Role::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);
    $admin = User::factory()->create();
    $admin->assignRole('super-admin');

    $response = $this->actingAs($admin)->get(route('admin.settings.index'));
    $response->assertOk();

    // Update General Settings
    $generalRes = $this->actingAs($admin)->post(route('admin.settings.general'), [
        'app_name' => 'Print Setu Central',
        'currency_symbol' => '₹',
        'currency_code' => 'INR',
        'support_email' => 'help@printsetu.com',
        'support_phone' => '+91 99999 88888',
        'timezone' => 'Asia/Kolkata',
    ]);
    $generalRes->assertRedirect();
    expect(SystemSetting::get('app_name'))->toBe('Print Setu Central');

    // Update Cashfree Settings
    $cfRes = $this->actingAs($admin)->post(route('admin.settings.cashfree'), [
        'app_id' => 'test_cf_app_id_12345',
        'secret_key' => 'test_cf_secret_key_67890',
        'environment' => 'sandbox',
        'webhook_secret' => 'whsec_test_secret_abc',
    ]);
    $cfRes->assertRedirect();
    expect(SystemSetting::get('cashfree_app_id'))->toBe('test_cf_app_id_12345');
    expect(SystemSetting::get('cashfree_environment'))->toBe('sandbox');
});

test('cashfree order creation creates active order session', function () {
    Http::fake([
        'https://sandbox.cashfree.com/pg/orders' => Http::response([
            'order_id' => 'ord_test_session_123',
            'cf_order_id' => '10029384',
            'payment_session_id' => 'session_test_token_abc_123',
            'order_status' => 'ACTIVE',
        ], 200),
    ]);

    SystemSetting::set('cashfree_app_id', 'test_app_id', 'cashfree');
    SystemSetting::set('cashfree_secret_key', 'test_secret_key', 'cashfree');
    SystemSetting::set('cashfree_environment', 'sandbox', 'cashfree');

    $owner = User::factory()->create();
    $qrPrint = QrPrint::create([
        'user_id' => $owner->id,
        'uuid' => (string) Str::uuid(),
        'title' => 'Alpha Cyber Cafe',
        'print_token' => 'alpha-token-123',
        'is_active' => true,
    ]);

    $session = PrintSession::create([
        'qr_print_id' => $qrPrint->id,
        'total_files' => 1,
        'completed_files' => 0,
        'failed_files' => 0,
        'status' => 'pending_payment',
        'payment_method' => 'card',
        'payment_status' => 'pending',
        'print_status' => 'pending_payment',
        'total_amount' => 50.00,
        'currency' => '₹',
    ]);

    $response = $this->postJson(route('qr-print.cashfree.create-order', 'alpha-token-123'), [
        'session_uuid' => $session->uuid,
        'customer_name' => 'John Doe',
        'customer_phone' => '9876543210',
    ]);

    $response->assertOk()
        ->assertJson([
            'success' => true,
            'payment_session_id' => 'session_test_token_abc_123',
            'environment' => 'sandbox',
        ]);
});

test('cashfree webhook updates session to paid, creates payment record, and activates print jobs', function () {
    $secret = 'test_webhook_secret_key_123';
    SystemSetting::set('cashfree_app_id', 'app_123', 'cashfree');
    SystemSetting::set('cashfree_secret_key', $secret, 'cashfree');
    SystemSetting::set('cashfree_webhook_secret', $secret, 'cashfree');

    $owner = User::factory()->create();
    $qrPrint = QrPrint::create([
        'user_id' => $owner->id,
        'uuid' => (string) Str::uuid(),
        'title' => 'Beta Print Point',
        'print_token' => 'beta-token-456',
        'is_active' => true,
    ]);

    $session = PrintSession::create([
        'qr_print_id' => $qrPrint->id,
        'total_files' => 1,
        'completed_files' => 0,
        'failed_files' => 0,
        'status' => 'pending_payment',
        'payment_method' => 'cashfree',
        'payment_status' => 'pending',
        'print_status' => 'pending_payment',
        'total_amount' => 30.00,
        'currency' => 'INR',
    ]);

    $doc = PrintDocument::create([
        'qr_print_id' => $qrPrint->id,
        'original_name' => 'report.pdf',
        'stored_name' => 'rep.pdf',
        'mime_type' => 'application/pdf',
        'file_size' => 1000,
        'disk' => 'public',
        'path' => 'print-documents/rep.pdf',
        'file_type' => 'pdf',
        'status' => 'ready',
    ]);

    $job = PrintJob::create([
        'uuid' => (string) Str::uuid(),
        'print_session_id' => $session->id,
        'print_document_id' => $doc->id,
        'status' => 'pending_payment',
        'copies' => 1,
        'color_mode' => 'bw',
        'paper_size' => 'A4',
    ]);

    $timestamp = (string) time();
    $payloadData = [
        'type' => 'ORDER_PAID_WEBHOOK',
        'data' => [
            'order' => [
                'order_id' => 'ord_' . substr(preg_replace('/[^A-Za-z0-9_-]/', '', $session->uuid), 0, 30) . '_123',
                'order_amount' => 30.00,
                'order_currency' => 'INR',
                'cf_order_id' => '99887766',
                'order_tags' => [
                    'session_uuid' => $session->uuid,
                ],
            ],
            'payment' => [
                'cf_payment_id' => 'pay_55443322',
                'payment_group' => 'upi',
            ],
        ],
    ];

    $rawJson = json_encode($payloadData);
    $signature = base64_encode(hash_hmac('sha256', $timestamp . $rawJson, $secret, true));

    $response = $this->withHeaders([
        'x-webhook-signature' => $signature,
        'x-webhook-timestamp' => $timestamp,
        'Content-Type' => 'application/json',
    ])->postJson(route('payment.cashfree.webhook'), $payloadData);

    $response->assertOk()
        ->assertJson(['status' => 'OK']);

    $session->refresh();
    expect($session->payment_status)->toBe('paid');
    expect($session->print_status)->toBe('ready_to_print');

    $job->refresh();
    expect($job->status)->toBe('pending');

    $payment = Payment::where('print_session_id', $session->id)->first();
    expect($payment)->not->toBeNull();
    expect($payment->status)->toBe('success');
    expect($payment->gateway_payment_id)->toBe('pay_55443322');
});

test('print agent endpoint strictly excludes unpaid jobs and retrieves only paid jobs', function () {
    $owner = User::factory()->create();
    $qrPrint = QrPrint::create([
        'user_id' => $owner->id,
        'uuid' => (string) Str::uuid(),
        'title' => 'Agent Queue Shop',
        'print_token' => 'agent-test-token',
        'is_active' => true,
    ]);

    $doc = PrintDocument::create([
        'qr_print_id' => $qrPrint->id,
        'original_name' => 'invoice.pdf',
        'stored_name' => 'inv.pdf',
        'mime_type' => 'application/pdf',
        'file_size' => 1000,
        'disk' => 'public',
        'path' => 'print-documents/inv.pdf',
        'file_type' => 'pdf',
        'status' => 'ready',
    ]);

    // 1. UNPAID Session
    $unpaidSession = PrintSession::create([
        'qr_print_id' => $qrPrint->id,
        'total_files' => 1,
        'status' => 'pending_payment',
        'payment_status' => 'pending',
        'print_status' => 'pending_payment',
    ]);

    $unpaidJob = PrintJob::create([
        'uuid' => (string) Str::uuid(),
        'print_session_id' => $unpaidSession->id,
        'print_document_id' => $doc->id,
        'status' => 'pending', // Even if status was pending, session is unpaid
        'copies' => 1,
    ]);

    // 2. PAID Session
    $paidSession = PrintSession::create([
        'qr_print_id' => $qrPrint->id,
        'total_files' => 1,
        'status' => 'ready',
        'payment_status' => 'paid',
        'print_status' => 'ready_to_print',
    ]);

    $paidJob = PrintJob::create([
        'uuid' => (string) Str::uuid(),
        'print_session_id' => $paidSession->id,
        'print_document_id' => $doc->id,
        'status' => 'pending',
        'copies' => 2,
    ]);

    // Print agent polls for jobs
    $agentResponse = $this->getJson('/api/print-agent/jobs?agent_id=TEST-AGENT-1');
    $agentResponse->assertOk()
        ->assertJson(['success' => true]);

    $jobIds = collect($agentResponse->json('jobs'))->pluck('id');
    expect($jobIds)->toContain($paidJob->id);
    expect($jobIds)->not->toContain($unpaidJob->id);
});

test('counter payment collection creates payment record and activates print jobs', function () {
    $owner = User::factory()->create();
    $qrPrint = QrPrint::create([
        'user_id' => $owner->id,
        'uuid' => (string) Str::uuid(),
        'title' => 'Counter Shop',
        'print_token' => 'counter-token',
        'is_active' => true,
    ]);

    $session = PrintSession::create([
        'qr_print_id' => $qrPrint->id,
        'total_files' => 1,
        'status' => 'pending_payment',
        'payment_method' => 'counter',
        'payment_status' => 'pending',
        'print_status' => 'pending_payment',
        'total_amount' => 15.00,
        'currency' => '₹',
    ]);

    $doc = PrintDocument::create([
        'qr_print_id' => $qrPrint->id,
        'original_name' => 'resume.pdf',
        'stored_name' => 'res.pdf',
        'mime_type' => 'application/pdf',
        'file_size' => 1000,
        'disk' => 'public',
        'path' => 'print-documents/res.pdf',
        'file_type' => 'pdf',
        'status' => 'ready',
    ]);

    $job = PrintJob::create([
        'uuid' => (string) Str::uuid(),
        'print_session_id' => $session->id,
        'print_document_id' => $doc->id,
        'status' => 'pending_payment',
        'copies' => 1,
    ]);

    // Shop owner collects cash at counter
    $res = $this->actingAs($owner)->post(route('dashboard.session.collect-payment', $session), [
        'payment_method' => 'cash',
    ]);

    $res->assertRedirect();

    $session->refresh();
    expect($session->payment_status)->toBe('paid');
    expect($session->print_status)->toBe('ready_to_print');

    $job->refresh();
    expect($job->status)->toBe('pending');

    $payment = Payment::where('print_session_id', $session->id)->first();
    expect($payment)->not->toBeNull();
    expect($payment->payment_type)->toBe('counter');
    expect($payment->payment_method)->toBe('cash');
    expect($payment->amount)->toBe('15.00');
});

test('super admin payments hub displays payments and processes refunds', function () {
    \App\Models\Role::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);
    $admin = User::factory()->create();
    $admin->assignRole('super-admin');

    $owner = User::factory()->create();
    $qrPrint = QrPrint::create([
        'user_id' => $owner->id,
        'uuid' => (string) Str::uuid(),
        'title' => 'Refund Shop',
        'print_token' => 'refund-shop-token',
        'is_active' => true,
    ]);

    $session = PrintSession::create([
        'qr_print_id' => $qrPrint->id,
        'total_files' => 1,
        'status' => 'completed',
        'payment_method' => 'cashfree',
        'payment_status' => 'paid',
        'print_status' => 'completed',
        'total_amount' => 100.00,
        'currency' => '₹',
    ]);

    $payment = Payment::create([
        'print_session_id' => $session->id,
        'qr_print_id' => $qrPrint->id,
        'order_id' => $session->formatted_order_id,
        'payment_method' => 'cashfree',
        'payment_type' => 'online',
        'gateway' => 'cashfree',
        'gateway_order_id' => 'cf_order_refund_test',
        'amount' => 100.00,
        'currency' => 'INR',
        'status' => 'success',
        'paid_at' => now(),
    ]);

    // View payments hub
    $res = $this->actingAs($admin)->get(route('admin.payments.index'));
    $res->assertOk();

    // Process refund
    $refundRes = $this->actingAs($admin)->post(route('admin.payments.refund', $payment->id), [
        'amount' => 100.00,
        'reason' => 'Defective print / customer cancelled',
    ]);
    $refundRes->assertRedirect();

    $payment->refresh();
    expect($payment->status)->toBe('refunded');
    expect($payment->refund_amount)->toBe('100.00');
    expect($payment->refund_reason)->toBe('Defective print / customer cancelled');
});

test('client can verify payment status with server and activate print jobs', function () {
    Http::fake([
        'https://sandbox.cashfree.com/pg/orders/ord_verify_test_123' => Http::response([
            'order_id' => 'ord_verify_test_123',
            'cf_order_id' => '99887766',
            'order_status' => 'PAID',
            'order_amount' => 30.00,
            'order_currency' => 'INR',
        ], 200),
    ]);

    SystemSetting::set('cashfree_app_id', 'test_app_id', 'cashfree');
    SystemSetting::set('cashfree_secret_key', 'test_secret_key', 'cashfree');
    SystemSetting::set('cashfree_environment', 'sandbox', 'cashfree');

    $owner = User::factory()->create();
    $qrPrint = QrPrint::create([
        'user_id' => $owner->id,
        'uuid' => (string) Str::uuid(),
        'title' => 'Verify Test Point',
        'print_token' => 'verify-token-123',
        'is_active' => true,
    ]);

    $doc = PrintDocument::create([
        'qr_print_id' => $qrPrint->id,
        'original_name' => 'doc.pdf',
        'stored_name' => 'doc.pdf',
        'mime_type' => 'application/pdf',
        'file_size' => 1024,
        'disk' => 'public',
        'path' => 'print-documents/doc.pdf',
        'file_type' => 'pdf',
        'metadata' => ['page_count' => 1],
        'status' => 'ready',
    ]);

    $session = PrintSession::create([
        'qr_print_id' => $qrPrint->id,
        'total_files' => 1,
        'status' => 'pending_payment',
        'payment_method' => 'online',
        'payment_status' => 'pending',
        'print_status' => 'pending_payment',
        'total_amount' => 30.00,
        'currency' => '₹',
    ]);

    $job = PrintJob::create([
        'print_session_id' => $session->id,
        'print_document_id' => $doc->id,
        'copies' => 1,
        'color_mode' => 'bw',
        'paper_size' => 'A4',
        'status' => 'pending_payment',
        'amount' => 30.00,
    ]);

    $res = $this->postJson(route('qr-print.cashfree.verify', 'verify-token-123'), [
        'session_uuid' => $session->uuid,
        'order_id' => 'ord_verify_test_123',
    ]);

    $res->assertOk()
        ->assertJson([
            'success' => true,
            'is_paid' => true,
            'payment_status' => 'paid',
            'print_status' => 'ready_to_print',
        ]);

    $session->refresh();
    $job->refresh();

    expect($session->payment_status)->toBe('paid');
    expect($session->print_status)->toBe('ready_to_print');
    expect($job->status)->toBe('pending');
});
