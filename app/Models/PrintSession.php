<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PrintSession extends Model
{
    protected $fillable = [
        'uuid',
        'qr_print_id',
        'total_files',
        'completed_files',
        'failed_files',
        'status',
        'payment_method',
        'payment_status',
        'total_amount',
        'currency',
    ];

    protected static function booted(): void
    {
        static::creating(function ($session) {
            if (!$session->uuid) {
                $session->uuid = (string) Str::uuid();
            }
        });
    }

    public function qrPrint()
    {
        return $this->belongsTo(QrPrint::class);
    }

    public function jobs()
    {
        return $this->hasMany(PrintJob::class, 'print_session_id');
    }
}
