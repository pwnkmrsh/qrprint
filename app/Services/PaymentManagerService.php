<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\PrintJob;
use App\Models\PrintSession;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaymentManagerService
{
    /**
     * Record successful online payment (Cashfree / UPI / Card), update session and activate print jobs.
     */
    public function recordOnlineSuccess(PrintSession $session, array $gatewayData, string $gateway = 'cashfree'): Payment
    {
        return DB::transaction(function () use ($session, $gatewayData, $gateway) {
            $cfOrderId = $gatewayData['cf_order_id'] ?? $gatewayData['order_id'] ?? null;
            $cfPaymentId = $gatewayData['cf_payment_id'] ?? $gatewayData['payment_id'] ?? null;
            $amount = (float)($gatewayData['order_amount'] ?? $gatewayData['amount'] ?? $session->total_amount);
            $paymentMethod = strtolower($gatewayData['payment_method'] ?? 'cashfree');

            // 1. Create or update Payment record
            $payment = Payment::updateOrCreate(
                [
                    'print_session_id' => $session->id,
                    'gateway_order_id' => $cfOrderId,
                ],
                [
                    'qr_print_id' => $session->qr_print_id,
                    'order_id' => $session->formatted_order_id,
                    'payment_method' => $paymentMethod,
                    'payment_type' => 'online',
                    'gateway' => $gateway,
                    'gateway_order_id' => $cfOrderId,
                    'gateway_payment_id' => $cfPaymentId,
                    'amount' => $amount,
                    'currency' => $session->currency ?: 'INR',
                    'status' => 'success',
                    'gateway_response' => $gatewayData,
                    'error_message' => null,
                    'paid_at' => now(),
                ]
            );

            // 2. Transition PrintSession to paid & ready_to_print
            $session->update([
                'payment_method' => $paymentMethod,
                'payment_status' => 'paid',
                'print_status' => 'ready_to_print',
                'status' => ($session->status === 'pending_payment' || $session->status === 'pending') ? 'ready' : $session->status,
                'paid_at' => now(),
            ]);

            // 3. Activate all session PrintJobs to 'pending' (ready for Print Agent to pick up)
            PrintJob::where('print_session_id', $session->id)
                ->whereIn('status', ['pending_payment', 'pending'])
                ->update([
                    'status' => 'pending',
                    'payment_method' => $paymentMethod,
                ]);

            return $payment;
        });
    }

    /**
     * Record counter payment (collected by shop owner/cashier), update session and activate print jobs.
     */
    public function recordCounterPayment(PrintSession $session, User $collector, string $method = 'cash'): Payment
    {
        return DB::transaction(function () use ($session, $collector, $method) {
            $amount = (float)$session->total_amount;

            // 1. Create Payment record
            $payment = Payment::create([
                'print_session_id' => $session->id,
                'qr_print_id' => $session->qr_print_id,
                'user_id' => $collector->id,
                'order_id' => $session->formatted_order_id,
                'payment_method' => $method,
                'payment_type' => 'counter',
                'gateway' => 'counter',
                'amount' => $amount,
                'currency' => $session->currency ?: 'INR',
                'status' => 'success',
                'gateway_response' => [
                    'collector_id' => $collector->id,
                    'collector_name' => $collector->name,
                    'method' => $method,
                    'timestamp' => now()->toIso8601String(),
                ],
                'paid_at' => now(),
            ]);

            // 2. Transition PrintSession to paid & ready_to_print
            $session->update([
                'payment_method' => $method,
                'payment_status' => 'paid',
                'print_status' => 'ready_to_print',
                'status' => 'ready',
                'paid_by' => $collector->id,
                'paid_at' => now(),
            ]);

            // 3. Activate all session PrintJobs to 'pending'
            PrintJob::where('print_session_id', $session->id)
                ->whereIn('status', ['pending_payment', 'pending'])
                ->update([
                    'status' => 'pending',
                    'payment_method' => $method,
                ]);

            return $payment;
        });
    }

    /**
     * Record failed payment transaction.
     */
    public function recordFailure(PrintSession $session, string $error, array $gatewayData = []): Payment
    {
        $cfOrderId = $gatewayData['cf_order_id'] ?? $gatewayData['order_id'] ?? null;

        $payment = Payment::create([
            'print_session_id' => $session->id,
            'qr_print_id' => $session->qr_print_id,
            'order_id' => $session->formatted_order_id,
            'payment_method' => strtolower($gatewayData['payment_method'] ?? 'cashfree'),
            'payment_type' => 'online',
            'gateway' => 'cashfree',
            'gateway_order_id' => $cfOrderId,
            'amount' => (float)$session->total_amount,
            'currency' => $session->currency ?: 'INR',
            'status' => 'failed',
            'gateway_response' => $gatewayData,
            'error_message' => $error,
        ]);

        $session->update([
            'payment_status' => 'failed',
        ]);

        return $payment;
    }

    /**
     * Process refund on a successful payment.
     */
    public function recordRefund(Payment $payment, float $amount, string $reason): Payment
    {
        return DB::transaction(function () use ($payment, $amount, $reason) {
            $payment->update([
                'status' => 'refunded',
                'refund_amount' => $amount,
                'refund_reason' => $reason,
                'refunded_at' => now(),
            ]);

            if ($payment->session) {
                $payment->session->update([
                    'payment_status' => 'refunded',
                ]);
            }

            return $payment;
        });
    }
}
