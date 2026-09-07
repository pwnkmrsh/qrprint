import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Store,
    Printer,
    FileText,
    QrCode,
    Power,
    ExternalLink,
    IndianRupee,
    RotateCcw,
    XCircle,
    CheckCircle2,
    Clock,
    Wifi,
    WifiOff,
    Edit3,
    Check,
    ArrowLeft,
    AlertCircle,
    Sliders,
    CreditCard
} from 'lucide-react';

interface PrinterItem {
    id: number;
    name: string;
    connection_type: string;
    ip_address?: string;
    status: string;
    is_default: boolean;
    color_support: boolean;
    duplex_support: boolean;
    total_jobs_printed: number;
    last_seen_at?: string;
}

interface OrderItem {
    id: number;
    uuid: string;
    formatted_order_id: string;
    total_files: number;
    total_amount: number;
    currency: string;
    status: string;
    payment_status: string;
    payment_method: string;
    created_at: string;
}

interface JobItem {
    id: number;
    uuid: string;
    document_name: string;
    file_type: string;
    printer_name?: string;
    copies: number;
    color_mode: string;
    paper_size: string;
    status: string;
    attempts: number;
    error_message?: string;
    created_at: string;
}

interface ShopDetailsProps {
    shop: {
        id: number;
        uuid: string;
        title: string;
        print_token: string;
        is_active: boolean;
        print_count: number;
        created_at: string;
        qr_url: string;
        print_url: string;
        owner: {
            id?: number;
            name: string;
            email: string;
        };
        setting: {
            shop_name: string;
            mobile_number: string;
            address: string;
            city: string;
            state: string;
            pincode: string;
            logo_url?: string;
            currency_symbol: string;
            bw_price_per_page: number;
            color_price_per_page: number;
            scanner_price_per_page: number;
            online_payment_enabled: boolean;
            counter_payment_enabled: boolean;
            gateway_provider: string;
        };
        printers: PrinterItem[];
        recent_orders: OrderItem[];
        recent_jobs: JobItem[];
    };
    stats: {
        total_sessions: number;
        paid_sessions: number;
        total_revenue: number;
        total_jobs: number;
        printed_jobs: number;
        failed_jobs: number;
        total_printers: number;
        online_printers: number;
    };
}

