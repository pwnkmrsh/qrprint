<?php

namespace App\Http\Controllers;

use App\Models\QrPrint;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\RoundBlockSizeMode;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Endroid\QrCode\Writer\SvgWriter;
use App\Models\PrintDocument;
use Illuminate\Support\Facades\Storage;

class QrPrintController extends Controller
{
    /**
     * QR Print dashboard
     */
    public function index()
    {
        $prints = QrPrint::latest()->get();

        return view('qr-print.index', compact('prints'));
    }

    /**
     * Create QR
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['nullable', 'string'],
        ]);

        $qrPrint = QrPrint::create([
            'uuid' => (string) Str::uuid(),
            'title' => $validated['title'],
            'content' => $validated['content'] ?? '',
            'print_token' => Str::random(32),
        ]);

        return redirect()
            ->route('qr-print.index')
            ->with('success', 'QR Code created successfully.');
    }

    /**
     * Show QR image
     */
    public function qr(QrPrint $qrPrint)
    {
        abort_unless($qrPrint->is_active, 404);

        $url = route('qr-print.print', [
            'token' => $qrPrint->print_token,
        ]);

        $builder = new Builder(
            writer: new SvgWriter(),
            writerOptions: [],
            validateResult: false,
            data: $url,
            encoding: new Encoding('UTF-8'),
            errorCorrectionLevel: ErrorCorrectionLevel::High,
            size: 300,
            margin: 10,
        );

        $result = $builder->build();

        return response($result->getString(), 200)
            ->header('Content-Type', 'image/svg+xml')
            ->header(
                'Cache-Control',
                'no-cache, no-store, must-revalidate'
            );
    }

    /**
     * Mobile QR scan page
     */
    public function print(string $token)
{
    $qrPrint = QrPrint::where('print_token', $token)
        ->where('is_active', true)
        ->firstOrFail();

    return view('qr-print.print', compact('qrPrint'));
}

    /**
     * Record successful browser print request
     */
    public function printed(QrPrint $qrPrint)
    {
        $qrPrint->increment('print_count');

        $qrPrint->update([
            'last_printed_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Print recorded successfully.',
        ]);
    }

    public function upload(Request $request, string $token)
    {
        $qrPrint = QrPrint::where('print_token', $token)
            ->where('is_active', true)
            ->firstOrFail();

        $validated = $request->validate([
            'document' => [
                'required',
                'file',
                'mimes:pdf,jpg,jpeg,png',
                'max:10240',
            ],
        ]);

        $file = $validated['document'];

        $storedName = $file->hashName();

        $path = $file->storeAs(
            'print-documents/' . $qrPrint->uuid,
            $storedName,
            'public'
        );

        $document = PrintDocument::create([
            'qr_print_id' => $qrPrint->id,
            'original_name' => $file->getClientOriginalName(),
            'stored_name' => $storedName,
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'disk' => 'public',
            'path' => $path,
        ]);

        return redirect()
            ->route('qr-print.document', [
                'token' => $token,
                'document' => $document->id,
            ])
            ->with('success', 'File uploaded successfully.');
    }

    public function document(string $token, PrintDocument $document)
    {
        $qrPrint = QrPrint::where('print_token', $token)
            ->where('is_active', true)
            ->firstOrFail();

        abort_unless(
            $document->qr_print_id === $qrPrint->id,
            404
        );

        return view('qr-print.document', compact(
            'qrPrint',
            'document'
        ));
    }

    public function printDocument(string $token, PrintDocument $document)
    {
        $qrPrint = QrPrint::where('print_token', $token)
            ->where('is_active', true)
            ->firstOrFail();

        abort_unless(
            $document->qr_print_id === $qrPrint->id,
            404
        );

        $document->increment('print_count');

        $document->update([
            'last_printed_at' => now(),
        ]);

        $qrPrint->increment('print_count');

        $qrPrint->update([
            'last_printed_at' => now(),
        ]);

        return response()->json([
            'success' => true,
        ]);
    }
}
