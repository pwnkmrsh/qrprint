<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('print_documents', function (Blueprint $table) {
            $table->id();

            $table->foreignId('qr_print_id')
                ->constrained('qr_prints')
                ->cascadeOnDelete();

            $table->string('original_name');
            $table->string('stored_name');
            $table->string('mime_type');
            $table->unsignedBigInteger('file_size');

            $table->string('disk')->default('public');
            $table->string('path');

            $table->unsignedInteger('print_count')->default(0);

            $table->timestamp('last_printed_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('print_documents');
    }
};