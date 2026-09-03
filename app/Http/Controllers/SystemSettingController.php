<?php

namespace App\Http\Controllers;

use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SystemSettingController extends Controller
{
    /**
     * Show the system settings edit form.
     */
    public function edit()
    {
        // Authorize super-admin role
        if (!Auth::user() || !Auth::user()->hasAnyRole(['super-admin', 'SUPER ADMIN'])) {
            abort(403, 'Unauthorized access.');
        }

        return Inertia::render('admin/settings', [
            'settings' => [
                'support_mobile' => SystemSetting::get('support_mobile', '9098132966'),
                'support_email' => SystemSetting::get('support_email', 'mynatech.in@gmail.com'),
            ]
        ]);
    }

    /**
     * Update the system settings.
     */
    public function update(Request $request)
    {
        // Authorize super-admin role
        if (!Auth::user() || !Auth::user()->hasAnyRole(['super-admin', 'SUPER ADMIN'])) {
            abort(403, 'Unauthorized access.');
        }

        $validated = $request->validate([
            'support_mobile' => ['required', 'string', 'max:30'],
            'support_email' => ['required', 'email', 'max:100'],
        ]);

        SystemSetting::set('support_mobile', $validated['support_mobile']);
        SystemSetting::set('support_email', $validated['support_email']);

        return redirect()->back()->with('success', 'System support configurations updated successfully.');
    }
}
