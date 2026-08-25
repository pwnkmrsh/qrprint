import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type CMSPage } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Plus,
    Search,
    FileText,
    Globe,
    CheckCircle2,
    Clock,
    Archive,
    ExternalLink,
    Edit3,
    Trash2,
    Eye,
    SlidersHorizontal,
    Sparkles,
    Shield,
    FileCode,
    Layers,
    ArrowUpRight
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Pages (CMS)', href: '/pages' },
];

interface PaginationLinks {
    url: string | null;
    label: string;
    active: boolean;
}

interface PagePagination {
    data: CMSPage[];
    links: PaginationLinks[];
    from: number;
    to: number;
    total: number;
    current_page: number;
    last_page: number;
}

interface IndexProps {
    pages: PagePagination;
    filters: {
        search?: string;
        status?: string;
        perPage?: string;
    };
    stats: {
        total: number;
        published: number;
        draft: number;
    };
    filteredCount: number;
}

export default function PagesIndex({ pages, filters, stats, filteredCount }: IndexProps) {
    const { auth } = usePage().props as any;
    const permissions: string[] = auth?.permissions || [];
    const roles: string[] = auth?.roles || [];
    const isSuperAdmin = roles.includes('super-admin') || roles.includes('SUPER ADMIN');

    const canCreate = isSuperAdmin || permissions.includes('page.create');
    const canEdit = isSuperAdmin || permissions.includes('page.edit');
    const canDelete = isSuperAdmin || permissions.includes('page.delete');
    const canPublish = isSuperAdmin || permissions.includes('page.publish');

    const [search, setSearch] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('pages.index'),
            {
                search: search || undefined,
                status: selectedStatus === 'all' ? undefined : selectedStatus,
            },
            { preserveState: true }
        );
    };

    const handleStatusFilter = (status: string) => {
        setSelectedStatus(status);
        router.get(
            route('pages.index'),
            {
                search: search || undefined,
                status: status === 'all' ? undefined : status,
            },
            { preserveState: true }
        );
    };

    const toggleStatus = (page: CMSPage) => {
        if (!canPublish) return;
        router.post(route('pages.toggle-status', page.id), {}, { preserveScroll: true });
    };

    const handleDelete = (page: CMSPage) => {
        if (!canDelete) return;
        if (page.is_system) {
            alert('System core page cannot be deleted.');
            return;
        }
        if (confirm(`Are you sure you want to delete "${page.title}"?`)) {
            router.delete(route('pages.destroy', page.id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pages & SEO Manager — Admin Panel" />

            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
                {/* Header Title & CTA */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            Pages & SEO Management
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Create and manage landing sections, custom CMS pages, publication states, and search engine optimization.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs font-semibold shadow-2xs">
                            <a href="/" target="_blank" rel="noreferrer">
                                <Globe className="h-3.5 w-3.5 text-primary" />
                                <span>View Website</span>
                                <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                            </a>
                        </Button>

                        {canCreate && (
                            <Button asChild size="sm" className="gap-1.5 font-semibold shadow-sm bg-primary text-primary-foreground">
                                <Link href={route('pages.create')}>
                                    <Plus className="h-4 w-4" />
                                    <span>Create New Page</span>
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="p-4 flex items-center justify-between bg-card border-border shadow-xs">
                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Pages</span>
                            <div className="text-2xl font-black text-foreground">{stats.total}</div>
                            <span className="text-[11px] text-muted-foreground">All landing & CMS pages</span>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                            <Layers className="h-5 w-5" />
                        </div>
                    </Card>

                    <Card className="p-4 flex items-center justify-between bg-card border-border shadow-xs">
                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Published</span>
                            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.published}</div>
                            <span className="text-[11px] text-muted-foreground">Live on website & searchable</span>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                    </Card>

                    <Card className="p-4 flex items-center justify-between bg-card border-border shadow-xs">
                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Drafts</span>
                            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{stats.draft}</div>
                            <span className="text-[11px] text-muted-foreground">Unpublished / Work in progress</span>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                            <Clock className="h-5 w-5" />
                        </div>
                    </Card>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-card border border-border shadow-2xs">
                    {/* Status Tabs */}
                    <div className="flex flex-wrap items-center gap-1.5">
                        {[
                            { label: 'All Pages', value: 'all', count: stats.total },
                            { label: 'Published', value: 'published', count: stats.published },
                            { label: 'Drafts', value: 'draft', count: stats.draft },
                            { label: 'Archived', value: 'archived', count: stats.total - stats.published - stats.draft },
                        ].map((tab) => (
                            <button
                                key={tab.value}
                                type="button"
                                onClick={() => handleStatusFilter(tab.value)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                    selectedStatus === tab.value
                                        ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                                }`}
                            >
                                <span>{tab.label}</span>
                                <span className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${
                                    selectedStatus === tab.value ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                                }`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Search Input Form */}
                    <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-sm w-full">
                        <div className="relative w-full">
                            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            <Input
                                type="text"
                                placeholder="Search by title, slug, meta..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 h-9 text-xs"
                            />
                        </div>
                        <Button type="submit" variant="secondary" size="sm" className="h-9 px-3 text-xs font-semibold">
                            Search
                        </Button>
                    </form>
                </div>

                {/* Pages Data Table */}
                <Card className="border-border bg-card shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                                <tr>
                                    <th className="px-5 py-3.5 font-bold">Page Title & Slug</th>
                                    <th className="px-5 py-3.5 font-bold">Template</th>
                                    <th className="px-5 py-3.5 font-bold">Status</th>
                                    <th className="px-5 py-3.5 font-bold">SEO Optimization</th>
                                    <th className="px-5 py-3.5 font-bold">Last Updated</th>
                                    <th className="px-5 py-3.5 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {pages.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                                            <FileText className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                                            <p className="font-semibold text-base text-foreground">No pages found</p>
                                            <p className="text-xs mt-1">Try adjusting your search terms or create a new page.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    pages.data.map((page) => (
                                        <tr key={page.id} className="hover:bg-muted/30 transition-colors group">
                                            {/* Title & Slug */}
                                            <td className="px-5 py-4">
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-foreground group-hover:text-primary transition-colors">
                                                            {page.title}
                                                        </span>
                                                        {page.is_system && (
                                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary bg-primary/5">
                                                                Core
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                                                        <span>/{page.slug}</span>
                                                        {page.template === 'landing_section' && (
                                                            <span className="text-[10px] text-primary/80 font-semibold">(#{page.slug})</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Template */}
                                            <td className="px-5 py-4">
                                                <span className="capitalize text-xs px-2.5 py-1 rounded-md bg-muted font-medium text-muted-foreground border border-border/80">
                                                    {page.template.replace('_', ' ')}
                                                </span>
                                            </td>

                                            {/* Status Badge & Toggle */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    {page.status === 'published' ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                            Published
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                                            Draft
                                                        </span>
                                                    )}

                                                    {canPublish && (
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleStatus(page)}
                                                            className="text-[10px] font-semibold text-primary hover:underline"
                                                            title="Toggle status"
                                                        >
                                                            {page.status === 'published' ? 'Switch to Draft' : 'Publish'}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>

                                            {/* SEO Health */}
                                            <td className="px-5 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5 text-xs">
                                                        {page.meta_title && page.meta_description ? (
                                                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                                <span>SEO Ready</span>
                                                            </span>
                                                        ) : (
                                                            <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                                                                <Clock className="h-3.5 w-3.5" />
                                                                <span>Needs SEO Meta</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                                                        {page.meta_title || 'Default Title'}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Last Updated */}
                                            <td className="px-5 py-4 text-xs text-muted-foreground">
                                                <div>{page.updated_at ? new Date(page.updated_at).toLocaleDateString() : '—'}</div>
                                                {page.author && <div className="text-[11px]">by {page.author.name}</div>}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {/* Public View / Preview */}
                                                    <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                        <a
                                                            href={page.template === 'landing_section' ? `/#${page.slug}` : `/p/${page.slug}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            title="Preview Page"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </a>
                                                    </Button>

                                                    {/* Edit */}
                                                    {canEdit && (
                                                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                            <Link href={route('pages.edit', page.id)} title="Edit Page & SEO">
                                                                <Edit3 className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                    )}

                                                    {/* Delete (if not system) */}
                                                    {canDelete && !page.is_system && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDelete(page)}
                                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                            title="Delete Page"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Links */}
                    {pages.links && pages.links.length > 3 && (
                        <div className="p-4 border-t border-border flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                                Showing {pages.from || 0} to {pages.to || 0} of {pages.total} pages
                            </span>
                            <div className="flex items-center gap-1">
                                {pages.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-2.5 py-1 rounded-md transition-colors ${
                                            link.active
                                                ? 'bg-primary text-primary-foreground font-bold'
                                                : link.url
                                                ? 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                                : 'text-muted-foreground/40 pointer-events-none'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}
