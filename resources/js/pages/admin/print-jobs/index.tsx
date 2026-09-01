import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
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
    FileText 
} from 'lucide-react';

interface PrintJobItem {
    id: number;
    uuid: string;
    session_uuid?: string;
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

interface PrintJobsProps {
    jobs: {
        data: PrintJobItem[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        status?: string;
        search?: string;
    };
    stats: {
        total_jobs: number;
        printed_jobs: number;
        pending_jobs: number;
        failed_jobs: number;
    };
}

export default function AdminPrintJobsIndex({ jobs, filters, stats }: PrintJobsProps) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.print-jobs.index'), { search, status: filters.status }, { preserveState: true });
    };

    const retryJob = (job: PrintJobItem) => {
        router.post(route('admin.print-jobs.retry', job.id), {}, { preserveScroll: true });
    };

    const cancelJob = (job: PrintJobItem) => {
        router.post(route('admin.print-jobs.cancel', job.id), {}, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Super Admin', href: '/admin/settings' }, { title: 'Print Jobs', href: '/admin/print-jobs' }]}>
            <Head title="Platform Print Jobs - Super Admin" />

            <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-6">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-primary/10 text-primary rounded-xl">
                                <Printer className="size-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-foreground">Hardware Print Jobs</h1>
                                <p className="text-sm text-muted-foreground">
                                    Monitor spool status, printer queues, retry failed jobs and monitor hardware execution.
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

                {/* Search */}
                <div className="flex items-center justify-between gap-4">
                    <form onSubmit={handleSearch} className="flex items-center gap-2 w-full max-w-sm">
                        <div className="relative w-full">
                            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search document, printer, shop..."
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
                                        <td colSpan={7} className="py-10 text-center text-muted-foreground">
                                            No print jobs found.
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
                                                {job.shop_title}
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
                                            <td className="py-3 px-4 text-right space-x-2">
                                                {job.status === 'failed' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => retryJob(job)}
                                                        className="h-7 text-xs gap-1 text-primary"
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
