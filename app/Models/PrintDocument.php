<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PrintDocument extends Model
{
    protected $fillable = [
        'qr_print_id',
        'original_name',
        'stored_name',
        'mime_type',
        'file_size',
        'disk',
        'path',
        'file_type',
        'metadata',
        'status',
        'print_count',
        'last_printed_at',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'last_printed_at' => 'datetime',
        ];
    }

    public function qrPrint()
    {
        return $this->belongsTo(QrPrint::class);
    }

    public function jobs()
    {
        return $this->hasMany(PrintJob::class);
    }

    public function getPageCountAttribute(): int
    {
        return $this->metadata['page_count'] ?? 1;
    }
}