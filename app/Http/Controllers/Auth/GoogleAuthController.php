<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;
use Spatie\Permission\Models\Role;

class GoogleAuthController extends Controller
{
    /**
     * Redirect the user to the Google OAuth consent screen.
     */
    public function redirectToGoogle(): RedirectResponse
    {
        try {
            return Socialite::driver('google')->redirect();
        } catch (\Throwable $e) {
            Log::error('Google OAuth redirect error: ' . $e->getMessage());

            return redirect()->route('login')->with('error', 'Google authentication service is currently unavailable.');
        }
    }

    /**
     * Handle callback from Google OAuth.
     */
    public function handleGoogleCallback(Request $request): RedirectResponse
    {
        // 1. Handle user cancellation or OAuth query errors
        if ($request->has('error') || $request->input('denied')) {
            return redirect()->route('login')->with('error', 'Google authentication was cancelled.');
        }

        try {
            /** @var \Laravel\Socialite\Two\User $googleUser */
            $googleUser = Socialite::driver('google')->user();

            // 2. Validate email is present and verified
            $email = $googleUser->getEmail();
            $rawUser = $googleUser->user ?? [];
            $isEmailVerified = isset($rawUser['email_verified']) ? (bool) $rawUser['email_verified'] : true;

            if (empty($email) || !$isEmailVerified) {
                return redirect()->route('login')->with('error', 'Your Google account email is not verified.');
            }

            // 3. Find or create local user
            $user = User::where('google_id', $googleUser->getId())->first();

            if (!$user) {
                // Check if account already exists with this verified email
                $user = User::where('email', $email)->first();

                if ($user) {
                    // Link Google identity to existing account
                    $user->update([
                        'google_id' => $googleUser->getId(),
                        'avatar' => $googleUser->getAvatar() ?: $user->avatar,
                        'email_verified_at' => $user->email_verified_at ?? now(),
                    ]);
                } else {
                    // Create new local user
                    $user = User::create([
                        'name' => $googleUser->getName() ?: ($googleUser->getNickname() ?: 'Google User'),
                        'email' => $email,
                        'google_id' => $googleUser->getId(),
                        'avatar' => $googleUser->getAvatar(),
                        'email_verified_at' => now(),
                        'password' => null,
                    ]);

                    // Assign default role if available
                    if (Role::where('name', 'SHOP OWNER')->exists()) {
                        $user->assignRole('SHOP OWNER');
                    }
                }
            } else {
                // Update avatar if changed
                if ($googleUser->getAvatar() && $user->avatar !== $googleUser->getAvatar()) {
                    $user->update(['avatar' => $googleUser->getAvatar()]);
                }
            }

            // 4. Create standard Laravel authenticated session & regenerate session ID
            Auth::login($user, remember: true);
            $request->session()->regenerate();

            // 5. Direct to Shop Dashboard or Shop Registration
            if ($user->shop) {
                return redirect()->route('shop.dashboard');
            }

            return redirect()->route('shop.register');
        } catch (\Throwable $e) {
            Log::error('Google OAuth callback error: ' . $e->getMessage(), [
                'exception' => $e,
            ]);

            return redirect()->route('login')->with('error', 'Unable to authenticate with Google. Please try again.');
        }
    }
}
