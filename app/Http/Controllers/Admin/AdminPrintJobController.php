<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PrintJob;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminPrintJobController extends Controller
{
    /**
     * List all Print Jobs across shops.
     */
    public function index(Request $request)
    {
        $status = $request->input('status');
        $search = $request->input('search');

        $jobs = PrintJob::with(['document', 'session.qrPrint'])
            ->when($status, fn($q) => $q->where('status', $status))
            ->when($search, function ($query, $search) {
                $query->where('uuid', 'like', "%{$search}%")
                    ->orWhere('printer_name', 'like', "%{$search}%")
                    ->orWhereHas('document', fn($q) => $q->where('original_name', 'like', "%{$search}%"));
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $stats = [
            'total_jobs' => PrintJob::count(),
            'printed_jobs' => PrintJob::where('status', 'printed')->count(),
            'pending_jobs' => PrintJob::where('status', 'pending')->count(),
            'failed_jobs' => PrintJob::where('status', 'failed')->count(),
        ];

        return Inertia::render('admin/print-jobs/index', [
            'jobs' => $jobs->through(fn(PrintJob $job) => [
                'id' => $job->id,
                'uuid' => $job->uuid,
                'session_uuid' => $job->session?->uuid,
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
            'filters' => [
                'status' => $status,
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
}
