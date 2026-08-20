<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\QrPrint;
use App\Models\PrintDocument;
use App\Models\PrintJob;

class PrintAgentController extends Controller
{
    public function jobs(Request $request)
    {
        $jobs = PrintJob::with('document')
            ->where('status', 'pending')
            ->orderBy('created_at')
            ->limit(5)
            ->get();

        foreach ($jobs as $job) {

            $job->update([
                'status' => 'printing',
                'attempts' => $job->attempts + 1,
                'claimed_at' => now(),
            ]);
        }

        return response()->json([
            'success' => true,

            'jobs' => $jobs->map(function ($job) {

                return [
                    'id' => $job->id,
                    'uuid' => $job->uuid,
                    'copies' => $job->copies,
                    'printer_name' => $job->printer_name,
                    'original_name' => $job->document->original_name,
                    'mime_type' => $job->document->mime_type,

                    'file_url' => route(
                        'print-agent.file',
                        $job->uuid
                    ),
                ];
            }),
        ]);
    }

    public function complete(Request $request, PrintJob $job)
    {
        $job->update([
            'status' => 'printed',
            'printed_at' => now(),
        ]);

        return response()->json([
            'success' => true,
        ]);
    }

    public function failed(Request $request, PrintJob $job)
    {
        $job->update([
            'status' => 'failed',
            'error_message' => $request->input('error_message'),
        ]);

        return response()->json([
            'success' => true,
        ]);
    }

    public function file(string $uuid)
    {
        $job = PrintJob::with('document')
            ->where('uuid', $uuid)
            ->firstOrFail();

        $document = $job->document;

        abort_unless($document, 404);

        $filePath = storage_path(
            'app/public/' . $document->path
        );

        abort_unless(file_exists($filePath), 404);

        return response()->file($filePath);
    }

    public function createJob(
        string $token,
        PrintDocument $document
    ) {
        $qrPrint = QrPrint::where('print_token', $token)
            ->where('is_active', true)
            ->firstOrFail();

        abort_unless(
            $document->qr_print_id === $qrPrint->id,
            404
        );

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
    public function status(PrintJob $job)
    {
        return response()->json([
            'success' => true,

            'job' => [
                'id' => $job->id,
                'uuid' => $job->uuid,
                'status' => $job->status,
                'attempts' => $job->attempts,
                'error_message' => $job->error_message,
                'printed_at' => $job->printed_at,
            ],
        ]);
    }

   
}
