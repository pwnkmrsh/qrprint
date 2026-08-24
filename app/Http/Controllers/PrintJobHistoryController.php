<?php

namespace App\Http\Controllers;

use App\Models\Printer;
use App\Models\PrinterAuditLog;
use App\Models\PrintJob;
use App\Models\PrintSession;
use App\Models\QrPrint;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PrintJobHistoryController extends Controller
{
    /**
     * Display a paginated, filterable print jobs history.
     */
    public function index(Request $request)
    {
        $qrPrint = $this->getShop();
        $user = Auth::user();

        $search = $request->query('search');
        $status = $request->query('status', 'all');
        $printerName = $request->query('printer');
        $colorMode = $request->query('color_mode');
        $dateRange = $request->query('date_range', 'all');

        $baseQuery = PrintJob::with(['document', 'session'])
            ->whereHas('document', function ($q) use ($qrPrint) {
                $q->where('qr_print_id', $qrPrint->id);
            });

        // Compute summary counts across all statuses
        $counts = [
            'all' => (clone $baseQuery)->count(),
            'pending' => (clone $baseQuery)->where('status', 'pending')->count(),
            'printing' => (clone $baseQuery)->where('status', 'printing')->count(),
            'completed' => (clone $baseQuery)->where('status', 'printed')->count(),
            'failed' => (clone $baseQuery)->where('status', 'failed')->count(),
            'cancelled' => (clone $baseQuery)->where('status', 'cancelled')->count(),
            'closed' => (clone $baseQuery)->where('status', 'closed')->count(),
        ];

        // Apply filters
        $jobsQuery = clone $baseQuery;

        if ($search) {
            $jobsQuery->where(function ($q) use ($search) {
                $q->where('uuid', 'like', "%{$search}%")
                    ->orWhere('printer_name', 'like', "%{$search}%")
                    ->orWhere('error_message', 'like', "%{$search}%")
                    ->orWhereHas('document', function ($dq) use ($search) {
                        $dq->where('original_name', 'like', "%{$search}%");
                    });
            });
        }

        if ($status && $status !== 'all') {
            if ($status === 'completed') {
                $jobsQuery->where('status', 'printed');
            } else {
                $jobsQuery->where('status', $status);
            }
        }

        if ($printerName) {
            $jobsQuery->where('printer_name', $printerName);
        }

        if ($colorMode) {
            $jobsQuery->where('color_mode', $colorMode);
        }

        if ($dateRange === 'today') {
            $jobsQuery->where('created_at', '>=', Carbon::today());
        } elseif ($dateRange === 'yesterday') {
            $jobsQuery->whereBetween('created_at', [Carbon::yesterday()->startOfDay(), Carbon::yesterday()->endOfDay()]);
        } elseif ($dateRange === 'week') {
            $jobsQuery->where('created_at', '>=', Carbon::now()->subDays(7));
        } elseif ($dateRange === 'month') {
            $jobsQuery->where('created_at', '>=', Carbon::now()->subDays(30));
        }

        $jobs = $jobsQuery->latest()->paginate(15)->withQueryString();

        // Get distinct printer names for filter dropdown
        $printersList = Printer::where('qr_print_id', $qrPrint->id)->pluck('name')->unique()->values();

        return Inertia::render('shop/jobs/index', [
            'jobs' => $jobs,
            'counts' => $counts,
            'filters' => [
                'search' => $search ?? '',
                'status' => $status,
                'printer' => $printerName ?? '',
                'color_mode' => $colorMode ?? '',
                'date_range' => $dateRange,
            ],
            'printersList' => $printersList,
            'shop' => [
                'id' => $qrPrint->id,
                'title' => $qrPrint->title,
                'print_token' => $qrPrint->print_token,
            ],
        ]);
    }

    /**
     * Retry a failed, cancelled, or closed print job.
     */
    public function retry(Request $request, PrintJob $job)
    {
        $qrPrint = $this->getShop();
        $this->authorizeJob($job, $qrPrint);

        if ($job->attempts >= 10) {
            return redirect()->back()->with('error', 'Maximum retry attempts exceeded for this job.');
        }

        $oldStatus = $job->status;

        DB::transaction(function () use ($job) {
            $job->update([
                'status' => 'pending',
                'error_message' => null,
                'attempts' => $job->attempts + 1,
                'claimed_at' => null,
                'started_at' => null,
                'completed_at' => null,
            ]);

            if ($job->print_session_id) {
                $session = PrintSession::find($job->print_session_id);
                if ($session && in_array($session->status, ['failed', 'partial_failed', 'cancelled', 'completed'])) {
                    $session->update(['status' => 'printing']);
                }
            }
        });

        // Audit Log
        PrinterAuditLog::log(
            $qrPrint->id,
            Auth::id(),
            null,
            'Job Retried',
            "Re-queued print job #{$job->id} ({$job->document?->original_name}) from status '{$oldStatus}' to 'pending'",
            ['job_uuid' => $job->uuid, 'previous_status' => $oldStatus]
        );

        return redirect()->back()->with('success', "Print job #{$job->id} re-queued successfully.");
    }

    /**
     * Cancel an active or pending print job.
     */
    public function cancel(Request $request, PrintJob $job)
    {
        $qrPrint = $this->getShop();
        $this->authorizeJob($job, $qrPrint);

        $reason = $request->input('reason', 'Cancelled by shop operator');
        $oldStatus = $job->status;

        DB::transaction(function () use ($job, $reason) {
            $job->update([
                'status' => 'cancelled',
                'error_message' => $reason,
                'completed_at' => now(),
            ]);

            if ($job->print_session_id) {
                $session = PrintSession::with('jobs')->find($job->print_session_id);
                if ($session) {
                    $total = $session->total_files;
                    $completed = $session->jobs()->where('status', 'printed')->count();
                    $failed = $session->jobs()->whereIn('status', ['failed', 'cancelled'])->count();
                    
                    $sessionStatus = ($completed + $failed >= $total) ? 'cancelled' : 'printing';
                    $session->update([
                        'failed_files' => $failed,
                        'status' => $sessionStatus,
                    ]);
                }
            }
        });

        // Audit Log
        PrinterAuditLog::log(
            $qrPrint->id,
            Auth::id(),
            null,
            'Job Cancelled',
            "Cancelled print job #{$job->id} ({$job->document?->original_name}): {$reason}",
            ['job_uuid' => $job->uuid, 'reason' => $reason, 'previous_status' => $oldStatus]
        );

        return redirect()->back()->with('success', "Print job #{$job->id} cancelled successfully.");
    }

    /**
     * Mark a job as closed / resolved.
     */
    public function close(Request $request, PrintJob $job)
    {
        $qrPrint = $this->getShop();
        $this->authorizeJob($job, $qrPrint);

        $oldStatus = $job->status;

        $job->update([
            'status' => 'closed',
            'completed_at' => $job->completed_at ?: now(),
        ]);

        // Audit Log
        PrinterAuditLog::log(
            $qrPrint->id,
            Auth::id(),
            null,
            'Job Closed',
            "Closed/Archived print job #{$job->id} ({$job->document?->original_name})",
            ['job_uuid' => $job->uuid, 'previous_status' => $oldStatus]
        );

        return redirect()->back()->with('success', "Print job #{$job->id} marked as closed.");
    }

    /**
     * Perform bulk action (retry, cancel, close) on multiple print jobs.
     */
    public function bulkAction(Request $request)
    {
        $qrPrint = $this->getShop();
        
        $validated = $request->validate([
            'action' => ['required', 'string', 'in:retry,cancel,close'],
            'job_ids' => ['required', 'array', 'min:1'],
            'job_ids.*' => ['integer'],
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        $action = $validated['action'];
        $reason = $validated['reason'] ?? 'Bulk action executed';

        $jobs = PrintJob::whereIn('id', $validated['job_ids'])
            ->whereHas('document', function ($q) use ($qrPrint) {
                $q->where('qr_print_id', $qrPrint->id);
            })
            ->get();

        $affectedCount = 0;

        foreach ($jobs as $job) {
            if ($action === 'retry') {
                $job->update([
                    'status' => 'pending',
                    'error_message' => null,
                    'attempts' => $job->attempts + 1,
                    'claimed_at' => null,
                    'started_at' => null,
                    'completed_at' => null,
                ]);
                $affectedCount++;
            } elseif ($action === 'cancel') {
                if (in_array($job->status, ['pending', 'printing'])) {
                    $job->update([
                        'status' => 'cancelled',
                        'error_message' => $reason,
                        'completed_at' => now(),
                    ]);
                    $affectedCount++;
                }
            } elseif ($action === 'close') {
                $job->update([
                    'status' => 'closed',
                    'completed_at' => $job->completed_at ?: now(),
                ]);
                $affectedCount++;
            }
        }

        // Audit Log
        PrinterAuditLog::log(
            $qrPrint->id,
            Auth::id(),
            null,
            'Bulk Job Action',
            "Executed bulk {$action} on {$affectedCount} print job(s)",
            ['action' => $action, 'count' => $affectedCount, 'job_ids' => $validated['job_ids']]
        );

        return redirect()->back()->with('success', "{$affectedCount} job(s) updated successfully.");
    }

    /**
     * Get active shop instance.
     */
    private function getShop(): QrPrint
    {
        $user = Auth::user();
        $shop = QrPrint::where('user_id', $user->id)->first();

        if (!$shop) {
            $shop = QrPrint::first() ?? QrPrint::create([
                'user_id' => $user->id,
                'title' => $user->name . ' Print Point',
                'content' => 'Scan to print at ' . $user->name,
                'is_active' => true,
            ]);
        }

        return $shop;
    }

    /**
     * Authorize that the job belongs to the current user's shop or user is admin.
     */
    private function authorizeJob(PrintJob $job, QrPrint $qrPrint)
    {
        $user = Auth::user();
        $isSuperAdmin = $user && ($user->hasRole(['super-admin', 'SUPER ADMIN', 'admin']));

        if (!$isSuperAdmin) {
            abort_unless(
                $job->document && $job->document->qr_print_id === $qrPrint->id,
                403,
                'Unauthorized access to print job.'
            );
        }
    }
}
