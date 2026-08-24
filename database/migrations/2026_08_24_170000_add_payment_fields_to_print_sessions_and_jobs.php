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
            $table->string('payment_method')->default('counter')->after('status'); // counter, online, upi, cash, card
            $table->string('payment_status')->default('pending')->after('payment_method'); // pending, paid, cancelled
            $table->decimal('total_amount', 10, 2)->default(0.00)->after('payment_status');
            $table->string('currency', 10)->default('₹')->after('total_amount');
        });

        Schema::table('print_jobs', function (Blueprint $table) {
            $table->string('payment_method')->nullable()->after('status');
            $table->decimal('amount', 10, 2)->default(0.00)->after('payment_method');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('print_sessions', function (Blueprint $table) {
            $table->dropColumn(['payment_method', 'payment_status', 'total_amount', 'currency']);
        });

        Schema::table('print_jobs', function (Blueprint $table) {
            $table->dropColumn(['payment_method', 'amount']);
        });
    }
};
