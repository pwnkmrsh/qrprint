<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use App\Models\PrintDocument;

class PrintJob extends Model
{
    protected $fillable = [
        'print_document_id',
        'printer_name',
        'copies',
        'status',
        'attempts',
        'error_message',
        'printed_at',
        'claimed_at',
    ];

    protected static function booted(): void
    {
        static::creating(function ($job) {

            if (!$job->uuid) {
                $job->uuid = (string) \Illuminate\Support\Str::uuid();
            }
        });
    }

    public function document()
    {
        return $this->belongsTo(
            PrintDocument::class,
            'print_document_id'
        );
    }
}
