<?php

namespace App\Http\Controllers;

use App\Models\Printer;
use App\Models\PrinterAuditLog;
use App\Models\PrintDocument;
use App\Models\PrintJob;
use App\Models\QrPrint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PrinterController extends Controller
{
    /**
     * Display all printers for the shop.
     */
    public function index()
    {
        $qrPrint = $this->getShop();
        $printers = $qrPrint->printers()->get();

        return Inertia::render('shop/printers/index', [
            'printers' => $printers,
            'qrPrint' => $qrPrint,
        ]);
    }

    /**
     * Show printer settings page.
     */
    public function settings(Printer $printer)
    {
        $this->authorizePrinter($printer);

        return Inertia::render('shop/printers/settings', [
            'printer' => $printer,
        ]);
    }

    /**
     * Update printer configuration/settings.
     */
    public function updateSettings(Request $request, Printer $printer)
    {
        $this->authorizePrinter($printer);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:500'],
            'is_default' => ['required', 'boolean'],
            'paper_size' => ['required', 'string', 'in:A4,A3,A5,Letter,Legal'],
            'orientation' => ['required', 'string', 'in:auto,portrait,landscape'],
            'color_mode' => ['required', 'string', 'in:bw,color'],
            'copies' => ['required', 'integer', 'min:1', 'max:100'],
            'scaling' => ['required', 'string', 'in:actual,fit_to_page,shrink_to_fit,fill_page'],
            'duplex' => ['required', 'string', 'in:off,long_edge,short_edge'],
            'allow_color' => ['required', 'boolean'],
            'allow_bw' => ['required', 'boolean'],
            'allow_duplex' => ['required', 'boolean'],
            'max_copies' => ['required', 'integer', 'min:1', 'max:100'],
        ]);

        $oldSettings = $printer->settings ?? [];
        $newSettings = [
            'description' => $validated['description'] ?? '',
            'paper_size' => $validated['paper_size'],
            'orientation' => $validated['orientation'],
            'color_mode' => $validated['color_mode'],
            'copies' => $validated['copies'],
            'scaling' => $validated['scaling'],
            'duplex' => $validated['duplex'],
            'allow_color' => $validated['allow_color'],
            'allow_bw' => $validated['allow_bw'],
            'allow_duplex' => $validated['allow_duplex'],
            'max_copies' => $validated['max_copies'],
        ];

        $oldName = $printer->name;
        $newName = $validated['name'];

        DB::transaction(function () use ($printer, $validated, $newSettings) {
            $printer->update([
                'name' => $validated['name'],
                'settings' => $newSettings,
            ]);

            if ($validated['is_default']) {
                Printer::where('qr_print_id', $printer->qr_print_id)
                    ->where('id', '!=', $printer->id)
                    ->update(['is_default' => false]);
                $printer->update(['is_default' => true]);
            }
        });

        // Audit Log
        $details = [
            'name' => ['old' => $oldName, 'new' => $newName],
            'is_default' => ['old' => $printer->getOriginal('is_default'), 'new' => $validated['is_default']],
            'settings' => ['old' => $oldSettings, 'new' => $newSettings],
        ];

        PrinterAuditLog::log(
            $printer->qr_print_id,
            Auth::id(),
            $printer->id,
            'Printer settings changed',
            "Updated configurations for printer '{$newName}'",
            $details
        );

        return redirect()->route('shop.printers.index')->with('success', 'Printer settings updated successfully.');
    }

    /**
     * Trigger a test print job.
     */
    public function testPrint(Printer $printer)
    {
        $this->authorizePrinter($printer);

        // 1. Ensure test-page.pdf exists in public storage
        $pdfContent = "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 54 >>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n(Print Setu Test Print Page) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000111 00000 n\n0000000250 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n355\n%%EOF";
        
        $testFilePath = 'print-documents/test-page.pdf';
        if (!Storage::disk('public')->exists($testFilePath)) {
            Storage::disk('public')->put($testFilePath, $pdfContent);
        }

        // 2. Create PrintDocument
        $doc = PrintDocument::create([
            'qr_print_id' => $printer->qr_print_id,
            'original_name' => 'QR2Print_Test_Page.pdf',
            'stored_name' => 'test-page.pdf',
            'mime_type' => 'application/pdf',
            'file_size' => strlen($pdfContent),
            'disk' => 'public',
            'path' => $testFilePath,
            'file_type' => 'pdf',
            'metadata' => ['page_count' => 1],
            'status' => 'ready',
        ]);

        // 3. Create PrintJob directly targeting this printer name
        $job = PrintJob::create([
            'print_document_id' => $doc->id,
            'printer_name' => $printer->name,
            'copies' => 1,
            'orientation' => 'portrait',
            'color_mode' => 'bw',
            'paper_size' => 'A4',
            'scaling' => 'fit_to_page',
            'duplex' => 'off',
            'status' => 'pending',
            'attempts' => 0,
        ]);

        // 4. Audit Log
        PrinterAuditLog::log(
            $printer->qr_print_id,
            Auth::id(),
            $printer->id,
            'Test print requested',
            "Triggered test print job for printer '{$printer->name}'",
            ['job_uuid' => $job->uuid]
        );

        return redirect()->back()->with('success', 'Test print job spooled. Please check your printer.');
    }

    /**
     * Test connection to the local printer agent.
     */
    public function testConnection(Printer $printer)
    {
        $this->authorizePrinter($printer);

        $isOnline = $printer->live_status !== 'offline';

        // Audit Log
        PrinterAuditLog::log(
            $printer->qr_print_id,
            Auth::id(),
            $printer->id,
            'Test connection requested',
            "Checked connection for printer '{$printer->name}': " . ($isOnline ? '🟢 Connected' : '🔴 Offline')
        );

        if ($isOnline) {
            return redirect()->back()->with('success', '🟢 Printer is online and ready.');
        }

        return redirect()->back()->with('error', '🔴 Printer is offline. Please make sure the local printer agent is running.');
    }

    /**
     * Set a printer as the default printer for the shop.
     */
    public function setDefault(Printer $printer)
    {
        $this->authorizePrinter($printer);

        DB::transaction(function () use ($printer) {
            Printer::where('qr_print_id', $printer->qr_print_id)->update(['is_default' => false]);
            $printer->update(['is_default' => true]);
        });

        // Audit Log
        PrinterAuditLog::log(
            $printer->qr_print_id,
            Auth::id(),
            $printer->id,
            'Default printer changed',
            "Set '{$printer->name}' as default printer"
        );

        return redirect()->back()->with('success', "Set '{$printer->name}' as default printer.");
    }

    /**
     * Activate a deactivated printer.
     */
    public function activate(Printer $printer)
    {
        $this->authorizePrinter($printer);

        $printer->update(['is_active' => true]);

        // Audit Log
        PrinterAuditLog::log(
            $printer->qr_print_id,
            Auth::id(),
            $printer->id,
            'Printer activated',
            "Activated printer '{$printer->name}'"
        );

        return redirect()->back()->with('success', "Printer '{$printer->name}' activated successfully.");
    }

    /**
     * Deactivate a printer.
     */
    public function deactivate(Printer $printer)
    {
        $this->authorizePrinter($printer);

        // Check if there are print jobs spooled under this printer name
        $hasHistory = PrintJob::where('printer_name', $printer->name)->exists();

        if ($hasHistory) {
            // Soft deactivation so print jobs history is preserved
            $printer->update(['is_active' => false, 'is_default' => false]);
        } else {
            // Hard delete since there's no transaction history
            $printer->delete();
        }

        // Audit Log
        PrinterAuditLog::log(
            $printer->qr_print_id,
            Auth::id(),
            $printer->id,
            'Printer deactivated',
            "Deactivated printer '{$printer->name}'"
        );

        return redirect()->back()->with('success', "Printer '{$printer->name}' deactivated successfully.");
    }

    /**
     * Get the active shop QrPrint instance for the logged in user.
     */
    private function getShop(): QrPrint
    {
        $user = Auth::user();
        return QrPrint::firstOrCreate(
            ['user_id' => $user->id],
            [
                'title' => $user->name . ' Print Point',
                'content' => 'Scan to print at ' . $user->name,
                'is_active' => true,
            ]
        );
    }

    /**
     * Enforce strict shop data isolation.
     */
    private function authorizePrinter(Printer $printer)
    {
        $shop = $this->getShop();
        abort_unless($printer->qr_print_id === $shop->id, 403, 'Unauthorized access to printer.');
    }
}
