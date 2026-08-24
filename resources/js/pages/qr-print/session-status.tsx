import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    Check,
    CheckCircle2,
    Clock,
    FileSpreadsheet,
    FileText,
    FileType2,
    ImageIcon,
    Loader2,
    PartyPopper,
    Presentation,
    Printer,
    RefreshCw,
    RotateCw,
    ShieldCheck,
    Sparkles,
    Store,
    QrCode,
    Banknote,
    Phone,
    MapPin
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

export interface SessionJob {
    id: number;
    uuid: string;
    document_name: string;
    file_type: 'pdf' | 'image' | 'excel' | 'word' | 'powerpoint' | 'other';
    copies: number;
    orientation: string;
    color_mode: string;
    paper_size: string;
    duplex: string;
    amount?: number;
    payment_method?: string;
    selected_sheets: string[] | null;
    status: 'pending' | 'printing' | 'printed' | 'failed' | string;
    attempts: number;
    error_message: string | null;
    created_at: string | null;
    completed_at: string | null;
}

interface SessionData {
    uuid: string;
    order_id?: string;
    status: 'ready' | 'printing' | 'completed' | 'partial_failed' | 'failed' | 'cancelled' | string;
    payment_method?: string;
    payment_status?: string;
    total_amount?: number;
    currency?: string;
    total_files: number;
    completed_files: number;
    failed_files: number;
    created_at: string | null;
}

interface SessionStatusProps {
    qrPrint: {
        title: string;
        token: string;
        home_url: string;
        logo_url?: string | null;
        mobile_number?: string | null;
        address?: string | null;
    };
    session: SessionData;
    jobs: SessionJob[];
    status_url: string;
    retry_url: string;
}

