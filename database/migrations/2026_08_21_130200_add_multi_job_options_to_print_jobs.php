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
        Schema::table('print_jobs', function (Blueprint $table) {
            $table->foreignId('print_session_id')
                ->nullable()
                ->after('uuid')
                ->constrained('print_sessions')
                ->cascadeOnDelete();
            $table->string('orientation')->nullable()->default('auto')->after('copies');
            $table->string('color_mode')->nullable()->default('bw')->after('orientation');
            $table->string('paper_size')->nullable()->default('A4')->after('color_mode');
            $table->string('scaling')->nullable()->default('actual')->after('paper_size');
            $table->string('duplex')->nullable()->default('off')->after('scaling');
            $table->string('page_range')->nullable()->after('duplex');
            $table->json('selected_sheets')->nullable()->after('page_range');
            $table->json('print_options')->nullable()->after('selected_sheets');
            $table->timestamp('started_at')->nullable()->after('claimed_at');
            $table->timestamp('completed_at')->nullable()->after('started_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('print_jobs', function (Blueprint $table) {
            $table->dropForeign(['print_session_id']);
            $table->dropColumn([
                'print_session_id',
                'orientation',
                'color_mode',
                'paper_size',
                'scaling',
                'duplex',
                'page_range',
                'selected_sheets',
                'print_options',
                'started_at',
                'completed_at',
            ]);
        });
    }
};
