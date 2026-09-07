<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PrintJob;
use App\Models\PrintSession;
use App\Models\QrPrint;
use App\Models\ShopSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminShopController extends Controller
{
    /**
     * List all registered shops on the platform with status filtering and metrics.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $status = $request->input('status'); // 'all', 'active', 'inactive'

        $shops = QrPrint::with(['user.shop', 'shopSetting', 'printers'])
            ->withCount(['printers', 'sessions', 'documents'])
            ->when($status === 'active', fn($q) => $q->where('is_active', true))
            ->when($status === 'inactive', fn($q) => $q->where('is_active', false))
            ->when($search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%")
                    ->orWhere('print_token', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%");
                    })
                    ->orWhereHas('shopSetting', function ($q) use ($search) {
                        $q->where('mobile_number', 'like', "%{$search}%")
                            ->orWhere('address', 'like', "%{$search}%");
                    });
            })
            ->latest()
            ->paginate(12)
            ->withQueryString();

        $stats = [
            'total_shops' => QrPrint::count(),
            'active_shops' => QrPrint::where('is_active', true)->count(),
            'inactive_shops' => QrPrint::where('is_active', false)->count(),
            'total_printers' => \App\Models\Printer::count(),
            'online_printers' => \App\Models\Printer::where('status', 'online')->count(),
            'total_revenue' => (float) PrintSession::where('payment_status', 'paid')->sum('total_amount'),
        ];

        return Inertia::render('admin/shops/index', [
            'shops' => $shops->through(fn(QrPrint $shop) => [
                'id' => $shop->id,
                'uuid' => $shop->uuid,
                'title' => $shop->title,
                'print_token' => $shop->print_token,
                'is_active' => (bool)$shop->is_active,
                'print_count' => $shop->print_count,
                'owner_name' => $shop->user?->name ?? 'Unassigned',
                'owner_email' => $shop->user?->email ?? '-',
                'mobile_number' => $shop->shopSetting?->mobile_number ?? $shop->user?->shop?->mobile ?? '-',
                'address' => $shop->shopSetting?->address ?? $shop->user?->shop?->address ?? '-',
                'logo_url' => $shop->shopSetting?->logo_url,
                'printers_count' => $shop->printers_count,
                'online_printers_count' => $shop->printers->where('status', 'online')->count(),
                'sessions_count' => $shop->sessions_count,
                'created_at' => $shop->created_at?->toDateTimeString(),
                'qr_url' => route('qr-print.qr', $shop),
                'print_url' => route('qr-print.print', $shop->print_token),
                'details_url' => route('admin.shops.show', $shop->id),
            ]),
            'filters' => [
                'search' => $search,
                'status' => $status ?: 'all',
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Show single shop overview with connected printers, recent jobs, and revenue breakdown.
     */
    public function show(QrPrint $shop)
    {
        $shop->load(['user.shop', 'shopSetting', 'printers.auditLogs']);

        $recentSessions = PrintSession::with(['payments', 'jobs.document'])
            ->where('qr_print_id', $shop->id)
            ->latest()
            ->take(10)
            ->get();

        $recentJobs = PrintJob::with(['document', 'session'])
            ->whereHas('session', fn($q) => $q->where('qr_print_id', $shop->id))
            ->latest()
            ->take(15)
            ->get();

        $totalRevenue = (float) PrintSession::where('qr_print_id', $shop->id)
            ->where('payment_status', 'paid')
            ->sum('total_amount');

        $stats = [
            'total_sessions' => PrintSession::where('qr_print_id', $shop->id)->count(),
            'paid_sessions' => PrintSession::where('qr_print_id', $shop->id)->where('payment_status', 'paid')->count(),
            'total_revenue' => $totalRevenue,
            'total_jobs' => PrintJob::whereHas('session', fn($q) => $q->where('qr_print_id', $shop->id))->count(),
            'printed_jobs' => PrintJob::whereHas('session', fn($q) => $q->where('qr_print_id', $shop->id))->where('status', 'printed')->count(),
            'failed_jobs' => PrintJob::whereHas('session', fn($q) => $q->where('qr_print_id', $shop->id))->where('status', 'failed')->count(),
            'total_printers' => $shop->printers->count(),
            'online_printers' => $shop->printers->where('status', 'online')->count(),
        ];

        return Inertia::render('admin/shops/show', [
            'shop' => [
                'id' => $shop->id,
                'uuid' => $shop->uuid,
                'title' => $shop->title,
                'print_token' => $shop->print_token,
                'is_active' => (bool)$shop->is_active,
                'print_count' => $shop->print_count,
                'created_at' => $shop->created_at?->toDateTimeString(),
                'qr_url' => route('qr-print.qr', $shop),
                'print_url' => route('qr-print.print', $shop->print_token),
                'owner' => [
                    'id' => $shop->user?->id,
                    'name' => $shop->user?->name ?? 'Unassigned',
                    'email' => $shop->user?->email ?? '-',
                ],
                'setting' => [
                    'shop_name' => $shop->shopSetting?->shop_name ?? $shop->title,
                    'mobile_number' => $shop->shopSetting?->mobile_number ?? $shop->user?->shop?->mobile ?? '-',
                    'address' => $shop->shopSetting?->address ?? $shop->user?->shop?->address ?? '-',
                    'city' => $shop->user?->shop?->city ?? '-',
                    'state' => $shop->user?->shop?->state ?? '-',
                    'pincode' => $shop->user?->shop?->pincode ?? '-',
                    'logo_url' => $shop->shopSetting?->logo_url,
                    'currency_symbol' => $shop->shopSetting?->currency_symbol ?? '₹',
                    'bw_price_per_page' => (float)($shop->shopSetting?->bw_price_per_page ?? 2.0),
                    'color_price_per_page' => (float)($shop->shopSetting?->color_price_per_page ?? 10.0),
                    'scanner_price_per_page' => (float)($shop->shopSetting?->scanner_price_per_page ?? 5.0),
                    'online_payment_enabled' => (bool)($shop->shopSetting?->online_payment_enabled ?? true),
                    'counter_payment_enabled' => (bool)($shop->shopSetting?->counter_payment_enabled ?? true),
                    'gateway_provider' => $shop->shopSetting?->gateway_provider ?? 'cashfree',
                ],
                'printers' => $shop->printers->map(fn($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'connection_type' => $p->connection_type,
                    'ip_address' => $p->ip_address,
                    'status' => $p->status,
                    'is_default' => (bool)$p->is_default,
                    'color_support' => (bool)$p->color_support,
                    'duplex_support' => (bool)$p->duplex_support,
                    'total_jobs_printed' => $p->total_jobs_printed,
                    'last_seen_at' => $p->last_seen_at?->toDateTimeString(),
                ]),
                'recent_orders' => $recentSessions->map(fn($s) => [
                    'id' => $s->id,
                    'uuid' => $s->uuid,
                    'formatted_order_id' => $s->formatted_order_id,
                    'total_files' => $s->total_files,
                    'total_amount' => (float)$s->total_amount,
                    'currency' => $s->currency ?: '₹',
                    'status' => $s->status,
                    'payment_status' => $s->payment_status,
                    'payment_method' => $s->payment_method,
                    'created_at' => $s->created_at?->toDateTimeString(),
                ]),
                'recent_jobs' => $recentJobs->map(fn($j) => [
                    'id' => $j->id,
                    'uuid' => $j->uuid,
                    'document_name' => $j->document?->original_name ?? 'Document',
                    'file_type' => $j->document?->file_type ?? 'pdf',
                    'printer_name' => $j->printer_name,
                    'copies' => $j->copies,
                    'color_mode' => $j->color_mode,
                    'paper_size' => $j->paper_size,
                    'status' => $j->status,
                    'attempts' => $j->attempts,
                    'error_message' => $j->error_message,
                    'created_at' => $j->created_at?->toDateTimeString(),
                ]),
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Update shop details, rates or status from Super Admin.
     */
    public function update(Request $request, QrPrint $shop)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'is_active' => 'required|boolean',
            'mobile_number' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'bw_price_per_page' => 'nullable|numeric|min:0',
            'color_price_per_page' => 'nullable|numeric|min:0',
            'scanner_price_per_page' => 'nullable|numeric|min:0',
        ]);

        $shop->update([
            'title' => $validated['title'],
            'is_active' => $validated['is_active'],
        ]);

        if ($shop->user?->shop) {
            $shop->user->shop->update([
                'shop_name' => $validated['title'],
                'mobile' => $validated['mobile_number'] ?? $shop->user->shop->mobile,
                'address' => $validated['address'] ?? $shop->user->shop->address,
                'status' => $validated['is_active'] ? 'active' : 'inactive',
            ]);
        }

        if ($shop->shopSetting) {
            $shop->shopSetting->update([
                'shop_name' => $validated['title'],
                'mobile_number' => $validated['mobile_number'],
                'address' => $validated['address'],
                'bw_price_per_page' => $validated['bw_price_per_page'] ?? $shop->shopSetting->bw_price_per_page,
                'color_price_per_page' => $validated['color_price_per_page'] ?? $shop->shopSetting->color_price_per_page,
                'scanner_price_per_page' => $validated['scanner_price_per_page'] ?? $shop->shopSetting->scanner_price_per_page,
            ]);
        }

        return redirect()->back()->with('success', "Shop '{$shop->title}' updated successfully.");
    }

    /**
     * Toggle shop active status and sync related shop models.
     */
    public function toggleActive(QrPrint $shop)
    {
        $newActive = !$shop->is_active;
        $shop->update(['is_active' => $newActive]);

        if ($shop->user?->shop) {
            $shop->user->shop->update(['status' => $newActive ? 'active' : 'inactive']);
        }

        $status = $newActive ? 'activated' : 'deactivated';
        return redirect()->back()->with('success', "Shop '{$shop->title}' {$status} successfully.");
    }
}
