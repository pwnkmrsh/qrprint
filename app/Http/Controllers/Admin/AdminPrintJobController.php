<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PrintJob;
use App\Models\QrPrint;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminPrintJobController extends Controller
{
    /**
     * List all Print Jobs across shops with filtering by shop and status.
     */
    public function index(Request $request)
    {
        $status = $request->input('status');
        $shopId = $request->input('shop_id');
        $search = $request->input('search');

        $jobs = PrintJob::with(['document', 'session.qrPrint'])
            ->when($status && $status !== 'all', fn($q) => $q->where('status', $status))
            ->when($shopId, function ($query, $shopId) {
                $query->whereHas('session', fn($q) => $q->where('qr_print_id', $shopId));
            })
            ->when($search, function ($query, $search) {
                $query->where(function ($sq) use ($search) {
                    $sq->where('uuid', 'like', "%{$search}%")
                        ->orWhere('printer_name', 'like', "%{$search}%")
                        ->orWhereHas('document', fn($dq) => $dq->where('original_name', 'like', "%{$search}%"))
                        ->orWhereHas('session.qrPrint', fn($sqp) => $sqp->where('title', 'like', "%{$search}%"));
                });
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $shops = QrPrint::select('id', 'title')->orderBy('title')->get();

        $stats = [
            'total_jobs' => PrintJob::count(),
            'printed_jobs' => PrintJob::where('status', 'printed')->count(),
            'pending_jobs' => PrintJob::whereIn('status', ['pending', 'pending_payment'])->count(),
            'printing_jobs' => PrintJob::where('status', 'printing')->count(),
            'failed_jobs' => PrintJob::where('status', 'failed')->count(),
        ];

        return Inertia::render('admin/print-jobs/index', [
            'jobs' => $jobs->through(fn(PrintJob $job) => [
                'id' => $job->id,
                'uuid' => $job->uuid,
                'session_uuid' => $job->session?->uuid,
                'shop_id' => $job->session?->qr_print_id,
                'shop_title' => $job->session?->qrPrint?->title ?? 'Shop',
                'document_name' => $job->document?->original_name ?? 'Document',
                'file_type' => $job->document?->file_type ?? 'pdf',
                'printer_name' => $job->printer_name,
                'copies' => $job->copies,
                'color_mode' => $job->color_mode,
                'paper_size' => $job->paper_size,
                'duplex' => $job->duplex,
                'status' => $job->status,
                'attempts' => $job->attempts,
                'error_message' => $job->error_message,
                'printed_at' => $job->printed_at?->toDateTimeString(),
                'created_at' => $job->created_at?->toDateTimeString(),
            ]),
            'shops' => $shops,
            'filters' => [
                'status' => $status ?: 'all',
                'shop_id' => $shopId,
                'search' => $search,
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Retry a failed job.
     */
    public function retry(PrintJob $job)
    {
        $job->update([
            'status' => 'pending',
            'error_message' => null,
            'attempts' => 0,
        ]);

        return redirect()->back()->with('success', 'Print job queued for retry.');
    }

    /**
     * Cancel a job.
     */
    public function cancel(PrintJob $job)
    {
        $job->update([
            'status' => 'cancelled',
        ]);

        return redirect()->back()->with('success', 'Print job cancelled.');
    }

    /**
     * Force mark a job as printed / completed.
     */
    public function complete(PrintJob $job)
    {
        $job->update([
            'status' => 'printed',
            'printed_at' => now(),
            'error_message' => null,
        ]);

        // Check if all session jobs are completed
        if ($job->session) {
            $allDone = $job->session->jobs()->where('status', '!=', 'printed')->count() === 0;
            if ($allDone) {
                $job->session->update(['status' => 'completed', 'print_status' => 'completed']);
            }
        }

        return redirect()->back()->with('success', 'Print job marked as printed successfully.');
    }
}
