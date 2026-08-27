<?php

namespace App\Http\Controllers;

use App\Models\QrPrint;
use App\Models\Shop;
use App\Models\ShopSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShopRegistrationController extends Controller
{
    /**
     * Display the shop registration form.
     */
    public function create(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        // If user already has a shop, redirect to shop dashboard
        if ($user->shop) {
            return redirect()->route('shop.dashboard');
        }

        return Inertia::render('shop/register', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    /**
     * Handle incoming shop registration submission.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        // Prevent duplicate shop registration
        if ($user->shop) {
            return redirect()->route('shop.dashboard')->with('error', 'A shop is already registered for this account.');
        }

        // Validate shop registration inputs
        $validated = $request->validate([
            'shop_name' => ['required', 'string', 'max:255'],
            'owner_name' => ['required', 'string', 'max:255'],
            'mobile' => ['required', 'string', 'regex:/^[0-9+\-\s()]{10,20}$/'],
            'address' => ['required', 'string', 'max:500'],
            'city' => ['required', 'string', 'max:100'],
            'state' => ['required', 'string', 'max:100'],
            'pincode' => ['required', 'string', 'regex:/^[0-9]{4,10}$/'],
        ], [
            'mobile.regex' => 'Please enter a valid mobile number.',
            'pincode.regex' => 'Please enter a valid postal pincode (e.g. 400001).',
        ]);

        // Sanitize inputs
        $shopName = trim(strip_tags($validated['shop_name']));
        $ownerName = trim(strip_tags($validated['owner_name']));
        $mobile = trim(strip_tags($validated['mobile']));
        $address = trim(strip_tags($validated['address']));
        $city = trim(strip_tags($validated['city']));
        $state = trim(strip_tags($validated['state']));
        $pincode = trim(strip_tags($validated['pincode']));

        // Update owner name if updated in registration form
        if ($ownerName && $user->name !== $ownerName) {
            $user->update(['name' => $ownerName]);
        }

        // Create Shop record
        $shop = Shop::create([
            'user_id' => $user->id,
            'shop_name' => $shopName,
            'mobile' => $mobile,
            'address' => $address,
            'city' => $city,
            'state' => $state,
            'pincode' => $pincode,
            'status' => 'active',
        ]);

        // Initialize / sync QrPrint and ShopSetting for seamless operations
        $qrPrint = QrPrint::firstOrCreate(
            ['user_id' => $user->id],
            [
                'title' => $shop->shop_name . ' Print Point',
                'content' => 'Scan to print at ' . $shop->shop_name,
                'is_active' => true,
            ]
        );

        ShopSetting::updateOrCreate(
            ['user_id' => $user->id],
            [
                'qr_print_id' => $qrPrint->id,
                'shop_name' => $shop->shop_name,
                'email' => $user->email,
                'address' => "{$shop->address}, {$shop->city}, {$shop->state} - {$shop->pincode}",
                'mobile_number' => $shop->mobile,
            ]
        );

        return redirect()->route('shop.dashboard')->with('success', 'Shop registered successfully! Welcome to your Dashboard.');
    }
}
