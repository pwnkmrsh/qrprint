<?php

namespace Tests\Feature;

use App\Models\PrintAgent;
use App\Models\PrintDocument;
use App\Models\Printer;
use App\Models\PrintJob;
use App\Models\PrintSession;
use App\Models\QrPrint;
use App\Models\Role;
use App\Models\Shop;
use App\Models\ShopSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SuperAdminShopAndJobManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $superAdmin;
    protected User $shopOwner;
    protected QrPrint $shopQr;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::create(['name' => 'super-admin', 'display_name' => 'Super Admin']);
        $shopOwnerRole = Role::create(['name' => 'shop-owner', 'display_name' => 'Shop Owner']);

        $this->superAdmin = User::factory()->create([
            'email' => 'admin@qrprint.test',
        ]);
        $this->superAdmin->roles()->attach($adminRole);

        $this->shopOwner = User::factory()->create([
            'email' => 'owner@shop.test',
            'name' => 'Test Owner',
        ]);
        $this->shopOwner->roles()->attach($shopOwnerRole);

        $shop = Shop::create([
            'user_id' => $this->shopOwner->id,
            'shop_name' => 'Apex Print Corner',
            'mobile' => '9876543210',
            'address' => '123 Market St',
            'city' => 'Mumbai',
            'state' => 'Maharashtra',
            'pincode' => '400001',
            'status' => 'active',
        ]);

        $this->shopQr = QrPrint::create([
            'user_id' => $this->shopOwner->id,
            'title' => 'Apex Print Corner',
            'print_token' => 'APEX_TOKEN_1234',
            'is_active' => true,
        ]);

        ShopSetting::create([
            'user_id' => $this->shopOwner->id,
            'qr_print_id' => $this->shopQr->id,
            'shop_name' => 'Apex Print Corner',
            'mobile_number' => '9876543210',
            'address' => '123 Market St',
            'bw_price_per_page' => 2.5,
            'color_price_per_page' => 12.0,
            'scanner_price_per_page' => 6.0,
            'online_payment_enabled' => true,
            'counter_payment_enabled' => true,
            'gateway_provider' => 'cashfree',
        ]);
    }

    public function test_super_admin_can_view_shops_index_and_filter()
    {
        $response = $this->actingAs($this->superAdmin)->get(route('admin.shops.index', ['status' => 'active']));
        $response->assertOk();
        $response->assertInertia(fn($page) => $page
            ->component('admin/shops/index')
            ->has('shops.data', 1)
            ->where('stats.active_shops', 1)
        );
    }

    public function test_super_admin_can_toggle_shop_active_status()
    {
        $response = $this->actingAs($this->superAdmin)->post(route('admin.shops.toggle-active', $this->shopQr->id));
        $response->assertRedirect();

        $this->shopQr->refresh();
        $this->assertFalse((bool)$this->shopQr->is_active);

        $shop = $this->shopOwner->shop()->first();
        $this->assertEquals('inactive', $shop->status);

        // Toggle back to active
        $response = $this->actingAs($this->superAdmin)->post(route('admin.shops.toggle-active', $this->shopQr->id));
        $response->assertRedirect();

        $this->shopQr->refresh();
        $this->assertTrue((bool)$this->shopQr->is_active);

        $shop->refresh();
        $this->assertEquals('active', $shop->status);
    }

    public function test_super_admin_can_view_shop_details_and_update_rates()
    {
        $agent = PrintAgent::create([
            'shop_id' => $this->shopOwner->shop->id,
            'agent_id' => 'agent_apex_01',
            'name' => 'Shop Front Desktop',
            'status' => 'online',
        ]);

        Printer::create([
            'agent_id' => $agent->agent_id,
            'qr_print_id' => $this->shopQr->id,
            'name' => 'HP LaserJet Pro',
            'status' => 'online',
            'is_default' => true,
        ]);

        $response = $this->actingAs($this->superAdmin)->get(route('admin.shops.show', $this->shopQr->id));
        $response->assertOk();
        $response->assertInertia(fn($page) => $page
            ->component('admin/shops/show')
            ->where('shop.title', 'Apex Print Corner')
            ->has('shop.printers', 1)
        );

        $updateResponse = $this->actingAs($this->superAdmin)->put(route('admin.shops.update', $this->shopQr->id), [
            'title' => 'Apex Print Corner Premium',
            'is_active' => true,
            'mobile_number' => '9111122222',
            'address' => '456 Commercial Blvd',
            'bw_price_per_page' => 3.0,
            'color_price_per_page' => 15.0,
            'scanner_price_per_page' => 7.0,
        ]);

        $updateResponse->assertRedirect();
        $this->shopQr->refresh();
        $this->assertEquals('Apex Print Corner Premium', $this->shopQr->title);

        $setting = $this->shopQr->shopSetting()->first();
        $this->assertEquals(3.0, $setting->bw_price_per_page);
        $this->assertEquals(15.0, $setting->color_price_per_page);
    }

    public function test_super_admin_can_manage_print_jobs_and_actions()
    {
        $session = PrintSession::create([
            'qr_print_id' => $this->shopQr->id,
            'total_files' => 1,
            'total_pages' => 2,
            'total_amount' => 5.0,
            'payment_status' => 'paid',
            'payment_method' => 'online',
            'status' => 'ready_for_print',
        ]);

        $document = PrintDocument::create([
            'qr_print_id' => $this->shopQr->id,
            'original_name' => 'Report.pdf',
            'stored_name' => 'Report.pdf',
            'mime_type' => 'application/pdf',
            'file_size' => 1024,
            'disk' => 'local',
            'path' => 'documents/report.pdf',
            'file_type' => 'pdf',
        ]);

        $job = PrintJob::create([
            'print_session_id' => $session->id,
            'print_document_id' => $document->id,
            'printer_name' => 'HP LaserJet',
            'copies' => 1,
            'color_mode' => 'bw',
            'paper_size' => 'A4',
            'duplex' => 'simplex',
            'status' => 'failed',
            'error_message' => 'Paper jam',
        ]);

        // 1. View print jobs index
        $response = $this->actingAs($this->superAdmin)->get(route('admin.print-jobs.index', ['shop_id' => $this->shopQr->id]));
        $response->assertOk();
        $response->assertInertia(fn($page) => $page
            ->component('admin/print-jobs/index')
            ->has('jobs.data', 1)
        );

        // 2. Retry failed job
        $retryResponse = $this->actingAs($this->superAdmin)->post(route('admin.print-jobs.retry', $job->id));
        $retryResponse->assertRedirect();
        $job->refresh();
        $this->assertEquals('pending', $job->status);
        $this->assertNull($job->error_message);

        // 3. Mark complete / printed
        $completeResponse = $this->actingAs($this->superAdmin)->post(route('admin.print-jobs.complete', $job->id));
        $completeResponse->assertRedirect();
        $job->refresh();
        $this->assertEquals('printed', $job->status);
        $this->assertNotNull($job->printed_at);

        // 4. Cancel job
        $cancelJob = PrintJob::create([
            'print_session_id' => $session->id,
            'print_document_id' => $document->id,
            'status' => 'pending',
        ]);
        $cancelResponse = $this->actingAs($this->superAdmin)->post(route('admin.print-jobs.cancel', $cancelJob->id));
        $cancelResponse->assertRedirect();
        $cancelJob->refresh();
        $this->assertEquals('cancelled', $cancelJob->status);
    }
}
