<?php

namespace App\Http\Controllers;

use App\Models\PrintJob;
use App\Models\PrintSession;
use App\Models\QrPrint;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the merchant dashboard.
     */
    public function index()
    {
        $user = Auth::user();

        // 1. Auto-provision or retrieve QrPrint for the user
        $qrPrint = QrPrint::firstOrCreate(
            ['user_id' => $user->id],
            [
                'title' => $user->name . ' Print Point',
                'content' => 'Scan to print at ' . $user->name,
                'is_active' => true,
            ]
        );

        // 2. Fetch printer/agent status from printers table
        $defaultPrinter = \App\Models\Printer::where('qr_print_id', $qrPrint->id)
            ->where('is_default', true)
            ->where('is_active', true)
            ->first() ?? \App\Models\Printer::where('qr_print_id', $qrPrint->id)
            ->where('is_active', true)
            ->first();

        if ($defaultPrinter) {
            $printerState = ucwords($defaultPrinter->live_status); // Online, Offline, Busy, Error
            $printerName = $defaultPrinter->name;
            $agentId = $defaultPrinter->agent_id;
            $lastSeen = $defaultPrinter->last_seen_at;
            $capabilities = $defaultPrinter->capabilities ?? [
                'color' => false,
                'duplex' => false,
                'paper_sizes' => ['A4']
            ];
        } else {
            $printerState = 'Offline';
            $printerName = 'No Printer Configured';
            $agentId = 'N/A';
            $lastSeen = null;
            $capabilities = [
                'color' => false,
                'duplex' => false,
                'paper_sizes' => ['A4']
            ];
        }

        // Count active/printing jobs to determine if busy
        $activeJobsCount = PrintJob::whereHas('document', function ($q) use ($qrPrint) {
            $q->where('qr_print_id', $qrPrint->id);
        })->whereIn('status', ['printing'])->count();

        // 3. Today's print statistics
        $todayStart = Carbon::today();
        
        // Today's completed jobs
        $todayJobs = PrintJob::whereHas('document', function ($q) use ($qrPrint) {
            $q->where('qr_print_id', $qrPrint->id);
        })
        ->where('status', 'printed')
        ->where('printed_at', '>=', $todayStart);

        $todayJobsCount = $todayJobs->count();
        $todayPagesCount = (int) $todayJobs->sum('copies');

        // Total completed jobs overall
        $totalCompletedJobs = PrintJob::whereHas('document', function ($q) use ($qrPrint) {
            $q->where('qr_print_id', $qrPrint->id);
        })
        ->where('status', 'printed')
        ->count();

        // Job status counts for the merchant
        $pendingCount = PrintJob::whereHas('document', function ($q) use ($qrPrint) {
            $q->where('qr_print_id', $qrPrint->id);
        })->where('status', 'pending')->count();

        $printingCount = PrintJob::whereHas('document', function ($q) use ($qrPrint) {
            $q->where('qr_print_id', $qrPrint->id);
        })->where('status', 'printing')->count();

        $completedCount = PrintJob::whereHas('document', function ($q) use ($qrPrint) {
            $q->where('qr_print_id', $qrPrint->id);
        })->where('status', 'printed')->count();

        $failedCount = PrintJob::whereHas('document', function ($q) use ($qrPrint) {
            $q->where('qr_print_id', $qrPrint->id);
        })->where('status', 'failed')->count();

        // 4. Print History (Recent 15 jobs)
        $jobs = PrintJob::with(['document.qrPrint'])
            ->whereHas('document', function ($q) use ($qrPrint) {
                $q->where('qr_print_id', $qrPrint->id);
            })
            ->latest()
            ->paginate(10);

        // 5. Staff and Role permission checks
        $canManageStaff = $user->can('access-users-module') || $user->roles->first()?->name === 'super-admin' || $user->roles->first()?->name === 'admin';

        return Inertia::render('dashboard', [
            'qrPrint' => [
                'id' => $qrPrint->id,
                'title' => $qrPrint->title,
                'content' => $qrPrint->content,
                'is_active' => $qrPrint->is_active,
                'print_token' => $qrPrint->print_token,
                'qr_url' => route('qr-print.qr', $qrPrint),
                'print_url' => route('qr-print.print', $qrPrint->print_token),
            ],
            'printer' => [
                'state' => $printerState,
                'name' => $printerName,
                'agent_id' => $agentId,
                'last_seen' => $lastSeen ? Carbon::parse($lastSeen)->diffForHumans() : 'Never',
                'capabilities' => $capabilities,
                'active_jobs' => $activeJobsCount,
                'pending_jobs' => $pendingCount,
            ],
            'stats' => [
                'today_jobs' => $todayJobsCount,
                'today_pages' => $todayPagesCount,
                'total_completed' => $totalCompletedJobs,
                'pending' => $pendingCount,
                'printing' => $printingCount,
                'completed' => $completedCount,
                'failed' => $failedCount,
            ],
            'jobs' => $jobs,
            'canManageStaff' => $canManageStaff,
        ]);
    }

    /**
     * Toggle active/inactive state of the QR Print point.
     */
    public function toggleQr(Request $request)
    {
        $user = Auth::user();
        $qrPrint = QrPrint::where('user_id', $user->id)->firstOrFail();
        
        $qrPrint->update([
            'is_active' => !$qrPrint->is_active
        ]);

        return redirect()->back()->with('success', $qrPrint->is_active ? 'QR activated successfully.' : 'QR deactivated successfully.');
    }

    /**
     * Update the merchant shop profile.
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        $qrPrint = QrPrint::where('user_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['nullable', 'string'],
        ]);

        $qrPrint->update([
            'title' => $validated['title'],
            'content' => $validated['content'] ?? '',
        ]);

        return redirect()->back()->with('success', 'Shop profile updated successfully.');
    }

    /**
     * Retry a failed job.
     */
    public function retryJob(Request $request, PrintJob $job)
    {
        $user = Auth::user();
        
        // Ensure this job belongs to the current user's shop
        abort_unless($job->document && $job->document->qrPrint->user_id === $user->id, 403);

        if ($job->attempts >= 5) {
            return response()->json([
                'success' => false,
                'message' => 'Maximum retry attempts exceeded for this job.',
            ], 422);
        }

        $job->update([
            'status' => 'pending',
            'error_message' => null,
            'attempts' => $job->attempts + 1,
        ]);

        if ($job->print_session_id) {
            $session = PrintSession::find($job->print_session_id);
            if ($session && in_array($session->status, ['failed', 'partial_failed'])) {
                $session->update(['status' => 'printing']);
            }
        }

        return redirect()->back()->with('success', 'Job re-queued successfully.');
    }

    /**
     * Cancel an active or pending job from dashboard.
     */
    public function cancelJob(Request $request, PrintJob $job)
    {
        $user = Auth::user();
        abort_unless($job->document && $job->document->qrPrint->user_id === $user->id, 403);

        $reason = $request->input('reason', 'Cancelled from merchant dashboard');

        $job->update([
            'status' => 'cancelled',
            'error_message' => $reason,
            'completed_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Job cancelled successfully.');
    }

    /**
     * Mark a job as closed from dashboard.
     */
    public function closeJob(Request $request, PrintJob $job)
    {
        $user = Auth::user();
        abort_unless($job->document && $job->document->qrPrint->user_id === $user->id, 403);

        $job->update([
            'status' => 'closed',
            'completed_at' => $job->completed_at ?: now(),
        ]);

        return redirect()->back()->with('success', 'Job marked as closed.');
    }

    /**
     * Render the high-resolution printable QR poster.
     */
    public function printPoster()
    {
        $user = Auth::user();
        $qrPrint = QrPrint::where('user_id', $user->id)->firstOrFail();

        return Inertia::render('qr-print/poster', [
            'shopName' => $qrPrint->title,
            'qrUrl' => route('qr-print.qr', $qrPrint),
            'printToken' => $qrPrint->print_token,
        ]);
    }
}
