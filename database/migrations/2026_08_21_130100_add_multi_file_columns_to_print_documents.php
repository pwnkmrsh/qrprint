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
        Schema::table('print_documents', function (Blueprint $table) {
            $table->string('file_type')->default('pdf')->after('disk');
            $table->json('metadata')->nullable()->after('file_type');
            $table->string('status')->default('ready')->after('metadata');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('print_documents', function (Blueprint $table) {
            $table->dropColumn(['file_type', 'metadata', 'status']);
        });
    }
};
