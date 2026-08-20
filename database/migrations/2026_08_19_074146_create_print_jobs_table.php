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
        Schema::create('print_jobs', function (Blueprint $table) {
            $table->id();

            $table->uuid('uuid')->unique();

            $table->foreignId('print_document_id')
                ->constrained('print_documents')
                ->cascadeOnDelete();

            $table->string('printer_name')->nullable();

            $table->unsignedInteger('copies')->default(1);

            $table->string('status')->default('pending');

            $table->unsignedInteger('attempts')->default(0);

            $table->text('error_message')->nullable();

            $table->timestamp('claimed_at')->nullable();
            $table->timestamp('printed_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('print_jobs');
    }
};
