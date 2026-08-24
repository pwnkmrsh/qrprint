<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('print_sessions', function (Blueprint $table) {
            $table->string('print_status')->default('ready_to_print')->after('payment_status'); // pending_payment, ready_to_print
            $table->timestamp('paid_at')->nullable()->after('print_status');
            $table->foreignId('paid_by')->nullable()->after('paid_at')->constrained('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('print_sessions', function (Blueprint $table) {
            $table->dropForeign(['paid_by']);
            $table->dropColumn(['print_status', 'paid_at', 'paid_by']);
        });
    }
};
