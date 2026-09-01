import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
    ShoppingBag, 
    Search, 
    ExternalLink, 
    CheckCircle2, 
    Clock, 
    XCircle, 
    Printer, 
    Store,
    CreditCard,
    RotateCcw
} from 'lucide-react';

interface OrderItem {
    id: number;
    uuid: string;
    formatted_order_id: string;
    shop_title: string;
    shop_id: number;
    total_files: number;
    completed_files: number;
    failed_files: number;
    total_pages: number;
    status: string;
    payment_method: string;
    payment_status: string;
    print_status: string;
    total_amount: number;
    currency: string;
    paid_at?: string;
    created_at: string;
}

interface OrdersProps {
    orders: {
        data: OrderItem[];
        current_page: number;
        last_page: number;
        total: number;
    };
    shops: { id: number; title: string }[];
    filters: {
        status?: string;
        payment_status?: string;
        shop_id?: string;
        search?: string;
    };
    stats: {
        total_orders: number;
        paid_orders: number;
        pending_payment_orders: number;
        total_revenue: number;
    };
}

export default function AdminOrdersIndex({ orders, shops, filters, stats }: OrdersProps) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.orders.index'), {
            ...filters,
            search,
        }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Super Admin', href: '/admin/settings' }, { title: 'Orders', href: '/admin/orders' }]}>
            <Head title="Orders & Print Sessions - Super Admin" />

            <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-6">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-primary/10 text-primary rounded-xl">
                                <ShoppingBag className="size-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-foreground">Customer Orders & Sessions</h1>
                                <p className="text-sm text-muted-foreground">
                                    Full audit trail of customer print orders, document specifications, and payment statuses.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="shadow-xs border">
                        <CardContent className="p-4">
                            <span className="text-xs text-muted-foreground font-medium">Total Orders</span>
                            <div className="text-2xl font-extrabold mt-1">{stats.total_orders}</div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-xs border">
                        <CardContent className="p-4">
                            <span className="text-xs text-muted-foreground font-medium">Paid Orders</span>
                            <div className="text-2xl font-extrabold mt-1 text-emerald-600">{stats.paid_orders}</div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-xs border">
                        <CardContent className="p-4">
                            <span className="text-xs text-muted-foreground font-medium">Pending Payment</span>
                            <div className="text-2xl font-extrabold mt-1 text-amber-600">{stats.pending_payment_orders}</div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-xs border">
                        <CardContent className="p-4">
                            <span className="text-xs text-muted-foreground font-medium">Total Gross Volume</span>
                            <div className="text-2xl font-extrabold mt-1 text-primary">₹{stats.total_revenue.toFixed(2)}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filters */}
                <div className="flex items-center justify-between gap-4">
                    <form onSubmit={handleSearch} className="flex items-center gap-2 w-full max-w-sm">
                        <div className="relative w-full">
                            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search Order ID, Shop..."
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

                {/* Table */}
                <Card className="shadow-xs border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-muted/40 border-b text-muted-foreground font-semibold">
                                <tr>
                                    <th className="py-3 px-4">Order ID</th>
                                    <th className="py-3 px-4">Shop</th>
                                    <th className="py-3 px-4">Documents / Pages</th>
                                    <th className="py-3 px-4">Total Amount</th>
                                    <th className="py-3 px-4">Payment</th>
                                    <th className="py-3 px-4">Print Status</th>
                                    <th className="py-3 px-4">Date</th>
                                    <th className="py-3 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {orders.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-10 text-center text-muted-foreground">
                                            No orders found.
                                        </td>
                                    </tr>
                                ) : (
                                    orders.data.map((order) => (
                                        <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="py-3 px-4 font-mono font-bold text-foreground">
                                                {order.formatted_order_id}
                                            </td>
                                            <td className="py-3 px-4 font-medium">
                                                {order.shop_title}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="font-semibold">{order.total_files} files</span>
                                                <span className="text-muted-foreground"> ({order.total_pages} pages)</span>
                                            </td>
                                            <td className="py-3 px-4 font-bold text-foreground">
                                                {order.currency}{order.total_amount.toFixed(2)}
                                            </td>
                                            <td className="py-3 px-4">
                                                {order.payment_status === 'paid' ? (
                                                    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">Paid</Badge>
                                                ) : order.payment_status === 'refunded' ? (
                                                    <Badge variant="secondary" className="bg-purple-500/15 text-purple-700">Refunded</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-amber-600 bg-amber-50">Pending</Badge>
                                                )}
                                                <span className="text-[10px] text-muted-foreground ml-1.5 uppercase font-medium">
                                                    {order.payment_method}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                {order.print_status === 'completed' || order.status === 'completed' ? (
                                                    <Badge className="bg-emerald-600 text-white">Printed</Badge>
                                                ) : order.print_status === 'printing' ? (
                                                    <Badge className="bg-blue-600 text-white animate-pulse">Printing</Badge>
                                                ) : order.payment_status === 'paid' ? (
                                                    <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">Ready to Print</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-muted-foreground">Waiting Payment</Badge>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-muted-foreground">
                                                {order.created_at}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Link
                                                    href={route('admin.orders.show', order.uuid)}
                                                    className="inline-flex items-center gap-1 text-primary hover:underline font-semibold"
                                                >
                                                    <ExternalLink className="size-3" /> View Details
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
