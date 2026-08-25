<?php

namespace App\Http\Controllers;

use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PageController extends Controller
{
    /**
     * Display a listing of CMS pages.
     */
    public function index(Request $request)
    {
        $query = Page::with('author');

        $totalCount = Page::count();
        $publishedCount = Page::where('status', 'published')->count();
        $draftCount = Page::where('status', 'draft')->count();

        // Status Filter
        if ($request->filled('status') && in_array($request->status, ['published', 'draft', 'archived'])) {
            $query->where('status', $request->status);
        }

        // Search Filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('subtitle', 'like', "%{$search}%")
                    ->orWhere('meta_title', 'like', "%{$search}%");
            });
        }

        $filteredCount = $query->count();
        $perPage = (int) ($request->perPage ?? 10);

        if ($perPage === -1) {
            $allPages = $query->orderBy('sort_order', 'asc')->latest()->get();
            $pages = [
                'data' => $allPages,
                'total' => $filteredCount,
                'per_page' => $perPage,
                'from' => 1,
                'to' => $filteredCount,
                'links' => [],
            ];
        } else {
            $pages = $query->orderBy('sort_order', 'asc')->latest()->paginate($perPage)->withQueryString();
        }

        return Inertia::render('pages/index', [
            'pages' => $pages,
            'filters' => $request->only(['search', 'status', 'perPage']),
            'stats' => [
                'total' => $totalCount,
                'published' => $publishedCount,
                'draft' => $draftCount,
            ],
            'filteredCount' => $filteredCount,
        ]);
    }

    /**
     * Show form for creating a new page.
     */
    public function create()
    {
        return Inertia::render('pages/page-form', [
            'page' => null,
            'templates' => [
                ['value' => 'default', 'label' => 'Standard CMS Page (with Header & Footer)'],
                ['value' => 'landing_section', 'label' => 'Landing Page Section (Anchor)'],
                ['value' => 'full_width', 'label' => 'Full Width Canvas'],
                ['value' => 'legal', 'label' => 'Legal Document / Terms Policy'],
            ],
        ]);
    }

    /**
     * Store a newly created page.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:pages,slug'],
            'subtitle' => ['nullable', 'string', 'max:500'],
            'content' => ['nullable', 'string'],
            'template' => ['required', 'string', 'in:default,landing_section,full_width,legal'],
            'status' => ['required', 'string', 'in:published,draft,archived'],
            'sort_order' => ['nullable', 'integer'],
            // SEO
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:1000'],
            'meta_keywords' => ['nullable', 'string', 'max:500'],
            'canonical_url' => ['nullable', 'url', 'max:500'],
            'og_image' => ['nullable', 'string', 'max:500'],
            'og_title' => ['nullable', 'string', 'max:255'],
            'og_description' => ['nullable', 'string', 'max:1000'],
            'is_indexable' => ['boolean'],
        ]);

        $slug = !empty($validated['slug'])
            ? Str::slug($validated['slug'])
            : Str::slug($validated['title']);

        // Ensure slug uniqueness
        $originalSlug = $slug;
        $count = 1;
        while (Page::where('slug', $slug)->exists()) {
            $slug = "{$originalSlug}-{$count}";
            $count++;
        }

        $validated['slug'] = $slug;
        $validated['author_id'] = $request->user()?->id;
        $validated['published_at'] = $validated['status'] === 'published' ? now() : null;
        $validated['is_system'] = false;
        $validated['sort_order'] = $validated['sort_order'] ?? 0;

        $page = Page::create($validated);

        return redirect()->route('pages.index')->with('success', "Page '{$page->title}' created successfully.");
    }

    /**
     * Show form for editing a page.
     */
    public function edit(Page $page)
    {
        return Inertia::render('pages/page-form', [
            'page' => $page,
            'templates' => [
                ['value' => 'default', 'label' => 'Standard CMS Page (with Header & Footer)'],
                ['value' => 'landing_section', 'label' => 'Landing Page Section (Anchor)'],
                ['value' => 'full_width', 'label' => 'Full Width Canvas'],
                ['value' => 'legal', 'label' => 'Legal Document / Terms Policy'],
            ],
        ]);
    }

    /**
     * Update an existing page.
     */
    public function update(Request $request, Page $page)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:pages,slug,' . $page->id],
            'subtitle' => ['nullable', 'string', 'max:500'],
            'content' => ['nullable', 'string'],
            'template' => ['required', 'string', 'in:default,landing_section,full_width,legal'],
            'status' => ['required', 'string', 'in:published,draft,archived'],
            'sort_order' => ['nullable', 'integer'],
            // SEO
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:1000'],
            'meta_keywords' => ['nullable', 'string', 'max:500'],
            'canonical_url' => ['nullable', 'url', 'max:500'],
            'og_image' => ['nullable', 'string', 'max:500'],
            'og_title' => ['nullable', 'string', 'max:255'],
            'og_description' => ['nullable', 'string', 'max:1000'],
            'is_indexable' => ['boolean'],
        ]);

        $validated['slug'] = Str::slug($validated['slug']);

        // Update published_at when first published
        if ($validated['status'] === 'published' && !$page->published_at) {
            $validated['published_at'] = now();
        } elseif ($validated['status'] === 'draft') {
            $validated['published_at'] = null;
        }

        $page->update($validated);

        return redirect()->route('pages.index')->with('success', "Page '{$page->title}' updated successfully.");
    }

    /**
     * Toggle page status between published and draft.
     */
    public function toggleStatus(Page $page)
    {
        $newStatus = $page->status === 'published' ? 'draft' : 'published';
        $page->update([
            'status' => $newStatus,
            'published_at' => $newStatus === 'published' ? now() : null,
        ]);

        return back()->with('success', "Page status updated to {$newStatus}.");
    }

    /**
     * Delete page.
     */
    public function destroy(Page $page)
    {
        if ($page->is_system) {
            return back()->with('error', "System core page '{$page->title}' cannot be deleted.");
        }

        $title = $page->title;
        $page->delete();

        return redirect()->route('pages.index')->with('success', "Page '{$title}' deleted successfully.");
    }
}
