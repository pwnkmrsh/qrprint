<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PrintJob extends Model
{
    protected $fillable = [
        'uuid',
        'print_session_id',
        'print_document_id',
        'printer_name',
        'copies',
        'orientation',
        'color_mode',
        'paper_size',
        'scaling',
        'duplex',
        'page_range',
        'selected_sheets',
        'print_options',
        'status',
        'attempts',
        'error_message',
        'claimed_at',
        'started_at',
        'completed_at',
        'printed_at',
    ];

    protected function casts(): array
    {
        return [
            'selected_sheets' => 'array',
            'print_options' => 'array',
            'claimed_at' => 'datetime',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'printed_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function ($job) {
            if (!$job->uuid) {
                $job->uuid = (string) Str::uuid();
            }
        });
    }

    public function document()
    {
        return $this->belongsTo(PrintDocument::class, 'print_document_id');
    }

    public function session()
    {
        return $this->belongsTo(PrintSession::class, 'print_session_id');
    }
}
