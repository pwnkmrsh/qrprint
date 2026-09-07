<?php

namespace App\Services;

use App\Models\PrintSession;
use App\Models\ShopSetting;
use App\Models\SystemSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class CashfreePaymentService
{
    private const SANDBOX_BASE_URL = 'https://sandbox.cashfree.com/pg';
    private const PRODUCTION_BASE_URL = 'https://api.cashfree.com/pg';
    private const DEFAULT_API_VERSION = '2023-08-01';

    /**
     * Resolve Cashfree API credentials hierarchically:
     * 1. ShopSetting (if shop has dedicated Cashfree credentials)
     * 2. Super Admin SystemSetting (platform-wide DB settings)
     * 3. config/services.php (.env fallback)
     */
    public function resolveCredentials(?ShopSetting $shopSetting = null): array
    {
        $appId = null;
        $secretKey = null;
        $environment = 'sandbox';
        $webhookSecret = null;

        // 1. Check Shop Setting
        if ($shopSetting && !empty($shopSetting->api_key_id) && !empty($shopSetting->secret_key)) {
            $appId = $shopSetting->api_key_id;
            $secretKey = $shopSetting->secret_key;
            $environment = $shopSetting->settings['cashfree_environment'] ?? 'sandbox';
            $webhookSecret = $shopSetting->settings['webhook_secret'] ?? null;
        }

        // 2. Fallback to Super Admin SystemSetting
        if (empty($appId) || empty($secretKey)) {
            $globalAppId = SystemSetting::get('cashfree_app_id');
            $globalSecret = SystemSetting::get('cashfree_secret_key');
            if (!empty($globalAppId) && !empty($globalSecret)) {
                $appId = $globalAppId;
                $secretKey = $globalSecret;
                $environment = SystemSetting::get('cashfree_environment', 'sandbox');
                $webhookSecret = SystemSetting::get('cashfree_webhook_secret', $webhookSecret);
            }
        }

        // 3. Fallback to config/services.php (.env)
        if (empty($appId) || empty($secretKey)) {
            $appId = config('services.cashfree.app_id');
            $secretKey = config('services.cashfree.secret_key');
            $environment = config('services.cashfree.environment', 'sandbox');
            $webhookSecret = config('services.cashfree.webhook_secret', $webhookSecret);
        }

        $environment = in_array(strtolower((string)$environment), ['production', 'prod', 'live'], true) ? 'production' : 'sandbox';
        $baseUrl = ($environment === 'production') ? self::PRODUCTION_BASE_URL : self::SANDBOX_BASE_URL;

        return [
            'app_id' => (string)$appId,
            'secret_key' => (string)$secretKey,
            'environment' => $environment,
            'webhook_secret' => (string)$webhookSecret,
            'base_url' => $baseUrl,
            'api_version' => config('services.cashfree.api_version', self::DEFAULT_API_VERSION),
            'is_configured' => !empty($appId) && !empty($secretKey),
        ];
    }

    /**
     * Create an online payment order in Cashfree PG.
     */
    public function createOrder(
        PrintSession $session,
        ?ShopSetting $shopSetting = null,
        array $customer = [],
        ?string $returnUrl = null,
        ?string $notifyUrl = null
    ): array {
        $creds = $this->resolveCredentials($shopSetting);

        if (!$creds['is_configured']) {
            return [
                'success' => false,
                'message' => 'Cashfree Payment Gateway is not configured. Please contact the administrator or shop owner.',
            ];
        }

        $amount = (float) $session->total_amount;
        if ($amount <= 0) {
            $amount = 1.00;
        }

        // Cashfree order ID requirements: alphanumeric and hyphen/underscore only, max 50 chars
        $sanitizedUuid = preg_replace('/[^A-Za-z0-9_-]/', '', $session->uuid);
        $orderId = 'ord_' . substr($sanitizedUuid, 0, 30) . '_' . time();

        $customerPhone = preg_replace('/[^0-9]/', '', $customer['phone'] ?? $shopSetting?->mobile_number ?? '9999999999');
        if (strlen($customerPhone) < 10) {
            $customerPhone = '9999999999';
        } else {
            $customerPhone = substr($customerPhone, -10);
        }

        $customerName = trim($customer['name'] ?? 'Print Customer');
        $customerEmail = trim($customer['email'] ?? 'customer@printsetu.com');
        $customerId = 'cust_' . substr(md5($customerPhone . $customerEmail), 0, 16);

        $qrPrint = $session->qrPrint;
        $token = $qrPrint ? $qrPrint->print_token : 'print';

        if (empty($returnUrl)) {
            $routeUrl = route('qr-print.cashfree.return', [
                'token' => $token,
                'session' => $session->uuid,
            ]);
            $separator = str_contains($routeUrl, '?') ? '&' : '?';
            $resolvedReturnUrl = $routeUrl . $separator . 'order_id={order_id}';
        } else {
            $resolvedReturnUrl = $returnUrl;
        }

        // Cashfree API strictly enforces that return_url and notify_url MUST start with https://
        if (str_starts_with(strtolower($resolvedReturnUrl), 'http://')) {
            $resolvedReturnUrl = 'https://' . substr($resolvedReturnUrl, 7);
        }

        $resolvedNotifyUrl = $notifyUrl ?: route('payment.cashfree.webhook');
        if (str_starts_with(strtolower($resolvedNotifyUrl), 'http://')) {
            $resolvedNotifyUrl = 'https://' . substr($resolvedNotifyUrl, 7);
        }

        $payload = [
            'order_id' => $orderId,
            'order_amount' => round($amount, 2),
            'order_currency' => $session->currency && strtoupper($session->currency) !== '₹' ? strtoupper($session->currency) : 'INR',
            'customer_details' => [
                'customer_id' => $customerId,
                'customer_phone' => $customerPhone,
                'customer_name' => $customerName,
                'customer_email' => $customerEmail,
            ],
            'order_meta' => [
                'return_url' => $resolvedReturnUrl,
                'notify_url' => $resolvedNotifyUrl,
            ],
            'order_note' => "Print Order {$session->formatted_order_id} ({$session->total_files} files)",
            'order_tags' => [
                'session_uuid' => (string)$session->uuid,
                'session_id' => (string)$session->id,
                'qr_print_id' => (string)$session->qr_print_id,
            ],
        ];

        try {
            $response = Http::withHeaders([
                'x-client-id' => $creds['app_id'],
                'x-client-secret' => $creds['secret_key'],
                'x-api-version' => $creds['api_version'],
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->timeout(15)->post($creds['base_url'] . '/orders', $payload);

            $data = $response->json();

            if ($response->successful() && !empty($data['payment_session_id'])) {
                return [
                    'success' => true,
                    'order_id' => $data['order_id'] ?? $orderId,
                    'cf_order_id' => $data['cf_order_id'] ?? null,
                    'payment_session_id' => $data['payment_session_id'],
                    'order_status' => $data['order_status'] ?? 'ACTIVE',
                    'environment' => $creds['environment'],
                    'amount' => $amount,
                    'currency' => $payload['order_currency'],
                    'raw' => $data,
                ];
            }

            Log::error('Cashfree Create Order Error', [
                'status' => $response->status(),
                'response' => $data,
                'payload' => $payload,
            ]);

            return [
                'success' => false,
                'message' => $data['message'] ?? 'Failed to initialize Cashfree payment order.',
                'raw' => $data,
            ];
        } catch (\Throwable $e) {
            Log::error('Cashfree Request Exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => 'Payment Gateway connection failed: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Fetch Order status directly from Cashfree API.
     */
    public function getOrderStatus(string $orderId, ?ShopSetting $shopSetting = null): array
    {
        $creds = $this->resolveCredentials($shopSetting);

        if (!$creds['is_configured']) {
            return [
                'success' => false,
                'message' => 'Cashfree credentials missing.',
            ];
        }

        try {
            $response = Http::withHeaders([
                'x-client-id' => $creds['app_id'],
                'x-client-secret' => $creds['secret_key'],
                'x-api-version' => $creds['api_version'],
                'Accept' => 'application/json',
            ])->timeout(10)->get($creds['base_url'] . '/orders/' . urlencode($orderId));

            $data = $response->json();

            if ($response->successful()) {
                return [
                    'success' => true,
                    'order_id' => $data['order_id'] ?? $orderId,
                    'cf_order_id' => $data['cf_order_id'] ?? null,
                    'order_status' => $data['order_status'] ?? 'UNKNOWN',
                    'order_amount' => (float)($data['order_amount'] ?? 0),
                    'order_currency' => $data['order_currency'] ?? 'INR',
                    'is_paid' => strtoupper($data['order_status'] ?? '') === 'PAID',
                    'raw' => $data,
                ];
            }

            return [
                'success' => false,
                'message' => $data['message'] ?? 'Order lookup failed.',
                'raw' => $data,
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Fetch payment transactions for an order.
     */
    public function getOrderPayments(string $orderId, ?ShopSetting $shopSetting = null): array
    {
        $creds = $this->resolveCredentials($shopSetting);

        if (!$creds['is_configured']) {
            return [];
        }

        try {
            $response = Http::withHeaders([
                'x-client-id' => $creds['app_id'],
                'x-client-secret' => $creds['secret_key'],
                'x-api-version' => $creds['api_version'],
                'Accept' => 'application/json',
            ])->timeout(10)->get($creds['base_url'] . '/orders/' . urlencode($orderId) . '/payments');

            if ($response->successful()) {
                return $response->json() ?: [];
            }
        } catch (\Throwable $e) {
            Log::warning('Cashfree fetch payments error: ' . $e->getMessage());
        }

        return [];
    }

    /**
     * Verify Cashfree Webhook Signature using HMAC SHA-256.
     * Cashfree computes signature as: base64_encode(hash_hmac('sha256', $timestamp . $rawBody, $secretKey, true))
     */
    public function verifyWebhookSignature(
        string $rawPayload,
        string $signature,
        string $timestamp,
        ?string $customSecret = null
    ): bool {
        if (empty($signature) || empty($timestamp)) {
            return false;
        }

        $secret = $customSecret;
        if (empty($secret)) {
            $creds = $this->resolveCredentials();
            $secret = !empty($creds['webhook_secret']) ? $creds['webhook_secret'] : $creds['secret_key'];
        }

        if (empty($secret)) {
            return false;
        }

        $signedPayload = $timestamp . $rawPayload;
        $expectedSignature = base64_encode(hash_hmac('sha256', $signedPayload, $secret, true));

        return hash_equals($expectedSignature, $signature);
    }

    /**
     * Test credentials by sending a sample order check or ping to Cashfree.
     */
    public function testCredentials(string $appId, string $secretKey, string $env = 'sandbox'): array
    {
        $envClean = in_array(strtolower($env), ['production', 'prod', 'live'], true) ? 'production' : 'sandbox';
        $baseUrl = ($envClean === 'production') ? self::PRODUCTION_BASE_URL : self::SANDBOX_BASE_URL;

        if (empty($appId) || empty($secretKey)) {
            return [
                'success' => false,
                'message' => 'Please provide both App ID and Secret Key.',
            ];
        }

        try {
            // Query a non-existent dummy test order to verify authentication headers
            $response = Http::withHeaders([
                'x-client-id' => trim($appId),
                'x-client-secret' => trim($secretKey),
                'x-api-version' => self::DEFAULT_API_VERSION,
                'Accept' => 'application/json',
            ])->timeout(10)->get($baseUrl . '/orders/test_auth_check_' . time());

            $status = $response->status();
            $data = $response->json();

            // Cashfree returns 404 (Order Not Found) when authentication succeeds but order doesn't exist
            // If auth fails, it returns 401 Unauthorized or 403 Forbidden
            if ($status === 404 || $status === 200) {
                return [
                    'success' => true,
                    'message' => "Successfully connected to Cashfree ({$envClean} mode). Credentials are valid.",
                    'environment' => $envClean,
                ];
            }

            if ($status === 401 || $status === 403) {
                return [
                    'success' => false,
                    'message' => 'Authentication failed. Please verify your Cashfree App ID and Secret Key.',
                ];
            }

            return [
                'success' => false,
                'message' => $data['message'] ?? "Cashfree returned status {$status}.",
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'message' => 'Connection failed: ' . $e->getMessage(),
            ];
        }
    }
}
