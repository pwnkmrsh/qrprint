<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Menu extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'location',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(MenuItem::class)->orderBy('order', 'asc');
    }

    public function activeItems(): HasMany
    {
        return $this->hasMany(MenuItem::class)->where('is_active', true)->orderBy('order', 'asc');
    }

    /**
     * Helper to retrieve menu by location key
     */
    public static function byLocation(string $location)
    {
        return static::where('location', $location)->where('is_active', true)->with('activeItems.page')->first();
    }
}
