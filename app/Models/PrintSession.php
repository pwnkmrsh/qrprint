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
        'print_status',
        'total_amount',
        'currency',
        'paid_at',
        'paid_by',
    ];

    protected function casts(): array
    {
        return [
            'paid_at' => 'datetime',
        ];
    }

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

    public function paidBy()
    {
        return $this->belongsTo(User::class, 'paid_by');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'print_session_id');
    }

    public function latestPayment()
    {
        return $this->hasOne(Payment::class, 'print_session_id')->latestOfMany();
    }

    public function getFormattedOrderIdAttribute(): string
    {
        return sprintf('Q2P-%06d', $this->id);
    }

    public function getTotalPagesAttribute(): int
    {
        return $this->jobs->sum(function ($job) {
            $pages = 1;
            if ($job->document) {
                if ($job->document->file_type === 'excel' && !empty($job->selected_sheets)) {
                    $pages = count($job->selected_sheets);
                } else {
                    $pages = $job->document->metadata['page_count'] ?? 1;
                }
            }
            return $pages * $job->copies;
        });
    }
}
