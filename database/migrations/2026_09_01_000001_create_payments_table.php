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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            $table->foreignId('print_session_id')
                ->constrained('print_sessions')
                ->cascadeOnDelete();

            $table->foreignId('qr_print_id')
                ->nullable()
                ->constrained('qr_prints')
                ->nullOnDelete();

            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('order_id')->index(); // e.g. Q2P-000123
            $table->string('payment_method')->default('cashfree'); // cashfree, upi, cash, card, netbanking, wallet, counter
            $table->string('payment_type')->default('online'); // online, counter
            $table->string('gateway')->default('cashfree'); // cashfree, counter, direct_upi, razorpay

            $table->string('gateway_order_id')->nullable()->index(); // e.g. Cashfree cf_order_id
            $table->string('gateway_payment_id')->nullable()->index(); // e.g. Cashfree cf_payment_id / transaction ID

            $table->decimal('amount', 10, 2)->default(0.00);
            $table->string('currency', 10)->default('INR');
            $table->string('status')->default('pending'); // success, pending, failed, refunded

            $table->json('gateway_response')->nullable();
            $table->text('error_message')->nullable();

            $table->decimal('refund_amount', 10, 2)->default(0.00);
            $table->string('refund_reason')->nullable();
            $table->timestamp('refunded_at')->nullable();

            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
