<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PrintSession;
use App\Models\QrPrint;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminOrderController extends Controller
{
    /**
     * Display all Orders / Print Sessions across shops.
     */
    public function index(Request $request)
    {
        $status = $request->input('status');
        $paymentStatus = $request->input('payment_status');
        $shopId = $request->input('shop_id');
        $search = $request->input('search');

        $orders = PrintSession::with(['qrPrint.shopSetting', 'jobs.document', 'payments'])
            ->when($status, fn($q) => $q->where('status', $status))
            ->when($paymentStatus, fn($q) => $q->where('payment_status', $paymentStatus))
            ->when($shopId, fn($q) => $q->where('qr_print_id', $shopId))
            ->when($search, function ($query, $search) {
                $query->where('uuid', 'like', "%{$search}%")
                    ->orWhere('id', 'like', "%{$search}%")
                    ->orWhereHas('qrPrint', fn($q) => $q->where('title', 'like', "%{$search}%"));
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $shops = QrPrint::select('id', 'title')->orderBy('title')->get();

        $stats = [
            'total_orders' => PrintSession::count(),
            'paid_orders' => PrintSession::where('payment_status', 'paid')->count(),
            'pending_payment_orders' => PrintSession::where('payment_status', 'pending')->count(),
            'total_revenue' => (float) PrintSession::where('payment_status', 'paid')->sum('total_amount'),
        ];

        return Inertia::render('admin/orders/index', [
            'orders' => $orders->through(fn(PrintSession $order) => [
                'id' => $order->id,
                'uuid' => $order->uuid,
                'formatted_order_id' => $order->formatted_order_id,
                'shop_title' => $order->qrPrint?->title ?? 'Unknown Shop',
                'shop_id' => $order->qr_print_id,
                'total_files' => $order->total_files,
                'completed_files' => $order->completed_files,
                'failed_files' => $order->failed_files,
                'total_pages' => $order->total_pages,
                'status' => $order->status,
                'payment_method' => $order->payment_method,
                'payment_status' => $order->payment_status,
                'print_status' => $order->print_status,
                'total_amount' => (float)$order->total_amount,
                'currency' => $order->currency ?: '₹',
                'paid_at' => $order->paid_at?->toDateTimeString(),
                'created_at' => $order->created_at?->toDateTimeString(),
            ]),
            'shops' => $shops,
            'filters' => [
                'status' => $status,
                'payment_status' => $paymentStatus,
                'shop_id' => $shopId,
                'search' => $search,
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Show single order detail with files, jobs and payment breakdown.
     */
    public function show(PrintSession $session)
    {
        $session->load(['qrPrint.shopSetting', 'jobs.document', 'payments.user', 'paidBy']);

        return Inertia::render('admin/orders/show', [
            'order' => [
                'id' => $session->id,
                'uuid' => $session->uuid,
                'formatted_order_id' => $session->formatted_order_id,
                'shop' => [
                    'id' => $session->qrPrint?->id,
                    'title' => $session->qrPrint?->title,
                    'phone' => $session->qrPrint?->shopSetting?->mobile_number,
                    'address' => $session->qrPrint?->shopSetting?->address,
                ],
                'status' => $session->status,
                'payment_method' => $session->payment_method,
                'payment_status' => $session->payment_status,
                'print_status' => $session->print_status,
                'total_amount' => (float)$session->total_amount,
                'currency' => $session->currency ?: '₹',
                'paid_at' => $session->paid_at?->toDateTimeString(),
                'paid_by' => $session->paidBy?->name,
                'created_at' => $session->created_at?->toDateTimeString(),
                'jobs' => $session->jobs->map(fn($job) => [
                    'id' => $job->id,
                    'uuid' => $job->uuid,
                    'document_name' => $job->document?->original_name ?? 'Document',
                    'file_type' => $job->document?->file_type ?? 'pdf',
                    'printer_name' => $job->printer_name,
                    'copies' => $job->copies,
                    'orientation' => $job->orientation,
                    'color_mode' => $job->color_mode,
                    'paper_size' => $job->paper_size,
                    'duplex' => $job->duplex,
                    'status' => $job->status,
                    'attempts' => $job->attempts,
                    'error_message' => $job->error_message,
                    'printed_at' => $job->printed_at?->toDateTimeString(),
                ]),
                'payments' => $session->payments->map(fn($payment) => [
                    'id' => $payment->id,
                    'uuid' => $payment->uuid,
                    'gateway' => $payment->gateway,
                    'gateway_order_id' => $payment->gateway_order_id,
                    'gateway_payment_id' => $payment->gateway_payment_id,
                    'payment_method' => $payment->payment_method,
                    'payment_type' => $payment->payment_type,
                    'amount' => (float)$payment->amount,
                    'currency' => $payment->currency,
                    'status' => $payment->status,
                    'refund_amount' => (float)$payment->refund_amount,
                    'refund_reason' => $payment->refund_reason,
                    'error_message' => $payment->error_message,
                    'collector_name' => $payment->user?->name,
                    'paid_at' => $payment->paid_at?->toDateTimeString(),
                    'created_at' => $payment->created_at?->toDateTimeString(),
                ]),
            ],
        ]);
    }
}
