<?php

namespace Tests\Feature;

use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\Page;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\PageAndMenuSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PageAndMenuManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_public_can_view_published_cms_page(): void
    {
        $response = $this->get('/p/how-it-works');
        $response->assertStatus(200);
    }

    public function test_public_cannot_view_draft_page(): void
    {
        $draftPage = Page::create([
            'title' => 'Draft Secret Page',
            'slug' => 'draft-secret-page',
            'content' => '<p>Secret Content</p>',
            'template' => 'default',
            'status' => 'draft',
        ]);

        $response = $this->get('/p/draft-secret-page');
        $response->assertStatus(404);
    }

    public function test_super_admin_can_preview_draft_page(): void
    {
        $superAdmin = User::where('email', 'superadmin@example.com')->first();
        if (!$superAdmin) {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super-admin');
        }

        $draftPage = Page::create([
            'title' => 'Admin Draft Preview',
            'slug' => 'admin-draft-preview',
            'content' => '<p>Work In Progress</p>',
            'template' => 'default',
            'status' => 'draft',
        ]);

        $response = $this->actingAs($superAdmin)->get('/p/admin-draft-preview');
        $response->assertStatus(200);
    }

    public function test_super_admin_can_access_pages_and_menus_modules(): void
    {
        $superAdmin = User::where('email', 'superadmin@example.com')->first();
        if (!$superAdmin) {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super-admin');
        }

        $response = $this->actingAs($superAdmin)->get('/pages');
        $response->assertStatus(200);

        $response = $this->actingAs($superAdmin)->get('/menus');
        $response->assertStatus(200);
    }

    public function test_admin_can_create_and_publish_new_page(): void
    {
        $superAdmin = User::where('email', 'superadmin@example.com')->first();
        if (!$superAdmin) {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super-admin');
        }

        $response = $this->actingAs($superAdmin)->post('/pages', [
            'title' => 'New Partner Guide',
            'slug' => 'new-partner-guide',
            'subtitle' => 'Comprehensive guide for partners',
            'content' => '<p>Welcome to our partner guide.</p>',
            'template' => 'default',
            'status' => 'published',
            'meta_title' => 'Partner Guide — QRPrintSetu',
            'meta_description' => 'Learn how to partner with QRPrintSetu to monetize your network.',
            'is_indexable' => true,
        ]);

        $response->assertRedirect('/pages');
        $this->assertDatabaseHas('pages', [
            'slug' => 'new-partner-guide',
            'status' => 'published',
        ]);
    }

    public function test_admin_can_toggle_page_status(): void
    {
        $superAdmin = User::where('email', 'superadmin@example.com')->first();
        if (!$superAdmin) {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super-admin');
        }

        $page = Page::where('slug', 'how-it-works')->first();
        $this->assertEquals('published', $page->status);

        $response = $this->actingAs($superAdmin)->post("/pages/{$page->id}/toggle-status");
        $response->assertStatus(302);

        $this->assertEquals('draft', $page->fresh()->status);
    }

    public function test_admin_can_add_menu_item(): void
    {
        $superAdmin = User::where('email', 'superadmin@example.com')->first();
        if (!$superAdmin) {
            $superAdmin = User::factory()->create();
            $superAdmin->assignRole('super-admin');
        }

        $menu = Menu::where('location', 'header')->first();

        $response = $this->actingAs($superAdmin)->post('/menus/items', [
            'menu_id' => $menu->id,
            'title' => 'Live Demo',
            'url_type' => 'custom',
            'url' => 'https://demo.printsetu.in',
            'icon' => 'Sparkles',
            'badge' => 'Hot',
            'target' => '_blank',
            'is_active' => true,
        ]);

        $response->assertStatus(302);
        $this->assertDatabaseHas('menu_items', [
            'menu_id' => $menu->id,
            'title' => 'Live Demo',
            'badge' => 'Hot',
        ]);
    }
}
