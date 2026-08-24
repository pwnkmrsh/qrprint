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
        // 1. Create printers table
        Schema::create('printers', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('qr_print_id')->constrained('qr_prints')->cascadeOnDelete();
            $table->string('agent_id');
            $table->string('name');
            $table->string('model')->nullable();
            $table->string('status')->default('offline'); // online, offline, busy, error
            $table->boolean('is_default')->default(false);
            $table->boolean('is_active')->default(true);
            $table->json('capabilities')->nullable();
            $table->json('settings')->nullable();
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamps();
        });

        // 2. Create printer_audit_logs table
        Schema::create('printer_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('qr_print_id')->constrained('qr_prints')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('printer_id')->nullable()->constrained('printers')->nullOnDelete();
            $table->string('user_name')->nullable();
            $table->string('user_role')->nullable();
            $table->string('action'); // Printer added, Printer settings changed, Printer activated, Printer deactivated, Default printer changed, Test print requested, Test connection requested
            $table->text('description')->nullable();
            $table->json('details')->nullable(); // Old and new values
            $table->timestamps();
        });

        // 3. Seed Permissions (with default fallback module and guard_name)
        $permissions = [
            [
                'name' => 'printer.view',
                'label' => 'View Printers',
                'description' => 'Can view shop printers and statuses',
                'module' => 'Printers',
                'guard_name' => 'web'
            ],
            [
                'name' => 'printer.create',
                'label' => 'Add Printer',
                'description' => 'Can add new printers',
                'module' => 'Printers',
                'guard_name' => 'web'
            ],
            [
                'name' => 'printer.update',
                'label' => 'Update Printer',
                'description' => 'Can update printer details',
                'module' => 'Printers',
                'guard_name' => 'web'
            ],
            [
                'name' => 'printer.delete',
                'label' => 'Delete/Deactivate Printer',
                'description' => 'Can deactivate printers',
                'module' => 'Printers',
                'guard_name' => 'web'
            ],
            [
                'name' => 'printer.settings',
                'label' => 'Manage Settings',
                'description' => 'Can configure printer default settings',
                'module' => 'Printers',
                'guard_name' => 'web'
            ],
            [
                'name' => 'printer.test',
                'label' => 'Test Printer',
                'description' => 'Can trigger test prints and test connections',
                'module' => 'Printers',
                'guard_name' => 'web'
            ],
            [
                'name' => 'printer.set_default',
                'label' => 'Set Default',
                'description' => 'Can change the shop default printer',
                'module' => 'Printers',
                'guard_name' => 'web'
            ]
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

        // 4. Seed Roles and assign seeded permissions
        $rolesConfig = [
            'SUPER ADMIN' => ['printer.view', 'printer.create', 'printer.update', 'printer.delete', 'printer.settings', 'printer.test', 'printer.set_default'],
            'SHOP OWNER' => ['printer.view', 'printer.create', 'printer.update', 'printer.delete', 'printer.settings', 'printer.test', 'printer.set_default'],
            'SHOP MANAGER' => ['printer.view', 'printer.settings', 'printer.test', 'printer.set_default'],
            'PRINTER OPERATOR' => ['printer.view', 'printer.test'],
            'VIEWER' => ['printer.view']
        ];

        foreach ($rolesConfig as $roleName => $perms) {
            $role = Role::firstOrCreate(
                ['name' => $roleName, 'guard_name' => 'web'],
                [
                    'label' => ucwords(strtolower($roleName)),
                    'description' => 'Role for ' . ucwords(strtolower($roleName)),
                    'is_active' => true
                ]
            );

            $role->syncPermissions($perms);
        }

        // Also assign full access to super-admin & admin if they exist in DB
        $legacyAdmin = Role::where('name', 'admin')->first();
        if ($legacyAdmin) {
            $legacyAdmin->givePermissionTo(collect($permissions)->pluck('name')->toArray());
        }
        $legacySuperAdmin = Role::where('name', 'super-admin')->first();
        if ($legacySuperAdmin) {
            $legacySuperAdmin->givePermissionTo(collect($permissions)->pluck('name')->toArray());
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('printer_audit_logs');
        Schema::dropIfExists('printers');
    }
};
