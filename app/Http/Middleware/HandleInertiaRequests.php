<?php
namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return [
             ...parent::share($request),
            'name'  => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth'  => [
                'user'        => $request->user(),
                'roles'       => fn() => $request->user()?->roles->pluck('name'),
                'permissions' => fn() => $request->user()?->getAllPermissions()->pluck('name'),
            ],
            'ziggy' => fn(): array=> [
                 ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'navigation_menus' => fn() => \Illuminate\Support\Facades\Schema::hasTable('menus')
                ? \App\Models\Menu::with(['activeItems.page'])
                    ->where('is_active', true)
                    ->get()
                    ->keyBy('location')
                    ->map(fn($menu) => [
                        'id' => $menu->id,
                        'name' => $menu->name,
                        'location' => $menu->location,
                        'items' => $menu->activeItems->map(fn($item) => [
                            'id' => $item->id,
                            'title' => $item->title,
                            'url_type' => $item->url_type,
                            'url' => $item->effective_url,
                            'icon' => $item->icon,
                            'badge' => $item->badge,
                            'target' => $item->target,
                            'order' => $item->order,
                        ]),
                    ])
                : [],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error'   => $request->session()->get('error'),
            ],
        ];
    }
}
