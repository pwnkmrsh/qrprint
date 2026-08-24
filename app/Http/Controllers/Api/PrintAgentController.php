<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PrintDocument;
use App\Models\PrintJob;
use App\Models\PrintSession;
use App\Models\QrPrint;
use Illuminate\Http\Request;

class PrintAgentController extends Controller
{
    /**
     * Agent pulls pending print jobs with all per-job settings.
     */
    public function jobs(Request $request)
    {
        $agentId = $request->input('agent_id', 'AGENT-001');
        \Cache::put("agent_{$agentId}_last_seen", now()->toDateTimeString(), 300);

        $jobs = PrintJob::with(['document', 'session'])
            ->where('status', 'pending')
            ->orderBy('created_at')
            ->limit(10)
            ->get();

        foreach ($jobs as $job) {
            $job->update([
                'status' => 'printing',
                'attempts' => $job->attempts + 1,
                'claimed_at' => now(),
                'started_at' => now(),
            ]);

            if ($job->session) {
                $sessionUpdate = [];
                if ($job->session->status !== 'printing') {
                    $sessionUpdate['status'] = 'printing';
                }
                if ($job->session->print_status !== 'printing') {
                    $sessionUpdate['print_status'] = 'printing';
                }
                if (!empty($sessionUpdate)) {
                    $job->session->update($sessionUpdate);
                }
            }
        }

        return response()->json([
            'success' => true,
            'jobs' => $jobs->map(function ($job) {
                return [
                    'id' => $job->id,
                    'uuid' => $job->uuid,
                    'session_uuid' => $job->session?->uuid,
                    'printer_name' => $job->printer_name,
                    'copies' => $job->copies ?? 1,
                    'orientation' => $job->orientation ?? 'auto',
                    'color_mode' => $job->color_mode ?? 'bw',
                    'paper_size' => $job->paper_size ?? 'A4',
                    'scaling' => $job->scaling ?? 'actual',
                    'duplex' => $job->duplex ?? 'off',
                    'page_range' => $job->page_range,
                    'selected_sheets' => $job->selected_sheets ?? [],
                    'print_options' => $job->print_options ?? [],
                    'original_name' => $job->document?->original_name ?? 'document.pdf',
                    'mime_type' => $job->document?->mime_type ?? 'application/pdf',
                    'file_type' => $job->document?->file_type ?? 'pdf',
                    'file_url' => route('print-agent.file', $job->uuid),
                ];
            }),
        ]);
    }

    /**
     * Mark a job completed and update session summary.
     */
    public function complete(Request $request, PrintJob $job)
    {
        $job->update([
            'status' => 'printed',
            'completed_at' => now(),
            'printed_at' => now(),
        ]);

        if ($job->print_session_id) {
            $session = PrintSession::with('jobs')->find($job->print_session_id);
            if ($session) {
                $completed = $session->jobs()->where('status', 'printed')->count();
                $failed = $session->jobs()->where('status', 'failed')->count();
                $total = $session->total_files;

                $sessionStatus = ($completed === $total) ? 'completed' : (($completed + $failed === $total) ? 'partial_failed' : 'printing');
                $session->update([
                    'completed_files' => $completed,
                    'failed_files' => $failed,
                    'status' => $sessionStatus,
                    'print_status' => $sessionStatus,
                ]);
            }
        }

        return response()->json([
            'success' => true,
        ]);
    }

    /**
     * Mark a job failed and update session summary.
     */
    public function failed(Request $request, PrintJob $job)
    {
        $job->update([
            'status' => 'failed',
            'error_message' => $request->input('error_message', 'Unknown printing error'),
        ]);

        if ($job->print_session_id) {
            $session = PrintSession::with('jobs')->find($job->print_session_id);
            if ($session) {
                $completed = $session->jobs()->where('status', 'printed')->count();
                $failed = $session->jobs()->where('status', 'failed')->count();
                $total = $session->total_files;

                $sessionStatus = ($failed === $total) ? 'failed' : (($completed + $failed === $total) ? 'partial_failed' : 'printing');
                $session->update([
                    'completed_files' => $completed,
                    'failed_files' => $failed,
                    'status' => $sessionStatus,
                    'print_status' => $sessionStatus,
                ]);
            }
        }

        return response()->json([
            'success' => true,
        ]);
    }

    /**
     * Stream document file securely to authenticated print agent.
     */
    public function file(string $uuid)
    {
        $job = PrintJob::with('document')
            ->where('uuid', $uuid)
            ->firstOrFail();

        $document = $job->document;
        abort_unless($document, 404);

        $filePath = storage_path('app/public/' . $document->path);
        abort_unless(file_exists($filePath), 404);

        return response()->file($filePath);
    }

    /**
     * Single document quick print job creation (legacy / individual fallback).
     */
    public function createJob(string $token, PrintDocument $document)
    {
        $qrPrint = QrPrint::where('print_token', $token)
            ->where('is_active', true)
            ->firstOrFail();

        abort_unless($document->qr_print_id === $qrPrint->id, 404);

        $job = PrintJob::create([
            'print_document_id' => $document->id,
            'printer_name' => null,
            'copies' => 1,
            'status' => 'pending',
            'attempts' => 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Print job created successfully.',
            'job_id' => $job->id,
            'job_uuid' => $job->uuid,
            'status' => $job->status,
        ]);
    }

    /**
     * Check individual job status.
     */
    public function status(string $jobIdentifier)
    {
        $job = PrintJob::where('uuid', $jobIdentifier)
            ->orWhere('id', $jobIdentifier)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'job' => [
                'id' => $job->id,
                'uuid' => $job->uuid,
                'status' => $job->status,
                'attempts' => $job->attempts,
                'error_message' => $job->error_message,
                'printed_at' => $job->printed_at,
                'completed_at' => $job->completed_at,
            ],
        ]);
    }

    /**
     * Agent reporting printer capabilities.
     */
    public function capabilities(Request $request)
    {
        $agentId = $request->input('agent_id', 'AGENT-001');
        $printerName = $request->input('printer_name');
        $capabilities = $request->input('capabilities');

        \Cache::put("agent_{$agentId}_last_seen", now()->toDateTimeString(), 300);
        if ($printerName) {
            \Cache::put("agent_{$agentId}_printer_name", $printerName, 86400);
        }
        if ($capabilities) {
            \Cache::put("agent_{$agentId}_capabilities", $capabilities, 86400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Capabilities recorded.',
        ]);
    }
}
