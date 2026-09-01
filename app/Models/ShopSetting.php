<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class ShopSetting extends Model
{
    protected $fillable = [
        'qr_print_id',
        'user_id',
        'shop_name',
        'email',
        'address',
        'mobile_number',
        'logo_path',
        'bw_printer_name',
        'color_printer_name',
        'auto_detect_enabled',
        'bw_price_per_page',
        'color_price_per_page',
        'scanner_price_per_page',
        'online_payment_enabled',
        'counter_payment_enabled',
        'show_currency',
        'currency_symbol',
        'payment_modes',
        'api_key_id',
        'secret_key',
        'webhook_url',
        'settings',
    ];

    protected function casts(): array
    {
        return [
            'auto_detect_enabled' => 'boolean',
            'bw_price_per_page' => 'decimal:2',
            'color_price_per_page' => 'decimal:2',
            'scanner_price_per_page' => 'decimal:2',
            'online_payment_enabled' => 'boolean',
            'counter_payment_enabled' => 'boolean',
            'show_currency' => 'boolean',
            'payment_modes' => 'array',
            'settings' => 'array',
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

    /**
     * Accessor for full logo URL
     */
    public function getLogoUrlAttribute(): ?string
    {
        if (!$this->logo_path) {
            return null;
        }

        if (str_starts_with($this->logo_path, 'http://') || str_starts_with($this->logo_path, 'https://')) {
            return $this->logo_path;
        }

        return Storage::disk('public')->url($this->logo_path);
    }

    /**
     * Default payment modes helper
     */
    public static function defaultPaymentModes(): array
    {
        return ['cash', 'upi', 'card', 'wallet'];
    }

    /**
     * Payment Gateway Provider (razorpay, phonepe, paytm, cashfree, direct_upi, stripe)
     */
    public function getGatewayProviderAttribute(): string
    {
        return $this->settings['gateway_provider'] ?? 'razorpay';
    }

    /**
     * Shop UPI ID / VPA for dynamic QR code generation
     */
    public function getUpiIdAttribute(): string
    {
        if (!empty($this->settings['upi_id'])) {
            return $this->settings['upi_id'];
        }

        if (!empty($this->mobile_number)) {
            $digits = preg_replace('/[^0-9]/', '', $this->mobile_number);
            if (!empty($digits)) {
                return $digits . '@upi';
            }
        }

        return 'merchant@upi';
    }

    /**
     * Merchant name displayed on UPI payment apps
     */
    public function getMerchantNameAttribute(): string
    {
        return $this->settings['merchant_name'] ?? ($this->shop_name ?: 'Print Shop');
    }

    /**
     * Default selected online sub-mode (upi or card)
     */
    public function getDefaultOnlineSubmodeAttribute(): string
    {
        return $this->settings['default_online_submode'] ?? 'upi';
    }

    /**
     * Webhook secret key for gateway signature verification
     */
    public function getWebhookSecretAttribute(): ?string
    {
        return $this->settings['webhook_secret'] ?? null;
    }
}
