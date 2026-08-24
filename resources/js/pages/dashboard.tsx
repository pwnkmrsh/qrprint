import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { 
    QrCode, 
    Printer, 
    Smartphone, 
    CheckCircle2, 
    XCircle, 
    Download, 
    RefreshCw, 
    Settings, 
    UserPlus, 
    History, 
    BarChart3, 
    ChevronRight,
    Loader2,
    Users,
    Edit2,
    AlertCircle,
    FileText,
    Banknote,
    Eye,
    Check,
    ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { CustomTextarea } from '@/components/ui/custom-textarea';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Merchant Dashboard',
        href: '/dashboard',
    },
];

interface Job {
    id: number;
    uuid: string;
    document?: {
        original_name: string;
        file_type: string;
    };
    copies: number;
    color_mode: string;
    paper_size: string;
    orientation: string;
    duplex: string;
    status: string;
    attempts: number;
    error_message: string | null;
    created_at: string;
    completed_at: string | null;
}

interface PendingPayment {
    id: number;
    uuid: string;
    order_id: string;
    documents_count: number;
    pages_count: number;
    amount: number;
    currency: string;
    payment_status: string;
    created_at: string;
    jobs?: {
        id: number;
        document_name: string;
        file_type: string;
        copies: number;
        orientation: string;
        color_mode: string;
        paper_size: string;
        duplex: string;
        amount: number;
    }[];
}

interface FailedSession {
    id: number;
    uuid: string;
    order_id: string;
    completed_count: number;
    failed_count: number;
    reason: string;
    failed_jobs: {
        id: number;
        uuid: string;
        document_name: string;
    }[];
}

interface DashboardProps {
    qrPrint: {
        id: number;
        title: string;
        content: string;
        is_active: boolean;
        print_token: string;
        qr_url: string;
        print_url: string;
    };
    printer: {
        state: 'Online' | 'Offline' | 'Busy' | 'Error';
        name: string;
        agent_id: string;
        last_seen: string;
        capabilities: {
            color: boolean;
            duplex: boolean;
            paper_sizes: string[];
        };
        active_jobs: number;
        pending_jobs: number;
    };
    stats: {
        today_jobs: number;
        today_pages: number;
        total_completed: number;
        pending: number;
        printing: number;
        completed: number;
        failed: number;
    };
    jobs: {
        data: Job[];
        links: any;
        current_page: number;
        last_page: number;
    };
    canManageStaff: boolean;
    pendingPayments: PendingPayment[];
    failedSessions: FailedSession[];
}

