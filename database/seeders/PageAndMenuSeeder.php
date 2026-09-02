<?php

namespace Database\Seeders;

use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\Page;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PageAndMenuSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Permissions
        $permissions = [
            // Pages module
            ['module' => 'Pages', 'name' => 'access-pages-module', 'label' => 'Access Pages Module', 'description' => 'Access CMS Pages in admin panel'],
            ['module' => 'Pages', 'name' => 'page.view', 'label' => 'View Pages', 'description' => 'View list and details of CMS pages'],
            ['module' => 'Pages', 'name' => 'page.create', 'label' => 'Create Page', 'description' => 'Create new CMS pages'],
            ['module' => 'Pages', 'name' => 'page.edit', 'label' => 'Edit Page', 'description' => 'Edit existing CMS pages'],
            ['module' => 'Pages', 'name' => 'page.delete', 'label' => 'Delete Page', 'description' => 'Delete CMS pages'],
            ['module' => 'Pages', 'name' => 'page.publish', 'label' => 'Publish/Draft Page', 'description' => 'Toggle page publication status'],

            // Menus module
            ['module' => 'Menus', 'name' => 'access-menus-module', 'label' => 'Access Menus Module', 'description' => 'Access Menu Manager in admin panel'],
            ['module' => 'Menus', 'name' => 'menu.view', 'label' => 'View Menus', 'description' => 'View menus and items'],
            ['module' => 'Menus', 'name' => 'menu.create', 'label' => 'Create Menu Items', 'description' => 'Add new menu items'],
            ['module' => 'Menus', 'name' => 'menu.edit', 'label' => 'Edit Menu Items', 'description' => 'Edit and reorder menu items'],
            ['module' => 'Menus', 'name' => 'menu.delete', 'label' => 'Delete Menu Items', 'description' => 'Remove menu items'],

            // Roles & Permissions module
            ['module' => 'Roles', 'name' => 'access-roles-module', 'label' => 'Access Roles Module', 'description' => 'Access Roles Manager in admin panel'],
            ['module' => 'Permissions', 'name' => 'access-permissions-module', 'label' => 'Access Permissions Module', 'description' => 'Access Permissions Manager in admin panel'],
            ['module' => 'Users', 'name' => 'access-users-module', 'label' => 'Access Users Module', 'description' => 'Access Users/Staff Manager in admin panel'],

            // Legacy modules
            ['module' => 'Products', 'name' => 'access-products-module', 'label' => 'Access Products Module', 'description' => 'Access Products Manager'],
            ['module' => 'Categories', 'name' => 'access-categories-module', 'label' => 'Access Categories Module', 'description' => 'Access Categories Manager'],
        ];

        foreach ($permissions as $p) {
            Permission::firstOrCreate(
                ['name' => $p['name'], 'guard_name' => 'web'],
                [
                    'module' => $p['module'],
                    'label' => $p['label'],
                    'description' => $p['description'],
                    'is_active' => true,
                ]
            );
        }

        // 2. Sync permissions for all system roles deterministically
        // Super Admin gets all system permissions
        $allPermissions = Permission::all();
        $superAdminRoles = Role::whereIn('name', ['super-admin', 'SUPER ADMIN'])->get();
        foreach ($superAdminRoles as $role) {
            $role->syncPermissions($allPermissions);
        }

        // Shop Owner gets ONLY Printers and Shop Settings permissions
        $shopOwnerPermissions = Permission::whereIn('module', ['Printers', 'Shop Settings'])->get();
        $shopOwnerRoles = Role::whereIn('name', ['admin', 'SHOP OWNER'])->get();
        foreach ($shopOwnerRoles as $role) {
            $role->syncPermissions($shopOwnerPermissions);
        }

        // Shop Manager gets shop manager permissions (view printer, test printer, set default printer, view shop settings)
        $shopManagerPermissions = Permission::whereIn('name', [
            'printer.view', 'printer.settings', 'printer.test', 'printer.set_default',
            'shop.settings.view'
        ])->get();
        $shopManagerRoles = Role::whereIn('name', ['editor', 'SHOP MANAGER'])->get();
        foreach ($shopManagerRoles as $role) {
            $role->syncPermissions($shopManagerPermissions);
        }

        // Printer Operator gets printer operator permissions (view and test printers)
        $operatorPermissions = Permission::whereIn('name', ['printer.view', 'printer.test'])->get();
        $operatorRoles = Role::whereIn('name', ['user', 'PRINTER OPERATOR'])->get();
        foreach ($operatorRoles as $role) {
            $role->syncPermissions($operatorPermissions);
        }

        // Viewer gets viewer permissions (view printer)
        $viewerPermissions = Permission::whereIn('name', ['printer.view'])->get();
        $viewerRoles = Role::whereIn('name', ['VIEWER'])->get();
        foreach ($viewerRoles as $role) {
            $role->syncPermissions($viewerPermissions);
        }

        $firstUser = User::first();
        $authorId = $firstUser ? $firstUser->id : null;

        // 2. Seed Default Core Pages
        $defaultPages = [
            [
                'title' => 'Home',
                'slug' => 'home',
                'subtitle' => 'Cloud QR Printing SaaS for Cyber Cafes & Print Shops',
                'content' => '<h1>Transform your Print Shop into an automated self-service hub</h1><p>Zero WhatsApp queues, instant UPI payments, and direct Windows spooling.</p>',
                'template' => 'landing_section',
                'status' => 'published',
                'published_at' => now(),
                'meta_title' => 'Print Setu — Cloud QR Printing SaaS for Cyber Cafes & Print Shops',
                'meta_description' => 'Transform your Cyber Cafe, Stationery or Print Shop into an automated self-service hub. Scan counter QR, upload files, pay via UPI, and prints start rolling out.',
                'meta_keywords' => 'qr print, cyber cafe printing, xerox automation, upi print payment, cloud printer agent',
                'is_system' => true,
                'sort_order' => 1,
            ],
            [
                'title' => 'How It Works',
                'slug' => 'how-it-works',
                'subtitle' => 'Print in 5 Simple Steps — Under 30 Seconds',
                'content' => '<h2>Print in 5 Simple Steps</h2><ol><li>Scan Counter QR from mobile</li><li>Upload Your Document</li><li>Set Print Preferences & Price</li><li>Pay Online via UPI</li><li>Get Your Fresh Prints</li></ol>',
                'template' => 'landing_section',
                'status' => 'published',
                'published_at' => now(),
                'meta_title' => 'How It Works — Instant 5-Step QR Printing',
                'meta_description' => 'No app installation, zero WhatsApp number sharing, and no waiting in counter queues. Anyone with a smartphone can print independently in under 30 seconds.',
                'meta_keywords' => 'how to print qr, scan and print, xerox shop step by step, automated counter printing',
                'is_system' => true,
                'sort_order' => 2,
            ],
            [
                'title' => 'Pricing Plans',
                'slug' => 'pricing',
                'subtitle' => 'Simple, Transparent Plans for Every Print Shop',
                'content' => '<h2>Transparent SaaS Plans</h2><p>Starter Plan (₹0 free forever), Cyber Cafe Pro (₹399/mo), and Enterprise Multi-Store (₹1,199/mo).</p>',
                'template' => 'landing_section',
                'status' => 'published',
                'published_at' => now(),
                'meta_title' => 'Pricing Plans — Affordable Cloud Print SaaS',
                'meta_description' => 'Start for free, then upgrade as your daily customer volume grows. No hidden transaction fees. Unlimited prints with Cyber Cafe Pro.',
                'meta_keywords' => 'print setu pricing, cyber cafe software cost, xerox shop saas plan',
                'is_system' => true,
                'sort_order' => 3,
            ],
            [
                'title' => 'How to Setup',
                'slug' => 'how-to-setup',
                'subtitle' => 'Setup Your Shop in Under 2 Minutes',
                'content' => '<h2>4-Step Rapid Onboarding</h2><ol><li>Create Shop Account</li><li>Install Windows Print Agent</li><li>Print Your Counter QR Stand</li><li>Start Auto-Printing</li></ol>',
                'template' => 'landing_section',
                'status' => 'published',
                'published_at' => now(),
                'meta_title' => 'How to Setup — 2 Minute Print Shop Onboarding',
                'meta_description' => 'No technical expertise needed. If you have a computer and a printer, you are ready to automate your shop in 2 minutes.',
                'meta_keywords' => 'setup print setu, install print agent, windows printer setup, qr stand download',
                'is_system' => true,
                'sort_order' => 4,
            ],
            [
                'title' => 'Feature',
                'slug' => 'feature',
                'subtitle' => 'Built Specifically for the Modern Print Shop',
                'content' => '<h2>Cutting-Edge Capabilities</h2><ul><li>Zero WhatsApp Overload</li><li>Windows Background Print Agent</li><li>Instant Payment Verification</li><li>Smart Live Price Estimator</li><li>Automated Privacy & File Purge</li><li>Shop Analytics & Daily Revenue</li></ul>',
                'template' => 'landing_section',
                'status' => 'published',
                'published_at' => now(),
                'meta_title' => 'Features — Built Specifically for Print Shops & Cyber Cafes',
                'meta_description' => 'Zero WhatsApp queue, background Windows agent, instant UPI webhook payments, automatic page shredding, and full hardware compatibility.',
                'meta_keywords' => 'print shop features, privacy shredding, direct printer spooling, live rate card',
                'is_system' => true,
                'sort_order' => 5,
            ],
            [
                'title' => 'Contact Us',
                'slug' => 'contact',
                'subtitle' => 'Get in Touch & Quick Onboarding Support',
                'content' => '<h2>Direct Support Desk</h2><p>WhatsApp: +91 90981 32966 (9 AM – 9 PM IST)<br>Email: mynatech.in@gmail.com</p>',
                'template' => 'landing_section',
                'status' => 'published',
                'published_at' => now(),
                'meta_title' => 'Contact Us — QRPrintSetu Support & Inquiries',
                'meta_description' => 'Have a question or need onboarding assistance? Contact the QRPrintSetu support desk via WhatsApp or email.',
                'meta_keywords' => 'contact qrprintsetu, cyber cafe support, help desk whatsapp',
                'is_system' => true,
                'sort_order' => 6,
            ],
            [
                'title' => 'Privacy Policy',
                'slug' => 'privacy-policy',
                'subtitle' => 'Strict Zero-Retention and Document Confidentiality',
                'content' => '<h2>Our Privacy Declaration</h2><p>Files uploaded by customers are strictly retained in temporary memory during the print queue only and permanently shredded upon completion.</p>',
                'template' => 'legal',
                'status' => 'published',
                'published_at' => now(),
                'meta_title' => 'Privacy Policy — Strict Zero-Retention Guarantee',
                'meta_description' => 'Official privacy declaration for QRPrintSetu. All customer documents are permanently deleted post printing with zero data retention.',
                'meta_keywords' => 'privacy policy, zero retention print, secure document printing',
                'is_system' => true,
                'sort_order' => 7,
            ],
            [
                'title' => 'Terms of Service',
                'slug' => 'terms-of-service',
                'subtitle' => 'Official Service Agreement & Platform Terms',
                'content' => '<h2>Terms of Service</h2><p>Usage agreement for merchant shops and end customers using the QRPrintSetu automation platform.</p>',
                'template' => 'legal',
                'status' => 'published',
                'published_at' => now(),
                'meta_title' => 'Terms of Service — QRPrintSetu Merchant & Customer Agreement',
                'meta_description' => 'Read our terms of service, billing policies, uptime SLA guarantees, and platform responsibilities.',
                'meta_keywords' => 'terms of service, merchant agreement, saas policy',
                'is_system' => true,
                'sort_order' => 8,
            ],
            [
                'title' => 'Security Declaration',
                'slug' => 'security-declaration',
                'subtitle' => '256-Bit TLS Encryption & Non-Tamper UPI Settlement',
                'content' => '<h2>Security & Privacy Declaration</h2><p>TLS 1.3 256-bit encryption for all payloads, volatile disk storage, and cryptographic audit logs.</p>',
                'template' => 'legal',
                'status' => 'published',
                'published_at' => now(),
                'meta_title' => 'Security Declaration — Architecture, Encryption & Audit Protocol',
                'meta_description' => 'Technical security declaration detailing data transport encryption, immediate disk purge, and verified UPI payment protocols.',
                'meta_keywords' => 'security declaration, tls 1.3 encryption, volatile print memory',
                'is_system' => true,
                'sort_order' => 9,
            ],
        ];

        $pageModels = [];
        foreach ($defaultPages as $pageData) {
            $page = Page::updateOrCreate(
                ['slug' => $pageData['slug']],
                array_merge($pageData, ['author_id' => $authorId])
            );
            $pageModels[$page->slug] = $page;
        }

        // 3. Seed Menus
        $headerMenu = Menu::updateOrCreate(
            ['location' => 'header'],
            [
                'name' => 'Main Header Navigation',
                'description' => 'Primary top navigation bar on public landing pages',
                'is_active' => true,
            ]
        );

        $footerProductMenu = Menu::updateOrCreate(
            ['location' => 'footer_product'],
            [
                'name' => 'Footer Product Links',
                'description' => 'First column of footer product navigation',
                'is_active' => true,
            ]
        );

        $footerCompanyMenu = Menu::updateOrCreate(
            ['location' => 'footer_company'],
            [
                'name' => 'Footer Company Links',
                'description' => 'Second column of footer company & partner navigation',
                'is_active' => true,
            ]
        );

        $footerTrustMenu = Menu::updateOrCreate(
            ['location' => 'footer_trust'],
            [
                'name' => 'Footer Trust & Security',
                'description' => 'Third column of footer legal & security links',
                'is_active' => true,
            ]
        );

        // 4. Seed Menu Items
        $headerItems = [
            ['title' => 'Home', 'url_type' => 'anchor', 'url' => '#home', 'icon' => 'Home', 'order' => 1],
            ['title' => 'How It Works', 'url_type' => 'anchor', 'url' => '#how-it-works', 'icon' => 'Sparkles', 'order' => 2],
            ['title' => 'Pricing', 'url_type' => 'anchor', 'url' => '#pricing', 'icon' => 'CircleDollarSign', 'order' => 3],
            ['title' => 'How to Setup', 'url_type' => 'anchor', 'url' => '#how-to-setup', 'icon' => 'Settings2', 'order' => 4],
            ['title' => 'Feature', 'url_type' => 'anchor', 'url' => '#feature', 'icon' => 'Sparkles', 'order' => 5],
            ['title' => 'Contact Us', 'url_type' => 'anchor', 'url' => '#contact', 'icon' => 'Mail', 'order' => 6],
        ];

        // Clear existing items for clean seeding
        MenuItem::where('menu_id', $headerMenu->id)->delete();
        foreach ($headerItems as $item) {
            MenuItem::create(array_merge($item, [
                'menu_id' => $headerMenu->id,
                'target' => '_self',
                'is_active' => true,
                'page_id' => $pageModels[ltrim($item['url'], '#')]?->id ?? null,
            ]));
        }

        $footerProductItems = [
            ['title' => 'Home', 'url_type' => 'anchor', 'url' => '#home', 'order' => 1],
            ['title' => 'How It Works', 'url_type' => 'anchor', 'url' => '#how-it-works', 'order' => 2],
            ['title' => 'Features', 'url_type' => 'anchor', 'url' => '#feature', 'icon' => 'Sparkles', 'order' => 3],
            ['title' => 'How to Setup', 'url_type' => 'anchor', 'url' => '#how-to-setup', 'order' => 4],
            ['title' => 'Pricing Plans', 'url_type' => 'anchor', 'url' => '#pricing', 'order' => 5],
        ];
        MenuItem::where('menu_id', $footerProductMenu->id)->delete();
        foreach ($footerProductItems as $item) {
            MenuItem::create(array_merge($item, [
                'menu_id' => $footerProductMenu->id,
                'target' => '_self',
                'is_active' => true,
                'page_id' => $pageModels[ltrim($item['url'], '#')]?->id ?? null,
            ]));
        }

        $footerCompanyItems = [
            ['title' => 'Partner Program', 'url_type' => 'anchor', 'url' => '#partner-program', 'badge' => '30%', 'order' => 1],
            ['title' => 'Contact Us', 'url_type' => 'anchor', 'url' => '#contact', 'order' => 2],
            ['title' => 'WhatsApp Support', 'url_type' => 'custom', 'url' => 'https://wa.me/919098132966', 'target' => '_blank', 'order' => 3],
        ];
        MenuItem::where('menu_id', $footerCompanyMenu->id)->delete();
        foreach ($footerCompanyItems as $item) {
            MenuItem::create(array_merge($item, [
                'menu_id' => $footerCompanyMenu->id,
                'is_active' => true,
            ]));
        }

        $footerTrustItems = [
            ['title' => 'Declaration & Privacy', 'url_type' => 'page', 'url' => '/security-declaration', 'target' => '_blank', 'page_id' => $pageModels['security-declaration']?->id ?? null, 'order' => 1],
            ['title' => 'Privacy Policy', 'url_type' => 'page', 'url' => '/privacy-policy', 'target' => '_blank', 'page_id' => $pageModels['privacy-policy']?->id ?? null, 'order' => 2],
            ['title' => 'Terms of Service', 'url_type' => 'page', 'url' => '/terms-of-service', 'target' => '_blank', 'page_id' => $pageModels['terms-of-service']?->id ?? null, 'order' => 3],
        ];
        MenuItem::where('menu_id', $footerTrustMenu->id)->delete();
        foreach ($footerTrustItems as $item) {
            MenuItem::create(array_merge($item, [
                'menu_id' => $footerTrustMenu->id,
                'is_active' => true,
            ]));
        }
    }
}
