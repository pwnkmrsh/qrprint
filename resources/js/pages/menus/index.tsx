import { useState } from 'react';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type DynamicMenu, type DynamicMenuItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import {
    Plus,
    Menu,
    ChevronUp,
    ChevronDown,
    Edit3,
    Trash2,
    Check,
    Globe,
    Home,
    Sparkles,
    CircleDollarSign,
    Settings2,
    Mail,
    ShieldCheck,
    FileText,
    Lock,
    Phone,
    HelpCircle,
    Layers,
    Zap,
    Store,
    Users,
    QrCode,
    ExternalLink,
    ArrowUpRight,
    CheckCircle2
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Menu Manager', href: '/menus' },
];

const ICON_MAP: Record<string, any> = {
    Home,
    Sparkles,
    CircleDollarSign,
    Settings2,
    Mail,
    ShieldCheck,
    FileText,
    Lock,
    Phone,
    HelpCircle,
    Layers,
    Zap,
    Store,
    Users,
    QrCode,
    ExternalLink,
};

interface MenuManagerProps {
    menus: DynamicMenu[];
    selectedMenu: DynamicMenu | null;
    pages: { id: number; title: string; slug: string; status: string }[];
    activeLocation: string;
    locations: { value: string; label: string }[];
    icons: string[];
}

