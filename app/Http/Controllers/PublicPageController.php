<?php

namespace App\Http\Controllers;

use App\Models\Page;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicPageController extends Controller
{
    /**
     * Display a published CMS page (or draft preview for authorized admins).
     */
    public function show(Request $request, string $slug)
    {
        $page = Page::where('slug', $slug)->first();

        if (!$page) {
            abort(404, 'Page not found');
        }

        // If page is draft or archived, only allow authenticated users with page.view or superadmin
        if ($page->status !== 'published') {
            $user = $request->user();
            if (!$user || (!$user->can('page.view') && !$user->hasRole(['super-admin', 'SUPER ADMIN', 'admin']))) {
                abort(404, 'Page not published');
            }
        }

        return Inertia::render('pages/show', [
            'page' => [
                'id' => $page->id,
                'title' => $page->title,
                'slug' => $page->slug,
                'subtitle' => $page->subtitle,
                'content' => $page->content,
                'template' => $page->template,
                'status' => $page->status,
                'published_at' => $page->published_at?->format('F d, Y'),
                'updated_at' => $page->updated_at?->format('F d, Y'),
                'meta_title' => $page->effective_meta_title,
                'meta_description' => $page->effective_meta_description,
                'meta_keywords' => $page->meta_keywords,
                'canonical_url' => $page->canonical_url,
                'og_image' => $page->og_image,
                'og_title' => $page->og_title ?: $page->effective_meta_title,
                'og_description' => $page->og_description ?: $page->effective_meta_description,
                'is_indexable' => $page->is_indexable,
            ],
            'isPreview' => $page->status !== 'published',
        ]);
    }
}
