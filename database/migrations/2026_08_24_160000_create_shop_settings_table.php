<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Permission;
use App\Models\Role;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('shop_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('qr_print_id')->unique()->constrained('qr_prints')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            
            // 1. Shop Profile
            $table->string('shop_name')->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->string('mobile_number')->nullable();
            $table->string('logo_path')->nullable();

            // 2. Printer Selection
            $table->string('bw_printer_name')->nullable();
            $table->string('color_printer_name')->nullable();
            $table->boolean('auto_detect_enabled')->default(true);

            // 3. Pricing Rate Setting
            $table->decimal('bw_price_per_page', 8, 2)->default(2.00);
            $table->decimal('color_price_per_page', 8, 2)->default(10.00);
            $table->decimal('scanner_price_per_page', 8, 2)->default(5.00);

            // 4. Payment Setting
            $table->boolean('online_payment_enabled')->default(true);
            $table->boolean('counter_payment_enabled')->default(true);
            $table->boolean('show_currency')->default(true);
            $table->string('currency_symbol')->default('₹');
            $table->json('payment_modes')->nullable(); // ['cash', 'upi', 'card', 'wallet']
            $table->string('api_key_id')->nullable();
            $table->text('secret_key')->nullable();
            $table->string('webhook_url')->nullable();
            $table->json('settings')->nullable();

            $table->timestamps();
        });

        // Seed shop settings permissions
        $permissions = [
            [
                'name' => 'shop.settings.view',
                'label' => 'View Shop Settings',
                'description' => 'Can view shop settings, profile, printers, pricing and payment',
                'module' => 'Shop Settings',
                'guard_name' => 'web'
            ],
            [
                'name' => 'shop.settings.update',
                'label' => 'Update Shop Settings',
                'description' => 'Can update shop profile, printers, pricing and payment settings',
                'module' => 'Shop Settings',
                'guard_name' => 'web'
            ],
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(
                ['name' => $perm['name'], 'guard_name' => $perm['guard_name']],
                [
                    'module' => $perm['module'],
                    'label' => $perm['label'],
                    'description' => $perm['description'],
                    'is_active' => true
                ]
            );
        }

        $roles = ['SUPER ADMIN', 'SHOP OWNER', 'SHOP MANAGER', 'admin', 'super-admin'];
        foreach ($roles as $roleName) {
            $role = Role::where('name', $roleName)->first();
            if ($role) {
                $role->givePermissionTo(['shop.settings.view', 'shop.settings.update']);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shop_settings');
    }
};
