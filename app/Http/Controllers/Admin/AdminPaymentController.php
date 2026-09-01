<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\PaymentManagerService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminPaymentController extends Controller
{
    public function __construct(protected PaymentManagerService $paymentManager) {}

    /**
     * Payments Hub: Online Payments, Counter Payments, Failed Payments, and Refunds.
     */
    public function index(Request $request)
    {
        $tab = $request->input('tab', 'all'); // all, online, counter, failed, refunds
        $search = $request->input('search');

        $query = Payment::with(['session.qrPrint', 'user', 'qrPrint'])
            ->when($search, function ($q, $search) {
                $q->where('order_id', 'like', "%{$search}%")
                    ->orWhere('gateway_order_id', 'like', "%{$search}%")
                    ->orWhere('gateway_payment_id', 'like', "%{$search}%")
                    ->orWhereHas('qrPrint', fn($sub) => $sub->where('title', 'like', "%{$search}%"));
            });

        if ($tab === 'online') {
            $query->online();
        } elseif ($tab === 'counter') {
            $query->counter();
        } elseif ($tab === 'failed') {
            $query->failed();
        } elseif ($tab === 'refunds') {
            $query->refunds();
        }

        $payments = $query->latest()->paginate(15)->withQueryString();

        $stats = [
            'total_volume' => (float) Payment::where('status', 'success')->sum('amount'),
            'online_volume' => (float) Payment::online()->where('status', 'success')->sum('amount'),
            'counter_volume' => (float) Payment::counter()->where('status', 'success')->sum('amount'),
            'failed_count' => Payment::failed()->count(),
            'refunded_volume' => (float) Payment::sum('refund_amount'),
        ];

        return Inertia::render('admin/payments/index', [
            'payments' => $payments->through(fn(Payment $p) => [
                'id' => $p->id,
                'uuid' => $p->uuid,
                'order_id' => $p->order_id,
                'session_uuid' => $p->session?->uuid,
                'shop_title' => $p->qrPrint?->title ?? $p->session?->qrPrint?->title ?? 'Shop',
                'payment_method' => $p->payment_method,
                'payment_type' => $p->payment_type,
                'gateway' => $p->gateway,
                'gateway_order_id' => $p->gateway_order_id,
                'gateway_payment_id' => $p->gateway_payment_id,
                'amount' => (float)$p->amount,
                'currency' => $p->currency ?: 'INR',
                'status' => $p->status,
                'error_message' => $p->error_message,
                'refund_amount' => (float)$p->refund_amount,
                'refund_reason' => $p->refund_reason,
                'collector_name' => $p->user?->name,
                'paid_at' => $p->paid_at?->toDateTimeString(),
                'created_at' => $p->created_at?->toDateTimeString(),
            ]),
            'active_tab' => $tab,
            'filters' => [
                'search' => $search,
                'tab' => $tab,
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Issue Refund on a Payment.
     */
    public function refund(Request $request, Payment $payment)
    {
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:1', "max:{$payment->amount}"],
            'reason' => ['required', 'string', 'max:255'],
        ]);

        $this->paymentManager->recordRefund(
            $payment,
            (float) $validated['amount'],
            $validated['reason']
        );

        return redirect()->back()->with('success', "Refund of ₹{$validated['amount']} processed successfully.");
    }
}