export default function SessionStatus({
    qrPrint,
    session: initialSession,
    jobs: initialJobs,
    status_url,
    retry_url,
}: SessionStatusProps) {
    const [session, setSession] = useState<SessionData>(initialSession);
    const [jobs, setJobs] = useState<SessionJob[]>(initialJobs);
    const [retryingJobUuid, setRetryingJobUuid] = useState<string | null>(null);
    const [lastPolled, setLastPolled] = useState<Date>(new Date());
    const [retryMessage, setRetryMessage] = useState<string | null>(null);

    const isAllFinished =
        session.status === 'completed' ||
        (session.status === 'failed' && jobs.every((j) => j.status === 'failed' || j.status === 'printed'));

    const sym = session.currency || '₹';
    const totalAmount = Number(session.total_amount || 0).toFixed(2);
    const isCounter = (session.payment_method || 'counter') === 'counter';

    // Real-time polling
    useEffect(() => {
        if (isAllFinished) return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(status_url, {
                    headers: {
                        Accept: 'application/json',
                    },
                });
                if (!res.ok) return;
                const data = await res.json();
                if (data.success && data.session && data.jobs) {
                    setSession(data.session);
                    setJobs(data.jobs);
                    setLastPolled(new Date());
                }
            } catch (err) {
                // silent poll error
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [status_url, isAllFinished]);

    // Handle Retry Job
    const handleRetry = async (jobUuid: string) => {
        setRetryingJobUuid(jobUuid);
        setRetryMessage(null);
        const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

        try {
            const res = await fetch(retry_url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrf,
                },
                body: JSON.stringify({ job_uuid: jobUuid }),
            });
            const data = await res.json();
            if (data.success) {
                setRetryMessage('Job re-queued successfully! The printer agent will retry.');
                // Update local job state optimistically
                setJobs((prev) =>
                    prev.map((j) =>
                        j.uuid === jobUuid ? { ...j, status: 'pending', error_message: null, attempts: j.attempts + 1 } : j
                    )
                );
            } else {
                setRetryMessage(data.message || 'Failed to retry job.');
            }
        } catch (err: any) {
            setRetryMessage(err.message || 'Error retrying job.');
        } finally {
            setRetryingJobUuid(null);
        }
    };

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'pdf':
                return <FileText className="size-4 text-rose-500" />;
            case 'excel':
                return <FileSpreadsheet className="size-4 text-emerald-600" />;
            case 'image':
                return <ImageIcon className="size-4 text-purple-500" />;
            case 'word':
                return <FileType2 className="size-4 text-blue-600" />;
            case 'powerpoint':
                return <Presentation className="size-4 text-amber-600" />;
            default:
                return <FileText className="size-4 text-muted-foreground" />;
        }
    };

    const completedCount = jobs.filter((j) => j.status === 'printed').length;
    const progressPercent = session.total_files > 0 ? Math.round((completedCount / session.total_files) * 100) : 0;

    return (
        <>
            <Head title={`Print Status | ${session.order_id || session.uuid.slice(0, 8).toUpperCase()}`} />
            <main className="bg-gradient-to-b from-background via-muted/20 to-muted/40 min-h-screen py-8 px-4 sm:px-6">
                <div className="mx-auto max-w-2xl space-y-6">
                    {/* Header with Shop Details */}
                    <div className="text-center space-y-2">
                        {qrPrint.logo_url ? (
                            <div className="mx-auto size-16 rounded-2xl border bg-background p-1.5 shadow-xs flex items-center justify-center">
                                <img src={qrPrint.logo_url} alt={qrPrint.title} className="size-full object-contain rounded-xl" />
                            </div>
                        ) : (
                            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
                                {session.status === 'completed' ? (
                                    <CheckCircle2 className="size-8 text-emerald-500 animate-in zoom-in" />
                                ) : session.status === 'failed' ? (
                                    <AlertCircle className="size-8 text-destructive" />
                                ) : (
                                    <Printer className="size-8 animate-pulse text-primary" />
                                )}
                            </div>
                        )}
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            {session.payment_status === 'pending' && isCounter
                                ? '⏳ Payment Pending'
                                : session.status === 'completed'
                                  ? 'Printing Completed Successfully!'
                                  : session.status === 'printing'
                                    ? 'Printing in Progress…'
                                    : session.status === 'partial_failed'
                                      ? 'Printing Finished with Alerts'
                                      : 'Print Order Dispatched'
                            }
                        </h1>
                        <p className="text-muted-foreground text-xs sm:text-sm">
                            {qrPrint.title} · Order ID: <span className="font-mono font-bold text-foreground">{session.order_id || session.uuid.slice(0, 8).toUpperCase()}</span>
                        </p>
                    </div>

                    {/* Order & Payment Summary Box */}
                    <Card className={`shadow-xs border overflow-hidden ${
                        session.payment_status === 'pending' && isCounter 
                            ? 'bg-amber-500/5 border-amber-500/20' 
                            : 'bg-primary/5 border-primary/20'
                    }`}>
                        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    {session.payment_status === 'pending' && isCounter ? (
                                        <Badge className="bg-amber-500 hover:bg-amber-600 text-white gap-1 text-xs">
                                            <Clock className="size-3" /> ⏳ Payment Pending
                                        </Badge>
                                    ) : isCounter ? (
                                        <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white gap-1 text-xs">
                                            <Store className="size-3" /> Paid at Counter (Cash / UPI)
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-blue-600 hover:bg-blue-600 text-white gap-1 text-xs">
                                            <QrCode className="size-3" /> Paid Online
                                        </Badge>
                                    )}
                                    <span className="text-xs text-muted-foreground">
                                        Status: <strong className="text-foreground capitalize">{session.payment_status?.replace('_', ' ') || 'Pending'}</strong>
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {session.payment_status === 'pending' && isCounter
                                        ? 'Show this Order ID at shop counter.'
                                        : isCounter
                                          ? `Payment verified at counter. Your printout is spooling directly.`
                                          : `Digital payment verified for ${sym}${totalAmount}. Your printout is spooling directly.`
                                    }
                                </p>
                            </div>
                            <div className="text-right sm:text-right shrink-0">
                                <div className="text-[11px] text-muted-foreground font-medium">Total Amount</div>
                                <div className="text-2xl font-black text-primary">{sym}{totalAmount}</div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Overall Progress Card */}
                    <Card className="shadow-xs border overflow-hidden">
                        <CardHeader className="bg-muted/15 border-b pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                                    <Clock className="size-4 text-primary" />
                                    Progress: {completedCount} of {session.total_files} Completed
                                </CardTitle>
                                <Badge
                                    variant={
                                        session.status === 'completed'
                                            ? 'default'
                                             : session.status === 'failed'
                                               ? 'destructive'
                                               : 'secondary'
                                    }
                                    className="capitalize text-xs font-semibold py-1 px-2.5"
                                >
                                    {session.status === 'completed' && <Check className="size-3 mr-1 inline" />}
                                    {session.status === 'printing' && <Loader2 className="size-3 mr-1 animate-spin inline" />}
                                    {session.status}
                                </Badge>
                            </div>

                            {/* Visual Progress Bar */}
                            <div className="w-full bg-muted rounded-full h-2.5 mt-3 overflow-hidden">
                                <div
                                    className={`h-2.5 rounded-full transition-all duration-500 ${
                                        session.status === 'completed'
                                            ? 'bg-emerald-500'
                                            : session.status === 'failed'
                                              ? 'bg-destructive'
                                              : 'bg-primary'
                                    }`}
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </CardHeader>

                        <CardContent className="p-4 sm:p-6 space-y-4">
                            {retryMessage && (
                                <Alert className="animate-in fade-in">
                                    <AlertDescription>{retryMessage}</AlertDescription>
                                </Alert>
                            )}

                            {/* Per-Job List */}
                            <div className="space-y-3">
                                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Document Queue ({jobs.length})
                                </div>

                                <div className="space-y-2.5">
                                    {jobs.map((job, idx) => (
                                        <div
                                            key={job.id}
                                            className={`rounded-xl border p-3.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                                job.status === 'printed'
                                                    ? 'bg-emerald-500/5 border-emerald-500/20'
                                                    : job.status === 'failed'
                                                      ? 'bg-destructive/5 border-destructive/20'
                                                      : job.status === 'printing'
                                                        ? 'bg-primary/5 border-primary/30 ring-1 ring-primary/20'
                                                        : 'bg-card'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3 min-w-0">
                                                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-card border shadow-xs mt-0.5">
                                                    {getFileIcon(job.file_type)}
                                                </div>
                                                <div className="min-w-0 space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-sm truncate text-foreground">
                                                            {idx + 1}. {job.document_name}
                                                        </span>
                                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize shrink-0">
                                                            {job.file_type}
                                                        </Badge>
                                                    </div>

                                                    {/* Print specs pills */}
                                                    <div className="flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
                                                        {job.selected_sheets && job.selected_sheets.length > 0 && (
                                                            <span className="font-medium text-emerald-700 dark:text-emerald-300">
                                                                Sheet: {job.selected_sheets.join(', ')}
                                                            </span>
                                                        )}
                                                        <span>· {job.copies} {job.copies === 1 ? 'copy' : 'copies'}</span>
                                                        <span>· {job.paper_size}</span>
                                                        <span>· {job.color_mode === 'bw' ? 'B&W' : 'Color'}</span>
                                                        {job.amount && (
                                                            <span className="font-bold text-foreground">· {sym}{Number(job.amount).toFixed(2)}</span>
                                                        )}
                                                    </div>

                                                    {/* Error detail if failed */}
                                                    {job.status === 'failed' && (
                                                        <p className="text-xs text-destructive font-medium pt-0.5">
                                                            Error: {job.error_message || 'Print processing failed.'}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Status Badge & Actions */}
                                            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                                {job.status === 'printed' ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md">
                                                        <CheckCircle2 className="size-3.5" />
                                                        Printed
                                                    </span>
                                                ) : job.status === 'printing' ? (
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-md animate-pulse">
                                                        <Loader2 className="size-3.5 animate-spin" />
                                                        Printing…
                                                    </span>
                                                ) : job.status === 'failed' ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-destructive bg-destructive/10 px-2 py-1 rounded-md">
                                                            <AlertCircle className="size-3.5" />
                                                            Failed
                                                        </span>
                                                        {job.attempts < 3 && (
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-7 text-xs gap-1 border-destructive/30 hover:bg-destructive/10 text-destructive"
                                                                onClick={() => handleRetry(job.uuid)}
                                                                disabled={retryingJobUuid === job.uuid}
                                                            >
                                                                <RotateCw className={`size-3 ${retryingJobUuid === job.uuid ? 'animate-spin' : ''}`} />
                                                                Retry ({3 - job.attempts} left)
                                                            </Button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
                                                        <Clock className="size-3.5" />
                                                        Queued
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Session Success Banner */}
                            {session.status === 'completed' && (
                                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-2 text-emerald-950 dark:text-emerald-200 animate-in fade-in">
                                    <div className="flex items-center gap-2 font-bold text-base text-emerald-700 dark:text-emerald-400">
                                        <Sparkles className="size-5" />
                                        All documents have been printed!
                                    </div>
                                    <p className="text-xs leading-relaxed text-emerald-800 dark:text-emerald-300">
                                        Your {session.total_files} print jobs were successfully executed. {isCounter ? `Please pay ${sym}${totalAmount} and collect your sheets at the counter.` : 'Please collect your sheets from the printer output tray.'}
                                    </p>
                                </div>
                            )}

                            {/* Live Polling Info Bar */}
                            {!isAllFinished && (
                                <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/40 rounded-lg p-3 border">
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="size-3.5 animate-spin text-primary" />
                                        Live printer agent polling active…
                                    </span>
                                    <span>Updated {lastPolled.toLocaleTimeString()}</span>
                                </div>
                            )}

                            {/* Bottom Navigation */}
                            <div className="pt-2 flex flex-col sm:flex-row gap-3">
                                <Button className="w-full gap-2 font-semibold shadow-xs" size="lg" asChild>
                                    <Link href={qrPrint.home_url}>
                                        <Printer className="size-4" />
                                        Print More Documents
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </>
    );
}