export default function Dashboard({ qrPrint, printer, stats, jobs, canManageStaff, pendingPayments, failedSessions }: DashboardProps) {
    const { auth } = usePage().props as any;
    
    // Toggle QR Confirmation Modal
    const [isConfirmToggleOpen, setIsConfirmToggleOpen] = useState(false);
    const [isSubmittingToggle, setIsSubmittingToggle] = useState(false);
    
    // Update Shop Profile Modal
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    
    // Retry status
    const [retryingJobId, setRetryingJobId] = useState<number | null>(null);

    // View Details Modal for Counter Payments
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewingPayment, setViewingPayment] = useState<PendingPayment | null>(null);

    // Collect Payment Modal Flow
    const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
    const [collectingPayment, setCollectingPayment] = useState<PendingPayment | null>(null);
    const [paymentStep, setPaymentStep] = useState<1 | 2>(1);
    const [collectPaymentMethod, setCollectPaymentMethod] = useState<'cash' | 'upi'>('cash');
    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

    const handleViewPaymentDetails = (payment: PendingPayment) => {
        setViewingPayment(payment);
        setIsViewModalOpen(true);
    };

    const handleStartCollectPayment = (payment: PendingPayment) => {
        setCollectingPayment(payment);
        setPaymentStep(1);
        setCollectPaymentMethod('cash');
        setIsCollectModalOpen(true);
    };

    const handleConfirmPayment = () => {
        if (!collectingPayment) return;
        setIsSubmittingPayment(true);
        router.post(route('dashboard.session.collect-payment', collectingPayment.id), {
            payment_method: collectPaymentMethod,
        }, {
            onSuccess: () => {
                setIsCollectModalOpen(false);
                setCollectingPayment(null);
                setPaymentStep(1);
            },
            onFinish: () => {
                setIsSubmittingPayment(false);
            }
        });
    };

    // Profile Form
    const profileForm = useForm({
        title: qrPrint.title,
        content: qrPrint.content,
    });

    // Toggle QR Form
    const toggleQrForm = useForm({});

    const handleToggleQr = () => {
        setIsSubmittingToggle(true);
        toggleQrForm.post(route('dashboard.toggle-qr'), {
            onSuccess: () => {
                setIsConfirmToggleOpen(false);
                setIsSubmittingToggle(false);
            },
            onError: () => {
                setIsSubmittingToggle(false);
            }
        });
    };

    const handleUpdateProfile = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.post(route('dashboard.update-profile'), {
            onSuccess: () => {
                setIsProfileModalOpen(false);
            }
        });
    };

    const handleRetryJob = (jobId: number) => {
        setRetryingJobId(jobId);
        router.post(route('dashboard.job.retry', jobId), {}, {
            onFinish: () => {
                setRetryingJobId(null);
            }
        });
    };

    const handleCancelJob = (jobId: number) => {
        router.post(route('dashboard.job.cancel', jobId));
    };

    const handleCloseJob = (jobId: number) => {
        router.post(route('dashboard.job.close', jobId));
    };

    // Helper for printer status color
    const getPrinterBadgeColor = (state: string) => {
        switch (state) {
            case 'Online':
                return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
            case 'Busy':
                return 'bg-amber-500/10 text-amber-600 border-amber-500/20 animate-pulse';
            case 'Error':
                return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
            default:
                return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
        }
    };

    // Helper for job status badges
    const getJobStatusBadge = (status: string) => {
        switch (status) {
            case 'printed':
                return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold uppercase text-[10px]">Success</Badge>;
            case 'failed':
                return <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 font-bold uppercase text-[10px]">Failed</Badge>;
            case 'printing':
                return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold uppercase text-[10px] animate-pulse">Printing</Badge>;
            case 'cancelled':
                return <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20 font-bold uppercase text-[10px]">Cancelled</Badge>;
            case 'closed':
                return <Badge variant="secondary" className="text-muted-foreground font-bold uppercase text-[10px]">Closed</Badge>;
            default:
                return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 font-bold uppercase text-[10px]">Pending</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Merchant Dashboard" />

            <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full pb-20 select-none">
                
                {/* ── Dashboard Header ── */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card border border-border rounded-2xl p-5 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-foreground">
                                {qrPrint.title}
                            </h1>
                            <Badge className={`ml-2 px-2 py-0.5 border text-xs font-semibold ${qrPrint.is_active ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border-rose-500/20'}`}>
                                {qrPrint.is_active ? '🟢 Active' : '🔴 Inactive'}
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Welcome back, <strong className="text-slate-800 dark:text-slate-200">{auth.user.name}</strong> · Merchant Dashboard
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setIsProfileModalOpen(true)}
                            className="gap-1.5 font-medium rounded-lg h-9 border-border"
                        >
                            <Edit2 className="h-4 w-4 text-muted-foreground" />
                            <span>Edit Profile</span>
                        </Button>
                        {canManageStaff && (
                            <Button asChild variant="outline" size="sm" className="gap-1.5 font-medium rounded-lg h-9 border-border">
                                <Link href="/users">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span>Staff Panel</span>
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* ── Main Layout Split Grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ── Column 1: Main QR Code Card & Pending Payments ── */}
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        <Card className="border border-border shadow-xs rounded-2xl flex flex-col justify-between overflow-hidden">
                            <CardHeader className="border-b bg-muted/20 pb-4 text-center">
                                <CardTitle className="text-sm font-black tracking-wider uppercase text-slate-500 dark:text-muted-foreground">
                                    Your QR Print Setu QR
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Customers scan this QR to upload and print instantly
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center p-6 space-y-6 flex-1">
                                {/* QR Code Graphic Frame */}
                                <div className="relative p-4 border-2 border-slate-200 dark:border-border rounded-2xl bg-white shadow-inner flex items-center justify-center max-w-[220px] aspect-square">
                                    <img 
                                        src={qrPrint.qr_url} 
                                        alt="Print Point QR" 
                                        className="w-full h-full object-contain"
                                    />
                                    <div className="absolute inset-0 m-auto h-10 w-10 rounded-lg bg-slate-900 text-white flex items-center justify-center border-2 border-white shadow-sm">
                                        <Printer className="h-4.5 w-4.5" />
                                    </div>
                                </div>

                                <div className="text-center space-y-1">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Shop Code</span>
                                    <h3 className="text-xl font-black font-mono tracking-widest text-foreground">
                                        {qrPrint.print_token}
                                    </h3>
                                    <p className="text-xs text-muted-foreground max-w-[220px]">
                                        Customers scan to access your print portal directly.
                                    </p>
                                </div>

                                {/* Action Buttons Row */}
                                <div className="grid grid-cols-2 gap-2 w-full pt-2">
                                    <Button 
                                        asChild 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-10 text-xs font-bold rounded-lg border-border gap-1.5"
                                    >
                                        <a href={route('dashboard.qr.print')} target="_blank" rel="noreferrer">
                                            <Printer className="h-4 w-4" />
                                            <span>Print Poster</span>
                                        </a>
                                    </Button>
                                    <Button 
                                        asChild 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-10 text-xs font-bold rounded-lg border-border gap-1.5"
                                    >
                                        <a href={qrPrint.qr_url} download={`qr-print-${qrPrint.print_token}.svg`}>
                                            <Download className="h-4 w-4" />
                                            <span>Download QR</span>
                                        </a>
                                    </Button>
                                </div>
                            </CardContent>

                            {/* Bottom Activate/Deactivate Button */}
                            <div className="border-t bg-muted/10 p-4">
                                <Button
                                    onClick={() => setIsConfirmToggleOpen(true)}
                                    variant={qrPrint.is_active ? 'destructive' : 'default'}
                                    className="w-full font-bold h-10 rounded-lg transition-transform"
                                >
                                    {qrPrint.is_active ? 'Deactivate QR' : 'Activate QR'}
                                </Button>
                            </div>
                        </Card>

                        {/* ── Payments - Pending Payments ── */}
                        <Card className="border border-border shadow-xs rounded-2xl overflow-hidden">
                            <CardHeader className="border-b bg-muted/10 pb-3 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-sm font-black tracking-wider uppercase text-slate-500 flex items-center gap-1.5">
                                        <Banknote className="h-4 w-4 text-emerald-500" />
                                        Pending Payments
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Cash or UPI collections at shop counter
                                    </CardDescription>
                                </div>
                                {pendingPayments.length > 0 && (
                                    <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold text-[10px]">
                                        {pendingPayments.length} Action Required
                                    </Badge>
                                )}
                            </CardHeader>
                            <CardContent className="p-4 space-y-4 max-h-[380px] overflow-y-auto">
                                {pendingPayments.length === 0 ? (
                                    <div className="py-8 text-center text-xs text-muted-foreground flex flex-col items-center justify-center space-y-2">
                                        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                                        <p className="font-semibold text-slate-800 dark:text-slate-200">All payments cleared!</p>
                                        <p>No print orders are waiting for counter payment.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {pendingPayments.map((payment) => (
                                            <div key={payment.id} className="p-3.5 border border-border rounded-xl bg-card hover:bg-muted/10 transition-colors flex flex-col gap-3">
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-0.5">
                                                        <div className="font-extrabold text-sm font-mono tracking-wide text-foreground">
                                                            {payment.order_id}
                                                        </div>
                                                        <div className="flex gap-2 text-[10px] text-muted-foreground font-medium">
                                                            <span>{payment.documents_count} {payment.documents_count === 1 ? 'Doc' : 'Docs'}</span>
                                                            <span>·</span>
                                                            <span>{payment.pages_count} {payment.pages_count === 1 ? 'Page' : 'Pages'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-black text-slate-900 dark:text-foreground text-sm">
                                                            {payment.currency}{payment.amount}
                                                        </div>
                                                        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[9px] font-bold py-0 px-1 mt-0.5 uppercase tracking-wide">
                                                            ⏳ Pending
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 pt-1 border-t border-border/50">
                                                    <Button 
                                                        variant="outline" 
                                                        size="xs" 
                                                        onClick={() => handleViewPaymentDetails(payment)}
                                                        className="h-8 text-xs font-semibold rounded-lg flex-1 border-border gap-1"
                                                    >
                                                        <Eye className="h-3 w-3 text-muted-foreground" />
                                                        <span>View</span>
                                                    </Button>
                                                    <Button 
                                                        variant="default" 
                                                        size="xs" 
                                                        onClick={() => handleStartCollectPayment(payment)}
                                                        className="h-8 text-xs font-bold rounded-lg flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                                                    >
                                                        <Check className="h-3.5 w-3.5" />
                                                        <span>Collect Payment</span>
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* ── Column 2 & 3: Stats & Printer Status & History ── */}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                        {/* ── Row: PhonePe Style Quick Stats Summary ── */}
                        <div className="grid grid-cols-3 gap-4">
                            <Card className="border border-border shadow-2xs rounded-xl p-4 bg-primary/[0.02]">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Today's Jobs</span>
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-foreground mt-1">
                                    {stats.today_jobs}
                                </h2>
                                <p className="text-[10px] text-muted-foreground mt-1">Printed jobs today</p>
                            </Card>
                            <Card className="border border-border shadow-2xs rounded-xl p-4 bg-primary/[0.02]">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Today's Pages</span>
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-foreground mt-1">
                                    {stats.today_pages}
                                </h2>
                                <p className="text-[10px] text-muted-foreground mt-1">Total page impressions</p>
                            </Card>
                            <Card className="border border-border shadow-2xs rounded-xl p-4 bg-primary/[0.02]">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Printed</span>
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-foreground mt-1">
                                    {stats.total_completed}
                                </h2>
                                <p className="text-[10px] text-muted-foreground mt-1">Overall completed prints</p>
                            </Card>
                        </div>

                        {/* ── Partially Failed Sessions Warning Alerts ── */}
                        {failedSessions && failedSessions.length > 0 && (
                            <div className="space-y-4">
                                {failedSessions.map((session) => (
                                    <Card key={session.id} className="border-rose-500/30 bg-rose-500/[0.02] shadow-xs rounded-2xl overflow-hidden border">
                                        <CardHeader className="pb-3 flex flex-row items-center justify-between border-b bg-rose-500/[0.05] border-rose-500/10">
                                            <div className="flex items-center gap-2">
                                                <AlertCircle className="h-5 w-5 text-rose-500" />
                                                <div>
                                                    <CardTitle className="text-sm font-extrabold tracking-wide uppercase text-rose-600">
                                                        Partial Printing Failure — {session.order_id}
                                                    </CardTitle>
                                                    <CardDescription className="text-xs text-rose-500/80">
                                                        Some documents in this order failed to print
                                                    </CardDescription>
                                                </div>
                                            </div>
                                            <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 font-bold text-xs uppercase">
                                                Action Required
                                            </Badge>
                                        </CardHeader>
                                        <CardContent className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <div className="space-y-2">
                                                <div className="flex gap-4 text-xs font-semibold text-slate-700">
                                                    <span className="flex items-center gap-1 text-emerald-600">
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {session.completed_count} Completed
                                                    </span>
                                                    <span className="flex items-center gap-1 text-rose-600">
                                                        <XCircle className="h-4 w-4 text-rose-600" /> {session.failed_count} Failed
                                                    </span>
                                                </div>
                                                <div className="text-xs">
                                                    <span className="text-muted-foreground block font-medium uppercase text-[9px] tracking-wider">Reason</span>
                                                    <span className="font-bold text-slate-800 dark:text-slate-200">{session.reason}</span>
                                                </div>
                                                {session.failed_jobs.map((job) => (
                                                    <p key={job.id} className="text-xs text-muted-foreground font-medium truncate max-w-[320px]">
                                                        Failed file: <span className="text-slate-700 font-semibold">{job.document_name}</span>
                                                    </p>
                                                ))}
                                            </div>
                                            <div className="shrink-0 flex flex-col gap-2">
                                                {session.failed_jobs.map((job) => (
                                                    <Button
                                                        key={job.id}
                                                        onClick={() => handleRetryJob(job.id)}
                                                        disabled={retryingJobId === job.id}
                                                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-9 rounded-lg gap-1.5"
                                                    >
                                                        {retryingJobId === job.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <RefreshCw className="h-4 w-4" />
                                                        )}
                                                        <span>Retry Failed Job</span>
                                                    </Button>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* ── Printer & Local Agent Status Card ── */}
                        <Card className="border border-border shadow-xs rounded-2xl">
                            <CardHeader className="pb-3 flex flex-row items-center justify-between border-b bg-muted/10">
                                <div>
                                    <CardTitle className="text-sm font-black tracking-wider uppercase text-slate-500">
                                        Printer Connection Status
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        {printer.name}
                                    </CardDescription>
                                </div>
                                <Badge className={`px-2.5 py-1 text-xs font-bold border ${getPrinterBadgeColor(printer.state)}`}>
                                    {printer.state === 'Online' && '🟢 Online'}
                                    {printer.state === 'Busy' && '🟡 Busy'}
                                    {printer.state === 'Offline' && '🔴 Offline'}
                                    {printer.state === 'Error' && '⚠️ Error / Blocked'}
                                </Badge>
                            </CardHeader>
                            <CardContent className="p-5 space-y-4">
                                {printer.state === 'Offline' ? (
                                    <div className="space-y-4">
                                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs">
                                            <div className="space-y-1">
                                                <span className="text-slate-400 font-semibold uppercase text-[9px] tracking-wider block">Agent Identifier</span>
                                                <p className="font-bold text-slate-800 dark:text-slate-200">
                                                    {printer.agent_id}
                                                </p>
                                            </div>
                                            <div className="space-y-1 sm:text-right">
                                                <span className="text-slate-400 font-semibold uppercase text-[9px] tracking-wider block">Last Seen</span>
                                                <p className="font-bold text-slate-800 dark:text-slate-200">
                                                    {printer.last_seen}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-xl p-3 flex items-center gap-2 text-xs font-bold">
                                            <AlertCircle className="h-4.5 w-4.5 text-rose-600" />
                                            <span>⚠️ {printer.pending_jobs} print jobs waiting in queue</span>
                                        </div>

                                        <div className="flex gap-2 pt-1">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={() => {
                                                    document.getElementById('jobs-table')?.scrollIntoView({ behavior: 'smooth' });
                                                }}
                                                className="h-9 text-xs font-bold rounded-lg border-border"
                                            >
                                                View Pending Jobs
                                            </Button>
                                            <Button 
                                                asChild 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-9 text-xs font-bold rounded-lg border-border"
                                            >
                                                <Link href="/shop/printers">
                                                    Printer Settings
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                                            <div className="space-y-0.5">
                                                <span className="text-slate-400 font-semibold uppercase text-[9px] tracking-wider block">Pending Jobs</span>
                                                <p className="font-bold text-slate-800 dark:text-slate-200">{printer.pending_jobs}</p>
                                            </div>
                                            <div className="space-y-0.5">
                                                <span className="text-slate-400 font-semibold uppercase text-[9px] tracking-wider block">Printing</span>
                                                <p className="font-bold text-slate-800 dark:text-slate-200">{printer.active_jobs}</p>
                                            </div>
                                            <div className="space-y-0.5">
                                                <span className="text-slate-400 font-semibold uppercase text-[9px] tracking-wider block">Completed Today</span>
                                                <p className="font-bold text-slate-800 dark:text-slate-200">{stats.today_jobs}</p>
                                            </div>
                                            <div className="space-y-0.5">
                                                <span className="text-slate-400 font-semibold uppercase text-[9px] tracking-wider block">Active Agent</span>
                                                <p className="font-bold text-slate-800 dark:text-slate-200">{printer.agent_id}</p>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center border-t border-border pt-3.5">
                                            <div className="flex flex-wrap gap-1.5">
                                                <Badge variant="outline" className="text-[10px] font-normal py-0.5 px-2 bg-muted/30">
                                                    {printer.capabilities.color ? '✓ Color Ready' : '❌ BW Only'}
                                                </Badge>
                                                <Badge variant="outline" className="text-[10px] font-normal py-0.5 px-2 bg-muted/30">
                                                    {printer.capabilities.duplex ? '✓ Duplex flip' : '❌ Simplex'}
                                                </Badge>
                                            </div>

                                            <Button 
                                                asChild 
                                                size="sm" 
                                                variant="outline" 
                                                className="h-8 text-xs font-bold rounded-lg border-border"
                                            >
                                                <Link href="/shop/printers">
                                                    Manage Printer
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                    </div>
                </div>

                {/* ── Column Grid: Print History & Jobs List ── */}
                <Card className="border border-border shadow-xs rounded-2xl overflow-hidden mt-2">
                    <CardHeader className="border-b bg-muted/10 pb-4">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                            <div>
                                <CardTitle className="text-sm font-black tracking-wider uppercase text-slate-500">
                                    Print Jobs History
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Real-time list of all print documents spooling through this QR Print Point
                                </CardDescription>
                            </div>
                            {/* Live Badge counters & Full History Link */}
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                                <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 font-semibold">
                                    {stats.pending} Pending
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 font-semibold animate-pulse">
                                    {stats.printing} Printing
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 font-semibold">
                                    {stats.completed} Success
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 font-semibold">
                                    {stats.failed} Failed
                                </span>
                                <Button variant="outline" size="sm" asChild className="h-7 text-xs gap-1 ml-2">
                                    <Link href="/shop/jobs">
                                        <span>View All Jobs</span>
                                        <ChevronRight className="w-3 h-3" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {jobs.data.length === 0 ? (
                            <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center justify-center space-y-2">
                                <History className="h-8 w-8 text-slate-300" />
                                <p>No print jobs recorded today.</p>
                                <p className="text-xs">Share your shop's QR code with customers to get started!</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-left text-xs">
                                    <thead>
                                        <tr className="border-b bg-muted/40 font-semibold text-slate-700 dark:text-muted-foreground">
                                            <th className="p-3">File / Document</th>
                                            <th className="p-3">Settings</th>
                                            <th className="p-3">Copies</th>
                                            <th className="p-3">Status</th>
                                            <th className="p-3">Time</th>
                                            <th className="p-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {jobs.data.map((job) => (
                                            <tr key={job.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="p-3 max-w-[200px]">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                                                        <div className="truncate">
                                                            <div className="font-semibold text-slate-900 dark:text-foreground truncate" title={job.document?.original_name}>
                                                                {job.document?.original_name || 'document.pdf'}
                                                            </div>
                                                            <div className="text-[10px] text-slate-400 font-mono">
                                                                {job.uuid.slice(0, 8)}...
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-3 space-y-0.5">
                                                    <div className="flex gap-1.5 flex-wrap">
                                                        <span className="px-1.5 py-0.2 rounded-sm bg-muted text-[10px] font-medium text-slate-700 dark:text-slate-200">
                                                            {job.paper_size}
                                                        </span>
                                                        <span className="px-1.5 py-0.2 rounded-sm bg-muted text-[10px] font-medium text-slate-700 dark:text-slate-200">
                                                            {job.color_mode === 'color' ? '🎨 Color' : '⬛ BW'}
                                                        </span>
                                                        <span className="px-1.5 py-0.2 rounded-sm bg-muted text-[10px] font-medium text-slate-700 dark:text-slate-200">
                                                            {job.orientation}
                                                        </span>
                                                        {job.duplex !== 'off' && (
                                                            <span className="px-1.5 py-0.2 rounded-sm bg-muted text-[10px] font-medium text-slate-700 dark:text-slate-200">
                                                                Duplex
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                                                    {job.copies}x
                                                </td>
                                                <td className="p-3">
                                                    <div className="space-y-1">
                                                        {getJobStatusBadge(job.status)}
                                                        {job.error_message && (
                                                            <p className="text-[10px] text-rose-500 font-medium max-w-[150px] leading-tight">
                                                                {job.error_message}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-3 text-slate-500">
                                                    {new Date(job.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="p-3 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {['failed', 'cancelled', 'closed'].includes(job.status) && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleRetryJob(job.id)}
                                                                disabled={retryingJobId === job.id}
                                                                className="h-7 text-[10px] font-bold gap-1 rounded-md border-border text-blue-600"
                                                                title="Retry Job"
                                                            >
                                                                {retryingJobId === job.id ? (
                                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                                ) : (
                                                                    <RefreshCw className="h-3 w-3" />
                                                                )}
                                                                <span>Retry</span>
                                                            </Button>
                                                        )}
                                                        {['pending', 'printing'].includes(job.status) && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleCancelJob(job.id)}
                                                                className="h-7 text-[10px] font-bold gap-1 rounded-md border-destructive/30 text-destructive hover:bg-destructive/10"
                                                                title="Cancel Job"
                                                            >
                                                                <span>Cancel</span>
                                                            </Button>
                                                        )}
                                                        {['printed', 'failed', 'cancelled'].includes(job.status) && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleCloseJob(job.id)}
                                                                className="h-7 text-[10px] font-medium text-muted-foreground hover:text-foreground"
                                                                title="Close / Archive Job"
                                                            >
                                                                <span>Close</span>
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ── Confirm Toggle QR Modal ── */}
                <Dialog open={isConfirmToggleOpen} onOpenChange={setIsConfirmToggleOpen}>
                    <DialogContent className="max-w-md rounded-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-extrabold">
                                {qrPrint.is_active ? 'Deactivate Shop QR?' : 'Activate Shop QR?'}
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                {qrPrint.is_active 
                                    ? 'Customers scanning your QR code will NOT be able to submit new print jobs until you reactivate it.'
                                    : 'Activate this QR code so customers can scan, upload, and spool prints automatically to your printer.'
                                }
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-4 flex gap-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="rounded-lg h-9" 
                                onClick={() => setIsConfirmToggleOpen(false)}
                                disabled={isSubmittingToggle}
                            >
                                Cancel
                            </Button>
                            <Button 
                                variant={qrPrint.is_active ? 'destructive' : 'default'} 
                                size="sm" 
                                className="rounded-lg h-9 font-bold"
                                onClick={handleToggleQr}
                                disabled={isSubmittingToggle}
                            >
                                {isSubmittingToggle ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                                ) : null}
                                <span>{qrPrint.is_active ? 'Deactivate' : 'Activate'}</span>
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* ── Edit Shop Profile Modal ── */}
                <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
                    <DialogContent className="max-w-md rounded-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-extrabold">
                                Edit Shop Profile
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Update the display title and print guidelines for your shop
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpdateProfile} className="space-y-4 py-2">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-muted-foreground">Shop Name / Display Title</label>
                                <Input 
                                    value={profileForm.data.title}
                                    onChange={(e) => profileForm.setData('title', e.target.value)}
                                    placeholder="e.g. ABC Cyber Cafe"
                                    className="rounded-lg h-9 text-xs"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-muted-foreground">Instructions / Description</label>
                                <CustomTextarea 
                                    value={profileForm.data.content}
                                    onChange={(e) => profileForm.setData('content', e.target.value)}
                                    placeholder="Describe instructions for print jobs or rate cards..."
                                    className="rounded-lg text-xs min-h-[80px]"
                                />
                            </div>
                            <DialogFooter className="mt-4 flex gap-2">
                                <Button 
                                    type="button"
                                    variant="outline" 
                                    size="sm" 
                                    className="rounded-lg h-9" 
                                    onClick={() => setIsProfileModalOpen(false)}
                                    disabled={profileForm.processing}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit"
                                    size="sm" 
                                    className="rounded-lg h-9 font-bold"
                                    disabled={profileForm.processing}
                                >
                                    {profileForm.processing ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                                    ) : null}
                                    <span>Save Changes</span>
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* ── View Details Modal ── */}
                <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                    <DialogContent className="sm:max-w-md select-none rounded-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-1.5 text-base font-extrabold">
                                <FileText className="h-4.5 w-4.5 text-primary" />
                                Order Details — {viewingPayment?.order_id}
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Review documents and print configurations for this session.
                            </DialogDescription>
                        </DialogHeader>
                        {viewingPayment && (
                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                                <div className="space-y-2.5">
                                    {viewingPayment.jobs?.map((job: any) => (
                                        <div key={job.id} className="p-3 border border-border rounded-xl bg-muted/20 flex flex-col gap-2">
                                            <div className="flex justify-between items-start gap-3">
                                                <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate flex-1" title={job.document_name}>
                                                    {job.document_name}
                                                </span>
                                                <span className="font-bold text-xs text-foreground shrink-0">
                                                    {viewingPayment.currency}{Number(job.amount || 0).toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 text-[10px]">
                                                <Badge variant="outline" className="px-1.5 py-0 bg-background text-muted-foreground text-[9px] font-medium border-border/85 uppercase">
                                                    {job.paper_size}
                                                </Badge>
                                                <Badge variant="outline" className="px-1.5 py-0 bg-background text-muted-foreground text-[9px] font-medium border-border/85 uppercase">
                                                    {job.color_mode === 'color' ? '🎨 Color' : '⬛ BW'}
                                                </Badge>
                                                <Badge variant="outline" className="px-1.5 py-0 bg-background text-muted-foreground text-[9px] font-medium border-border/85 uppercase">
                                                    {job.orientation}
                                                </Badge>
                                                {job.duplex !== 'off' && (
                                                    <Badge variant="outline" className="px-1.5 py-0 bg-background text-muted-foreground text-[9px] font-medium border-border/85 uppercase">
                                                        Duplex
                                                    </Badge>
                                                )}
                                                <Badge variant="secondary" className="px-1.5 py-0 text-foreground text-[9px] font-extrabold">
                                                    {job.copies}x {job.copies === 1 ? 'Copy' : 'Copies'}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <DialogFooter className="border-t border-border/50 pt-3 flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setIsViewModalOpen(false)} className="rounded-lg h-9 font-semibold">
                                Close
                            </Button>
                            <Button 
                                variant="default" 
                                size="sm" 
                                onClick={() => {
                                    setIsViewModalOpen(false);
                                    handleStartCollectPayment(viewingPayment!);
                                }} 
                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-9 font-bold gap-1"
                            >
                                <Check className="h-4 w-4" />
                                <span>Collect Payment</span>
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* ── Collect Payment Modal ── */}
                <Dialog open={isCollectModalOpen} onOpenChange={setIsCollectModalOpen}>
                    <DialogContent className="sm:max-w-md select-none rounded-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-1.5 text-base font-extrabold">
                                <Banknote className="h-4.5 w-4.5 text-emerald-500" />
                                {paymentStep === 1 ? 'Select Payment Method' : 'Confirm Payment'}
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                {paymentStep === 1 
                                    ? 'Verify order details and select how the customer is paying.'
                                    : 'Confirm cash receipt or Counter UPI transfer details before approval.'
                                }
                            </DialogDescription>
                        </DialogHeader>

                        {collectingPayment && (
                            <div className="space-y-4">
                                {/* Summary strip */}
                                <div className="p-3 border border-emerald-500/20 bg-emerald-500/5 rounded-xl flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Order Reference</div>
                                        <div className="font-extrabold text-sm font-mono text-slate-800 dark:text-slate-200">{collectingPayment.order_id}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Total Due</div>
                                        <div className="font-black text-base text-emerald-600">{collectingPayment.currency}{collectingPayment.amount}</div>
                                    </div>
                                </div>

                                {paymentStep === 1 ? (
                                    <div className="space-y-3 pt-2">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Choose Method:</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setCollectPaymentMethod('cash')}
                                                className={`p-4 border rounded-xl flex flex-col items-center gap-2 cursor-pointer transition-all ${
                                                    collectPaymentMethod === 'cash' 
                                                        ? 'border-emerald-600 bg-emerald-500/5 ring-2 ring-emerald-500/20' 
                                                        : 'border-border bg-card hover:bg-muted/10'
                                                }`}
                                            >
                                                <Banknote className={`h-6 w-6 ${collectPaymentMethod === 'cash' ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                                                <span className="font-bold text-xs">Cash Payment</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setCollectPaymentMethod('upi')}
                                                className={`p-4 border rounded-xl flex flex-col items-center gap-2 cursor-pointer transition-all ${
                                                    collectPaymentMethod === 'upi' 
                                                        ? 'border-emerald-600 bg-emerald-500/5 ring-2 ring-emerald-500/20' 
                                                        : 'border-border bg-card hover:bg-muted/10'
                                                }`}
                                            >
                                                <QrCode className={`h-6 w-6 ${collectPaymentMethod === 'upi' ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                                                <span className="font-bold text-xs">Counter UPI</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3 py-1">
                                        <div className="rounded-xl border border-border p-4 bg-muted/10 space-y-3 text-xs">
                                            <div className="flex justify-between items-center pb-2 border-b border-border/50">
                                                <span className="text-muted-foreground font-semibold">Order ID</span>
                                                <span className="font-bold font-mono">{collectingPayment.order_id}</span>
                                            </div>
                                            <div className="flex justify-between items-center pb-2 border-b border-border/50">
                                                <span className="text-muted-foreground font-semibold">Amount</span>
                                                <span className="font-black text-slate-900 dark:text-foreground text-sm">{collectingPayment.currency}{collectingPayment.amount}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-muted-foreground font-semibold">Payment Method</span>
                                                <span className="font-bold text-emerald-600 capitalize">
                                                    {collectPaymentMethod === 'cash' ? 'Cash' : 'Counter UPI'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <DialogFooter className="border-t border-border/50 pt-3 flex flex-row items-center gap-2 justify-end">
                            {paymentStep === 1 ? (
                                <>
                                    <Button variant="outline" size="sm" onClick={() => setIsCollectModalOpen(false)} className="rounded-lg h-9 font-semibold flex-1 sm:flex-initial">
                                        Cancel
                                    </Button>
                                    <Button 
                                        type="button"
                                        variant="default" 
                                        size="sm" 
                                        onClick={() => setPaymentStep(2)}
                                        className="bg-primary hover:bg-primary/95 text-white rounded-lg h-9 font-bold gap-1 flex-1 sm:flex-initial"
                                    >
                                        <span>Next</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button variant="outline" size="sm" onClick={() => setIsCollectModalOpen(false)} disabled={isSubmittingPayment} className="rounded-lg h-9 font-semibold flex-1 sm:flex-initial">
                                        Cancel
                                    </Button>
                                    <Button 
                                        type="button"
                                        variant="default" 
                                        size="sm" 
                                        onClick={handleConfirmPayment}
                                        disabled={isSubmittingPayment}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-9 font-bold gap-1 flex-1 sm:flex-initial"
                                    >
                                        {isSubmittingPayment ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>Processing…</span>
                                            </>
                                        ) : (
                                            <span>Confirm {collectingPayment?.currency}{collectingPayment?.amount} Paid</span>
                                        )}
                                    </Button>
                                </>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </div>
        </AppLayout>
    );
}
