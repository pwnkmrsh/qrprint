import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    ShoppingBag, 
    ArrowLeft, 
    FileText, 
    Printer, 
    CreditCard, 
    Store, 
    CheckCircle2, 
    Clock, 
    XCircle,
    User,
    Calendar,
    Receipt
} from 'lucide-react';

interface OrderDetailProps {
    order: {
        id: number;
        uuid: string;
        formatted_order_id: string;
        shop: {
            id?: number;
            title?: string;
            phone?: string;
            address?: string;
        };
        status: string;
        payment_method: string;
        payment_status: string;
        print_status: string;
        total_amount: number;
        currency: string;
        paid_at?: string;
        paid_by?: string;
        created_at: string;
        jobs: {
            id: number;
            uuid: string;
            document_name: string;
            file_type: string;
            printer_name?: string;
            copies: number;
            orientation: string;
            color_mode: string;
            paper_size: string;
            duplex: string;
            status: string;
            attempts: number;
            error_message?: string;
            printed_at?: string;
        }[];
        payments: {
            id: number;
            uuid: string;
            gateway: string;
            gateway_order_id?: string;
            gateway_payment_id?: string;
            payment_method: string;
            payment_type: string;
            amount: number;
            currency: string;
            status: string;
            refund_amount: number;
            refund_reason?: string;
            error_message?: string;
            collector_name?: string;
            paid_at?: string;
            created_at: string;
        }[];
    };
}

export default function AdminOrderDetail({ order }: OrderDetailProps) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Orders', href: '/admin/orders' }, { title: order.formatted_order_id, href: '#' }]}>
            <Head title={`Order ${order.formatted_order_id} - Super Admin`} />

            <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6">
                    <div className="space-y-1">
                        <Link href={route('admin.orders.index')} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium mb-1">
                            <ArrowLeft className="size-3.5" /> Back to Orders
                        </Link>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-foreground font-mono">{order.formatted_order_id}</h1>
                            {order.payment_status === 'paid' ? (
                                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">Paid</Badge>
                            ) : (
                                <Badge variant="outline" className="text-amber-600 bg-amber-50">Payment Pending</Badge>
                            )}
                            <Badge variant="outline" className="uppercase font-semibold text-xs">
                                {order.print_status}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left 2 Cols: Print Jobs / Documents */}
                    <div className="md:col-span-2 space-y-6">
                        <Card className="shadow-xs border">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <FileText className="size-4 text-primary" />
                                    Configured Print Jobs ({order.jobs.length})
                                </CardTitle>
                                <CardDescription>Files and print parameters in this customer order.</CardDescription>
                            </CardHeader>
                            <CardContent className="divide-y p-0">
                                {order.jobs.map((job, idx) => (
                                    <div key={job.id} className="p-4 flex items-start justify-between gap-4 hover:bg-muted/15 transition-colors">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-muted-foreground">#{idx + 1}</span>
                                                <span className="font-semibold text-sm text-foreground">{job.document_name}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
                                                <Badge variant="secondary" className="text-[10px]">{job.copies} {job.copies > 1 ? 'copies' : 'copy'}</Badge>
                                                <Badge variant="secondary" className="text-[10px] uppercase">{job.color_mode}</Badge>
                                                <Badge variant="secondary" className="text-[10px]">{job.paper_size}</Badge>
                                                <Badge variant="secondary" className="text-[10px]">Duplex: {job.duplex}</Badge>
                                                {job.printer_name && (
                                                    <span className="text-primary font-medium">Printer: {job.printer_name}</span>
                                                )}
                                            </div>
                                            {job.error_message && (
                                                <p className="text-xs text-rose-500 font-medium">{job.error_message}</p>
                                            )}
                                        </div>
                                        <div>
                                            {job.status === 'printed' ? (
                                                <Badge className="bg-emerald-600 text-white">Printed</Badge>
                                            ) : job.status === 'printing' ? (
                                                <Badge className="bg-blue-600 text-white animate-pulse">Printing</Badge>
                                            ) : (
                                                <Badge variant="outline">{job.status}</Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Payment Transactions */}
                        <Card className="shadow-xs border">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <CreditCard className="size-4 text-emerald-600" />
                                    Payment Audit Records ({order.payments.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="divide-y p-0">
                                {order.payments.length === 0 ? (
                                    <div className="p-6 text-center text-xs text-muted-foreground">
                                        No validated payment records recorded yet.
                                    </div>
                                ) : (
                                    order.payments.map((p) => (
                                        <div key={p.id} className="p-4 flex items-center justify-between text-xs">
                                            <div className="space-y-1">
                                                <div className="font-semibold text-foreground flex items-center gap-2">
                                                    <span>₹{p.amount.toFixed(2)}</span>
                                                    <Badge variant="outline" className="text-[10px] uppercase font-bold">{p.gateway} ({p.payment_type})</Badge>
                                                </div>
                                                <div className="font-mono text-[11px] text-muted-foreground">
                                                    Ref: {p.gateway_payment_id || p.gateway_order_id || 'Cash/Direct'}
                                                </div>
                                                {p.collector_name && (
                                                    <div className="text-muted-foreground">Collected by: {p.collector_name}</div>
                                                )}
                                            </div>
                                            <div className="text-right space-y-1">
                                                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                                                    {p.status.toUpperCase()}
                                                </Badge>
                                                <div className="text-[10px] text-muted-foreground">{p.paid_at || p.created_at}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right 1 Col: Summary & Shop Info */}
                    <div className="space-y-6">
                        <Card className="shadow-xs border">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <Receipt className="size-4 text-primary" /> Order Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-xs">
                                <div className="flex justify-between py-1 border-b">
                                    <span className="text-muted-foreground">Total Bill Amount:</span>
                                    <span className="font-bold text-base text-foreground">₹{order.total_amount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b">
                                    <span className="text-muted-foreground">Payment Method:</span>
                                    <span className="font-semibold uppercase">{order.payment_method}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b">
                                    <span className="text-muted-foreground">Order Date:</span>
                                    <span>{order.created_at}</span>
                                </div>
                                {order.paid_at && (
                                    <div className="flex justify-between py-1 border-b">
                                        <span className="text-muted-foreground">Paid At:</span>
                                        <span className="text-emerald-600 font-semibold">{order.paid_at}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="shadow-xs border">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <Store className="size-4 text-primary" /> Print Shop
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-xs">
                                <div className="font-bold text-foreground text-sm">{order.shop.title || 'Print Shop'}</div>
                                {order.shop.phone && (
                                    <div className="text-muted-foreground">{order.shop.phone}</div>
                                )}
                                {order.shop.address && (
                                    <div className="text-muted-foreground leading-relaxed">{order.shop.address}</div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
