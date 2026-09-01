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
    Power
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
    };
    stats: {
        total_shops: number;
        active_shops: number;
        inactive_shops: number;
    };
}

export default function AdminShopsIndex({ shops, filters, stats }: ShopsProps) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.shops.index'), { search }, { preserveState: true });
    };

    const toggleShopActive = (shop: ShopItem) => {
        router.post(route('admin.shops.toggle-active', shop.id), {}, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Super Admin', href: '/admin/settings' }, { title: 'Shops', href: '/admin/shops' }]}>
            <Head title="Registered Print Shops - Super Admin" />

            <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-6">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-primary/10 text-primary rounded-xl">
                                <Store className="size-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-foreground">Registered Print Shops</h1>
                                <p className="text-sm text-muted-foreground">
                                    Manage onboarded printing outlets, hardware connections, and active QR print points.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <Card className="shadow-xs border">
                        <CardContent className="p-4">
                            <span className="text-xs text-muted-foreground font-medium">Total Shops</span>
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
                </div>

                {/* Search */}
                <div className="flex items-center justify-between gap-4">
                    <form onSubmit={handleSearch} className="flex items-center gap-2 w-full max-w-sm">
                        <div className="relative w-full">
                            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search shop name, owner, token..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 text-xs h-9"
                            />
                        </div>
                        <Button type="submit" size="sm" variant="secondary" className="h-9 text-xs">
                            Search
                        </Button>
                    </form>
                </div>

                {/* Shops Grid / Table */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {shops.data.map((shop) => (
                        <Card key={shop.id} className="shadow-xs border hover:shadow-md transition-shadow">
                            <CardContent className="p-5 space-y-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-base text-foreground line-clamp-1">{shop.title}</h3>
                                        <p className="text-xs text-muted-foreground font-mono">Token: /{shop.print_token}</p>
                                    </div>
                                    <Badge className={shop.is_active ? 'bg-emerald-600 text-white' : 'bg-rose-500 text-white'}>
                                        {shop.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>

                                <div className="space-y-2 text-xs border-t pt-3">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Owner:</span>
                                        <span className="font-semibold">{shop.owner_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Phone:</span>
                                        <span>{shop.mobile_number}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Hardware Printers:</span>
                                        <span className="font-semibold text-primary">
                                            {shop.online_printers_count} online / {shop.printers_count} total
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Total Print Sessions:</span>
                                        <span className="font-bold">{shop.sessions_count}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-2 border-t pt-3">
                                    <a
                                        href={shop.print_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-primary hover:underline font-semibold inline-flex items-center gap-1"
                                    >
                                        <QrCode className="size-3.5" /> Customer QR View
                                    </a>

                                    <Button
                                        size="sm"
                                        variant={shop.is_active ? 'outline' : 'default'}
                                        onClick={() => toggleShopActive(shop)}
                                        className="h-8 text-xs gap-1.5"
                                    >
                                        <Power className="size-3" />
                                        {shop.is_active ? 'Deactivate' : 'Activate'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
