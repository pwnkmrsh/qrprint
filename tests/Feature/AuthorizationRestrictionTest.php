<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthorizationRestrictionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_super_admin_can_access_all_admin_modules(): void
    {
        // Central Super Admin is seeded by default in DatabaseSeeder
        $superAdmin = User::where('email', 'pwnkmrsh@gmail.com')->first();

        // Check CMS Pages
        $response = $this->actingAs($superAdmin)->get('/pages');
        $response->assertStatus(200);

        // Check Menu Manager
        $response = $this->actingAs($superAdmin)->get('/menus');
        $response->assertStatus(200);

        // Check Roles
        $response = $this->actingAs($superAdmin)->get('/roles');
        $response->assertStatus(200);

        // Check Permissions
        $response = $this->actingAs($superAdmin)->get('/permissions');
        $response->assertStatus(200);

        // Check Users
        $response = $this->actingAs($superAdmin)->get('/users');
        $response->assertStatus(200);
    }

    public function test_shop_owner_is_denied_access_to_admin_modules(): void
    {
        // Shop Owner is seeded by default in DatabaseSeeder
        $shopOwner = User::where('email', 'owner@example.com')->first();

        // Denied CMS Pages
        $response = $this->actingAs($shopOwner)->get('/pages');
        $response->assertStatus(403);

        // Denied Menu Manager
        $response = $this->actingAs($shopOwner)->get('/menus');
        $response->assertStatus(403);

        // Denied Roles
        $response = $this->actingAs($shopOwner)->get('/roles');
        $response->assertStatus(403);

        // Denied Permissions
        $response = $this->actingAs($shopOwner)->get('/permissions');
        $response->assertStatus(403);

        // Denied Users
        $response = $this->actingAs($shopOwner)->get('/users');
        $response->assertStatus(403);
    }

    public function test_shop_owner_can_access_shop_settings_and_printers(): void
    {
        $shopOwner = User::where('email', 'owner@example.com')->first();

        // Access Shop Dashboard
        $response = $this->actingAs($shopOwner)->get('/shop/dashboard');
        $response->assertStatus(200);

        // Access Printer Settings
        $response = $this->actingAs($shopOwner)->get('/shop/printers');
        $response->assertStatus(200);

        // Access Shop Settings
        $response = $this->actingAs($shopOwner)->get('/shop/settings');
        $response->assertStatus(200);

        // Access Job History
        $response = $this->actingAs($shopOwner)->get('/shop/jobs');
        $response->assertStatus(200);
    }

    public function test_shop_owner_only_sees_their_own_qr_prints_and_unauthorized_is_forbidden(): void
    {
        $shopOwner1 = User::where('email', 'owner@example.com')->first();

        // Create Shop Owner 2
        $shopOwner2 = User::create([
            'name' => 'Owner Two',
            'email' => 'owner2@example.com',
            'password' => bcrypt('password'),
        ]);
        $shopOwner2->assignRole('SHOP OWNER');
        $shopOwner2->assignRole('admin');

        // Create QRs for each owner
        $qr1 = \App\Models\QrPrint::create([
            'user_id' => $shopOwner1->id,
            'title' => 'Shop One QR',
            'content' => 'Content One',
        ]);

        $qr2 = \App\Models\QrPrint::create([
            'user_id' => $shopOwner2->id,
            'title' => 'Shop Two QR',
            'content' => 'Content Two',
        ]);

        // Owner 1 index should see only QR 1
        $response = $this->actingAs($shopOwner1)->get('/qr-print');
        $response->assertStatus(200);
        
        $prints = $response->viewData('page')['props']['prints'];
        $printIds = collect($prints)->pluck('id');
        
        $this->assertTrue($printIds->contains($qr1->id));
        $this->assertFalse($printIds->contains($qr2->id));

        // Owner 1 trying to load Owner 2's QR SVG should get a 403
        $response = $this->actingAs($shopOwner1)->get("/qr-print/{$qr2->id}/qr");
        $response->assertStatus(403);

        // Owner 1 trying to load their own QR SVG should get a 200
        $response = $this->actingAs($shopOwner1)->get("/qr-print/{$qr1->id}/qr");
        $response->assertStatus(200);

        // Super Admin should see all QRs
        $superAdmin = User::where('email', 'pwnkmrsh@gmail.com')->first();
        $response = $this->actingAs($superAdmin)->get('/qr-print');
        $response->assertStatus(200);
        
        $allPrints = $response->viewData('page')['props']['prints'];
        $allPrintIds = collect($allPrints)->pluck('id');
        
        $this->assertTrue($allPrintIds->contains($qr1->id));
        $this->assertTrue($allPrintIds->contains($qr2->id));
    }

    public function test_super_admin_can_access_and_update_system_settings_while_shop_owner_is_denied(): void
    {
        $this->withoutExceptionHandling();
        $routes = collect(\Route::getRoutes())->map(function ($route) {
            return $route->uri();
        })->toArray();
        dd($routes);
        $superAdmin = User::where('email', 'pwnkmrsh@gmail.com')->first();
        $shopOwner = User::where('email', 'owner@example.com')->first();

        // 1. Shop Owner is denied view
        $response = $this->actingAs($shopOwner)->get('/admin/settings');
        $response->assertStatus(403);

        // 2. Shop Owner is denied update
        $response = $this->actingAs($shopOwner)->post('/admin/settings', [
            'support_mobile' => '918888888888',
            'support_email' => 'hacked@hack.com',
        ]);
        $response->assertStatus(403);

        // 3. Super Admin is allowed view
        $response = $this->actingAs($superAdmin)->get('/admin/settings');
        $response->assertStatus(200);

        // 4. Super Admin is allowed update
        $response = $this->actingAs($superAdmin)->post('/admin/settings', [
            'support_mobile' => '919876543210',
            'support_email' => 'newsupport@printsetu.com',
        ]);
        $response->assertStatus(302); // Redirect back
        
        $this->assertEquals('919876543210', \App\Models\SystemSetting::get('support_mobile'));
        $this->assertEquals('newsupport@printsetu.com', \App\Models\SystemSetting::get('support_email'));
    }
}
