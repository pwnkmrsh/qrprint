<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class QrPrint extends Model
{
    protected $fillable = [
        'user_id',
        'uuid',
        'title',
        'print_token',
        'content',
        'is_active',
        'print_count',
        'last_printed_at',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    protected static function booted(): void
    {
        static::creating(function (QrPrint $qrPrint) {
            $qrPrint->uuid ??= (string) Str::uuid();

            $qrPrint->print_token ??= Str::random(32);
        });
    }

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'last_printed_at' => 'datetime',
        ];
    }
    public function documents()
    {
        return $this->hasMany(PrintDocument::class);
    }

    public function sessions()
    {
        return $this->hasMany(PrintSession::class);
    }

    public function printers()
    {
        return $this->hasMany(Printer::class);
    }

    public function auditLogs()
    {
        return $this->hasMany(PrinterAuditLog::class);
    }

    public function shopSetting()
    {
        return $this->hasOne(ShopSetting::class);
    }
}
