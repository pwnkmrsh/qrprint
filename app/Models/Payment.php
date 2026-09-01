<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Payment extends Model
{
    protected $fillable = [
        'uuid',
        'print_session_id',
        'qr_print_id',
        'user_id',
        'order_id',
        'payment_method',
        'payment_type',
        'gateway',
        'gateway_order_id',
        'gateway_payment_id',
        'amount',
        'currency',
        'status',
        'gateway_response',
        'error_message',
        'refund_amount',
        'refund_reason',
        'refunded_at',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'refund_amount' => 'decimal:2',
            'gateway_response' => 'array',
            'paid_at' => 'datetime',
            'refunded_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function ($payment) {
            if (!$payment->uuid) {
                $payment->uuid = (string) Str::uuid();
            }
        });
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(PrintSession::class, 'print_session_id');
    }

    public function qrPrint(): BelongsTo
    {
        return $this->belongsTo(QrPrint::class, 'qr_print_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Scopes
    public function scopeOnline($query)
    {
        return $query->where('payment_type', 'online');
    }

    public function scopeCounter($query)
    {
        return $query->where('payment_type', 'counter');
    }

    public function scopeSuccess($query)
    {
        return $query->where('status', 'success');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopeRefunds($query)
    {
        return $query->where('status', 'refunded')->orWhere('refund_amount', '>', 0);
    }
}
