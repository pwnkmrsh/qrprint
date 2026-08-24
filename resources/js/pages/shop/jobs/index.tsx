import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { 
    History, 
    Printer, 
    FileText, 
    RefreshCw, 
    Search, 
    Filter, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    AlertTriangle, 
    Ban, 
    Archive, 
    Copy, 
    Check, 
    ExternalLink, 
    Info, 
    ChevronRight, 
    FileSpreadsheet, 
    FileImage, 
    FileType, 
    Layers, 
    Sparkles,
    Trash2,
    Calendar,
    ArrowUpDown
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Print Job History',
        href: '/shop/jobs',
    },
];

interface JobItem {
    id: number;
    uuid: string;
    print_session_id: number | null;
    print_document_id: number;
    printer_name: string;
    copies: number;
    orientation: string;
    color_mode: string;
    paper_size: string;
    scaling: string;
    duplex: string;
    page_range: string | null;
    selected_sheets: string[] | null;
    print_options: any;
    status: 'pending' | 'printing' | 'printed' | 'failed' | 'cancelled' | 'closed';
    attempts: number;
    error_message: string | null;
    claimed_at: string | null;
    started_at: string | null;
    completed_at: string | null;
    printed_at: string | null;
    created_at: string;
    document?: {
        id: number;
        original_name: string;
        mime_type: string;
        file_size: number;
        file_type: string;
        metadata?: any;
    };
    session?: {
        uuid: string;
        total_files: number;
        completed_files: number;
        failed_files: number;
        status: string;
    };
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface IndexProps {
    jobs: {
        data: JobItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: PaginationLink[];
        from: number;
        to: number;
    };
    counts: {
        all: number;
        pending: number;
        printing: number;
        completed: number;
        failed: number;
        cancelled: number;
        closed: number;
    };
    filters: {
        search: string;
        status: string;
        printer: string;
        color_mode: string;
        date_range: string;
    };
    printersList: string[];
    shop: {
        id: number;
        title: string;
        print_token: string;
    };
}

export default function JobHistory({
    jobs,
    counts,
    filters,
    printersList,
    shop,
}: IndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedPrinter, setSelectedPrinter] = useState(filters.printer || '');
    const [selectedColorMode, setSelectedColorMode] = useState(filters.color_mode || '');
    const [selectedDateRange, setSelectedDateRange] = useState(filters.date_range || 'all');

    // Multi-selection state
    const [selectedJobIds, setSelectedJobIds] = useState<number[]>([]);
    
