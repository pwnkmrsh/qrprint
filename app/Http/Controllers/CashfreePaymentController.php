<?php

namespace App\Http\Controllers;

use App\Models\PrintSession;
use App\Models\QrPrint;
use App\Models\ShopSetting;
use App\Services\CashfreePaymentService;
use App\Services\PaymentManagerService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CashfreePaymentController extends Controller
{
    public function __construct(
        protected CashfreePaymentService $cashfree,
        protected PaymentManagerService $paymentManager
    ) {}

    /**
     * Initialize Cashfree Payment Order for a print session.
     */
    public function createOrder(Request $request, string $token)
    {
        $qrPrint = QrPrint::where('print_token', $token)->firstOrFail();
        if (!$qrPrint->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'This QR Print Point is currently deactivated.',
            ], 403);
        }

        $validated = $request->validate([
            'session_uuid' => ['required', 'string'],
            'customer_name' => ['nullable', 'string', 'max:100'],
            'customer_phone' => ['nullable', 'string', 'max:20'],
            'customer_email' => ['nullable', 'email', 'max:100'],
        ]);

        $session = PrintSession::where('uuid', $validated['session_uuid'])
            ->where('qr_print_id', $qrPrint->id)
            ->firstOrFail();

        $setting = $qrPrint->shopSetting;

        $result = $this->cashfree->createOrder(
            $session,
            $setting,
            [
                'name' => $validated['customer_name'] ?? 'Print Customer',
                'phone' => $validated['customer_phone'] ?? $setting?->mobile_number ?? '',
                'email' => $validated['customer_email'] ?? 'customer@printsetu.com',
            ]
        );

        if (!$result['success']) {
            return response()->json($result, 422);
        }

        return response()->json([
            'success' => true,
            'order_id' => $result['order_id'],
            'cf_order_id' => $result['cf_order_id'],
            'payment_session_id' => $result['payment_session_id'],
            'environment' => $result['environment'],
            'amount' => $result['amount'],
            'currency' => $result['currency'],
            'status_url' => route('qr-print.session.status', [
                'token' => $token,
                'session' => $session->uuid,
            ]),
        ]);
    }

    /**
     * Handle Customer Return URL after Cashfree Drop / Hosted Checkout.
     */
    public function handleReturn(Request $request, string $token)
    {
        $orderId = (string)$request->query('order_id');
        $sessionUuid = (string)$request->query('session');

        $qrPrint = QrPrint::where('print_token', $token)->firstOrFail();

        $session = null;
        if (!empty($sessionUuid)) {
            $session = PrintSession::where('uuid', $sessionUuid)->first();
        }

        if (!$session && !empty($orderId)) {
            // Check tags or payment order mapping
            $session = PrintSession::where('qr_print_id', $qrPrint->id)->latest()->first();
        }

        if (!$session) {
            return redirect()->route('qr-print.print', $token)->with('error', 'Print session not found.');
        }

        // Verify order status directly with Cashfree
        if (!empty($orderId)) {
            $statusCheck = $this->cashfree->getOrderStatus($orderId, $qrPrint->shopSetting);
            if ($statusCheck['success'] && !empty($statusCheck['is_paid'])) {
                $this->paymentManager->recordOnlineSuccess($session, $statusCheck['raw'], 'cashfree');
            }
        }

        return redirect()->route('qr-print.session.status', [
            'token' => $token,
            'session' => $session->uuid,
        ]);
    }

    /**
     * Cashfree Server-to-Server Webhook Handler.
     */
    public function handleWebhook(Request $request)
    {
        $rawPayload = $request->getContent();
        $signature = (string)$request->header('x-webhook-signature');
        $timestamp = (string)$request->header('x-webhook-timestamp');

        Log::info('Cashfree Webhook Received', [
            'signature_present' => !empty($signature),
            'timestamp' => $timestamp,
            'body_length' => strlen($rawPayload),
        ]);

        $payload = json_decode($rawPayload, true);
        if (!$payload) {
            return response()->json(['status' => 'INVALID_JSON'], 400);
        }

        // Validate webhook signature
        $isSignatureValid = $this->cashfree->verifyWebhookSignature($rawPayload, $signature, $timestamp);
        if (!$isSignatureValid) {
            Log::warning('Cashfree Webhook Signature Mismatch');
            return response()->json(['status' => 'SIGNATURE_MISMATCH'], 401);
        }

        $eventType = $payload['type'] ?? $payload['event'] ?? 'UNKNOWN';
        $orderData = $payload['data']['order'] ?? $payload['data'] ?? [];
        $orderId = $orderData['order_id'] ?? null;
        $orderTags = $orderData['order_tags'] ?? [];
        $sessionUuid = $orderTags['session_uuid'] ?? null;

        $session = null;
        if (!empty($sessionUuid)) {
            $session = PrintSession::where('uuid', $sessionUuid)->first();
        }

        if (!$session && !empty($orderId)) {
            $session = PrintSession::whereHas('payments', function ($q) use ($orderId) {
                $q->where('gateway_order_id', $orderId);
            })->first();
        }

        if ($session) {
            if (in_array($eventType, ['PAYMENT_SUCCESS_WEBHOOK', 'ORDER_PAID_WEBHOOK'], true)) {
                $paymentData = $payload['data']['payment'] ?? [];
                $mergedData = array_merge($orderData, [
                    'cf_payment_id' => $paymentData['cf_payment_id'] ?? null,
                    'payment_method' => $paymentData['payment_group'] ?? 'cashfree',
                ]);

                $this->paymentManager->recordOnlineSuccess($session, $mergedData, 'cashfree');
                Log::info("PrintSession #{$session->id} successfully marked as PAID via Webhook.");
            } elseif (in_array($eventType, ['PAYMENT_FAILED_WEBHOOK', 'PAYMENT_USER_DROPPED_WEBHOOK'], true)) {
                $err = $payload['data']['payment']['payment_message'] ?? 'Payment failed or cancelled';
                $this->paymentManager->recordFailure($session, $err, $orderData);
            }
        }

        return response()->json(['status' => 'OK']);
    }

    /**
     * Test Cashfree API Credentials directly.
     */
    public function testConnection(Request $request)
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
}
