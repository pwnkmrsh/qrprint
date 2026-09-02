<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'group',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'array',
        ];
    }

    /**
     * Get setting value by key with fallback default.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $setting = static::where('key', $key)->first();
        if (!$setting) {
            return $default;
        }

        // If the value is a single-element associative wrapper or raw value
        if (is_array($setting->value) && array_key_exists('value', $setting->value)) {
            return $setting->value['value'] ?? $default;
        }

        return $setting->value ?? $default;
    }

    /**
     * Set setting value by key.
     */
    public static function set(string $key, mixed $value, string $group = 'general'): static
    {
        return static::updateOrCreate(
            ['key' => $key],
            [
                'value' => is_array($value) ? $value : ['value' => $value],
                'group' => $group,
            ]
        );
    }

    /**
     * Get all settings grouped by their group name.
     */
    public static function getGroup(string $group): array
    {
        $settings = static::where('group', $group)->get();
        $result = [];

        foreach ($settings as $setting) {
            $val = $setting->value;
            if (is_array($val) && array_key_exists('value', $val)) {
                $val = $val['value'];
            }
            $result[$setting->key] = $val;
        }

        return $result;
    protected $fillable = ['key', 'value'];

    /**
     * Get a setting value by key.
     */
    public static function get(string $key, $default = null)
    {
        $setting = self::where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    /**
     * Set/Update a setting value by key.
     */
    public static function set(string $key, ?string $value)
    {
        return self::updateOrCreate(['key' => $key], ['value' => $value]);
    }
}
