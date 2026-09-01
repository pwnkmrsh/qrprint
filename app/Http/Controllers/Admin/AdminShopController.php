<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\QrPrint;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminShopController extends Controller
{
    /**
     * List all registered shops on the platform.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');

        $shops = QrPrint::with(['user', 'shopSetting', 'printers'])
            ->withCount(['printers', 'sessions', 'documents'])
            ->when($search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%")
                    ->orWhere('print_token', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%");
                    });
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $stats = [
            'total_shops' => QrPrint::count(),
            'active_shops' => QrPrint::where('is_active', true)->count(),
            'inactive_shops' => QrPrint::where('is_active', false)->count(),
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
                'mobile_number' => $shop->shopSetting?->mobile_number ?? '-',
                'address' => $shop->shopSetting?->address ?? '-',
                'logo_url' => $shop->shopSetting?->logo_url,
                'printers_count' => $shop->printers_count,
                'online_printers_count' => $shop->printers->where('status', 'online')->count(),
                'sessions_count' => $shop->sessions_count,
                'created_at' => $shop->created_at?->toDateTimeString(),
                'qr_url' => route('qr-print.qr', $shop),
                'print_url' => route('qr-print.print', $shop->print_token),
            ]),
            'filters' => [
                'search' => $search,
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Toggle shop active status.
     */
    public function toggleActive(QrPrint $shop)
    {
        $shop->update(['is_active' => !$shop->is_active]);

        $status = $shop->is_active ? 'activated' : 'deactivated';
        return redirect()->back()->with('success', "Shop '{$shop->title}' {$status} successfully.");
    }
}
