import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
    CreditCard, 
    Store, 
    AlertCircle, 
    RotateCcw, 
    Search, 
    ExternalLink, 
    ArrowUpDown, 
    CheckCircle2, 
    Clock, 
    XCircle,
    TrendingUp,
    ShieldAlert,
    RefreshCw
} from 'lucide-react';

interface PaymentItem {
    id: number;
    uuid: string;
    order_id: string;
    session_uuid?: string;
    shop_title: string;
    payment_method: string;
    payment_type: 'online' | 'counter';
    gateway: string;
    gateway_order_id?: string;
    gateway_payment_id?: string;
    amount: number;
    currency: string;
    status: 'success' | 'pending' | 'failed' | 'refunded';
    error_message?: string;
    refund_amount: number;
    refund_reason?: string;
    collector_name?: string;
    paid_at?: string;
    created_at: string;
}

interface PaymentsProps {
    payments: {
        data: PaymentItem[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    active_tab: string;
    filters: {
        search?: string;
        tab?: string;
    };
    stats: {
        total_volume: number;
        online_volume: number;
        counter_volume: number;
        failed_count: number;
        refunded_volume: number;
    };
}

export default function AdminPaymentsIndex({ payments, active_tab = 'all', filters, stats }: PaymentsProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedRefundPayment, setSelectedRefundPayment] = useState<PaymentItem | null>(null);
    const [refundAmount, setRefundAmount] = useState<string>('');
    const [refundReason, setRefundReason] = useState<string>('');
    const [isRefunding, setIsRefunding] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.payments.index'), {
            tab: active_tab,
            search,
        }, { preserveState: true });
    };

    const handleTabChange = (tab: string) => {
        router.get(route('admin.payments.index'), {
            tab,
            search,
        }, { preserveState: true });
    };

    const handleOpenRefund = (payment: PaymentItem) => {
        setSelectedRefundPayment(payment);
        setRefundAmount(payment.amount.toString());
        setRefundReason('Customer requested cancellation / Print defect');
    };

    const submitRefund = () => {
        if (!selectedRefundPayment) return;
        setIsRefunding(true);
        router.post(route('admin.payments.refund', selectedRefundPayment.id), {
            amount: parseFloat(refundAmount),
            reason: refundReason,
        }, {
            onFinish: () => {
                setIsRefunding(false);
                setSelectedRefundPayment(null);
            },
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'success':
                return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 gap-1"><CheckCircle2 className="size-3" /> Paid</Badge>;
            case 'pending':
                return <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/20 gap-1"><Clock className="size-3" /> Pending</Badge>;
            case 'failed':
                return <Badge variant="destructive" className="gap-1"><XCircle className="size-3" /> Failed</Badge>;
            case 'refunded':
                return <Badge variant="secondary" className="bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30 gap-1"><RotateCcw className="size-3" /> Refunded</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Super Admin', href: '/admin/settings' }, { title: 'Payments Hub', href: '/admin/payments' }]}>
            <Head title="Payments Management Hub - Super Admin" />

            <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
                {/* Header Title */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-6">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
                                <CreditCard className="size-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-foreground">Payments Hub</h1>
                                <p className="text-sm text-muted-foreground">
                                    Monitor Online Payments (Cashfree / UPI), Counter Cash Collections, Failed Transactions and Refunds.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KPI Metrics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="shadow-xs border bg-card">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">Total Revenue</span>
                                <TrendingUp className="size-4 text-emerald-600" />
                            </div>
                            <div className="text-2xl font-extrabold mt-1 text-foreground">
                                ₹{stats.total_volume.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </div>
                            <span className="text-[10px] text-muted-foreground">All verified collections</span>
                        </CardContent>
                    </Card>

                    <Card className="shadow-xs border bg-card">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">Online (Cashfree / UPI)</span>
                                <CreditCard className="size-4 text-blue-600" />
                            </div>
                            <div className="text-2xl font-extrabold mt-1 text-blue-600">
                                ₹{stats.online_volume.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </div>
                            <span className="text-[10px] text-muted-foreground">Instant gateway settlements</span>
                        </CardContent>
                    </Card>

                    <Card className="shadow-xs border bg-card">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">Counter Payments</span>
                                <Store className="size-4 text-emerald-600" />
                            </div>
                            <div className="text-2xl font-extrabold mt-1 text-emerald-600">
                                ₹{stats.counter_volume.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </div>
                            <span className="text-[10px] text-muted-foreground">Collected at shop counters</span>
                        </CardContent>
                    </Card>

                    <Card className="shadow-xs border bg-card">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">Total Refunds</span>
                                <RotateCcw className="size-4 text-purple-600" />
                            </div>
                            <div className="text-2xl font-extrabold mt-1 text-purple-600">
                                ₹{stats.refunded_volume.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </div>
                            <span className="text-[10px] text-rose-500">{stats.failed_count} failed orders</span>
                        </CardContent>
                    </Card>
                </div>

                {/* Navigation Tabs & Search Toolbar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Filter Tabs */}
                    <div className="flex bg-muted/60 p-1 rounded-xl border flex-wrap">
                        {[
                            { id: 'all', label: 'All Payments', icon: ArrowUpDown },
                            { id: 'online', label: 'Online (Cashfree)', icon: CreditCard },
                            { id: 'counter', label: 'Counter Cash', icon: Store },
                            { id: 'failed', label: 'Failed', icon: AlertCircle },
                            { id: 'refunds', label: 'Refunds', icon: RotateCcw },
                        ].map((t) => {
                            const Icon = t.icon;
                            const isActive = active_tab === t.id;
                            return (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => handleTabChange(t.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                        isActive
                                            ? 'bg-primary text-primary-foreground shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <Icon className="size-3.5" />
                                    {t.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-72">
                        <div className="relative w-full">
                            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search Order, CF ID, Shop..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 h-9 text-xs"
                            />
                        </div>
                        <Button type="submit" size="sm" variant="secondary" className="h-9 text-xs">
                            Filter
                        </Button>
                    </form>
                </div>

                {/* Payments Table */}
                <Card className="shadow-xs border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-muted/40 border-b text-muted-foreground font-semibold">
                                <tr>
                                    <th className="py-3 px-4">Order & Time</th>
                                    <th className="py-3 px-4">Shop Name</th>
                                    <th className="py-3 px-4">Type & Gateway</th>
                                    <th className="py-3 px-4">Gateway Reference</th>
                                    <th className="py-3 px-4">Amount</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {payments.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-muted-foreground">
                                            <ShieldAlert className="size-8 mx-auto mb-2 text-muted-foreground/50" />
                                            No payment records found matching this filter.
                                        </td>
                                    </tr>
                                ) : (
                                    payments.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="py-3 px-4">
                                                <div className="font-mono font-bold text-foreground">{item.order_id}</div>
                                                <div className="text-[10px] text-muted-foreground">{item.created_at}</div>
                                            </td>
                                            <td className="py-3 px-4 font-medium text-foreground">
                                                {item.shop_title}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-1.5">
                                                    {item.payment_type === 'online' ? (
                                                        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30 text-[10px] py-0">Online</Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px] py-0">Counter</Badge>
                                                    )}
                                                    <span className="text-[11px] font-semibold uppercase">{item.payment_method}</span>
                                                </div>
                                                {item.collector_name && (
                                                    <div className="text-[10px] text-muted-foreground">by {item.collector_name}</div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">
                                                <div>{item.gateway_payment_id || item.gateway_order_id || '—'}</div>
                                                {item.error_message && (
                                                    <div className="text-rose-500 text-[10px] truncate max-w-xs">{item.error_message}</div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="font-bold text-foreground">
                                                    ₹{item.amount.toFixed(2)}
                                                </div>
                                                {item.refund_amount > 0 && (
                                                    <div className="text-[10px] text-purple-600 font-semibold">
                                                        -₹{item.refund_amount.toFixed(2)} refunded
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                {getStatusBadge(item.status)}
                                            </td>
                                            <td className="py-3 px-4 text-right space-x-2">
                                                {item.session_uuid && (
                                                    <Link
                                                        href={route('admin.orders.show', item.session_uuid)}
                                                        className="inline-flex items-center gap-1 text-primary hover:underline font-semibold text-xs"
                                                    >
                                                        <ExternalLink className="size-3" /> View Order
                                                    </Link>
                                                )}
                                                {item.status === 'success' && item.refund_amount < item.amount && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleOpenRefund(item)}
                                                        className="h-7 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                                    >
                                                        Refund
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Refund Confirmation Modal */}
                {selectedRefundPayment && (
                    <Dialog open={Boolean(selectedRefundPayment)} onOpenChange={() => setSelectedRefundPayment(null)}>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-base">
                                    <RotateCcw className="size-5 text-purple-600" />
                                    Issue Refund for {selectedRefundPayment.order_id}
                                </DialogTitle>
                                <DialogDescription className="text-xs">
                                    This will mark the payment and associated print session as refunded.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-2">
                                <div className="p-3 bg-muted/40 rounded-xl space-y-1 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Original Payment:</span>
                                        <span className="font-bold">₹{selectedRefundPayment.amount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Payment Method:</span>
                                        <span className="font-semibold uppercase">{selectedRefundPayment.payment_method} ({selectedRefundPayment.gateway})</span>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="refund_amount" className="text-xs font-semibold">Refund Amount (₹)</Label>
                                    <Input
                                        id="refund_amount"
                                        type="number"
                                        step="0.01"
                                        max={selectedRefundPayment.amount}
                                        value={refundAmount}
                                        onChange={(e) => setRefundAmount(e.target.value)}
                                        className="text-sm font-bold"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="refund_reason" className="text-xs font-semibold">Reason for Refund</Label>
                                    <Input
                                        id="refund_reason"
                                        value={refundReason}
                                        onChange={(e) => setRefundReason(e.target.value)}
                                        placeholder="e.g. Paper jam / Customer cancellation"
                                        className="text-xs"
                                    />
                                </div>
                            </div>

                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button variant="outline" size="sm" onClick={() => setSelectedRefundPayment(null)} disabled={isRefunding}>
                                    Cancel
                                </Button>
                                <Button size="sm" onClick={submitRefund} disabled={isRefunding || !refundAmount} className="bg-purple-600 hover:bg-purple-700 text-white">
                                    {isRefunding ? 'Processing...' : 'Confirm Refund'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </AppLayout>
    );
}