export default function AdminShopShow({ shop, stats }: ShopDetailsProps) {
    const [isEditing, setIsEditing] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        title: shop.title,
        is_active: shop.is_active,
        mobile_number: shop.setting.mobile_number || '',
        address: shop.setting.address || '',
        bw_price_per_page: shop.setting.bw_price_per_page || 2.0,
        color_price_per_page: shop.setting.color_price_per_page || 10.0,
        scanner_price_per_page: shop.setting.scanner_price_per_page || 5.0,
    });

    const toggleShopActive = () => {
        router.post(route('admin.shops.toggle-active', shop.id), {}, { preserveScroll: true });
    };

    const handleUpdateShop = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.shops.update', shop.id), {
            onSuccess: () => setIsEditing(false),
            preserveScroll: true,
        });
    };

    const retryJob = (jobId: number) => {
        router.post(route('admin.print-jobs.retry', jobId), {}, { preserveScroll: true });
    };

    const cancelJob = (jobId: number) => {
        router.post(route('admin.print-jobs.cancel', jobId), {}, { preserveScroll: true });
    };

    const completeJob = (jobId: number) => {
        router.post(route('admin.print-jobs.complete', jobId), {}, { preserveScroll: true });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Super Admin', href: '/admin/settings' },
                { title: 'Shops Management', href: '/admin/shops' },
                { title: shop.title, href: route('admin.shops.show', shop.id) },
            ]}
        >
            <Head title={`Shop: ${shop.title} - Super Admin`} />

            <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
                {/* Back Link & Header */}
                <div className="flex flex-col gap-4">
                    <Link
                        href={route('admin.shops.index')}
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 w-fit font-medium"
                    >
                        <ArrowLeft className="size-3.5" /> Back to All Shops
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-6">
                        <div className="flex items-start gap-3.5">
                            <div className="p-3 bg-primary/10 text-primary rounded-2xl shadow-xs">
                                <Store className="size-7" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold tracking-tight text-foreground">{shop.title}</h1>
                                    <Badge
                                        className={`text-xs font-semibold ${
                                            shop.is_active
                                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                                                : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                                        }`}
                                    >
                                        {shop.is_active ? 'Active & Serving' : 'Deactivated'}
                                    </Badge>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1.5">
                                    <span>Owner: <strong className="text-foreground">{shop.owner.name}</strong> ({shop.owner.email})</span>
                                    <span>•</span>
                                    <span>Phone: <strong className="text-foreground">{shop.setting.mobile_number}</strong></span>
                                    <span>•</span>
                                    <span className="font-mono text-primary">Token: /{shop.print_token}</span>
                                </div>
                            </div>
                        </div>

                        {/* Top Action Buttons */}
                        <div className="flex items-center gap-2.5 shrink-0">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setIsEditing(!isEditing)}
                                className="h-9 text-xs gap-1.5 font-semibold"
                            >
                                <Edit3 className="size-3.5" />
                                {isEditing ? 'Cancel Edit' : 'Edit Rates & Info'}
                            </Button>

                            <Button
                                size="sm"
                                variant={shop.is_active ? 'destructive' : 'default'}
                                onClick={toggleShopActive}
                                className={`h-9 text-xs gap-1.5 font-bold ${
                                    !shop.is_active ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''
                                }`}
                            >
                                <Power className="size-3.5" />
                                {shop.is_active ? 'Deactivate Shop' : 'Activate Shop'}
                            </Button>

                            <Button size="sm" variant="secondary" asChild className="h-9 text-xs gap-1.5">
                                <a href={shop.print_url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="size-3.5" /> Customer Portal
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Edit Form Card (collapsible) */}
                {isEditing && (
                    <Card className="border-primary/40 bg-primary/5 shadow-xs">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Sliders className="size-4 text-primary" /> Modify Shop Profile & Pricing Rules
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Super Admin override for shop rates and metadata.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdateShop} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="title" className="text-xs">Shop Name</Label>
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            className="h-8 text-xs bg-background"
                                        />
                                        {errors.title && <span className="text-[10px] text-rose-500">{errors.title}</span>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="mobile" className="text-xs">Mobile Number</Label>
                                        <Input
                                            id="mobile"
                                            value={data.mobile_number}
                                            onChange={(e) => setData('mobile_number', e.target.value)}
                                            className="h-8 text-xs bg-background"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="address" className="text-xs">Shop Address</Label>
                                        <Input
                                            id="address"
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            className="h-8 text-xs bg-background"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="bw_rate" className="text-xs">B&W Rate / Page (₹)</Label>
                                        <Input
                                            id="bw_rate"
                                            type="number"
                                            step="0.5"
                                            value={data.bw_price_per_page}
                                            onChange={(e) => setData('bw_price_per_page', parseFloat(e.target.value) || 0)}
                                            className="h-8 text-xs bg-background"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="color_rate" className="text-xs">Color Rate / Page (₹)</Label>
                                        <Input
                                            id="color_rate"
                                            type="number"
                                            step="0.5"
                                            value={data.color_price_per_page}
                                            onChange={(e) => setData('color_price_per_page', parseFloat(e.target.value) || 0)}
                                            className="h-8 text-xs bg-background"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="scanner_rate" className="text-xs">Scanner Rate / Page (₹)</Label>
                                        <Input
                                            id="scanner_rate"
                                            type="number"
                                            step="0.5"
                                            value={data.scanner_price_per_page}
                                            onChange={(e) => setData('scanner_price_per_page', parseFloat(e.target.value) || 0)}
                                            className="h-8 text-xs bg-background"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setIsEditing(false)}
                                        className="h-8 text-xs"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        size="sm"
                                        disabled={processing}
                                        className="h-8 text-xs font-bold gap-1"
                                    >
                                        <Check className="size-3" /> Save Changes
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="shadow-xs border">
                        <CardContent className="p-4">
                            <span className="text-xs text-muted-foreground font-medium">Total Paid Revenue</span>
                            <div className="text-2xl font-extrabold mt-1 text-emerald-600">
                                ₹{stats.total_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-xs border">
                        <CardContent className="p-4">
                            <span className="text-xs text-muted-foreground font-medium">Print Sessions</span>
                            <div className="text-2xl font-extrabold mt-1">
                                {stats.paid_sessions} <span className="text-xs text-muted-foreground font-normal">/ {stats.total_sessions} total</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-xs border">
                        <CardContent className="p-4">
                            <span className="text-xs text-muted-foreground font-medium">Spool Print Jobs</span>
                            <div className="text-2xl font-extrabold mt-1 text-primary">
                                {stats.printed_jobs} <span className="text-xs text-muted-foreground font-normal">/ {stats.total_jobs} total</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-xs border">
                        <CardContent className="p-4">
                            <span className="text-xs text-muted-foreground font-medium">Connected Hardware</span>
                            <div className="text-2xl font-extrabold mt-1">
                                <span className="text-emerald-600">{stats.online_printers}</span> / {stats.total_printers} Online
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left 2 Cols: Hardware Printers & Recent Print Jobs */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Connected Printers Section */}
                        <Card className="shadow-xs border">
                            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-base font-bold flex items-center gap-2">
                                        <Printer className="size-4 text-primary" /> Physical Hardware Printers ({shop.printers.length})
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Printers registered and connected to this shop's desktop bridge agent.
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {shop.printers.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground">
                                        <Printer className="size-8 mx-auto text-muted-foreground/40 mb-2" />
                                        <p className="text-xs font-medium">No printers linked yet.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y text-xs">
                                        {shop.printers.map((printer) => (
                                            <div key={printer.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-foreground text-sm">{printer.name}</span>
                                                        {printer.is_default && (
                                                            <Badge variant="outline" className="text-[10px] text-primary border-primary/40">Default</Badge>
                                                        )}
                                                        <Badge
                                                            className={`text-[10px] ${
                                                                printer.status === 'online'
                                                                    ? 'bg-emerald-600 text-white'
                                                                    : 'bg-muted-foreground/30 text-foreground'
                                                            }`}
                                                        >
                                                            {printer.status === 'online' ? (
                                                                <span className="flex items-center gap-1"><Wifi className="size-3" /> Online</span>
                                                            ) : (
                                                                <span className="flex items-center gap-1"><WifiOff className="size-3" /> Offline</span>
                                                            )}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
                                                        <span>Type: <strong className="text-foreground uppercase">{printer.connection_type}</strong></span>
                                                        {printer.ip_address && <span>IP: <span className="font-mono">{printer.ip_address}</span></span>}
                                                        <span>Printed: <strong className="text-foreground">{printer.total_jobs_printed} jobs</strong></span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1.5">
                                                    {printer.color_support && <Badge variant="secondary" className="text-[10px]">Color</Badge>}
                                                    {printer.duplex_support && <Badge variant="secondary" className="text-[10px]">Duplex</Badge>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Print Jobs Spool */}
                        <Card className="shadow-xs border">
                            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-base font-bold flex items-center gap-2">
                                        <FileText className="size-4 text-primary" /> Recent Print Jobs Spool
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Live queue executions and print spool attempts for this shop.
                                    </CardDescription>
                                </div>
                                <Link
                                    href={`/admin/print-jobs?shop_id=${shop.id}`}
                                    className="text-xs text-primary hover:underline font-semibold"
                                >
                                    View All Jobs →
                                </Link>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-muted/40 border-b text-muted-foreground font-semibold">
                                            <tr>
                                                <th className="py-2.5 px-4">Document</th>
                                                <th className="py-2.5 px-4">Printer</th>
                                                <th className="py-2.5 px-4">Status</th>
                                                <th className="py-2.5 px-4">Time</th>
                                                <th className="py-2.5 px-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {shop.recent_jobs.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                                                        No recent print jobs.
                                                    </td>
                                                </tr>
                                            ) : (
                                                shop.recent_jobs.map((job) => (
                                                    <tr key={job.id} className="hover:bg-muted/20 transition-colors">
                                                        <td className="py-3 px-4">
                                                            <div className="font-semibold text-foreground">{job.document_name}</div>
                                                            <div className="text-[10px] text-muted-foreground font-mono">{job.uuid}</div>
                                                        </td>
                                                        <td className="py-3 px-4 font-mono text-muted-foreground">
                                                            {job.printer_name || 'Auto'}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            {job.status === 'printed' ? (
                                                                <Badge className="bg-emerald-600 text-white text-[10px]">Printed</Badge>
                                                            ) : job.status === 'printing' ? (
                                                                <Badge className="bg-blue-600 text-white animate-pulse text-[10px]">Printing</Badge>
                                                            ) : job.status === 'failed' ? (
                                                                <Badge variant="destructive" className="text-[10px]">Failed</Badge>
                                                            ) : (
                                                                <Badge variant="outline" className="text-[10px]">Pending</Badge>
                                                            )}
                                                            {job.error_message && (
                                                                <div className="text-rose-500 text-[9px] mt-0.5 max-w-[140px] truncate">
                                                                    {job.error_message}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-4 text-muted-foreground text-[11px]">
                                                            {job.created_at}
                                                        </td>
                                                        <td className="py-3 px-4 text-right space-x-1">
                                                            {job.status !== 'printed' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => completeJob(job.id)}
                                                                    className="h-6 text-[10px] px-2 text-emerald-600 hover:text-emerald-700"
                                                                    title="Force mark as printed"
                                                                >
                                                                    Complete
                                                                </Button>
                                                            )}
                                                            {job.status === 'failed' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => retryJob(job.id)}
                                                                    className="h-6 text-[10px] px-2 text-primary"
                                                                >
                                                                    Retry
                                                                </Button>
                                                            )}
                                                            {job.status === 'pending' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => cancelJob(job.id)}
                                                                    className="h-6 text-[10px] px-2 text-rose-500 hover:text-rose-600"
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Col: Shop Configuration & Recent Orders */}
                    <div className="space-y-6">
                        {/* Pricing & Gateway Rules */}
                        <Card className="shadow-xs border">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <IndianRupee className="size-4 text-primary" /> Active Pricing & Gateway
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-xs">
                                <div className="flex justify-between items-center py-1.5 border-b">
                                    <span className="text-muted-foreground">B&W Print Rate:</span>
                                    <span className="font-bold text-foreground">₹{shop.setting.bw_price_per_page.toFixed(2)} / page</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b">
                                    <span className="text-muted-foreground">Color Print Rate:</span>
                                    <span className="font-bold text-foreground">₹{shop.setting.color_price_per_page.toFixed(2)} / page</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b">
                                    <span className="text-muted-foreground">Scanner Rate:</span>
                                    <span className="font-bold text-foreground">₹{shop.setting.scanner_price_per_page.toFixed(2)} / page</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b">
                                    <span className="text-muted-foreground">Payment Gateway:</span>
                                    <Badge variant="outline" className="uppercase font-mono text-[10px]">
                                        {shop.setting.gateway_provider}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center py-1.5">
                                    <span className="text-muted-foreground">Online Payments:</span>
                                    <Badge className={shop.setting.online_payment_enabled ? 'bg-emerald-600 text-white' : 'bg-muted-foreground text-white'}>
                                        {shop.setting.online_payment_enabled ? 'Enabled' : 'Disabled'}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Orders List */}
                        <Card className="shadow-xs border">
                            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                        <CreditCard className="size-4 text-emerald-600" /> Recent Orders
                                    </CardTitle>
                                </div>
                                <Link
                                    href={`/admin/orders?shop_id=${shop.id}`}
                                    className="text-xs text-primary hover:underline font-semibold"
                                >
                                    All Orders →
                                </Link>
                            </CardHeader>
                            <CardContent className="p-0">
                                {shop.recent_orders.length === 0 ? (
                                    <div className="p-6 text-center text-muted-foreground text-xs">
                                        No customer orders yet.
                                    </div>
                                ) : (
                                    <div className="divide-y text-xs">
                                        {shop.recent_orders.map((order) => (
                                            <div key={order.id} className="p-3.5 flex items-center justify-between hover:bg-muted/20 transition-colors">
                                                <div className="space-y-0.5">
                                                    <div className="font-semibold text-foreground">
                                                        {order.formatted_order_id}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground">
                                                        {order.total_files} files • {order.payment_method || 'Online'}
                                                    </div>
                                                </div>
                                                <div className="text-right space-y-1">
                                                    <div className="font-bold text-foreground">
                                                        ₹{order.total_amount.toFixed(2)}
                                                    </div>
                                                    <Badge
                                                        className={`text-[9px] ${
                                                            order.payment_status === 'paid'
                                                                ? 'bg-emerald-600 text-white'
                                                                : 'bg-amber-600 text-white'
                                                        }`}
                                                    >
                                                        {order.payment_status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
