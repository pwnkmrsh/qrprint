<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasRoles, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id',
        'avatar',
        'email_verified_at',
    ];


    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function shop()
    {
        return $this->hasOne(Shop::class);
    }

    public function qrPrint()
    {
        return $this->hasOne(QrPrint::class);
    }

    public function qrPrints()
    {
        return $this->hasMany(QrPrint::class);
    }

    public function shopSetting()
    {
        return $this->hasOne(ShopSetting::class);
    }

    public function printSessions()
    {
        return $this->hasManyThrough(PrintSession::class, QrPrint::class);
    }

    public function printDocuments()
    {
        return $this->hasManyThrough(PrintDocument::class, QrPrint::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function getPrintJobsAttribute()
    {
        return PrintJob::whereHas('session.qrPrint', function ($q) {
            $q->where('user_id', $this->id);
        })->get();
    }
}

