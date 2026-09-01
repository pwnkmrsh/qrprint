<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Printer;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class AdminPrintAgentController extends Controller
{
    /**
     * Display Print Agents status and hardware health.
     */
    public function index(Request $request)
    {
        $timeoutSeconds = (int) SystemSetting::get('agent_heartbeat_timeout_seconds', 180);

        // Group printers by agent_id
        $printers = Printer::with(['qrPrint.user', 'qrPrint.shopSetting'])
            ->get()
            ->groupBy('agent_id');

        $agents = [];
        foreach ($printers as $agentId => $agentPrinters) {
            $lastSeenCache = Cache::get("agent_{$agentId}_last_seen");
            $lastSeenTime = $lastSeenCache ? \Carbon\Carbon::parse($lastSeenCache) : null;
            $isOnline = $lastSeenTime && $lastSeenTime->diffInSeconds(now()) < $timeoutSeconds;

            $primaryShop = $agentPrinters->first()?->qrPrint;

            $agents[] = [
                'agent_id' => $agentId,
                'is_online' => (bool)$isOnline,
                'last_seen' => $lastSeenTime ? $lastSeenTime->diffForHumans() : 'Never',
                'last_seen_raw' => $lastSeenTime?->toDateTimeString(),
                'shop_title' => $primaryShop?->title ?? 'Unknown Shop',
                'owner_name' => $primaryShop?->user?->name ?? 'Unassigned',
                'printers_count' => $agentPrinters->count(),
                'printers' => $agentPrinters->map(fn($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'model' => $p->model,
                    'status' => $p->status,
                    'is_default' => $p->is_default,
                ]),
            ];
        }

        $stats = [
            'total_agents' => count($agents),
            'online_agents' => collect($agents)->where('is_online', true)->count(),
            'offline_agents' => collect($agents)->where('is_online', false)->count(),
            'total_printers' => Printer::count(),
        ];

        return Inertia::render('admin/print-agents/index', [
            'agents' => $agents,
            'stats' => $stats,
        ]);
    }
}
