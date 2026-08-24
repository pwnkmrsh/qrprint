<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Printer extends Model
{
    protected $fillable = [
        'uuid',
        'qr_print_id',
        'agent_id',
        'name',
        'model',
        'status',
        'is_default',
        'is_active',
        'capabilities',
        'settings',
        'last_seen_at',
    ];

    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
            'is_active' => 'boolean',
            'capabilities' => 'array',
            'settings' => 'array',
            'last_seen_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Printer $printer) {
            $printer->uuid ??= (string) Str::uuid();
        });
    }

    public function qrPrint()
    {
        return $this->belongsTo(QrPrint::class);
    }
}
