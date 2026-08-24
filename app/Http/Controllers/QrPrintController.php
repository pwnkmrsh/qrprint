<?php

namespace App\Http\Controllers;

use App\Models\QrPrint;
use App\Models\PrintDocument;
use App\Models\PrintJob;
use App\Models\PrintSession;
use App\Services\DocumentAnalyzerService;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\Writer\SvgWriter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class QrPrintController extends Controller
{
    private const PRICING = [
        'A4' => ['bw' => 2, 'color' => 10],
        'A3' => ['bw' => 5, 'color' => 20],
        'Letter' => ['bw' => 2, 'color' => 10],
        'Legal' => ['bw' => 3, 'color' => 12],
    ];

    /**
     * QR Print dashboard (Admin)
     */
    public function index()
    {
        $prints = QrPrint::latest()->get()->map(fn(QrPrint $qrPrint) => [
            'id' => $qrPrint->id,
            'title' => $qrPrint->title,
            'print_count' => $qrPrint->print_count,
            'is_active' => $qrPrint->is_active,
            'created_at' => $qrPrint->created_at?->toDateTimeString(),
            'qr_url' => route('qr-print.qr', $qrPrint),
            'print_url' => route('qr-print.print', $qrPrint->print_token),
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
        // Allowed even if inactive, so merchant can print/download QR poster from dashboard


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
            ->header('Cache-Control', 'no-cache, no-store, must-revalidate');
    }

    /**
     * Mobile Multi-File QR Print Page
     */
    public function print(string $token)
    {
        $qrPrint = QrPrint::where('print_token', $token)->firstOrFail();
        $setting = $qrPrint->shopSetting;

        return Inertia::render('qr-print/multi-print', [
            'qrPrint' => [
                'id' => $qrPrint->id,
                'title' => $setting?->shop_name ?: $qrPrint->title,
                'token' => $qrPrint->print_token,
                'is_active' => $qrPrint->is_active,
                'upload_url' => route('qr-print.upload-multi', $qrPrint->print_token),
                'create_session_url' => route('qr-print.session.create', $qrPrint->print_token),
                'logo_url' => $setting?->logo_url,
                'mobile_number' => $setting?->mobile_number,
                'address' => $setting?->address,
            ],
            'shopSettings' => [
                'shop_name' => $setting?->shop_name ?: $qrPrint->title,
                'bw_price_per_page' => $setting ? (float)$setting->bw_price_per_page : 2.0,
                'color_price_per_page' => $setting ? (float)$setting->color_price_per_page : 10.0,
                'scanner_price_per_page' => $setting ? (float)$setting->scanner_price_per_page : 5.0,
                'online_payment_enabled' => $setting ? (bool)$setting->online_payment_enabled : true,
                'counter_payment_enabled' => $setting ? (bool)$setting->counter_payment_enabled : true,
                'show_currency' => $setting ? (bool)$setting->show_currency : true,
                'currency_symbol' => $setting?->currency_symbol ?: '₹',
                'payment_modes' => $setting?->payment_modes ?: ['cash', 'upi', 'card', 'wallet'],
            ],
            'limits' => [
                'max_files' => 10,
                'max_file_size_mb' => 20,
                'allowed_extensions' => ['pdf', 'jpg', 'jpeg', 'png', 'xls', 'xlsx', 'doc', 'docx', 'ppt', 'pptx'],
            ],
        ]);
    }

    /**
     * Multi-file upload with automatic analysis and Excel sheet extraction.
     */
    public function uploadMulti(Request $request, string $token, DocumentAnalyzerService $analyzer)
    {
        $qrPrint = $this->findActivePrint($token);

        $validated = $request->validate([
            'documents' => ['required', 'array', 'min:1', 'max:10'],
            'documents.*' => [
                'required',
                'file',
                'mimes:pdf,jpg,jpeg,png,webp,xls,xlsx,csv,doc,docx,ppt,pptx',
                'max:20480', // 20 MB
            ],
        ]);

        $uploaded = [];
        foreach ($validated['documents'] as $file) {
            $originalName = $file->getClientOriginalName();
            $extension = $file->getClientOriginalExtension() ?: pathinfo($originalName, PATHINFO_EXTENSION);
            $mimeType = $file->getMimeType() ?: 'application/octet-stream';
            $storedName = $file->hashName();

            $path = $file->storeAs(
                'print-documents/' . $qrPrint->uuid,
                $storedName,
                'public'
            );

            $fullStoragePath = storage_path('app/public/' . $path);
            $analysis = $analyzer->analyze($fullStoragePath, $extension, $mimeType);

            $doc = PrintDocument::create([
                'qr_print_id' => $qrPrint->id,
                'original_name' => $originalName,
                'stored_name' => $storedName,
                'mime_type' => $mimeType,
                'file_size' => $file->getSize(),
                'disk' => 'public',
                'path' => $path,
                'file_type' => $analysis['file_type'],
                'metadata' => $analysis['metadata'],
                'status' => 'ready',
            ]);

            $uploaded[] = [
                'id' => $doc->id,
                'original_name' => $doc->original_name,
                'file_size' => $doc->file_size,
                'file_type' => $doc->file_type,
                'metadata' => $doc->metadata ?? [],
                'file_url' => Storage::disk('public')->url($doc->path),
            ];
        }

        return response()->json([
            'success' => true,
            'documents' => $uploaded,
        ]);
    }

    /**
     * Create PrintSession and individual PrintJobs for all configured files.
     */
    public function createSession(Request $request, string $token)
    {
        $qrPrint = $this->findActivePrint($token);
        $setting = $qrPrint->shopSetting;

        $validated = $request->validate([
            'payment_method' => ['nullable', 'string', 'in:counter,online,upi,cash,card,wallet'],
            'files' => ['required', 'array', 'min:1', 'max:10'],
            'files.*.document_id' => ['required', 'integer'],
            'files.*.copies' => ['required', 'integer', 'min:1', 'max:20'],
            'files.*.orientation' => ['nullable', 'string', 'in:auto,portrait,landscape'],
            'files.*.color_mode' => ['nullable', 'string', 'in:bw,color'],
            'files.*.paper_size' => ['nullable', 'string', 'in:A4,A3,Letter,Legal'],
            'files.*.scaling' => ['nullable', 'string'],
            'files.*.duplex' => ['nullable', 'string', 'in:off,long_edge,short_edge'],
            'files.*.page_range' => ['nullable', 'string'],
            'files.*.selected_sheets' => ['nullable', 'array'],
            'files.*.print_options' => ['nullable', 'array'],
        ]);

        $docIds = collect($validated['files'])->pluck('document_id')->unique();
        $documents = PrintDocument::where('qr_print_id', $qrPrint->id)
            ->whereIn('id', $docIds)
            ->get()
            ->keyBy('id');

        abort_unless($documents->count() === $docIds->count(), 400, 'Invalid documents in session.');

        $defaultPrinter = \App\Models\Printer::where('qr_print_id', $qrPrint->id)
            ->where('is_default', true)
            ->where('is_active', true)
            ->first();

        // Validate Excel files have at least 1 sheet selected
        foreach ($validated['files'] as $fileConfig) {
            $doc = $documents[$fileConfig['document_id']];
            if ($doc->file_type === 'excel') {
                if (empty($fileConfig['selected_sheets'])) {
                    return response()->json([
                        'success' => false,
                        'message' => "Please select at least one sheet for {$doc->original_name}.",
                    ], 422);
                }
            }
        }

        // Pricing Rates from Shop Settings
        $bwPrice = $setting ? (float)$setting->bw_price_per_page : 2.0;
        $colorPrice = $setting ? (float)$setting->color_price_per_page : 10.0;
        $currency = $setting?->currency_symbol ?: '₹';

        $paymentMethod = $validated['payment_method'] ?? 'counter';
        $isOnline = ($paymentMethod === 'online' || $paymentMethod === 'upi');
        $paymentStatus = $isOnline ? 'paid' : 'pending';
        $printStatus = $isOnline ? 'ready_to_print' : 'pending_payment';

        $session = PrintSession::create([
            'qr_print_id' => $qrPrint->id,
            'total_files' => count($validated['files']),
            'completed_files' => 0,
            'failed_files' => 0,
            'status' => 'ready',
            'payment_method' => $paymentMethod,
            'payment_status' => $paymentStatus,
            'print_status' => $printStatus,
            'total_amount' => 0.00,
            'currency' => $currency,
        ]);

        $totalSessionAmount = 0.0;

        foreach ($validated['files'] as $fileConfig) {
            $doc = $documents[$fileConfig['document_id']];

            // Resolve values with fallback chain
            $resolvedCopies = $fileConfig['copies'] ?? null;
            $resolvedOrientation = $fileConfig['orientation'] ?? null;
            $resolvedColorMode = $fileConfig['color_mode'] ?? null;
            $resolvedPaperSize = $fileConfig['paper_size'] ?? null;
            $resolvedScaling = $fileConfig['scaling'] ?? null;
            $resolvedDuplex = $fileConfig['duplex'] ?? null;

            if ($defaultPrinter) {
                $printerSettings = $defaultPrinter->settings ?? [];
                
                $resolvedCopies ??= $printerSettings['copies'] ?? 1;
                $resolvedOrientation ??= $printerSettings['orientation'] ?? 'auto';
                $resolvedColorMode ??= $printerSettings['color_mode'] ?? 'bw';
                $resolvedPaperSize ??= $printerSettings['paper_size'] ?? 'A4';
                $resolvedScaling ??= $printerSettings['scaling'] ?? 'actual';
                $resolvedDuplex ??= $printerSettings['duplex'] ?? 'off';
            } else {
                $resolvedCopies ??= 1;
                $resolvedOrientation ??= 'auto';
                $resolvedColorMode ??= 'bw';
                $resolvedPaperSize ??= 'A4';
                $resolvedScaling ??= 'actual';
                $resolvedDuplex ??= 'off';
            }

            // Capability check
            if ($defaultPrinter) {
                $capabilities = $defaultPrinter->capabilities ?? [];

                if ($resolvedColorMode === 'color' && empty($capabilities['color'])) {
                    return response()->json([
                        'success' => false,
                        'message' => "Selected printer does not support color printing.",
                    ], 422);
                }

                if (in_array($resolvedDuplex, ['long_edge', 'short_edge']) && empty($capabilities['duplex'])) {
                    return response()->json([
                        'success' => false,
                        'message' => "Selected printer does not support duplex printing.",
                    ], 422);
                }

                $supportedPaper = $capabilities['paper_sizes'] ?? [];
                if (!empty($supportedPaper) && !in_array($resolvedPaperSize, $supportedPaper)) {
                    return response()->json([
                        'success' => false,
                        'message' => "Selected printer does not support {$resolvedPaperSize} paper size.",
                    ], 422);
                }

                $maxCopies = $defaultPrinter->settings['max_copies'] ?? 20;
                if ($resolvedCopies > $maxCopies) {
                    return response()->json([
                        'success' => false,
                        'message' => "Requested copies ({$resolvedCopies}) exceeds maximum allowed copies ({$maxCopies}) for this printer.",
                    ], 422);
                }
            }

            // Calculate job cost
            $rate = ($resolvedColorMode === 'color') ? $colorPrice : $bwPrice;
            $pages = 1;
            if ($doc->file_type === 'excel' && !empty($fileConfig['selected_sheets'])) {
                $pages = count($fileConfig['selected_sheets']);
            } elseif ($doc->page_count) {
                $pages = $doc->page_count;
            }
            $jobAmount = (float)($pages * $resolvedCopies * $rate);
            $totalSessionAmount += $jobAmount;

            PrintJob::create([
                'print_session_id' => $session->id,
                'print_document_id' => $doc->id,
                'printer_name' => $defaultPrinter ? $defaultPrinter->name : null,
                'copies' => $resolvedCopies,
                'orientation' => $resolvedOrientation,
                'color_mode' => $resolvedColorMode,
                'paper_size' => $resolvedPaperSize,
                'scaling' => $resolvedScaling,
                'duplex' => $resolvedDuplex,
                'page_range' => $fileConfig['page_range'] ?? null,
                'selected_sheets' => $fileConfig['selected_sheets'] ?? null,
                'print_options' => $fileConfig['print_options'] ?? null,
                'payment_method' => $paymentMethod,
                'amount' => $jobAmount,
                'status' => $isOnline ? 'pending' : 'pending_payment',
                'attempts' => 0,
            ]);

            $doc->increment('print_count');
            $doc->update(['last_printed_at' => now()]);
        }

        // Update session total amount
        $session->update(['total_amount' => $totalSessionAmount]);

        $qrPrint->increment('print_count');
        $qrPrint->update(['last_printed_at' => now()]);

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'session_uuid' => $session->uuid,
                'status_url' => route('qr-print.session.status', [
                    'token' => $token,
                    'session' => $session->uuid,
                ]),
            ]);
        }

        return redirect()->route('qr-print.session.status', [
            'token' => $token,
            'session' => $session->uuid,
        ]);
    }

    /**
     * Session Status View (Live progress tracking for all files in a print session)
     */
    public function sessionStatus(string $token, string $sessionUuid)
    {
        $qrPrint = $this->findActivePrint($token);
        $setting = $qrPrint->shopSetting;

        $session = PrintSession::with(['jobs.document'])
            ->where('uuid', $sessionUuid)
            ->where('qr_print_id', $qrPrint->id)
            ->firstOrFail();

        return Inertia::render('qr-print/session-status', [
            'qrPrint' => [
                'title' => $setting?->shop_name ?: $qrPrint->title,
                'token' => $qrPrint->print_token,
                'home_url' => route('qr-print.print', $token),
                'logo_url' => $setting?->logo_url,
                'mobile_number' => $setting?->mobile_number,
                'address' => $setting?->address,
            ],
            'session' => [
                'uuid' => $session->uuid,
                'order_id' => $session->formatted_order_id,
                'status' => $session->status,
                'payment_method' => $session->payment_method ?: 'counter',
                'payment_status' => $session->payment_status ?: 'pending',
                'print_status' => $session->print_status ?: 'ready_to_print',
                'total_amount' => (float)$session->total_amount,
                'currency' => $session->currency ?: ($setting?->currency_symbol ?: '₹'),
                'total_files' => $session->total_files,
                'completed_files' => $session->completed_files,
                'failed_files' => $session->failed_files,
                'created_at' => $session->created_at?->toDateTimeString(),
            ],
            'jobs' => $session->jobs->map(fn(PrintJob $job) => [
                'id' => $job->id,
                'uuid' => $job->uuid,
                'document_name' => $job->document?->original_name ?? 'Unknown',
                'file_type' => $job->document?->file_type ?? 'other',
                'copies' => $job->copies,
                'orientation' => $job->orientation,
                'color_mode' => $job->color_mode,
                'paper_size' => $job->paper_size,
                'duplex' => $job->duplex,
                'amount' => (float)$job->amount,
                'payment_method' => $job->payment_method,
                'selected_sheets' => $job->selected_sheets,
                'status' => $job->status,
                'attempts' => $job->attempts,
                'error_message' => $job->error_message,
                'created_at' => $job->created_at?->toDateTimeString(),
                'completed_at' => $job->completed_at?->toDateTimeString(),
            ]),
            'status_url' => route('qr-print.session.api', [
                'token' => $token,
                'session' => $session->uuid,
            ]),
            'retry_url' => route('qr-print.job.retry', $token),
        ]);
    }

    /**
     * Session Status JSON API endpoint for polling.
     */
    public function sessionStatusApi(string $token, string $sessionUuid)
    {
        $qrPrint = $this->findActivePrint($token);

        $session = PrintSession::with(['jobs.document'])
            ->where('uuid', $sessionUuid)
            ->where('qr_print_id', $qrPrint->id)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'session' => [
                'uuid' => $session->uuid,
                'order_id' => $session->formatted_order_id,
                'status' => $session->status,
                'payment_method' => $session->payment_method ?: 'counter',
                'payment_status' => $session->payment_status ?: 'pending',
                'print_status' => $session->print_status ?: 'ready_to_print',
                'total_amount' => (float)$session->total_amount,
                'currency' => $session->currency ?: '₹',
                'total_files' => $session->total_files,
                'completed_files' => $session->completed_files,
                'failed_files' => $session->failed_files,
            ],
            'jobs' => $session->jobs->map(fn(PrintJob $job) => [
                'id' => $job->id,
                'uuid' => $job->uuid,
                'document_name' => $job->document?->original_name ?? 'Unknown',
                'file_type' => $job->document?->file_type ?? 'other',
                'copies' => $job->copies,
                'orientation' => $job->orientation,
                'color_mode' => $job->color_mode,
                'paper_size' => $job->paper_size,
                'duplex' => $job->duplex,
                'amount' => (float)$job->amount,
                'selected_sheets' => $job->selected_sheets,
                'status' => $job->status,
                'attempts' => $job->attempts,
                'error_message' => $job->error_message,
                'completed_at' => $job->completed_at?->toDateTimeString(),
            ]),
        ]);
    }

    /**
     * Re-queue a failed job (supports up to 3 retry attempts).
     */
    public function retryJob(Request $request, string $token)
    {
        $qrPrint = $this->findActivePrint($token);

        $validated = $request->validate([
            'job_uuid' => ['required', 'string'],
        ]);

        $job = PrintJob::where('uuid', $validated['job_uuid'])->firstOrFail();
        abort_unless($job->document && $job->document->qr_print_id === $qrPrint->id, 403);

        if ($job->attempts >= 3) {
            return response()->json([
                'success' => false,
                'message' => 'Maximum retry attempts (3) exceeded for this job.',
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
                $session->update([
                    'status' => 'printing',
                    'print_status' => 'printing',
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Job re-queued successfully.',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Existing & Legacy Customer Flow Endpoints
    |--------------------------------------------------------------------------
    */

    public function shop(string $token)
    {
        $qrPrint = $this->findActivePrint($token);
        $setting = $qrPrint->shopSetting;

        return Inertia::render('customer/shop', [
            'shop' => [
                'name' => $setting?->shop_name ?: $qrPrint->title,
                'slug' => $token,
                'email' => $setting?->email,
                'mobile_number' => $setting?->mobile_number,
                'address' => $setting?->address,
                'logo_url' => $setting?->logo_url,
                'upload_url' => route('qr-print.print', $token),
                'pricing' => [
                    'bw_price_per_page' => $setting ? (float)$setting->bw_price_per_page : 2.0,
                    'color_price_per_page' => $setting ? (float)$setting->color_price_per_page : 10.0,
                    'scanner_price_per_page' => $setting ? (float)$setting->scanner_price_per_page : 5.0,
                    'currency_symbol' => $setting?->currency_symbol ?: '₹',
                    'show_currency' => $setting ? (bool)$setting->show_currency : true,
                    'online_payment_enabled' => $setting ? (bool)$setting->online_payment_enabled : true,
                    'counter_payment_enabled' => $setting ? (bool)$setting->counter_payment_enabled : true,
                ],
            ],
        ]);
    }

    public function customerUpload(string $token)
    {
        return $this->print($token);
    }

    public function customerStoreUpload(Request $request, string $token, DocumentAnalyzerService $analyzer)
    {
        return $this->uploadMulti($request, $token, $analyzer);
    }

    public function customerConfigure(Request $request, string $token)
    {
        return $this->print($token);
    }

    public function customerPayment(Request $request, string $token)
    {
        $qrPrint = $this->findActivePrint($token);
        $setting = $qrPrint->shopSetting;

        $ids = collect(explode(',', (string) $request->query('documents')))
            ->filter(fn($id) => ctype_digit((string) $id))
            ->map(fn($id) => (int) $id);

        abort_if($ids->isEmpty(), 404);

        $documents = PrintDocument::where('qr_print_id', $qrPrint->id)
            ->whereIn('id', $ids)
            ->get();

        abort_unless($documents->count() === $ids->count(), 404);

        $paperSize = $request->query('paper_size', 'A4');
        if (!in_array($paperSize, ['A4', 'A3', 'Letter', 'Legal'])) {
            $paperSize = 'A4';
        }

        $colorMode = $request->query('color_mode', 'bw');
        if (!in_array($colorMode, ['bw', 'color'])) {
            $colorMode = 'bw';
        }

        $copies = max(1, min(99, (int) $request->query('copies', 1)));
        $duplex = filter_var($request->query('duplex', false), FILTER_VALIDATE_BOOLEAN);
        $orientation = $request->query('orientation', 'portrait') === 'landscape' ? 'landscape' : 'portrait';

        $bwRate = $setting ? (float)$setting->bw_price_per_page : 2.0;
        $colorRate = $setting ? (float)$setting->color_price_per_page : 10.0;
        $rate = $colorMode === 'color' ? $colorRate : $bwRate;

        $totalDocuments = $documents->count();
        $subtotal = $totalDocuments * $copies * $rate;

        return Inertia::render('customer/payment', [
            'shop' => [
                'name' => $setting?->shop_name ?: $qrPrint->title,
                'slug' => $token,
                'online_payment_enabled' => $setting ? (bool)$setting->online_payment_enabled : true,
                'counter_payment_enabled' => $setting ? (bool)$setting->counter_payment_enabled : true,
                'show_currency' => $setting ? (bool)$setting->show_currency : true,
                'currency_symbol' => $setting?->currency_symbol ?: '₹',
                'payment_modes' => $setting?->payment_modes ?: ['cash', 'upi', 'card', 'wallet'],
            ],
            'documents' => $documents->map(fn(PrintDocument $doc) => [
                'id' => $doc->id,
                'name' => $doc->original_name,
                'size' => $doc->file_size,
                'pages' => 1,
            ])->values(),
            'config' => [
                'paper_size' => $paperSize,
                'color_mode' => $colorMode,
                'copies' => $copies,
                'duplex' => $duplex,
                'orientation' => $orientation,
            ],
            'pricing' => [
                'rate' => $rate,
                'subtotal' => $subtotal,
            ],
            'checkout_url' => route('customer.checkout', $token),
            'configure_url' => route('qr-print.print', $token),
        ]);
    }

    public function customerCheckout(Request $request, string $token)
    {
        return $this->createSession($request, $token);
    }

    public function customerStatus(string $token, string $jobIdentifier)
    {
        $qrPrint = $this->findActivePrint($token);

        $job = PrintJob::with('document')
            ->where('uuid', $jobIdentifier)
            ->orWhere('id', $jobIdentifier)
            ->firstOrFail();

        abort_unless($job->document && $job->document->qr_print_id === $qrPrint->id, 404);

        if ($job->print_session_id) {
            $session = PrintSession::find($job->print_session_id);
            if ($session) {
                return redirect()->route('qr-print.session.status', [
                    'token' => $token,
                    'session' => $session->uuid,
                ]);
            }
        }

        return Inertia::render('customer/status', [
            'shop' => [
                'name' => $qrPrint->title,
                'slug' => $token,
                'home_url' => route('qr-print.print', $token),
            ],
            'job' => [
                'id' => $job->id,
                'uuid' => $job->uuid,
                'status' => $job->status,
                'copies' => $job->copies,
                'attempts' => $job->attempts,
                'error_message' => $job->error_message,
                'created_at' => $job->created_at?->toDateTimeString(),
                'printed_at' => $job->printed_at?->toDateTimeString(),
                'document_name' => $job->document->original_name,
                'document_size' => $job->document->file_size,
            ],
            'status_url' => route('customer.job-status', [
                'token' => $token,
                'job' => $job->uuid,
            ]),
        ]);
    }

    public function customerJobStatus(string $token, string $jobIdentifier)
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
            ],
        ]);
    }

    public function estimate(Request $request, string $token)
    {
        $qrPrint = $this->findActivePrint($token);
        $data = $request->validate([
            'documents' => ['required', 'array', 'min:1', 'max:10'],
            'documents.*' => ['integer'],
            'paper_size' => ['required', 'in:A4,A3,Letter,Legal'],
            'color_mode' => ['required', 'in:bw,color'],
            'copies' => ['required', 'integer', 'min:1', 'max:20'],
            'duplex' => ['nullable'],
            'orientation' => ['nullable'],
        ]);

        $count = PrintDocument::where('qr_print_id', $qrPrint->id)->whereIn('id', $data['documents'])->count();
        abort_unless($count === count($data['documents']), 404);

        $setting = $qrPrint->shopSetting;
        $bwRate = $setting ? (float)$setting->bw_price_per_page : 2.0;
        $colorRate = $setting ? (float)$setting->color_price_per_page : 10.0;
        $rate = $data['color_mode'] === 'color' ? $colorRate : $bwRate;

        return response()->json([
            'success' => true,
            'estimate' => [
                'pages' => $count,
                'rate' => $rate,
                'subtotal' => $count * $data['copies'] * $rate,
            ],
        ]);
    }

    private function findActivePrint(string $token): QrPrint
    {
        $qrPrint = QrPrint::where('print_token', $token)->firstOrFail();
        if (!$qrPrint->is_active) {
            abort(403, 'This QR Print Point is currently deactivated.');
        }
        return $qrPrint;
    }

    public function printed(QrPrint $qrPrint)
    {
        $qrPrint->increment('print_count');
        $qrPrint->update(['last_printed_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'Print recorded successfully.',
        ]);
    }

    public function printContent(string $token)
    {
        $qrPrint = $this->findActivePrint($token);

        return Inertia::render('qr-print/print-content', [
            'qrPrint' => [
                'title' => $qrPrint->title,
                'uuid' => $qrPrint->uuid,
                'content' => $qrPrint->content,
                'printed_url' => route('qr-print.printed', $qrPrint),
            ],
        ]);
    }

    public function upload(Request $request, string $token, DocumentAnalyzerService $analyzer)
    {
        return $this->uploadMulti($request, $token, $analyzer);
    }

    public function document(string $token, PrintDocument $document)
    {
        $qrPrint = $this->findActivePrint($token);
        abort_unless($document->qr_print_id === $qrPrint->id, 404);

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
        $qrPrint = $this->findActivePrint($token);
        abort_unless($document->qr_print_id === $qrPrint->id, 404);

        $document->increment('print_count');
        $document->update(['last_printed_at' => now()]);
        $qrPrint->increment('print_count');
        $qrPrint->update(['last_printed_at' => now()]);

        return response()->json(['success' => true]);
    }
}
