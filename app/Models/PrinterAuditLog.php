<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PrinterAuditLog extends Model
{
    protected $fillable = [
        'qr_print_id',
        'user_id',
        'printer_id',
        'user_name',
        'user_role',
        'action',
        'description',
        'details',
    ];

    protected function casts(): array
    {
        return [
            'details' => 'array',
        ];
    }

    public function qrPrint()
    {
        return $this->belongsTo(QrPrint::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function printer()
    {
        return $this->belongsTo(Printer::class);
    }

    /**
     * Helper to quickly log an action.
     */
    public static function log(int $qrPrintId, ?int $userId, ?int $printerId, string $action, string $description, ?array $details = null)
    {
        $userName = 'System';
        $userRole = 'System';
        
        if ($userId) {
            $user = User::find($userId);
            if ($user) {
                $userName = $user->name;
                $userRole = $user->roles->first()?->name ?? 'User';
            }
        }

        return self::create([
            'qr_print_id' => $qrPrintId,
            'user_id' => $userId,
            'printer_id' => $printerId,
            'user_name' => $userName,
            'user_role' => $userRole,
            'action' => $action,
            'description' => $description,
            'details' => $details,
        ]);
    }
}
