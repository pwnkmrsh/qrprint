import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Search, CheckCircle2, XCircle, Printer } from 'lucide-react';

interface CustomerItem {
    id: number;
    name: string;
    email: string;
    roles: string[];
    print_jobs_count: number;
    email_verified: boolean;
    created_at: string;
}

interface CustomersProps {
    customers: {
        data: CustomerItem[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search?: string;
    };
    stats: {
        total_users: number;
        total_print_sessions: number;
        paid_sessions: number;
    };
}

export default function AdminCustomersIndex({ customers, filters, stats }: CustomersProps) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.customers.index'), { search }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Super Admin', href: '/admin/settings' }, { title: 'Customers', href: '/admin/customers' }]}>
            <Head title="Customers & Users - Super Admin" />

            <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-6">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-primary/10 text-primary rounded-xl">
                                <Users className="size-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-foreground">Customers & Platform Users</h1>
                                <p className="text-sm text-muted-foreground">
                                    View customer accounts, print activity, and user roles across the platform.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <Card className="shadow-xs border">
                        <CardContent className="p-4">
                            <span className="text-xs text-muted-foreground font-medium">Total Registered Users</span>
                            <div className="text-2xl font-extrabold mt-1">{stats.total_users}</div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-xs border">
                        <CardContent className="p-4">
                            <span className="text-xs text-muted-foreground font-medium">Total Print Sessions</span>
                            <div className="text-2xl font-extrabold mt-1 text-primary">{stats.total_print_sessions}</div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-xs border">
                        <CardContent className="p-4">
                            <span className="text-xs text-muted-foreground font-medium">Paid Sessions</span>
                            <div className="text-2xl font-extrabold mt-1 text-emerald-600">{stats.paid_sessions}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search Toolbar */}
                <div className="flex items-center justify-between gap-4">
                    <form onSubmit={handleSearch} className="flex items-center gap-2 w-full max-w-sm">
                        <div className="relative w-full">
                            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search customer name or email..."
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

                {/* Customers Table */}
                <Card className="shadow-xs border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-muted/40 border-b text-muted-foreground font-semibold">
                                <tr>
                                    <th className="py-3 px-4">User</th>
                                    <th className="py-3 px-4">Roles</th>
                                    <th className="py-3 px-4">Email Verification</th>
                                    <th className="py-3 px-4">Print Jobs</th>
                                    <th className="py-3 px-4">Joined Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {customers.data.map((c) => (
                                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="font-bold text-foreground">{c.name}</div>
                                            <div className="text-muted-foreground text-[11px]">{c.email}</div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex flex-wrap gap-1">
                                                {c.roles.map((r) => (
                                                    <Badge key={r} variant="secondary" className="text-[10px]">{r}</Badge>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            {c.email_verified ? (
                                                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">Verified</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-amber-600">Unverified</Badge>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 font-semibold text-foreground">
                                            {c.print_jobs_count} jobs
                                        </td>
                                        <td className="py-3 px-4 text-muted-foreground">
                                            {c.created_at}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