    // Action Dialogs
    const [cancelModalJob, setCancelModalJob] = useState<JobItem | null>(null);
    const [cancelReason, setCancelReason] = useState('Cancelled by shop owner');
    const [closeModalJob, setCloseModalJob] = useState<JobItem | null>(null);
    const [detailsModalJob, setDetailsModalJob] = useState<JobItem | null>(null);
    
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Apply Filter Search
    const applyFilters = (overrides = {}) => {
        router.get(
            route('shop.jobs.index'),
            {
                search: searchTerm,
                status: selectedStatus,
                printer: selectedPrinter,
                color_mode: selectedColorMode,
                date_range: selectedDateRange,
                ...overrides,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters();
    };

    const handleStatusTabClick = (st: string) => {
        setSelectedStatus(st);
        applyFilters({ status: st });
    };

    // Retry single job
    const handleRetry = (job: JobItem) => {
        setProcessingId(job.id);
        router.post(
            route('shop.jobs.retry', job.id),
            {},
            {
                onFinish: () => setProcessingId(null),
                onSuccess: () => toast.success(`Job #${job.id} re-queued successfully!`),
                onError: () => toast.error('Failed to retry job.'),
            }
        );
    };

    // Confirm cancel job
    const handleConfirmCancel = () => {
        if (!cancelModalJob) return;
        setProcessingId(cancelModalJob.id);
        router.post(
            route('shop.jobs.cancel', cancelModalJob.id),
            { reason: cancelReason },
            {
                onFinish: () => {
                    setProcessingId(null);
                    setCancelModalJob(null);
                },
                onSuccess: () => toast.success(`Job #${cancelModalJob.id} cancelled.`),
                onError: () => toast.error('Failed to cancel job.'),
            }
        );
    };

    // Confirm close job
    const handleConfirmClose = () => {
        if (!closeModalJob) return;
        setProcessingId(closeModalJob.id);
        router.post(
            route('shop.jobs.close', closeModalJob.id),
            {},
            {
                onFinish: () => {
                    setProcessingId(null);
                    setCloseModalJob(null);
                },
                onSuccess: () => toast.success(`Job #${closeModalJob.id} closed and marked resolved.`),
                onError: () => toast.error('Failed to close job.'),
            }
        );
    };

    // Bulk actions
    const handleBulkAction = (action: 'retry' | 'cancel' | 'close') => {
        if (selectedJobIds.length === 0) return;
        setIsBulkProcessing(true);
        router.post(
            route('shop.jobs.bulk-action'),
            { action, job_ids: selectedJobIds },
            {
                onFinish: () => {
                    setIsBulkProcessing(false);
                    setSelectedJobIds([]);
                },
                onSuccess: () => toast.success(`Bulk ${action} executed successfully.`),
                onError: () => toast.error('Failed to execute bulk action.'),
            }
        );
    };

    // Toggle single checkbox
    const toggleSelectJob = (id: number) => {
        if (selectedJobIds.includes(id)) {
            setSelectedJobIds(selectedJobIds.filter((item) => item !== id));
        } else {
            setSelectedJobIds([...selectedJobIds, id]);
        }
    };

    // Select all on page
    const toggleSelectAll = () => {
        if (selectedJobIds.length === jobs.data.length) {
            setSelectedJobIds([]);
        } else {
            setSelectedJobIds(jobs.data.map((j) => j.id));
        }
    };

    // Copy helper
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(text);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Status Badge Component
    const renderStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200">
                        <Clock className="w-3 h-3 mr-1" /> Pending
                    </Badge>
                );
            case 'printing':
                return (
                    <Badge className="bg-amber-500 hover:bg-amber-500 text-white animate-pulse">
                        <Printer className="w-3 h-3 mr-1" /> Printing...
                    </Badge>
                );
            case 'printed':
                return (
                    <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
                    </Badge>
                );
            case 'failed':
                return (
                    <Badge variant="destructive">
                        <XCircle className="w-3 h-3 mr-1" /> Failed
                    </Badge>
                );
            case 'cancelled':
                return (
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 border-orange-200">
                        <Ban className="w-3 h-3 mr-1" /> Cancelled
                    </Badge>
                );
            case 'closed':
                return (
                    <Badge variant="secondary" className="text-muted-foreground">
                        <Archive className="w-3 h-3 mr-1" /> Closed
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    // File icon helper
    const renderFileIcon = (fileType?: string) => {
        switch (fileType) {
            case 'pdf':
                return <FileText className="w-4 h-4 text-rose-500" />;
            case 'excel':
                return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
            case 'image':
                return <FileImage className="w-4 h-4 text-purple-500" />;
            default:
                return <FileType className="w-4 h-4 text-blue-500" />;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Print Job History & Management" />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                {/* Header Banner */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                <History className="w-3.5 h-3.5 mr-1 inline" /> Spool Queue Log
                            </Badge>
                            <span className="text-xs text-muted-foreground">Shop: {shop.title}</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
                            Printing Job History
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Monitor, retry failed prints, cancel in-flight queues, or archive resolved printing jobs.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => applyFilters()}
                            className="gap-1.5 shadow-xs"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </Button>
                        <Button variant="default" size="sm" asChild className="gap-1.5">
                            <Link href="/shop/settings?tab=printer-status">
                                <Printer className="w-4 h-4" />
                                Hardware Diagnostics
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Status Filter Cards / Summary Counter Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                    {[
                        { id: 'all', label: 'All Jobs', count: counts.all, color: 'border-border text-foreground' },
                        { id: 'pending', label: 'Pending', count: counts.pending, color: 'border-blue-300 text-blue-600 dark:text-blue-400' },
                        { id: 'printing', label: 'Printing', count: counts.printing, color: 'border-amber-300 text-amber-600 dark:text-amber-400' },
                        { id: 'completed', label: 'Completed', count: counts.completed, color: 'border-emerald-300 text-emerald-600 dark:text-emerald-400' },
                        { id: 'failed', label: 'Failed', count: counts.failed, color: 'border-rose-300 text-rose-600 dark:text-rose-400' },
                        { id: 'cancelled', label: 'Cancelled', count: counts.cancelled, color: 'border-orange-300 text-orange-600 dark:text-orange-400' },
                        { id: 'closed', label: 'Closed', count: counts.closed, color: 'border-slate-300 text-muted-foreground' },
                    ].map((tab) => {
                        const isActive = selectedStatus === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => handleStatusTabClick(tab.id)}
                                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                    isActive
                                        ? 'bg-primary/10 border-primary shadow-xs ring-1 ring-primary'
                                        : 'bg-card border-border hover:bg-muted/40'
                                }`}
                            >
                                <p className="text-xs font-medium text-muted-foreground">{tab.label}</p>
                                <p className={`text-xl font-bold mt-1 ${tab.color}`}>{tab.count}</p>
                            </button>
                        );
                    })}
                </div>

                {/* Filter and Search Bar */}
                <Card className="border-border shadow-xs">
                    <CardContent className="p-4 space-y-4">
                        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                            {/* Search Input */}
                            <div className="sm:col-span-5 relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search filename, job UUID, error..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            {/* Printer Filter */}
                            <div className="sm:col-span-3">
                                <select
                                    value={selectedPrinter}
                                    onChange={(e) => {
                                        setSelectedPrinter(e.target.value);
                                        applyFilters({ printer: e.target.value });
                                    }}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">All Target Printers</option>
                                    {printersList.map((p, i) => (
                                        <option key={i} value={p}>{p}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Color Mode Filter */}
                            <div className="sm:col-span-2">
                                <select
                                    value={selectedColorMode}
                                    onChange={(e) => {
                                        setSelectedColorMode(e.target.value);
                                        applyFilters({ color_mode: e.target.value });
                                    }}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">All Color Modes</option>
                                    <option value="bw">Black & White (BW)</option>
                                    <option value="color">Full Color</option>
                                </select>
                            </div>

                            {/* Date Filter */}
                            <div className="sm:col-span-2">
                                <select
                                    value={selectedDateRange}
                                    onChange={(e) => {
                                        setSelectedDateRange(e.target.value);
                                        applyFilters({ date_range: e.target.value });
                                    }}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="all">All Time</option>
                                    <option value="today">Today</option>
                                    <option value="yesterday">Yesterday</option>
                                    <option value="week">Past 7 Days</option>
                                    <option value="month">Past 30 Days</option>
                                </select>
                            </div>
                        </form>

                        {/* Bulk Action Toolbar when items selected */}
                        {selectedJobIds.length > 0 && (
                            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-primary/10 border border-primary/30 rounded-xl animate-in fade-in">
                                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                                    <span>{selectedJobIds.length} job(s) selected</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedJobIds([])}
                                        className="h-7 text-xs text-muted-foreground hover:text-foreground"
                                    >
                                        Deselect All
                                    </Button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 gap-1.5 bg-background shadow-xs text-blue-600 border-blue-200"
                                        disabled={isBulkProcessing}
                                        onClick={() => handleBulkAction('retry')}
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        Bulk Retry
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 gap-1.5 bg-background shadow-xs text-orange-600 border-orange-200"
                                        disabled={isBulkProcessing}
                                        onClick={() => handleBulkAction('cancel')}
                                    >
                                        <Ban className="w-3.5 h-3.5" />
                                        Bulk Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 gap-1.5 bg-background shadow-xs text-slate-700 dark:text-slate-200 border-slate-300"
                                        disabled={isBulkProcessing}
                                        onClick={() => handleBulkAction('close')}
                                    >
                                        <Archive className="w-3.5 h-3.5" />
                                        Bulk Close
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Print Jobs Data Table */}
                <Card className="border-border shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="border-b border-border bg-muted/50 font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                                    <th className="p-3.5 w-10 text-center">
                                        <input
                                            type="checkbox"
                                            checked={jobs.data.length > 0 && selectedJobIds.length === jobs.data.length}
                                            onChange={toggleSelectAll}
                                            className="rounded border-input text-primary focus:ring-primary size-4"
                                        />
                                    </th>
                                    <th className="p-3.5">Job ID / File</th>
                                    <th className="p-3.5">Target Printer</th>
                                    <th className="p-3.5">Print Specs</th>
                                    <th className="p-3.5">Status</th>
                                    <th className="p-3.5">Spooled At</th>
                                    <th className="p-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {jobs.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-12 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center space-y-2">
                                                <History className="size-10 text-muted-foreground/40" />
                                                <p className="text-base font-medium text-foreground">No print jobs found</p>
                                                <p className="text-xs text-muted-foreground max-w-sm">
                                                    No jobs match your current search and status filter parameters.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    jobs.data.map((job) => {
                                        const isSelected = selectedJobIds.includes(job.id);
                                        return (
                                            <tr
                                                key={job.id}
                                                className={`hover:bg-muted/30 transition-colors ${
                                                    isSelected ? 'bg-primary/5' : ''
                                                }`}
                                            >
                                                {/* Checkbox */}
                                                <td className="p-3.5 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleSelectJob(job.id)}
                                                        className="rounded border-input text-primary focus:ring-primary size-4 cursor-pointer"
                                                    />
                                                </td>

                                                {/* Job File & UUID */}
                                                <td className="p-3.5 max-w-xs">
                                                    <div className="flex items-start gap-2.5">
                                                        <div className="mt-0.5 p-1.5 bg-muted rounded-md shrink-0">
                                                            {renderFileIcon(job.document?.file_type)}
                                                        </div>
                                                        <div className="space-y-0.5 truncate">
                                                            <div
                                                                className="font-semibold text-foreground truncate cursor-pointer hover:underline"
                                                                title={job.document?.original_name}
                                                                onClick={() => setDetailsModalJob(job)}
                                                            >
                                                                {job.document?.original_name || 'document.pdf'}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                                                                <span>#{job.id} · {job.uuid.slice(0, 8)}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => copyToClipboard(job.uuid)}
                                                                    className="hover:text-foreground"
                                                                    title="Copy Job UUID"
                                                                >
                                                                    {copiedId === job.uuid ? (
                                                                        <Check className="w-3 h-3 text-emerald-600" />
                                                                    ) : (
                                                                        <Copy className="w-3 h-3" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Target Printer */}
                                                <td className="p-3.5 font-medium text-xs">
                                                    <div className="flex items-center gap-1.5">
                                                        <Printer className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                                        <span className="truncate max-w-[150px]">{job.printer_name || 'Auto Assigned'}</span>
                                                    </div>
                                                </td>

                                                {/* Specs */}
                                                <td className="p-3.5">
                                                    <div className="flex items-center gap-1.5 flex-wrap text-xs">
                                                        <span className="font-semibold px-1.5 py-0.5 rounded bg-muted">
                                                            {job.copies}x
                                                        </span>
                                                        <Badge variant="outline" className="text-[10px] py-0">
                                                            {job.paper_size}
                                                        </Badge>
                                                        <Badge
                                                            variant="outline"
                                                            className={`text-[10px] py-0 ${
                                                                job.color_mode === 'color'
                                                                    ? 'text-purple-600 border-purple-300 dark:border-purple-800'
                                                                    : 'text-slate-600'
                                                            }`}
                                                        >
                                                            {job.color_mode === 'color' ? '🎨 Color' : '⬛ B/W'}
                                                        </Badge>
                                                        {job.duplex !== 'off' && (
                                                            <Badge variant="outline" className="text-[10px] py-0">
                                                                Duplex
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Status & Error */}
                                                <td className="p-3.5">
                                                    <div className="space-y-1">
                                                        {renderStatusBadge(job.status)}
                                                        {job.error_message && (
                                                            <p className="text-[11px] text-destructive truncate max-w-[180px]" title={job.error_message}>
                                                                {job.error_message}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Timestamp */}
                                                <td className="p-3.5 text-xs text-muted-foreground whitespace-nowrap">
                                                    <div>{new Date(job.created_at).toLocaleDateString()}</div>
                                                    <div className="text-[11px] text-muted-foreground/80">
                                                        {new Date(job.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </td>

                                                {/* Action Buttons */}
                                                <td className="p-3.5 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {/* Action 1: Retry */}
                                                        {['failed', 'cancelled', 'closed'].includes(job.status) && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 gap-1 text-xs text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                                                                disabled={processingId === job.id}
                                                                onClick={() => handleRetry(job)}
                                                            >
                                                                <RefreshCw className={`w-3.5 h-3.5 ${processingId === job.id ? 'animate-spin' : ''}`} />
                                                                <span>Retry</span>
                                                            </Button>
                                                        )}

                                                        {/* Action 2: Cancel */}
                                                        {['pending', 'printing'].includes(job.status) && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 gap-1 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                                                                onClick={() => setCancelModalJob(job)}
                                                            >
                                                                <Ban className="w-3.5 h-3.5" />
                                                                <span>Cancel</span>
                                                            </Button>
                                                        )}

                                                        {/* Action 3: Close / Archive */}
                                                        {['printed', 'failed', 'cancelled'].includes(job.status) && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
                                                                onClick={() => setCloseModalJob(job)}
                                                                title="Close / Archive Job"
                                                            >
                                                                <Archive className="w-3.5 h-3.5" />
                                                                <span>Close</span>
                                                            </Button>
                                                        )}

                                                        {/* Info details */}
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="size-8 text-muted-foreground"
                                                            onClick={() => setDetailsModalJob(job)}
                                                            title="View Job Details"
                                                        >
                                                            <Info className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Bar */}
                    {jobs.links && jobs.links.length > 3 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border bg-muted/20 text-xs text-muted-foreground">
                            <div>
                                Showing <span className="font-semibold text-foreground">{jobs.from || 0}</span> to{' '}
                                <span className="font-semibold text-foreground">{jobs.to || 0}</span> of{' '}
                                <span className="font-semibold text-foreground">{jobs.total}</span> jobs
                            </div>
                            <div className="flex gap-1 flex-wrap">
                                {jobs.links.map((link, i) => (
                                    <Button
                                        key={i}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        asChild={!!link.url}
                                        className="h-8 px-3 text-xs"
                                    >
                                        {link.url ? (
                                            <Link href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} />
                                        ) : (
                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                        )}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>

                {/* ── Cancel Job Confirmation Dialog ── */}
                <Dialog open={!!cancelModalJob} onOpenChange={(open) => !open && setCancelModalJob(null)}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-destructive">
                                <AlertTriangle className="size-5" /> Cancel Print Job #{cancelModalJob?.id}?
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Cancelling this print job will halt local spooling and mark the document job as cancelled.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3 py-2">
                            <div className="p-3 rounded-lg bg-muted/40 text-xs space-y-1">
                                <p className="font-semibold text-foreground">{cancelModalJob?.document?.original_name}</p>
                                <p className="text-muted-foreground">Printer: {cancelModalJob?.printer_name} · Copies: {cancelModalJob?.copies}x</p>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold">Cancellation Reason</label>
                                <Input
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    placeholder="e.g. Paper jam / Customer requested cancellation"
                                />
                            </div>
                        </div>
                        <DialogFooter className="gap-2">
                            <Button variant="outline" size="sm" onClick={() => setCancelModalJob(null)}>
                                Dismiss
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                disabled={processingId === cancelModalJob?.id}
                                onClick={handleConfirmCancel}
                            >
                                Confirm Cancel
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* ── Close Job Confirmation Dialog ── */}
                <Dialog open={!!closeModalJob} onOpenChange={(open) => !open && setCloseModalJob(null)}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold flex items-center gap-2">
                                <Archive className="size-5 text-primary" /> Close & Archive Job #{closeModalJob?.id}?
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Marking this job as closed indicates it is fully resolved and completed.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="p-3 rounded-lg bg-muted/40 text-xs space-y-1">
                            <p className="font-semibold text-foreground">{closeModalJob?.document?.original_name}</p>
                            <p className="text-muted-foreground">Current Status: {closeModalJob?.status}</p>
                        </div>
                        <DialogFooter className="gap-2">
                            <Button variant="outline" size="sm" onClick={() => setCloseModalJob(null)}>
                                Cancel
                            </Button>
                            <Button
                                variant="default"
                                size="sm"
                                disabled={processingId === closeModalJob?.id}
                                onClick={handleConfirmClose}
                            >
                                Mark as Closed
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* ── Job Details Modal ── */}
                <Dialog open={!!detailsModalJob} onOpenChange={(open) => !open && setDetailsModalJob(null)}>
                    <DialogContent className="max-w-xl">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <FileText className="size-5 text-primary" /> Job #{detailsModalJob?.id} Details
                                </span>
                                {detailsModalJob && renderStatusBadge(detailsModalJob.status)}
                            </DialogTitle>
                            <DialogDescription className="text-xs font-mono">
                                UUID: {detailsModalJob?.uuid}
                            </DialogDescription>
                        </DialogHeader>

                        {detailsModalJob && (
                            <div className="space-y-4 py-2 text-xs">
                                {/* Document Info Box */}
                                <div className="p-3.5 rounded-xl border bg-muted/30 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-foreground text-sm">{detailsModalJob.document?.original_name}</p>
                                            <p className="text-muted-foreground">MIME: {detailsModalJob.document?.mime_type} · Type: {detailsModalJob.document?.file_type?.toUpperCase()}</p>
                                        </div>
                                        <Badge variant="secondary">
                                            {((detailsModalJob.document?.file_size || 0) / 1024).toFixed(1)} KB
                                        </Badge>
                                    </div>
                                </div>

                                {/* Detailed Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    <div className="p-3 rounded-lg border bg-background">
                                        <p className="text-muted-foreground">Printer Name</p>
                                        <p className="font-semibold text-foreground mt-0.5 truncate">{detailsModalJob.printer_name || 'N/A'}</p>
                                    </div>
                                    <div className="p-3 rounded-lg border bg-background">
                                        <p className="text-muted-foreground">Copies / Sides</p>
                                        <p className="font-semibold text-foreground mt-0.5">{detailsModalJob.copies}x · {detailsModalJob.duplex !== 'off' ? 'Double Sided' : 'Single Sided'}</p>
                                    </div>
                                    <div className="p-3 rounded-lg border bg-background">
                                        <p className="text-muted-foreground">Paper & Color</p>
                                        <p className="font-semibold text-foreground mt-0.5">{detailsModalJob.paper_size} · {detailsModalJob.color_mode.toUpperCase()}</p>
                                    </div>
                                    <div className="p-3 rounded-lg border bg-background">
                                        <p className="text-muted-foreground">Orientation / Scaling</p>
                                        <p className="font-semibold text-foreground mt-0.5">{detailsModalJob.orientation} · {detailsModalJob.scaling}</p>
                                    </div>
                                    <div className="p-3 rounded-lg border bg-background">
                                        <p className="text-muted-foreground">Retry Attempts</p>
                                        <p className="font-semibold text-foreground mt-0.5">{detailsModalJob.attempts} attempt(s)</p>
                                    </div>
                                    <div className="p-3 rounded-lg border bg-background">
                                        <p className="text-muted-foreground">Session UUID</p>
                                        <p className="font-mono font-semibold text-foreground mt-0.5 truncate">{detailsModalJob.session?.uuid || 'Single Job'}</p>
                                    </div>
                                </div>

                                {/* Timestamps */}
                                <div className="space-y-1.5 p-3 rounded-lg border bg-muted/20">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Created:</span>
                                        <span className="font-medium">{new Date(detailsModalJob.created_at).toLocaleString()}</span>
                                    </div>
                                    {detailsModalJob.claimed_at && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Claimed by Agent:</span>
                                            <span className="font-medium">{new Date(detailsModalJob.claimed_at).toLocaleString()}</span>
                                        </div>
                                    )}
                                    {detailsModalJob.completed_at && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Finished:</span>
                                            <span className="font-medium">{new Date(detailsModalJob.completed_at).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>

                                {detailsModalJob.error_message && (
                                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive space-y-1">
                                        <p className="font-semibold flex items-center gap-1.5">
                                            <AlertTriangle className="size-4" /> Error Log / Cancellation Reason:
                                        </p>
                                        <p className="font-mono text-xs">{detailsModalJob.error_message}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <DialogFooter className="gap-2">
                            {detailsModalJob && ['failed', 'cancelled', 'closed'].includes(detailsModalJob.status) && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-blue-600 border-blue-200 gap-1"
                                    onClick={() => {
                                        const j = detailsModalJob;
                                        setDetailsModalJob(null);
                                        handleRetry(j);
                                    }}
                                >
                                    <RefreshCw className="size-3.5" />
                                    Retry Job
                                </Button>
                            )}
                            <Button variant="default" size="sm" onClick={() => setDetailsModalJob(null)}>
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
