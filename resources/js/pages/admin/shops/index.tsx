import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
    Store, 
    Search, 
    Printer, 
    ExternalLink, 
    CheckCircle2, 
    XCircle,
    FileText,
    QrCode,
    Power,
    SlidersHorizontal,
    Eye,
    TrendingUp,
    Wifi
} from 'lucide-react';

interface ShopItem {
    id: number;
    uuid: string;
    title: string;
    print_token: string;
    is_active: boolean;
    print_count: number;
    owner_name: string;
    owner_email: string;
    mobile_number: string;
    address: string;
    logo_url?: string;
    printers_count: number;
    online_printers_count: number;
    sessions_count: number;
    created_at: string;
    qr_url: string;
    print_url: string;
    details_url: string;
}

interface ShopsProps {
    shops: {
        data: ShopItem[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
    stats: {
        total_shops: number;
        active_shops: number;
        inactive_shops: number;
        total_printers: number;
        online_printers: number;
        total_revenue: number;
    };
}

export default function AdminShopsIndex({ shops, filters, stats }: ShopsProps) {
    const [search, setSearch] = useState(filters.search || '');
    const currentStatus = filters.status || 'all';

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.shops.index'), { search, status: currentStatus }, { preserveState: true });
    };

    const handleStatusFilter = (status: string) => {
        router.get(route('admin.shops.index'), { search, status }, { preserveState: true });
    };

    const toggleShopActive = (shop: ShopItem) => {
        router.post(route('admin.shops.toggle-active', shop.id), {}, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Super Admin', href: '/admin/settings' }, { title: 'Shops Management', href: '/admin/shops' }]}>
            <Head title="Manage Print Shops - Super Admin" />

            <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-6">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <div className="p-2.5 bg-primary/10 text-primary rounded-2xl shadow-xs">
                                <Store className="size-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-foreground">Shops & Outlets Management</h1>
                                <p className="text-sm text-muted-foreground">
                                    Activate, deactivate, monitor hardware print agents, and manage all onboarded shops.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="shadow-xs border">
                        <CardContent className="p-4">
                            <span className="text-xs text-muted-foreground font-medium">Total Outlets</span>
                            <div className="text-2xl font-extrabold mt-1">{stats.total_shops}</div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-xs border">
                        <CardContent className="p-4">
                            <span className="text-xs text-muted-foreground font-medium">Active QR Points</span>
                            <div className="text-2xl font-extrabold mt-1 text-emerald-600">{stats.active_shops}</div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-xs border">
                        <CardContent className="p-4">
                            <span className="text-xs text-muted-foreground font-medium">Inactive Shops</span>
                            <div className="text-2xl font-extrabold mt-1 text-rose-500">{stats.inactive_shops}</div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-xs border">
                        <CardContent className="p-4">
                            <span className="text-xs text-muted-foreground font-medium">Printers (Online / Total)</span>
                            <div className="text-2xl font-extrabold mt-1 text-primary">
                                <span className="text-emerald-600">{stats.online_printers}</span> / {stats.total_printers}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Toolbar & Status Pills */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-2xl border shadow-xs">
                    {/* Status Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                        <Button
                            type="button"
                            size="sm"
                            variant={currentStatus === 'all' ? 'default' : 'outline'}
                            onClick={() => handleStatusFilter('all')}
                            className="h-8 text-xs font-semibold rounded-lg"
                        >
                            All ({stats.total_shops})
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant={currentStatus === 'active' ? 'default' : 'outline'}
                            onClick={() => handleStatusFilter('active')}
                            className={`h-8 text-xs font-semibold rounded-lg ${currentStatus === 'active' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'text-emerald-600'}`}
                        >
                            <CheckCircle2 className="size-3 mr-1" /> Active ({stats.active_shops})
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant={currentStatus === 'inactive' ? 'default' : 'outline'}
                            onClick={() => handleStatusFilter('inactive')}
                            className={`h-8 text-xs font-semibold rounded-lg ${currentStatus === 'inactive' ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'text-rose-500'}`}
                        >
                            <XCircle className="size-3 mr-1" /> Inactive ({stats.inactive_shops})
                        </Button>
                    </div>

                    {/* Search */}
                    <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:max-w-xs">
                        <div className="relative w-full">
                            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search title, owner, phone..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 text-xs h-8 rounded-lg"
                            />
                        </div>
                        <Button type="submit" size="sm" variant="secondary" className="h-8 text-xs px-3">
                            Search
                        </Button>
                    </form>
                </div>

                {/* Shops Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {shops.data.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-muted-foreground border rounded-2xl bg-card">
                            <Store className="size-10 mx-auto text-muted-foreground/50 mb-2" />
                            <p className="font-semibold text-sm">No shops found.</p>
                            <p className="text-xs text-muted-foreground mt-1">Try adjusting your search query or status filter.</p>
                        </div>
                    ) : (
                        shops.data.map((shop) => (
                            <Card key={shop.id} className="shadow-xs border hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
                                <CardContent className="p-5 space-y-4">
                                    {/* Shop Header */}
                                    <div className="flex items-start justify-between gap-2.5">
                                        <div className="space-y-1 min-w-0">
                                            <Link href={shop.details_url} className="hover:underline">
                                                <h3 className="font-bold text-base text-foreground truncate">{shop.title}</h3>
                                            </Link>
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                                                <span>Token: /{shop.print_token.slice(0, 10)}…</span>
                                            </div>
                                        </div>
                                        <Badge className={`shrink-0 text-xs font-semibold ${shop.is_active ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'}`}>
                                            {shop.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-2 text-xs border-t pt-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">Owner:</span>
                                            <span className="font-semibold text-foreground truncate max-w-[180px]">{shop.owner_name}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">Contact:</span>
                                            <span className="font-mono text-muted-foreground">{shop.mobile_number}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">Hardware Printers:</span>
                                            <span className="font-semibold flex items-center gap-1.5">
                                                {shop.online_printers_count > 0 ? (
                                                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                                ) : (
                                                    <span className="size-2 rounded-full bg-muted-foreground" />
                                                )}
                                                <span className="text-primary font-bold">{shop.online_printers_count}</span>
                                                <span className="text-muted-foreground">/ {shop.printers_count} total</span>
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">Print Sessions:</span>
                                            <span className="font-bold text-foreground">{shop.sessions_count} sessions</span>
                                        </div>
                                    </div>

                                    {/* Quick Links / Actions */}
                                    <div className="grid grid-cols-2 gap-2 pt-2 border-t text-xs">
                                        <Link
                                            href={`/admin/print-jobs?shop_id=${shop.id}`}
                                            className="p-2 rounded-lg border bg-muted/30 hover:bg-muted text-center font-semibold text-foreground flex items-center justify-center gap-1.5 transition-colors"
                                        >
                                            <Printer className="size-3.5 text-primary" /> View Jobs
                                        </Link>
                                        <Link
                                            href={`/admin/orders?shop_id=${shop.id}`}
                                            className="p-2 rounded-lg border bg-muted/30 hover:bg-muted text-center font-semibold text-foreground flex items-center justify-center gap-1.5 transition-colors"
                                        >
                                            <FileText className="size-3.5 text-emerald-600" /> View Orders
                                        </Link>
                                    </div>

                                    {/* Primary Control Buttons */}
                                    <div className="flex items-center justify-between gap-2 pt-1">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            asChild
                                            className="h-8 text-xs gap-1 flex-1 font-semibold"
                                        >
                                            <Link href={shop.details_url}>
                                                <Eye className="size-3.5" /> Manage
                                            </Link>
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant={shop.is_active ? 'destructive' : 'default'}
                                            onClick={() => toggleShopActive(shop)}
                                            className={`h-8 text-xs gap-1 flex-1 font-bold ${!shop.is_active ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
                                        >
                                            <Power className="size-3" />
                                            {shop.is_active ? 'Deactivate' : 'Activate'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
