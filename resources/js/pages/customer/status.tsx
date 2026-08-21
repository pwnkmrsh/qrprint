import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    Clock,
    Download,
    FileText,
    Loader2,
    PartyPopper,
    Printer,
    RefreshCw,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface StatusJob {
    id: number;
    uuid: string;
    status: 'pending' | 'printing' | 'printed' | 'failed' | string;
    copies: number;
    attempts: number;
    error_message: string | null;
    created_at: string | null;
    printed_at: string | null;
    document_name: string;
    document_size: number;
}

interface StatusProps {
    shop: {
        name: string;
        slug: string;
        home_url: string;
    };
    job: StatusJob;
    status_url: string;
}

export default function Status({ shop, job: initialJob, status_url }: StatusProps) {
    const [job, setJob] = useState<StatusJob>(initialJob);
    const [lastPolled, setLastPolled] = useState<Date>(new Date());
    const [pollError, setPollError] = useState<string | null>(null);

    const isTerminal = job.status === 'printed' || job.status === 'failed';

    useEffect(() => {
        if (isTerminal) return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(status_url, {
                    headers: {
                        Accept: 'application/json',
                    },
                });
                if (!res.ok) throw new Error('Status check failed');
                const data = await res.json();
                if (data.success && data.job) {
                    setJob((prev) => ({
                        ...prev,
                        status: data.job.status,
                        attempts: data.job.attempts,
                        error_message: data.job.error_message,
                        printed_at: data.job.printed_at,
                    }));
                    setLastPolled(new Date());
                }
            } catch (err) {
                setPollError(err instanceof Error ? err.message : 'Error polling status');
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [status_url, isTerminal]);

    const getStatusStep = () => {
        switch (job.status) {
            case 'pending':
                return 2; // Queued
            case 'printing':
                return 3; // Printing
            case 'printed':
                return 4; // Completed
            case 'failed':
                return -1;
            default:
                return 2;
        }
    };

    const currentStep = getStatusStep();

    return (
        <>
            <Head title={`Print Status #${job.uuid.slice(0, 8)} | ${shop.name}`} />
            <main className="bg-gradient-to-b from-background via-muted/20 to-muted/40 min-h-screen py-8 px-4 sm:px-6">
                <div className="mx-auto max-w-2xl space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
                            {job.status === 'printed' ? (
                                <CheckCircle2 className="size-8 text-emerald-500" />
                            ) : job.status === 'failed' ? (
                                <AlertCircle className="size-8 text-destructive" />
                            ) : (
                                <Printer className="size-8 animate-pulse text-primary" />
                            )}
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            {job.status === 'printed'
                                ? 'Print Completed!'
                                : job.status === 'printing'
                                  ? 'Printing in Progress…'
                                  : job.status === 'failed'
                                    ? 'Print Job Failed'
                                    : 'Job Queued for Printing'}
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            {shop.name} · Job Ref: <span className="font-mono font-medium text-foreground">{job.uuid.slice(0, 8).toUpperCase()}</span>
                        </p>
                    </div>

                    {/* Main Status Card */}
                    <Card className="shadow-sm border overflow-hidden">
                        <CardHeader className="bg-muted/15 border-b pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <FileText className="size-4 text-primary" />
                                    {job.document_name}
                                </CardTitle>
                                <Badge
                                    variant={
                                        job.status === 'printed'
                                            ? 'default'
                                            : job.status === 'failed'
                                              ? 'destructive'
                                              : 'secondary'
                                    }
                                    className="capitalize text-xs font-semibold py-1 px-2.5"
                                >
                                    {job.status === 'printed' && (
                                        <CheckCircle2 className="size-3 mr-1 text-emerald-300 inline" />
                                    )}
                                    {job.status === 'printing' && (
                                        <Loader2 className="size-3 mr-1 animate-spin inline" />
                                    )}
                                    {job.status}
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="p-6 space-y-6">
                            {/* Live Timeline Steps */}
                            <div className="space-y-4">
                                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Live Print Progress
                                </div>

                                <div className="space-y-3 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-muted-foreground/20">
                                    {/* Step 1: Uploaded & Configured */}
                                    <div className="flex items-start gap-3 relative">
                                        <div className="flex size-7 items-center justify-center rounded-full bg-emerald-500 text-white shrink-0 z-10">
                                            <CheckCircle2 className="size-4" />
                                        </div>
                                        <div className="pt-0.5">
                                            <p className="text-sm font-semibold text-foreground">
                                                Document Received & Configured
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {job.copies} {job.copies === 1 ? 'copy' : 'copies'} requested
                                            </p>
                                        </div>
                                    </div>

                                    {/* Step 2: In Queue */}
                                    <div className="flex items-start gap-3 relative">
                                        <div
                                            className={`flex size-7 items-center justify-center rounded-full shrink-0 z-10 ${
                                                currentStep >= 2
                                                    ? 'bg-emerald-500 text-white'
                                                    : 'bg-muted text-muted-foreground border'
                                            }`}
                                        >
                                            <CheckCircle2 className="size-4" />
                                        </div>
                                        <div className="pt-0.5">
                                            <p className="text-sm font-semibold text-foreground">
                                                Order Confirmed & Sent to Queue
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Connected to shop print dispatch
                                            </p>
                                        </div>
                                    </div>

                                    {/* Step 3: Printing by Agent */}
                                    <div className="flex items-start gap-3 relative">
                                        <div
                                            className={`flex size-7 items-center justify-center rounded-full shrink-0 z-10 ${
                                                job.status === 'printed'
                                                    ? 'bg-emerald-500 text-white'
                                                    : job.status === 'printing'
                                                      ? 'bg-primary text-primary-foreground animate-pulse'
                                                      : job.status === 'failed'
                                                        ? 'bg-destructive text-white'
                                                        : 'bg-muted text-muted-foreground border'
                                            }`}
                                        >
                                            {job.status === 'printing' ? (
                                                <Loader2 className="size-4 animate-spin" />
                                            ) : job.status === 'printed' ? (
                                                <CheckCircle2 className="size-4" />
                                            ) : (
                                                <Printer className="size-4" />
                                            )}
                                        </div>
                                        <div className="pt-0.5">
                                            <p className="text-sm font-semibold text-foreground">
                                                Local Printer Agent Output
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {job.status === 'printing'
                                                    ? 'Currently printing on shop hardware…'
                                                    : job.status === 'printed'
                                                      ? 'Hardware completed all pages'
                                                      : 'Waiting for local agent to claim job'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Step 4: Ready for Collection */}
                                    <div className="flex items-start gap-3 relative">
                                        <div
                                            className={`flex size-7 items-center justify-center rounded-full shrink-0 z-10 ${
                                                job.status === 'printed'
                                                    ? 'bg-emerald-500 text-white'
                                                    : 'bg-muted text-muted-foreground border'
                                            }`}
                                        >
                                            <PartyPopper className="size-4" />
                                        </div>
                                        <div className="pt-0.5">
                                            <p className="text-sm font-semibold text-foreground">
                                                Ready for Collection
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Collect printed document at the shop counter
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Success Celebration Alert */}
                            {job.status === 'printed' && (
                                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-2 text-emerald-950 dark:text-emerald-200">
                                    <div className="flex items-center gap-2 font-bold text-base text-emerald-700 dark:text-emerald-400">
                                        <Sparkles className="size-5" />
                                        Your document has been printed successfully!
                                    </div>
                                    <p className="text-xs leading-relaxed text-emerald-800 dark:text-emerald-300">
                                        Please collect your document from the counter. Thank you for using {shop.name}!
                                    </p>
                                </div>
                            )}

                            {/* Failed Alert */}
                            {job.status === 'failed' && (
                                <Alert variant="destructive">
                                    <AlertCircle className="size-4" />
                                    <AlertTitle>Printing Failed</AlertTitle>
                                    <AlertDescription>
                                        {job.error_message ||
                                            'The printer agent encountered an error processing your document. Please inform the shopkeeper.'}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Polling Activity Status Indicator */}
                            {!isTerminal && (
                                <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/40 rounded-lg p-3 border">
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="size-3.5 animate-spin text-primary" />
                                        Checking printer status live…
                                    </span>
                                    <span>Updated {lastPolled.toLocaleTimeString()}</span>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="pt-2 flex flex-col sm:flex-row gap-3">
                                <Button
                                    className="w-full gap-2 font-semibold shadow-xs"
                                    size="lg"
                                    asChild
                                >
                                    <Link href={shop.home_url}>
                                        <Printer className="size-4" />
                                        Print Another Document
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
