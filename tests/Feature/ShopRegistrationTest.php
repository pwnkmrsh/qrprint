<?php

use App\Models\PrintAgent;
use App\Models\Shop;
use App\Models\User;

test('guest cannot access shop registration page and is redirected to login', function () {
    $response = $this->get(route('shop.register'));

    $response->assertRedirect(route('login'));
});

test('authenticated user without shop can view shop registration screen', function () {
    $user = User::factory()->create([
        'email_verified_at' => now(),
    ]);

    $response = $this->actingAs($user)->get(route('shop.register'));

    $response->assertStatus(200);
});

test('authenticated user with existing shop is redirected to shop dashboard', function () {
    $user = User::factory()->create([
        'email_verified_at' => now(),
    ]);

    Shop::create([
        'user_id' => $user->id,
        'shop_name' => 'City Fast Print',
        'mobile' => '9876543210',
        'address' => 'Main Market',
        'city' => 'Pune',
        'state' => 'Maharashtra',
        'pincode' => '411001',
        'status' => 'active',
    ]);

    $response = $this->actingAs($user)->get(route('shop.register'));

    $response->assertRedirect(route('shop.dashboard'));
});

test('7. authenticated user can create shop with valid details and initializes shop settings and qr point', function () {
    $user = User::factory()->create([
        'name' => 'Original Name',
        'email' => 'shopcreator@example.com',
        'email_verified_at' => now(),
    ]);

    $response = $this->actingAs($user)->post(route('shop.register.store'), [
        'shop_name' => 'Express Print & Copy',
        'owner_name' => 'Updated Owner Name',
        'mobile' => '9898989898',
        'address' => 'Shop 12, Galaxy Plaza, MG Road',
        'city' => 'Bengaluru',
        'state' => 'Karnataka',
        'pincode' => '560001',
    ]);

    $response->assertRedirect(route('shop.dashboard'));
    $response->assertSessionHas('success');

    // Assert Shop is stored in database
    $shop = Shop::where('user_id', $user->id)->first();
    expect($shop)->not->toBeNull();
    expect($shop->shop_name)->toBe('Express Print & Copy');
    expect($shop->mobile)->toBe('9898989898');
    expect($shop->address)->toBe('Shop 12, Galaxy Plaza, MG Road');
    expect($shop->city)->toBe('Bengaluru');
    expect($shop->state)->toBe('Karnataka');
    expect($shop->pincode)->toBe('560001');
    expect($shop->status)->toBe('active');

    // Assert User name is updated
    expect($user->fresh()->name)->toBe('Updated Owner Name');

    // Assert QrPrint and ShopSetting auto-provisioned
    expect($user->fresh()->qrPrint)->not->toBeNull();
    expect($user->fresh()->shopSetting)->not->toBeNull();
    expect($user->fresh()->shopSetting->shop_name)->toBe('Express Print & Copy');
});

test('8. duplicate shop registration is prevented for user with existing shop', function () {
    $user = User::factory()->create([
        'email_verified_at' => now(),
    ]);

    Shop::create([
        'user_id' => $user->id,
        'shop_name' => 'Original Shop',
        'mobile' => '9111111111',
        'address' => 'First Address',
        'city' => 'Delhi',
        'state' => 'Delhi',
        'pincode' => '110001',
        'status' => 'active',
    ]);

    $response = $this->actingAs($user)->post(route('shop.register.store'), [
        'shop_name' => 'Second Shop Attempt',
        'owner_name' => 'Same Owner',
        'mobile' => '9222222222',
        'address' => 'Second Address',
        'city' => 'Delhi',
        'state' => 'Delhi',
        'pincode' => '110002',
    ]);

    $response->assertRedirect(route('shop.dashboard'));
    $response->assertSessionHas('error');

    // Assert only one shop exists for this user
    expect(Shop::where('user_id', $user->id)->count())->toBe(1);
    expect(Shop::where('user_id', $user->id)->first()->shop_name)->toBe('Original Shop');
});

test('shop registration validates required fields and formats', function () {
    $user = User::factory()->create([
        'email_verified_at' => now(),
    ]);

    $response = $this->actingAs($user)->post(route('shop.register.store'), [
        'shop_name' => '',
        'owner_name' => '',
        'mobile' => 'invalid-phone',
        'address' => '',
        'city' => '',
        'state' => '',
        'pincode' => 'invalid-pincode',
    ]);

    $response->assertSessionHasErrors([
        'shop_name',
        'owner_name',
        'mobile',
        'address',
        'city',
        'state',
        'pincode',
    ]);
});

test('10. User -> Shop -> PrintAgent relationships work accurately', function () {
    $user = User::factory()->create();

    $shop = Shop::create([
        'user_id' => $user->id,
        'shop_name' => 'Cyber Cafe & Prints',
        'mobile' => '9876543210',
        'address' => 'Tech Park Sector 5',
        'city' => 'Kolkata',
        'state' => 'West Bengal',
        'pincode' => '700091',
        'status' => 'active',
    ]);

    $agent1 = PrintAgent::create([
        'shop_id' => $shop->id,
        'agent_id' => 'AGENT-KOL-001',
        'name' => 'Desk 1 HP LaserJet Agent',
        'status' => 'online',
        'last_seen_at' => now(),
    ]);

    $agent2 = PrintAgent::create([
        'shop_id' => $shop->id,
        'agent_id' => 'AGENT-KOL-002',
        'name' => 'Desk 2 Canon Color Agent',
        'status' => 'offline',
        'last_seen_at' => now()->subMinutes(10),
    ]);

    // Test User -> Shop relationship
    expect($user->shop)->not->toBeNull();
    expect($user->shop->id)->toBe($shop->id);
    expect($user->shop->shop_name)->toBe('Cyber Cafe & Prints');

    // Test Shop -> User relationship
    expect($shop->user)->not->toBeNull();
    expect($shop->user->id)->toBe($user->id);

    // Test Shop -> PrintAgents relationship
    expect($shop->printAgents)->toHaveCount(2);
    expect($shop->printAgents->pluck('agent_id')->toArray())->toContain('AGENT-KOL-001', 'AGENT-KOL-002');

    // Test PrintAgent -> Shop relationship
    expect($agent1->shop)->not->toBeNull();
    expect($agent1->shop->id)->toBe($shop->id);
    expect($agent2->shop->id)->toBe($shop->id);
});