export default function MenuManager({
    menus,
    selectedMenu,
    pages,
    activeLocation,
    locations,
    icons,
}: MenuManagerProps) {
    const { auth } = usePage().props as any;
    const permissions: string[] = auth?.permissions || [];
    const roles: string[] = auth?.roles || [];
    const isSuperAdmin = roles.includes('super-admin') || roles.includes('SUPER ADMIN');

    const canCreate = isSuperAdmin || permissions.includes('menu.create');
    const canEdit = isSuperAdmin || permissions.includes('menu.edit');
    const canDelete = isSuperAdmin || permissions.includes('menu.delete');

    // Modal state for Add/Edit item
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<DynamicMenuItem | null>(null);

    const form = useForm({
        menu_id: selectedMenu?.id || (menus[0]?.id ?? 1),
        title: '',
        url_type: 'anchor' as 'anchor' | 'page' | 'route' | 'custom',
        page_id: '' as string | number,
        url: '#',
        icon: 'Sparkles',
        badge: '',
        target: '_self' as '_self' | '_blank',
        is_active: true,
    });

    const openAddModal = () => {
        setEditingItem(null);
        form.reset();
        form.setData({
            menu_id: selectedMenu?.id || (menus[0]?.id ?? 1),
            title: '',
            url_type: 'anchor',
            page_id: '',
            url: '#',
            icon: 'Sparkles',
            badge: '',
            target: '_self',
            is_active: true,
        });
        setIsModalOpen(true);
    };

    const openEditModal = (item: DynamicMenuItem) => {
        setEditingItem(item);
        form.setData({
            menu_id: item.menu_id || (selectedMenu?.id ?? 1),
            title: item.title,
            url_type: item.url_type || 'anchor',
            page_id: item.page_id || '',
            url: item.url || '',
            icon: item.icon || 'Sparkles',
            badge: item.badge || '',
            target: item.target || '_self',
            is_active: item.is_active ?? true,
        });
        setIsModalOpen(true);
    };

    const handleSaveItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) {
            form.patch(route('menus.items.update', editingItem.id), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                },
            });
        } else {
            form.post(route('menus.items.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                },
            });
        }
    };

    const handleDeleteItem = (item: DynamicMenuItem) => {
        if (!canDelete) return;
        if (confirm(`Remove "${item.title}" from this menu?`)) {
            router.delete(route('menus.items.destroy', item.id));
        }
    };

    const handleMove = (index: number, direction: 'up' | 'down') => {
        if (!selectedMenu?.items) return;
        const newItems = [...selectedMenu.items];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= newItems.length) return;

        const temp = newItems[index];
        newItems[index] = newItems[targetIndex];
        newItems[targetIndex] = temp;

        const reorderPayload = newItems.map((item, idx) => ({
            id: item.id,
            order: idx + 1,
        }));

        router.post(route('menus.items.reorder'), { items: reorderPayload }, { preserveScroll: true });
    };

    const handleLocationChange = (loc: string) => {
        router.get(route('menus.index'), { location: loc }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Menu Manager — Header & Footer Navigation" />

            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
                {/* Header Title & CTA */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            Menu & Navigation Manager
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Configure header navbar links, footer columns, anchor scrolls, custom URLs, and visual badges.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
                            <a href="/" target="_blank" rel="noreferrer">
                                <Globe className="h-3.5 w-3.5 text-primary" />
                                <span>Preview Website</span>
                                <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                            </a>
                        </Button>

                        {canCreate && (
                            <Button
                                onClick={openAddModal}
                                size="sm"
                                className="gap-1.5 font-semibold shadow-sm bg-primary text-primary-foreground"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Add Menu Item</span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Location Tabs */}
                <div className="flex flex-wrap items-center gap-2 p-1.5 bg-card rounded-xl border border-border shadow-2xs">
                    {locations.map((loc) => {
                        const isSelected = activeLocation === loc.value;
                        const matchingMenu = menus.find((m) => m.location === loc.value);
                        const count = matchingMenu?.items?.length || 0;

                        return (
                            <button
                                key={loc.value}
                                type="button"
                                onClick={() => handleLocationChange(loc.value)}
                                className={`px-4 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                                    isSelected
                                        ? 'bg-primary text-primary-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                                }`}
                            >
                                <Menu className="h-3.5 w-3.5" />
                                <span>{loc.label}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                                    isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                                }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Menu Items List */}
                <Card className="border-border bg-card shadow-xs overflow-hidden">
                    <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                        <div>
                            <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
                                <span>{selectedMenu?.name || 'Menu Navigation'}</span>
                                <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
                                    Location: {selectedMenu?.location}
                                </Badge>
                            </h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {selectedMenu?.description || 'Active menu links displayed to visitors.'}
                            </p>
                        </div>

                        {canCreate && (
                            <Button onClick={openAddModal} variant="outline" size="sm" className="text-xs gap-1.5 h-8">
                                <Plus className="h-3.5 w-3.5" />
                                <span>Add Item</span>
                            </Button>
                        )}
                    </div>

                    <div className="divide-y divide-border">
                        {!selectedMenu?.items || selectedMenu.items.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground">
                                <Menu className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                                <p className="font-semibold text-foreground">No menu items added yet</p>
                                <p className="text-xs mt-1">Click "Add Menu Item" to link pages or anchors to this menu.</p>
                            </div>
                        ) : (
                            selectedMenu.items.map((item, index) => {
                                const IconComponent = item.icon && ICON_MAP[item.icon] ? ICON_MAP[item.icon] : Sparkles;

                                return (
                                    <div
                                        key={item.id}
                                        className="p-4 flex items-center justify-between hover:bg-muted/40 transition-colors group"
                                    >
                                        {/* Left info & icon */}
                                        <div className="flex items-center gap-3.5">
                                            {/* Reorder Buttons */}
                                            {canEdit && (
                                                <div className="flex flex-col gap-0.5 shrink-0">
                                                    <button
                                                        type="button"
                                                        disabled={index === 0}
                                                        onClick={() => handleMove(index, 'up')}
                                                        className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-20 disabled:pointer-events-none"
                                                        title="Move Up"
                                                    >
                                                        <ChevronUp className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={index === selectedMenu.items!.length - 1}
                                                        onClick={() => handleMove(index, 'down')}
                                                        className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-20 disabled:pointer-events-none"
                                                        title="Move Down"
                                                    >
                                                        <ChevronDown className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            )}

                                            {/* Item Icon */}
                                            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                <IconComponent className="h-4 w-4" />
                                            </div>

                                            {/* Label & Details */}
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm text-foreground">{item.title}</span>
                                                    {item.badge && (
                                                        <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                    {item.target === '_blank' && (
                                                        <span className="text-[10px] text-muted-foreground font-mono">(new tab)</span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                                                    <span className="capitalize px-1.5 py-0.2 rounded bg-muted text-[10px] font-sans">
                                                        {item.url_type}
                                                    </span>
                                                    <span>{item.url}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1.5">
                                            {canEdit && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openEditModal(item)}
                                                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                    title="Edit Item"
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </Button>
                                            )}

                                            {canDelete && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteItem(item)}
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                    title="Delete Item"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </Card>
            </div>

            {/* Modal Dialog for Add / Edit Menu Item */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-card border border-border shadow-2xl rounded-2xl max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-2 border-b border-border">
                            <h3 className="font-bold text-base text-foreground">
                                {editingItem ? `Edit Menu Item: ${editingItem.title}` : 'Add New Menu Item'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="text-muted-foreground hover:text-foreground text-xs font-semibold px-2 py-1 rounded"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSaveItem} className="space-y-4">
                            <div>
                                <Label htmlFor="item_title" className="text-xs font-bold">
                                    Menu Label / Title <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="item_title"
                                    type="text"
                                    required
                                    value={form.data.title}
                                    onChange={(e) => form.setData('title', e.target.value)}
                                    placeholder="e.g. How It Works, Pricing, Support"
                                    className="mt-1 text-xs"
                                />
                                <InputError message={form.errors.title} className="mt-1 text-xs" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="item_url_type" className="text-xs font-bold">
                                        Link Type
                                    </Label>
                                    <select
                                        id="item_url_type"
                                        value={form.data.url_type}
                                        onChange={(e) => form.setData('url_type', e.target.value as any)}
                                        className="mt-1 w-full h-9 px-3 rounded-md text-xs bg-background border border-input focus:outline-hidden focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="anchor">Anchor Section (#feature)</option>
                                        <option value="page">CMS Dynamic Page (/p/slug)</option>
                                        <option value="custom">Custom URL (External or Path)</option>
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="item_icon" className="text-xs font-bold">
                                        Lucide Icon
                                    </Label>
                                    <select
                                        id="item_icon"
                                        value={form.data.icon}
                                        onChange={(e) => form.setData('icon', e.target.value)}
                                        className="mt-1 w-full h-9 px-3 rounded-md text-xs bg-background border border-input focus:outline-hidden focus:ring-2 focus:ring-primary"
                                    >
                                        {icons.map((ic) => (
                                            <option key={ic} value={ic}>
                                                {ic}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* CMS Page Selector if url_type === 'page' */}
                            {form.data.url_type === 'page' && (
                                <div>
                                    <Label htmlFor="item_page_id" className="text-xs font-bold">
                                        Select CMS Page
                                    </Label>
                                    <select
                                        id="item_page_id"
                                        value={form.data.page_id}
                                        onChange={(e) => {
                                            const pId = e.target.value;
                                            const foundPage = pages.find((p) => p.id.toString() === pId);
                                            form.setData({
                                                ...form.data,
                                                page_id: pId,
                                                url: foundPage ? `/p/${foundPage.slug}` : form.data.url,
                                                title: form.data.title || (foundPage ? foundPage.title : ''),
                                            });
                                        }}
                                        className="mt-1 w-full h-9 px-3 rounded-md text-xs bg-background border border-input focus:outline-hidden focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="">Select a published page</option>
                                        {pages.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.title} (/{p.slug}) - [{p.status}]
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* URL string if not page */}
                            {form.data.url_type !== 'page' && (
                                <div>
                                    <Label htmlFor="item_url" className="text-xs font-bold">
                                        Link Target URL / Anchor
                                    </Label>
                                    <Input
                                        id="item_url"
                                        type="text"
                                        required
                                        value={form.data.url}
                                        onChange={(e) => form.setData('url', e.target.value)}
                                        placeholder={form.data.url_type === 'anchor' ? '#feature' : 'https://example.com'}
                                        className="mt-1 text-xs font-mono"
                                    />
                                    <InputError message={form.errors.url} className="mt-1 text-xs" />
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="item_badge" className="text-xs font-bold">
                                        Badge Label (Optional)
                                    </Label>
                                    <Input
                                        id="item_badge"
                                        type="text"
                                        value={form.data.badge}
                                        onChange={(e) => form.setData('badge', e.target.value)}
                                        placeholder="e.g. 30%, New, Hot"
                                        className="mt-1 text-xs"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="item_target" className="text-xs font-bold">
                                        Open Behavior
                                    </Label>
                                    <select
                                        id="item_target"
                                        value={form.data.target}
                                        onChange={(e) => form.setData('target', e.target.value as any)}
                                        className="mt-1 w-full h-9 px-3 rounded-md text-xs bg-background border border-input focus:outline-hidden focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="_self">Same Tab (_self)</option>
                                        <option value="_blank">New Tab (_blank)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-xs"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                    size="sm"
                                    className="text-xs font-semibold bg-primary text-primary-foreground shadow-sm"
                                >
                                    {form.processing ? 'Saving...' : editingItem ? 'Update Item' : 'Add to Menu'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
