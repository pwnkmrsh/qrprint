import { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
    Printer, 
    Search, 
    RotateCcw, 
    XCircle, 
    CheckCircle2, 
    Clock, 
    FileText,
    Store,
    Filter,
    Check
} from 'lucide-react';

interface PrintJobItem {
    id: number;
    uuid: string;
    session_uuid?: string;
    shop_id?: number;
    shop_title: string;
    document_name: string;
    file_type: string;
    printer_name?: string;
    copies: number;
    color_mode: string;
    paper_size: string;
    duplex: string;
    status: string;
    attempts: number;
    error_message?: string;
    printed_at?: string;
    created_at: string;
}

interface ShopOption {
    id: number;
    title: string;
}

interface PrintJobsProps {
    jobs: {
        data: PrintJobItem[];
        current_page: number;
        last_page: number;
        total: number;
    };
    shops: ShopOption[];
    filters: {
        status?: string;
        shop_id?: string | number;
        search?: string;
    };
    stats: {
        total_jobs: number;
        printed_jobs: number;
        pending_jobs: number;
        printing_jobs: number;
        failed_jobs: number;
    };
}

export default function AdminPrintJobsIndex({ jobs, shops = [], filters, stats }: PrintJobsProps) {
    const [search, setSearch] = useState(filters.search || '');
    const currentStatus = filters.status || 'all';
    const currentShopId = filters.shop_id ? String(filters.shop_id) : '';

    const applyFilters = (newParams: Record<string, string | number | undefined>) => {
        router.get(route('admin.print-jobs.index'), {
            search,
            status: currentStatus,
            shop_id: currentShopId,
            ...newParams,
        }, { preserveState: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters({ search });
    };

    const handleStatusFilter = (status: string) => {
        applyFilters({ status });
    };

    const handleShopFilter = (shopId: string) => {
        applyFilters({ shop_id: shopId || undefined });
    };

    const retryJob = (job: PrintJobItem) => {
        router.post(route('admin.print-jobs.retry', job.id), {}, { preserveScroll: true });
    };

    const cancelJob = (job: PrintJobItem) => {
        router.post(route('admin.print-jobs.cancel', job.id), {}, { preserveScroll: true });
    };

    const completeJob = (job: PrintJobItem) => {
        router.post(route('admin.print-jobs.complete', job.id), {}, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Super Admin', href: '/admin/settings' }, { title: 'Print Jobs', href: '/admin/print-jobs' }]}>
            <Head title="Platform Print Jobs - Super Admin" />

            <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-6">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <div className="p-2.5 bg-primary/10 text-primary rounded-2xl shadow-xs">
                                <Printer className="size-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-foreground">Hardware Print Jobs</h1>
                                <p className="text-sm text-muted-foreground">
                                    Monitor spool status, printer queues, retry failed jobs, and override print completions platform-wide.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="shadow-xs border">
                        <CardContent className="p-4">
                            <span className="text-xs text-muted-foreground font-medium">Total Print Jobs</span>
                            <div className="text-2xl font-extrabold mt-1">{stats.total_jobs}</div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-xs border">
                        <CardContent className="p-4">
                            <span className="text-xs text-muted-foreground font-medium">Printed Successfully</span>
                            <div className="text-2xl font-extrabold mt-1 text-emerald-600">{stats.printed_jobs}</div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-xs border">
                        <CardContent className="p-4">
                            <span className="text-xs text-muted-foreground font-medium">In Queue / Ready</span>
                            <div className="text-2xl font-extrabold mt-1 text-amber-600">{stats.pending_jobs}</div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-xs border">
                        <CardContent className="p-4">
                            <span className="text-xs text-muted-foreground font-medium">Failed Spools</span>
                            <div className="text-2xl font-extrabold mt-1 text-rose-500">{stats.failed_jobs}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Toolbar */}
                <div className="flex flex-col gap-3 bg-card p-4 rounded-2xl border shadow-xs">
                    {/* Status Tabs */}
                    <div className="flex flex-wrap items-center gap-1.5 border-b pb-3">
                        <Button
                            type="button"
                            size="sm"
                            variant={currentStatus === 'all' ? 'default' : 'outline'}
                            onClick={() => handleStatusFilter('all')}
                            className="h-8 text-xs font-semibold rounded-lg"
                        >
                            All ({stats.total_jobs})
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant={currentStatus === 'pending' ? 'default' : 'outline'}
                            onClick={() => handleStatusFilter('pending')}
                            className={`h-8 text-xs font-semibold rounded-lg ${currentStatus === 'pending' ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'text-amber-600'}`}
                        >
                            <Clock className="size-3 mr-1" /> Pending ({stats.pending_jobs})
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant={currentStatus === 'printing' ? 'default' : 'outline'}
                            onClick={() => handleStatusFilter('printing')}
                            className={`h-8 text-xs font-semibold rounded-lg ${currentStatus === 'printing' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'text-blue-600'}`}
                        >
                            <Printer className="size-3 mr-1" /> Printing ({stats.printing_jobs || 0})
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant={currentStatus === 'printed' ? 'default' : 'outline'}
                            onClick={() => handleStatusFilter('printed')}
                            className={`h-8 text-xs font-semibold rounded-lg ${currentStatus === 'printed' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'text-emerald-600'}`}
                        >
                            <CheckCircle2 className="size-3 mr-1" /> Printed ({stats.printed_jobs})
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant={currentStatus === 'failed' ? 'default' : 'outline'}
                            onClick={() => handleStatusFilter('failed')}
                            className={`h-8 text-xs font-semibold rounded-lg ${currentStatus === 'failed' ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'text-rose-600'}`}
                        >
                            <XCircle className="size-3 mr-1" /> Failed ({stats.failed_jobs})
                        </Button>
                    </div>

                    {/* Secondary Filters: Shop Selector & Search */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <Store className="size-4 text-muted-foreground shrink-0" />
                            <select
                                value={currentShopId}
                                onChange={(e) => handleShopFilter(e.target.value)}
                                className="h-9 px-3 rounded-lg border bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary min-w-[200px]"
                            >
                                <option value="">All Shops / Outlets</option>
                                {shops.map((shop) => (
                                    <option key={shop.id} value={shop.id}>
                                        {shop.title}
                                    </option>
                                ))}
                            </select>
                            {currentShopId && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleShopFilter('')}
                                    className="h-9 text-xs px-2 text-muted-foreground"
                                >
                                    Clear
                                </Button>
                            )}
                        </div>

                        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:max-w-xs">
                            <div className="relative w-full">
                                <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search document, printer, UUID..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 text-xs h-9 rounded-lg"
                                />
                            </div>
                            <Button type="submit" size="sm" variant="secondary" className="h-9 text-xs px-3">
                                Search
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Table */}
                <Card className="shadow-xs border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-muted/40 border-b text-muted-foreground font-semibold">
                                <tr>
                                    <th className="py-3 px-4">Document</th>
                                    <th className="py-3 px-4">Shop</th>
                                    <th className="py-3 px-4">Printer</th>
                                    <th className="py-3 px-4">Specs</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4">Date</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {jobs.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-muted-foreground">
                                            <Printer className="size-10 mx-auto text-muted-foreground/40 mb-2" />
                                            <p className="font-semibold text-sm">No print jobs found.</p>
                                            <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters or search terms.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    jobs.data.map((job) => (
                                        <tr key={job.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="py-3 px-4">
                                                <div className="font-semibold text-foreground">{job.document_name}</div>
                                                <div className="text-[10px] text-muted-foreground font-mono">{job.uuid}</div>
                                            </td>
                                            <td className="py-3 px-4 font-medium">
                                                {job.shop_id ? (
                                                    <Link href={route('admin.shops.show', job.shop_id)} className="text-primary hover:underline font-semibold">
                                                        {job.shop_title}
                                                    </Link>
                                                ) : (
                                                    <span>{job.shop_title}</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                {job.printer_name ? (
                                                    <span className="font-mono text-primary font-medium">{job.printer_name}</span>
                                                ) : (
                                                    <span className="text-muted-foreground">Auto-assigned</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex flex-wrap gap-1">
                                                    <Badge variant="secondary" className="text-[10px]">{job.copies} copy</Badge>
                                                    <Badge variant="secondary" className="text-[10px] uppercase">{job.color_mode}</Badge>
                                                    <Badge variant="secondary" className="text-[10px]">{job.paper_size}</Badge>
                                                </div>
                                                {job.error_message && (
                                                    <div className="text-rose-500 text-[10px] mt-1 truncate max-w-xs">{job.error_message}</div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                {job.status === 'printed' ? (
                                                    <Badge className="bg-emerald-600 text-white">Printed</Badge>
                                                ) : job.status === 'printing' ? (
                                                    <Badge className="bg-blue-600 text-white animate-pulse">Printing</Badge>
                                                ) : job.status === 'failed' ? (
                                                    <Badge variant="destructive">Failed</Badge>
                                                ) : (
                                                    <Badge variant="outline">Pending</Badge>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-muted-foreground">
                                                {job.printed_at || job.created_at}
                                            </td>
                                            <td className="py-3 px-4 text-right space-x-1.5">
                                                {job.status !== 'printed' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => completeJob(job)}
                                                        className="h-7 text-xs gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                                        title="Force mark as printed"
                                                    >
                                                        <Check className="size-3" /> Mark Printed
                                                    </Button>
                                                )}
                                                {job.status === 'failed' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => retryJob(job)}
                                                        className="h-7 text-xs gap-1 text-primary"
                                                        title="Retry print spool"
                                                    >
                                                        <RotateCcw className="size-3" /> Retry
                                                    </Button>
                                                )}
                                                {job.status === 'pending' && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => cancelJob(job)}
                                                        className="h-7 text-xs text-rose-500 hover:text-rose-600"
                                                        title="Cancel job"
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
                </Card>
            </div>
        </AppLayout>
    );
}
