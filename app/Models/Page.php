<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Page extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'subtitle',
        'content',
        'template',
        'status',
        'published_at',
        'author_id',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'canonical_url',
        'og_image',
        'og_title',
        'og_description',
        'is_indexable',
        'is_system',
        'sort_order',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'is_indexable' => 'boolean',
        'is_system' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function menuItems(): HasMany
    {
        return $this->hasMany(MenuItem::class);
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function getUrlAttribute(): string
    {
        if ($this->template === 'landing_section' || Str::startsWith($this->slug, '#')) {
            return '#' . ltrim($this->slug, '#');
        }

        if (in_array($this->slug, ['home', '/'])) {
            return '/';
        }

        if (in_array($this->slug, ['privacy-policy', 'terms-of-service', 'security-declaration'])) {
            return '/' . $this->slug;
        }

        return '/p/' . $this->slug;
    }

    /**
     * Get computed effective SEO title
     */
    public function getEffectiveMetaTitleAttribute(): string
    {
        return $this->meta_title ?: ($this->title . ' — ' . config('app.name', 'Print Setu'));
    }

    /**
     * Get computed effective SEO description
     */
    public function getEffectiveMetaDescriptionAttribute(): string
    {
        return $this->meta_description ?: ($this->subtitle ?: Str::limit(strip_tags($this->content ?? ''), 160));
    }
}
