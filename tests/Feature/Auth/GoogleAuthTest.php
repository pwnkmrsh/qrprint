<?php

use App\Models\Shop;
use App\Models\User;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    // Ensure 'SHOP OWNER' role exists in test database
    Role::firstOrCreate(['name' => 'SHOP OWNER', 'guard_name' => 'web']);
});

function mockGoogleUser(string $id, string $email, string $name, bool $emailVerified = true, ?string $avatar = 'https://lh3.googleusercontent.com/a/avatar.jpg')
{
    $abstractUser = Mockery::mock(SocialiteUser::class);
    $abstractUser->shouldReceive('getId')->andReturn($id);
    $abstractUser->shouldReceive('getEmail')->andReturn($email);
    $abstractUser->shouldReceive('getName')->andReturn($name);
    $abstractUser->shouldReceive('getNickname')->andReturn(null);
    $abstractUser->shouldReceive('getAvatar')->andReturn($avatar);
    $abstractUser->user = [
        'email_verified' => $emailVerified,
    ];

    $provider = Mockery::mock('Laravel\Socialite\Two\GoogleProvider');
    $provider->shouldReceive('user')->andReturn($abstractUser);

    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    return $abstractUser;
}

test('guest can initiate google oauth redirect', function () {
    $provider = Mockery::mock('Laravel\Socialite\Two\GoogleProvider');
    $provider->shouldReceive('redirect')->andReturn(redirect('https://accounts.google.com/o/oauth2/v2/auth'));
    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    $response = $this->get(route('auth.google'));

    $response->assertRedirect('https://accounts.google.com/o/oauth2/v2/auth');
});

test('1. new google user registration creates local user with verified email and redirects to shop register', function () {
    mockGoogleUser('google-uid-1001', 'newmerchant@example.com', 'Pawan Kumar', true);

    $response = $this->get(route('auth.google.callback'));

    $this->assertAuthenticated();

    $user = User::where('email', 'newmerchant@example.com')->first();
    expect($user)->not->toBeNull();
    expect($user->google_id)->toBe('google-uid-1001');
    expect($user->name)->toBe('Pawan Kumar');
    expect($user->email_verified_at)->not->toBeNull();
    expect($user->password)->toBeNull();
    expect($user->hasRole('SHOP OWNER'))->toBeTrue();

    $response->assertRedirect(route('shop.register'));
});

test('2. existing google user login with shop redirects to shop dashboard', function () {
    $user = User::factory()->create([
        'email' => 'existingowner@example.com',
        'google_id' => 'google-uid-1002',
    ]);

    Shop::create([
        'user_id' => $user->id,
        'shop_name' => 'Metro Xerox Center',
        'mobile' => '9876543210',
        'address' => 'Station Road',
        'city' => 'Mumbai',
        'state' => 'Maharashtra',
        'pincode' => '400001',
        'status' => 'active',
    ]);

    mockGoogleUser('google-uid-1002', 'existingowner@example.com', 'Existing Owner', true);

    $response = $this->get(route('auth.google.callback'));

    $this->assertAuthenticatedAs($user);
    $response->assertRedirect(route('shop.dashboard'));
});

test('3. existing google user without shop redirects to complete shop registration', function () {
    $user = User::factory()->create([
        'email' => 'noshopuser@example.com',
        'google_id' => 'google-uid-1003',
    ]);

    mockGoogleUser('google-uid-1003', 'noshopuser@example.com', 'No Shop User', true);

    $response = $this->get(route('auth.google.callback'));

    $this->assertAuthenticatedAs($user);
    $response->assertRedirect(route('shop.register'));
});

test('4. duplicate google id links to existing email account without duplicating record', function () {
    $existingUser = User::factory()->create([
        'email' => 'linkme@example.com',
        'google_id' => null,
    ]);

    mockGoogleUser('google-uid-1004', 'linkme@example.com', 'Link Me', true);

    $response = $this->get(route('auth.google.callback'));

    $this->assertAuthenticatedAs($existingUser);
    expect(User::where('email', 'linkme@example.com')->count())->toBe(1);
    expect($existingUser->fresh()->google_id)->toBe('google-uid-1004');
    $response->assertRedirect(route('shop.register'));
});

test('5. unverified google email is rejected and does not authenticate user', function () {
    mockGoogleUser('google-uid-unverified', 'unverified@example.com', 'Unverified User', false);

    $response = $this->get(route('auth.google.callback'));

    $this->assertGuest();
    expect(User::where('email', 'unverified@example.com')->first())->toBeNull();
    $response->assertRedirect(route('login'));
    $response->assertSessionHas('error', 'Your Google account email is not verified.');
});

test('6. oauth cancellation is handled gracefully', function () {
    $response = $this->get(route('auth.google.callback', ['error' => 'access_denied']));

    $this->assertGuest();
    $response->assertRedirect(route('login'));
    $response->assertSessionHas('error', 'Google authentication was cancelled.');
});

test('oauth exception does not expose sensitive details', function () {
    $provider = Mockery::mock('Laravel\Socialite\Two\GoogleProvider');
    $provider->shouldReceive('user')->andThrow(new \Exception('Invalid OAuth client secret token'));
    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    $response = $this->get(route('auth.google.callback'));

    $this->assertGuest();
    $response->assertRedirect(route('login'));
    $response->assertSessionHas('error', 'Unable to authenticate with Google. Please try again.');
});

test('9. authentication session is created upon successful google login', function () {
    mockGoogleUser('google-uid-session', 'sessionuser@example.com', 'Session User', true);

    $response = $this->get(route('auth.google.callback'));

    $this->assertAuthenticated();
    $user = User::where('email', 'sessionuser@example.com')->first();
    expect(auth()->id())->toBe($user->id);
});
