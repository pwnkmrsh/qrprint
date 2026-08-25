<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\QrPrint;
use App\Models\Printer;
use App\Models\PrinterAuditLog;
use App\Models\PrintDocument;
use App\Models\PrintSession;
use App\Models\PrintJob;
use App\Models\ShopSetting;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Reset/Clear Tables
        Schema::disableForeignKeyConstraints();
        DB::table('menu_items')->delete();
        DB::table('menus')->delete();
        DB::table('pages')->delete();
        DB::table('print_jobs')->delete();
        DB::table('print_sessions')->delete();
        DB::table('print_documents')->delete();
        DB::table('printer_audit_logs')->delete();
        DB::table('printers')->delete();
        DB::table('shop_settings')->delete();
        DB::table('qr_prints')->delete();
        DB::table('users')->delete();
        Schema::enableForeignKeyConstraints();

        // 2. Ensure default legacy roles exist
        $legacyRoles = ['super-admin', 'admin', 'editor', 'user'];
        foreach ($legacyRoles as $roleName) {
            Role::firstOrCreate(
                ['name' => $roleName, 'guard_name' => 'web'],
                [
                    'label' => ucwords(str_replace('-', ' ', $roleName)),
                    'description' => 'Legacy role ' . $roleName,
                    'is_active' => true
                ]
            );
        }

        // 3. Create Users and assign roles
        $usersConfig = [
            [
                'name' => 'Central Super Admin',
                'email' => 'pwnkmrsh@gmail.com',
                'password' => 'Qaws@123',
                'roles' => ['super-admin', 'SUPER ADMIN']
            ],
            [
                'name' => 'Shop Owner',
                'email' => 'owner@example.com',
                'password' => 'password',
                'roles' => ['admin', 'SHOP OWNER']
            ],
            [
                'name' => 'Ravi Manager',
                'email' => 'manager@example.com',
                'password' => 'password',
                'roles' => ['editor', 'SHOP MANAGER']
            ],
            [
                'name' => 'Vijay Operator',
                'email' => 'operator@example.com',
                'password' => 'password',
                'roles' => ['user', 'PRINTER OPERATOR']
            ],
            [
                'name' => 'Suresh Auditor',
                'email' => 'viewer@example.com',
                'password' => 'password',
                'roles' => ['user', 'VIEWER']
            ]
        ];

        $users = [];
        foreach ($usersConfig as $u) {
            $user = User::create([
                'name' => $u['name'],
                'email' => $u['email'],
                'password' => Hash::make($u['password']),
            ]);

            $user->syncRoles($u['roles']);
            $users[$u['email']] = $user;
        }

        // 4. Seed Shop (QrPrint) for Pawan Owner
        $owner = $users['owner@example.com'];
        $qrPrint = QrPrint::create([
            'user_id' => $owner->id,
            'uuid' => (string) Str::uuid(),
            'title' => 'ABC Cyber Cafe',
            'print_token' => 'abc-print',
            'content' => 'Rate Card: B&W A4 - ₹2/page, Color A4 - ₹10/page. Spools instantly.',
            'is_active' => true,
            'print_count' => 121,
            'last_printed_at' => now(),
        ]);

        ShopSetting::create([
            'qr_print_id' => $qrPrint->id,
            'user_id' => $owner->id,
            'shop_name' => 'ABC Cyber Cafe',
            'email' => 'contact@abccybercafe.com',
            'mobile_number' => '+91 98765 43210',
            'address' => 'Shop 4, Market Complex, Station Road, Delhi',
            'bw_printer_name' => 'Brother DCP-B7535DW',
            'color_printer_name' => 'HP LaserJet Color',
            'auto_detect_enabled' => true,
            'bw_price_per_page' => 2.00,
            'color_price_per_page' => 10.00,
            'scanner_price_per_page' => 5.00,
            'online_payment_enabled' => true,
            'counter_payment_enabled' => true,
            'show_currency' => true,
            'currency_symbol' => '₹',
            'payment_modes' => ['cash', 'upi', 'card', 'wallet'],
            'api_key_id' => 'rzp_test_1DP5mmOlF5G5ag',
            'secret_key' => 's3cr3t_t3st_k3y_987654321',
            'webhook_url' => url('/api/payment/webhook/' . $qrPrint->uuid),
        ]);

        // 5. Seed Printers for ABC Cyber Cafe
        // Printer 1: Brother (Default, Online)
        $printer1 = Printer::create([
            'uuid' => (string) Str::uuid(),
            'qr_print_id' => $qrPrint->id,
            'agent_id' => 'AGENT-001',
            'name' => 'Brother DCP-B7535DW',
            'model' => 'Brother DCP-B7535DW series',
            'status' => 'online',
            'is_default' => true,
            'is_active' => true,
            'capabilities' => [
                'color' => false,
                'duplex' => true,
                'paper_sizes' => ['A4', 'A5', 'Letter']
            ],
            'settings' => [
                'description' => 'Main Shop Spool Printer',
                'paper_size' => 'A4',
                'orientation' => 'auto',
                'color_mode' => 'bw',
                'copies' => 1,
                'scaling' => 'fit_to_page',
                'duplex' => 'off',
                'allow_color' => false,
                'allow_bw' => true,
                'allow_duplex' => true,
                'max_copies' => 20,
            ],
            'last_seen_at' => now()->subSeconds(15),
        ]);

        // Printer 2: HP LaserJet (Backup, Offline)
        $printer2 = Printer::create([
            'uuid' => (string) Str::uuid(),
            'qr_print_id' => $qrPrint->id,
            'agent_id' => 'AGENT-002',
            'name' => 'HP LaserJet Color',
            'model' => 'HP Color LaserJet Pro M254dw',
            'status' => 'offline',
            'is_default' => false,
            'is_active' => true,
            'capabilities' => [
                'color' => true,
                'duplex' => true,
                'paper_sizes' => ['A4', 'A5', 'Letter', 'Legal']
            ],
            'settings' => [
                'description' => 'Secondary Color Spool Printer',
                'paper_size' => 'A4',
                'orientation' => 'auto',
                'color_mode' => 'color',
                'copies' => 1,
                'scaling' => 'fit_to_page',
                'duplex' => 'off',
                'allow_color' => true,
                'allow_bw' => true,
                'allow_duplex' => true,
                'max_copies' => 10,
            ],
            'last_seen_at' => now()->subMinutes(12),
        ]);

        // 6. Seed Spooled Print documents and jobs
        // Document 1: Completed Resume
        $doc1 = PrintDocument::create([
            'qr_print_id' => $qrPrint->id,
            'original_name' => 'my_resume_latest.pdf',
            'stored_name' => 'resume-1.pdf',
            'mime_type' => 'application/pdf',
            'file_size' => 102400, // 100 KB
            'disk' => 'public',
            'path' => 'print-documents/resume-1.pdf',
            'file_type' => 'pdf',
            'metadata' => ['page_count' => 2],
            'status' => 'ready',
            'print_count' => 3,
            'last_printed_at' => now()->subMinutes(5),
        ]);

        // Document 2: Completed Excel worksheet
        $doc2 = PrintDocument::create([
            'qr_print_id' => $qrPrint->id,
            'original_name' => 'monthly_sales_report.xlsx',
            'stored_name' => 'sales-1.xlsx',
            'mime_type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'file_size' => 254800, // 250 KB
            'disk' => 'public',
            'path' => 'print-documents/sales-1.xlsx',
            'file_type' => 'excel',
            'metadata' => ['sheets' => ['Sheet1', 'Summary', 'Charts']],
            'status' => 'ready',
            'print_count' => 1,
            'last_printed_at' => now()->subMinutes(10),
        ]);

        // Document 3: Failed Print Spool
        $doc3 = PrintDocument::create([
            'qr_print_id' => $qrPrint->id,
            'original_name' => 'photo_frame_print.png',
            'stored_name' => 'photo-1.png',
            'mime_type' => 'image/png',
            'file_size' => 3145728, // 3 MB
            'disk' => 'public',
            'path' => 'print-documents/photo-1.png',
            'file_type' => 'image',
            'metadata' => ['width' => 1920, 'height' => 1080],
            'status' => 'ready',
            'print_count' => 1,
            'last_printed_at' => now()->subMinutes(20),
        ]);

        // Print Sessions & Jobs
        // Session 1: Completed Resume
        $session1 = PrintSession::create([
            'qr_print_id' => $qrPrint->id,
            'total_files' => 1,
            'completed_files' => 1,
            'failed_files' => 0,
            'status' => 'completed',
        ]);

        PrintJob::create([
            'uuid' => (string) Str::uuid(),
            'print_session_id' => $session1->id,
            'print_document_id' => $doc1->id,
            'printer_name' => $printer1->name,
            'copies' => 2,
            'orientation' => 'portrait',
            'color_mode' => 'bw',
            'paper_size' => 'A4',
            'scaling' => 'fit_to_page',
            'duplex' => 'off',
            'status' => 'printed',
            'attempts' => 1,
            'claimed_at' => now()->subMinutes(5),
            'started_at' => now()->subMinutes(5),
            'completed_at' => now()->subMinutes(4),
            'printed_at' => now()->subMinutes(4),
        ]);

        // Session 2: Completed Excel
        $session2 = PrintSession::create([
            'qr_print_id' => $qrPrint->id,
            'total_files' => 1,
            'completed_files' => 1,
            'failed_files' => 0,
            'status' => 'completed',
        ]);

        PrintJob::create([
            'uuid' => (string) Str::uuid(),
            'print_session_id' => $session2->id,
            'print_document_id' => $doc2->id,
            'printer_name' => $printer1->name,
            'copies' => 1,
            'orientation' => 'auto',
            'color_mode' => 'bw',
            'paper_size' => 'A4',
            'scaling' => 'actual',
            'duplex' => 'off',
            'selected_sheets' => ['Sheet1', 'Summary'],
            'status' => 'printed',
            'attempts' => 1,
            'claimed_at' => now()->subMinutes(10),
            'started_at' => now()->subMinutes(10),
            'completed_at' => now()->subMinutes(9),
            'printed_at' => now()->subMinutes(9),
        ]);

        // Session 3: Failed Print
        $session3 = PrintSession::create([
            'qr_print_id' => $qrPrint->id,
            'total_files' => 1,
            'completed_files' => 0,
            'failed_files' => 1,
            'status' => 'failed',
        ]);

        PrintJob::create([
            'uuid' => (string) Str::uuid(),
            'print_session_id' => $session3->id,
            'print_document_id' => $doc3->id,
            'printer_name' => $printer1->name,
            'copies' => 1,
            'orientation' => 'portrait',
            'color_mode' => 'bw',
            'paper_size' => 'A4',
            'scaling' => 'fit_to_page',
            'duplex' => 'off',
            'status' => 'failed',
            'attempts' => 1,
            'error_message' => 'Local Spool Error: Paper jam in tray 1.',
            'claimed_at' => now()->subMinutes(20),
            'started_at' => now()->subMinutes(20),
            'completed_at' => now()->subMinutes(19),
        ]);

        // 7. Seed some Audit Logs
        PrinterAuditLog::log(
            $qrPrint->id,
            $owner->id,
            $printer1->id,
            'Printer added',
            "Automatically registered printer '{$printer1->name}' via local agent announcement"
        );

        PrinterAuditLog::log(
            $qrPrint->id,
            $owner->id,
            $printer2->id,
            'Printer added',
            "Automatically registered printer '{$printer2->name}' via local agent announcement"
        );

        PrinterAuditLog::log(
            $qrPrint->id,
            $owner->id,
            $printer1->id,
            'Default printer changed',
            "Set '{$printer1->name}' as default shop printer"
        );

        // 8. Seed CMS Pages, Menus & RBAC Permissions
        $this->call(PageAndMenuSeeder::class);
    }
}
