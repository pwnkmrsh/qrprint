<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\Page;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MenuController extends Controller
{
    /**
     * Display menu manager.
     */
    public function index(Request $request)
    {
        $menus = Menu::with(['items.page'])->get();
        $pages = Page::select('id', 'title', 'slug', 'status')->orderBy('title', 'asc')->get();

        $activeLocation = $request->get('location', 'header');
        $selectedMenu = $menus->firstWhere('location', $activeLocation) ?: $menus->first();

        return Inertia::render('menus/index', [
            'menus' => $menus,
            'selectedMenu' => $selectedMenu ? $selectedMenu->load('items.page') : null,
            'pages' => $pages,
            'activeLocation' => $activeLocation,
            'locations' => [
                ['value' => 'header', 'label' => 'Main Header Navigation'],
                ['value' => 'footer_product', 'label' => 'Footer Product Links'],
                ['value' => 'footer_company', 'label' => 'Footer Company & Partner Links'],
                ['value' => 'footer_trust', 'label' => 'Footer Trust & Security Links'],
            ],
            'icons' => [
                'Home', 'Sparkles', 'CircleDollarSign', 'Settings2', 'Mail',
                'ShieldCheck', 'FileText', 'Lock', 'Phone', 'HelpCircle',
                'Layers', 'Zap', 'Store', 'Users', 'QrCode', 'ExternalLink',
            ],
        ]);
    }

    /**
     * Store new menu item.
     */
    public function storeItem(Request $request)
    {
        $validated = $request->validate([
            'menu_id' => ['required', 'exists:menus,id'],
            'title' => ['required', 'string', 'max:255'],
            'url_type' => ['required', 'string', 'in:anchor,page,route,custom'],
            'page_id' => ['nullable', 'exists:pages,id'],
            'url' => ['nullable', 'string', 'max:500'],
            'icon' => ['nullable', 'string', 'max:100'],
            'badge' => ['nullable', 'string', 'max:50'],
            'target' => ['required', 'string', 'in:_self,_blank'],
            'is_active' => ['boolean'],
        ]);

        $maxOrder = MenuItem::where('menu_id', $validated['menu_id'])->max('order') ?? 0;
        $validated['order'] = $maxOrder + 1;
        $validated['is_active'] = $validated['is_active'] ?? true;

        if ($validated['url_type'] === 'page' && !empty($validated['page_id'])) {
            $page = Page::find($validated['page_id']);
            $validated['url'] = $page ? $page->url : '#';
        }

        MenuItem::create($validated);

        return back()->with('success', "Menu item '{$validated['title']}' added successfully.");
    }

    /**
     * Update menu item.
     */
    public function updateItem(Request $request, MenuItem $item)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'url_type' => ['required', 'string', 'in:anchor,page,route,custom'],
            'page_id' => ['nullable', 'exists:pages,id'],
            'url' => ['nullable', 'string', 'max:500'],
            'icon' => ['nullable', 'string', 'max:100'],
            'badge' => ['nullable', 'string', 'max:50'],
            'target' => ['required', 'string', 'in:_self,_blank'],
            'is_active' => ['boolean'],
        ]);

        if ($validated['url_type'] === 'page' && !empty($validated['page_id'])) {
            $page = Page::find($validated['page_id']);
            $validated['url'] = $page ? $page->url : '#';
        }

        $item->update($validated);

        return back()->with('success', "Menu item '{$item->title}' updated successfully.");
    }

    /**
     * Delete menu item.
     */
    public function destroyItem(MenuItem $item)
    {
        $title = $item->title;
        $item->delete();

        return back()->with('success', "Menu item '{$title}' removed.");
    }

    /**
     * Reorder menu items.
     */
    public function reorderItems(Request $request)
    {
        $validated = $request->validate([
            'items' => ['required', 'array'],
            'items.*.id' => ['required', 'exists:menu_items,id'],
            'items.*.order' => ['required', 'integer'],
        ]);

        foreach ($validated['items'] as $itemData) {
            MenuItem::where('id', $itemData['id'])->update(['order' => $itemData['order']]);
        }

        return back()->with('success', 'Menu order updated successfully.');
    }
}
