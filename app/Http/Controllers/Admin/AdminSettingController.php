<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use App\Services\CashfreePaymentService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminSettingController extends Controller
{
    public function __construct(protected CashfreePaymentService $cashfree) {}

    /**
     * Display Super Admin Settings Hub (General, Cashfree, Print Settings).
     */
    public function index()
    {
        $cashfreeWebhookUrl = route('payment.cashfree.webhook');

        $settings = [
            'general' => [
                'app_name' => SystemSetting::get('app_name', config('app.name', 'Print Setu')),
                'currency_symbol' => SystemSetting::get('currency_symbol', '₹'),
                'currency_code' => SystemSetting::get('currency_code', 'INR'),
                'support_email' => SystemSetting::get('support_email', 'support@printsetu.com'),
                'support_phone' => SystemSetting::get('support_phone', '+91 98765 43210'),
                'timezone' => SystemSetting::get('timezone', config('app.timezone', 'Asia/Kolkata')),
            ],
            'cashfree' => [
                'app_id' => SystemSetting::get('cashfree_app_id', config('services.cashfree.app_id', '')),
                'secret_key' => SystemSetting::get('cashfree_secret_key', config('services.cashfree.secret_key', '')),
                'environment' => SystemSetting::get('cashfree_environment', config('services.cashfree.environment', 'sandbox')),
                'webhook_secret' => SystemSetting::get('cashfree_webhook_secret', config('services.cashfree.webhook_secret', '')),
                'webhook_url' => $cashfreeWebhookUrl,
                'api_version' => config('services.cashfree.api_version', '2023-08-01'),
            ],
            'print' => [
                'max_files_per_session' => (int) SystemSetting::get('max_files_per_session', 10),
                'max_file_size_mb' => (int) SystemSetting::get('max_file_size_mb', 20),
                'allowed_extensions' => SystemSetting::get('allowed_extensions', ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'xls', 'xlsx', 'csv', 'doc', 'docx', 'ppt', 'pptx']),
                'default_paper_size' => SystemSetting::get('default_paper_size', 'A4'),
                'default_color_mode' => SystemSetting::get('default_color_mode', 'bw'),
                'default_scaling' => SystemSetting::get('default_scaling', 'actual'),
                'agent_heartbeat_timeout_seconds' => (int) SystemSetting::get('agent_heartbeat_timeout_seconds', 180),
            ],
        ];

        return Inertia::render('admin/settings/index', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update General platform settings.
     */
    public function updateGeneral(Request $request)
    {
        $validated = $request->validate([
            'app_name' => ['required', 'string', 'max:100'],
            'currency_symbol' => ['required', 'string', 'max:10'],
            'currency_code' => ['required', 'string', 'max:10'],
            'support_email' => ['nullable', 'email', 'max:100'],
            'support_phone' => ['nullable', 'string', 'max:30'],
            'timezone' => ['required', 'string', 'max:50'],
        ]);

        foreach ($validated as $key => $value) {
            SystemSetting::set($key, $value, 'general');
        }

        return redirect()->back()->with('success', 'General settings saved successfully.');
    }

    /**
     * Update Global Cashfree Payment Gateway settings.
     */
    public function updateCashfree(Request $request)
    {
        $validated = $request->validate([
            'app_id' => ['required', 'string', 'max:255'],
            'secret_key' => ['required', 'string', 'max:255'],
            'environment' => ['required', 'string', 'in:sandbox,production'],
            'webhook_secret' => ['nullable', 'string', 'max:255'],
        ]);

        SystemSetting::set('cashfree_app_id', $validated['app_id'], 'cashfree');
        SystemSetting::set('cashfree_secret_key', $validated['secret_key'], 'cashfree');
        SystemSetting::set('cashfree_environment', $validated['environment'], 'cashfree');
        if (isset($validated['webhook_secret'])) {
            SystemSetting::set('cashfree_webhook_secret', $validated['webhook_secret'], 'cashfree');
        }

        return redirect()->back()->with('success', 'Cashfree Payment Gateway configuration saved successfully.');
    }

    /**
     * Test Cashfree connection from Admin settings.
     */
    public function testCashfree(Request $request)
    {
        $validated = $request->validate([
            'app_id' => ['required', 'string'],
            'secret_key' => ['required', 'string'],
            'environment' => ['nullable', 'string', 'in:sandbox,production'],
        ]);

        $result = $this->cashfree->testCredentials(
            $validated['app_id'],
            $validated['secret_key'],
            $validated['environment'] ?? 'sandbox'
        );

        return response()->json($result);
    }

    /**
     * Update Print & Spooling rules.
     */
    public function updatePrint(Request $request)
    {
        $validated = $request->validate([
            'max_files_per_session' => ['required', 'integer', 'min:1', 'max:50'],
            'max_file_size_mb' => ['required', 'integer', 'min:1', 'max:100'],
            'default_paper_size' => ['required', 'string', 'in:A4,A3,Letter,Legal'],
            'default_color_mode' => ['required', 'string', 'in:bw,color'],
            'default_scaling' => ['required', 'string', 'in:actual,fit_to_page,shrink_to_fit'],
            'agent_heartbeat_timeout_seconds' => ['required', 'integer', 'min:30', 'max:3600'],
        ]);

        foreach ($validated as $key => $value) {
            SystemSetting::set($key, $value, 'print');
        }

        return redirect()->back()->with('success', 'Print platform rules saved successfully.');
    }
}
