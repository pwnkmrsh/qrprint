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
use Inertia\Inertia;

class QrPrintController extends Controller
{
    private const PRICING = ['A4' => ['bw' => 2, 'color' => 10], 'A3' => ['bw' => 5, 'color' => 20], 'Letter' => ['bw' => 2, 'color' => 10], 'Legal' => ['bw' => 3, 'color' => 12]];
    /**
     * QR Print dashboard
     */
    public function index()
    {
        $prints = QrPrint::latest()->get()->map(fn (QrPrint $qrPrint) => [
            'id' => $qrPrint->id,
            'title' => $qrPrint->title,
            'print_count' => $qrPrint->print_count,
            'is_active' => $qrPrint->is_active,
            'created_at' => $qrPrint->created_at?->toDateTimeString(),
            'qr_url' => route('qr-print.qr', $qrPrint),
            'print_url' => route('customer.shop', $qrPrint->print_token),
        ]);

        return Inertia::render('qr-print/index', compact('prints'));
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

        $url = route('customer.shop', [
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

        return Inertia::render('qr-print/print', [
            'qrPrint' => [
                'title' => $qrPrint->title,
                'upload_url' => route('qr-print.upload', $qrPrint->print_token),
            ],
        ]);
    }

    public function shop(string $token)
    {
        $qrPrint = $this->findActivePrint($token);
        return Inertia::render('customer/shop', ['shop' => ['name' => $qrPrint->title, 'slug' => $token, 'upload_url' => route('customer.upload', $token)]]);
    }

    public function customerUpload(string $token)
    {
        $qrPrint = $this->findActivePrint($token);
        return Inertia::render('customer/upload', ['shop' => ['name' => $qrPrint->title, 'slug' => $token, 'upload_url' => route('customer.upload.store', $token)], 'limits' => ['max_files' => 5, 'max_file_size_mb' => 10]]);
    }

    public function customerStoreUpload(Request $request, string $token)
    {
        $qrPrint = $this->findActivePrint($token);
        $validated = $request->validate(['documents' => ['required', 'array', 'min:1', 'max:5'], 'documents.*' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240']]);
        $ids = collect($validated['documents'])->map(function ($file) use ($qrPrint) {
            $storedName = $file->hashName();
            $path = $file->storeAs('print-documents/' . $qrPrint->uuid, $storedName, 'public');
            return PrintDocument::create(['qr_print_id' => $qrPrint->id, 'original_name' => $file->getClientOriginalName(), 'stored_name' => $storedName, 'mime_type' => $file->getMimeType(), 'file_size' => $file->getSize(), 'disk' => 'public', 'path' => $path])->id;
        });
        return redirect()->route('customer.configure', ['token' => $token, 'documents' => $ids->implode(',')]);
    }

    public function customerConfigure(Request $request, string $token)
    {
        $qrPrint = $this->findActivePrint($token);
        $ids = collect(explode(',', (string) $request->query('documents')))->filter(fn ($id) => ctype_digit($id))->map(fn ($id) => (int) $id);
        abort_if($ids->isEmpty(), 404);
        $documents = PrintDocument::where('qr_print_id', $qrPrint->id)->whereIn('id', $ids)->get();
        abort_unless($documents->count() === $ids->count(), 404);
        return Inertia::render('customer/configure', ['shop' => ['name' => $qrPrint->title, 'slug' => $token], 'documents' => $documents->map(fn (PrintDocument $document) => ['id' => $document->id, 'name' => $document->original_name, 'size' => $document->file_size, 'pages' => 1])->values(), 'estimate_url' => route('customer.estimate', $token)]);
    }

    public function estimate(Request $request, string $token)
    {
        $qrPrint = $this->findActivePrint($token);
        $data = $request->validate(['documents' => ['required', 'array', 'min:1', 'max:5'], 'documents.*' => ['integer'], 'paper_size' => ['required', 'in:A4,A3,Letter,Legal'], 'color_mode' => ['required', 'in:bw,color'], 'copies' => ['required', 'integer', 'min:1', 'max:99'], 'duplex' => ['required', 'boolean'], 'orientation' => ['required', 'in:portrait,landscape']]);
        $count = PrintDocument::where('qr_print_id', $qrPrint->id)->whereIn('id', $data['documents'])->count();
        abort_unless($count === count($data['documents']), 404);
        $rate = self::PRICING[$data['paper_size']][$data['color_mode']];
        return response()->json(['success' => true, 'estimate' => ['pages' => $count, 'rate' => $rate, 'subtotal' => $count * $data['copies'] * $rate]]);
    }

    private function findActivePrint(string $token): QrPrint
    {
        return QrPrint::where('print_token', $token)->where('is_active', true)->firstOrFail();
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

    public function printContent(string $token)
    {
        $qrPrint = QrPrint::where('print_token', $token)
            ->where('is_active', true)
            ->firstOrFail();

        return Inertia::render('qr-print/print-content', [
            'qrPrint' => [
                'title' => $qrPrint->title,
                'uuid' => $qrPrint->uuid,
                'content' => $qrPrint->content,
                'printed_url' => route('qr-print.printed', $qrPrint),
            ],
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

        return Inertia::render('qr-print/document', [
            'qrPrint' => [
                'title' => $qrPrint->title,
            ],
            'document' => [
                'id' => $document->id,
                'original_name' => $document->original_name,
                'mime_type' => $document->mime_type,
                'file_url' => Storage::disk($document->disk)->url($document->path),
            ],
            'create_job_url' => route('qr-print.document.create-job', [
                'token' => $qrPrint->print_token,
                'document' => $document->id,
            ]),
        ]);
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
