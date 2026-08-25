import { useState, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type CMSPage } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import InputError from '@/components/input-error';
import {
    ArrowLeft,
    Save,
    Sparkles,
    Globe,
    Search,
    FileText,
    Share2,
    Sliders,
    Eye,
    CheckCircle2,
    Clock,
    Layers,
    LayoutTemplate,
    ExternalLink
} from 'lucide-react';

interface PageFormProps {
    page?: CMSPage | null;
    templates: { value: string; label: string }[];
}

export default function PageForm({ page, templates }: PageFormProps) {
    const isEdit = !!page;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pages (CMS)', href: '/pages' },
        { title: isEdit ? `Edit: ${page.title}` : 'Create Page', href: '#' },
    ];

    const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'publish'>('content');

    const { data, setData, post, patch, processing, errors, isDirty } = useForm({
        title: page?.title || '',
        slug: page?.slug || '',
        subtitle: page?.subtitle || '',
        content: page?.content || '',
        template: page?.template || 'default',
        status: page?.status || 'published',
        sort_order: page?.sort_order ?? 0,
        // SEO
        meta_title: page?.meta_title || '',
        meta_description: page?.meta_description || '',
        meta_keywords: page?.meta_keywords || '',
        canonical_url: page?.canonical_url || '',
        og_image: page?.og_image || '',
        og_title: page?.og_title || '',
        og_description: page?.og_description || '',
        is_indexable: page?.is_indexable ?? true,
    });

    // Auto slug generator when creating a new page
    const handleTitleChange = (val: string) => {
        setData((prev) => {
            const next = { ...prev, title: val };
            if (!isEdit && (!prev.slug || prev.slug === slugify(prev.title))) {
                next.slug = slugify(val);
            }
            if (!prev.meta_title || prev.meta_title === prev.title) {
                next.meta_title = val;
            }
            return next;
        });
    };

    const slugify = (text: string) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && page) {
            patch(route('pages.update', page.id));
        } else {
            post(route('pages.store'));
        }
    };

    // Live preview values
    const effectiveTitle = data.meta_title || data.title || 'Page Title — Print Setu';
    const effectiveDescription =
        data.meta_description || data.subtitle || 'Discover fast, zero-queue automated cloud printing for cyber cafes and stationery shops.';
    const effectiveUrl = `https://printsetu.in/p/${data.slug || 'page-slug'}`;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? `Edit "${page?.title}" — Pages CMS` : 'Create New Page — Pages CMS'} />

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
                {/* Header Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <Button asChild variant="outline" size="sm" className="h-9 w-9 p-0 rounded-lg">
                            <Link href={route('pages.index')}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                                {isEdit ? `Edit Page: ${page?.title}` : 'Create New Page'}
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                Configure page content, design layout, search metadata, and publication controls.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {isEdit && page && (
                            <Button asChild variant="ghost" size="sm" className="text-xs gap-1.5 text-muted-foreground hover:text-foreground">
                                <a
                                    href={page.template === 'landing_section' ? `/#${page.slug}` : `/p/${page.slug}`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <Eye className="h-3.5 w-3.5" />
                                    <span>Live Preview</span>
                                </a>
                            </Button>
                        )}

                        <Button
                            type="submit"
                            disabled={processing}
                            className="gap-2 font-semibold bg-primary text-primary-foreground shadow-md hover:bg-primary/90 h-9 px-4 text-xs"
                        >
                            <Save className="h-4 w-4" />
                            <span>{processing ? 'Saving...' : isEdit ? 'Save Changes' : 'Create & Publish'}</span>
                        </Button>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex items-center gap-2 border-b border-border pb-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab('content')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                            activeTab === 'content'
                                ? 'bg-primary text-primary-foreground shadow-xs'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                    >
                        <FileText className="h-4 w-4" />
                        <span>Content & Layout</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('seo')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                            activeTab === 'seo'
                                ? 'bg-primary text-primary-foreground shadow-xs'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                    >
                        <Search className="h-4 w-4" />
                        <span>SEO & Social Sharing</span>
                        {(data.meta_title || data.meta_description) && (
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('publish')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                            activeTab === 'publish'
                                ? 'bg-primary text-primary-foreground shadow-xs'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                    >
                        <Sliders className="h-4 w-4" />
                        <span>Publish & Visibility</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                            data.status === 'published' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                        }`}>
                            {data.status}
                        </span>
                    </button>
                </div>

                {/* TAB 1: CONTENT & LAYOUT */}
                {activeTab === 'content' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-150">
                        {/* Main Content Area (8 cols) */}
                        <div className="lg:col-span-8 space-y-5">
                            <Card className="p-6 space-y-4 bg-card border-border shadow-xs">
                                <div>
                                    <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider">
                                        Page Title <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="title"
                                        type="text"
                                        required
                                        value={data.title}
                                        onChange={(e) => handleTitleChange(e.target.value)}
                                        placeholder="e.g. How It Works, Features, About Our Software"
                                        className="mt-1 text-base font-semibold"
                                    />
                                    <InputError message={errors.title} className="mt-1 text-xs" />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="slug" className="text-xs font-bold uppercase tracking-wider">
                                            URL Slug <span className="text-destructive">*</span>
                                        </Label>
                                        <div className="flex items-center mt-1">
                                            <span className="px-3 py-2 text-xs bg-muted border border-r-0 border-input rounded-l-md text-muted-foreground select-none">
                                                /p/
                                            </span>
                                            <Input
                                                id="slug"
                                                type="text"
                                                required
                                                value={data.slug}
                                                onChange={(e) => setData('slug', slugify(e.target.value))}
                                                placeholder="features"
                                                className="rounded-l-none font-mono text-xs"
                                            />
                                        </div>
                                        <InputError message={errors.slug} className="mt-1 text-xs" />
                                    </div>

                                    <div>
                                        <Label htmlFor="template" className="text-xs font-bold uppercase tracking-wider">
                                            Page Template Layout
                                        </Label>
                                        <select
                                            id="template"
                                            value={data.template}
                                            onChange={(e) => setData('template', e.target.value as any)}
                                            className="mt-1 w-full h-9 px-3 rounded-md text-xs bg-background border border-input focus:outline-hidden focus:ring-2 focus:ring-primary"
                                        >
                                            {templates.map((tpl) => (
                                                <option key={tpl.value} value={tpl.value}>
                                                    {tpl.label}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.template} className="mt-1 text-xs" />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="subtitle" className="text-xs font-bold uppercase tracking-wider">
                                        Subtitle / Summary Tagline
                                    </Label>
                                    <Input
                                        id="subtitle"
                                        type="text"
                                        value={data.subtitle}
                                        onChange={(e) => setData('subtitle', e.target.value)}
                                        placeholder="e.g. Next-generation automated QR print hub for Indian shops"
                                        className="mt-1 text-xs"
                                    />
                                    <InputError message={errors.subtitle} className="mt-1 text-xs" />
                                </div>
                            </Card>

                            {/* Rich Content Editor */}
                            <Card className="p-6 space-y-3 bg-card border-border shadow-xs">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="content" className="text-xs font-bold uppercase tracking-wider">
                                        Page Body Content (HTML / Markdown Supported)
                                    </Label>
                                    <span className="text-[11px] text-muted-foreground font-mono">
                                        {data.content ? `${data.content.length} characters` : 'Empty'}
                                    </span>
                                </div>

                                {/* Quick Formatting Toolbar */}
                                <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-muted/60 rounded-lg border border-border text-xs">
                                    <button
                                        type="button"
                                        onClick={() => setData('content', (data.content || '') + '<h2>Section Heading</h2>\n<p>Write your detailed section content here...</p>\n')}
                                        className="px-2 py-1 rounded bg-background hover:bg-card border border-border text-[11px] font-semibold"
                                    >
                                        + Add Heading
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setData('content', (data.content || '') + '<ul>\n  <li>Feature point 1</li>\n  <li>Feature point 2</li>\n</ul>\n')}
                                        className="px-2 py-1 rounded bg-background hover:bg-card border border-border text-[11px] font-semibold"
                                    >
                                        + Bullet List
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setData('content', (data.content || '') + '<div class="p-4 rounded-xl bg-primary/10 border border-primary/20 text-sm">\n  <strong>Highlighted Tip:</strong> Important announcement text.\n</div>\n')}
                                        className="px-2 py-1 rounded bg-background hover:bg-card border border-border text-[11px] font-semibold"
                                    >
                                        + Callout Box
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setData('content', (data.content || '') + '<a href="https://wa.me/919098132966" target="_blank" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-bold">Contact On WhatsApp</a>\n')}
                                        className="px-2 py-1 rounded bg-background hover:bg-card border border-border text-[11px] font-semibold"
                                    >
                                        + Button Link
                                    </button>
                                </div>

                                <textarea
                                    id="content"
                                    rows={12}
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    placeholder="Write your HTML or formatted markdown content here..."
                                    className="w-full p-4 rounded-lg text-sm bg-background border border-input font-mono focus:outline-hidden focus:ring-2 focus:ring-primary leading-relaxed"
                                />
                                <InputError message={errors.content} className="mt-1 text-xs" />
                            </Card>
                        </div>

                        {/* Sidebar Info (4 cols) */}
                        <div className="lg:col-span-4 space-y-5">
                            <Card className="p-5 space-y-4 bg-card border-border shadow-xs">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Layout Template Information
                                </h3>

                                <div className="space-y-3 text-xs">
                                    <div className={`p-3 rounded-lg border transition-all ${data.template === 'default' ? 'bg-primary/5 border-primary text-foreground' : 'bg-muted/30 border-border text-muted-foreground'}`}>
                                        <div className="font-bold flex items-center gap-1.5">
                                            <LayoutTemplate className="h-4 w-4 text-primary" />
                                            <span>Standard CMS Page</span>
                                        </div>
                                        <p className="text-[11px] mt-1">Renders with full website navigation header, container padding, and site footer.</p>
                                    </div>

                                    <div className={`p-3 rounded-lg border transition-all ${data.template === 'landing_section' ? 'bg-primary/5 border-primary text-foreground' : 'bg-muted/30 border-border text-muted-foreground'}`}>
                                        <div className="font-bold flex items-center gap-1.5">
                                            <Sparkles className="h-4 w-4 text-primary" />
                                            <span>Landing Section (Anchor)</span>
                                        </div>
                                        <p className="text-[11px] mt-1">Links to a smooth-scrolling section on the home page (e.g. <code>/#how-it-works</code>).</p>
                                    </div>

                                    <div className={`p-3 rounded-lg border transition-all ${data.template === 'legal' ? 'bg-primary/5 border-primary text-foreground' : 'bg-muted/30 border-border text-muted-foreground'}`}>
                                        <div className="font-bold flex items-center gap-1.5">
                                            <FileText className="h-4 w-4 text-primary" />
                                            <span>Legal Document</span>
                                        </div>
                                        <p className="text-[11px] mt-1">Structured for policies, terms, and formal declarations with date stamps.</p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {/* TAB 2: SEO & SOCIAL SHARING ENGINE */}
                {activeTab === 'seo' && (
                    <div className="space-y-6 animate-in fade-in duration-150">
                        {/* Live Google Search Snippet Preview */}
                        <Card className="p-6 bg-card border-border shadow-xs space-y-3">
                            <div className="flex items-center justify-between border-b border-border pb-2">
                                <div className="flex items-center gap-2">
                                    <Search className="h-4 w-4 text-primary" />
                                    <h3 className="text-xs font-bold uppercase tracking-wider">Google Search Result Preview</h3>
                                </div>
                                <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
                                    Desktop SERP Simulation
                                </Badge>
                            </div>

                            {/* Google SERP Card */}
                            <div className="p-4 rounded-xl bg-background border border-border space-y-1.5 max-w-2xl font-sans">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Globe className="h-3.5 w-3.5 text-primary" />
                                    <span className="truncate">{effectiveUrl}</span>
                                </div>
                                <div className="text-base font-medium text-sky-700 dark:text-sky-400 hover:underline cursor-pointer line-clamp-1">
                                    {effectiveTitle}
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                    {effectiveDescription}
                                </p>
                            </div>
                        </Card>

                        {/* Meta Tags Configuration */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="p-6 space-y-4 bg-card border-border shadow-xs">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Core Search Metadata
                                </h3>

                                <div>
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="meta_title" className="text-xs font-bold">Meta Title</Label>
                                        <span className="text-[10px] text-muted-foreground font-mono">
                                            {(data.meta_title || '').length} / 60 recommended
                                        </span>
                                    </div>
                                    <Input
                                        id="meta_title"
                                        type="text"
                                        value={data.meta_title}
                                        onChange={(e) => setData('meta_title', e.target.value)}
                                        placeholder="e.g. How It Works — Instant 5-Step QR Printing | Print Setu"
                                        className="mt-1 text-xs"
                                    />
                                    <InputError message={errors.meta_title} className="mt-1 text-xs" />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="meta_description" className="text-xs font-bold">Meta Description</Label>
                                        <span className="text-[10px] text-muted-foreground font-mono">
                                            {(data.meta_description || '').length} / 160 recommended
                                        </span>
                                    </div>
                                    <textarea
                                        id="meta_description"
                                        rows={3}
                                        value={data.meta_description}
                                        onChange={(e) => setData('meta_description', e.target.value)}
                                        placeholder="Provide a compelling 1-2 sentence summary to maximize Google click-through rate..."
                                        className="mt-1 w-full p-2.5 rounded-md text-xs bg-background border border-input resize-none focus:outline-hidden focus:ring-2 focus:ring-primary"
                                    />
                                    <InputError message={errors.meta_description} className="mt-1 text-xs" />
                                </div>

                                <div>
                                    <Label htmlFor="meta_keywords" className="text-xs font-bold">Meta Keywords (Comma separated)</Label>
                                    <Input
                                        id="meta_keywords"
                                        type="text"
                                        value={data.meta_keywords}
                                        onChange={(e) => setData('meta_keywords', e.target.value)}
                                        placeholder="e.g. qr print, cyber cafe, automated xerox shop, upi printing"
                                        className="mt-1 text-xs"
                                    />
                                    <InputError message={errors.meta_keywords} className="mt-1 text-xs" />
                                </div>

                                <div>
                                    <Label htmlFor="canonical_url" className="text-xs font-bold">Canonical URL (Optional)</Label>
                                    <Input
                                        id="canonical_url"
                                        type="url"
                                        value={data.canonical_url}
                                        onChange={(e) => setData('canonical_url', e.target.value)}
                                        placeholder="https://printsetu.in/p/features"
                                        className="mt-1 text-xs font-mono"
                                    />
                                    <InputError message={errors.canonical_url} className="mt-1 text-xs" />
                                </div>
                            </Card>

                            {/* OpenGraph & Social Sharing */}
                            <Card className="p-6 space-y-4 bg-card border-border shadow-xs">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <Share2 className="h-4 w-4 text-primary" />
                                    <span>Social Media (OpenGraph / Twitter)</span>
                                </h3>

                                <div>
                                    <Label htmlFor="og_title" className="text-xs font-bold">Social Share Title</Label>
                                    <Input
                                        id="og_title"
                                        type="text"
                                        value={data.og_title}
                                        onChange={(e) => setData('og_title', e.target.value)}
                                        placeholder="Leave blank to use Meta Title"
                                        className="mt-1 text-xs"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="og_description" className="text-xs font-bold">Social Share Description</Label>
                                    <textarea
                                        id="og_description"
                                        rows={3}
                                        value={data.og_description}
                                        onChange={(e) => setData('og_description', e.target.value)}
                                        placeholder="Leave blank to use Meta Description"
                                        className="mt-1 w-full p-2.5 rounded-md text-xs bg-background border border-input resize-none focus:outline-hidden focus:ring-2 focus:ring-primary"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="og_image" className="text-xs font-bold">Social Share Image URL</Label>
                                    <Input
                                        id="og_image"
                                        type="text"
                                        value={data.og_image}
                                        onChange={(e) => setData('og_image', e.target.value)}
                                        placeholder="https://printsetu.in/images/og-preview.png"
                                        className="mt-1 text-xs font-mono"
                                    />
                                </div>

                                {/* Robots Indexable Toggle */}
                                <div className="pt-3 border-t border-border flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <div className="font-bold text-xs">Search Engine Indexing</div>
                                        <div className="text-[11px] text-muted-foreground">Allow Google & Bing bots to index this page</div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.is_indexable}
                                            onChange={(e) => setData('is_indexable', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-9 h-5 bg-muted peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                                    </label>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {/* TAB 3: PUBLISH & VISIBILITY */}
                {activeTab === 'publish' && (
                    <div className="max-w-2xl space-y-6 animate-in fade-in duration-150">
                        <Card className="p-6 space-y-5 bg-card border-border shadow-xs">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Publication Status & Ordering
                            </h3>

                            <div className="space-y-3">
                                <Label className="text-xs font-bold">Select Publication State</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {[
                                        { value: 'published', label: 'Published (Live)', desc: 'Visible to public & indexed' },
                                        { value: 'draft', label: 'Draft (Private)', desc: 'Only visible to authorized staff' },
                                        { value: 'archived', label: 'Archived', desc: 'Hidden from navigation' },
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setData('status', opt.value as any)}
                                            className={`p-3.5 rounded-xl border text-left transition-all ${
                                                data.status === opt.value
                                                    ? 'border-primary bg-primary/10 ring-2 ring-primary/20 text-foreground font-bold'
                                                    : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/60'
                                            }`}
                                        >
                                            <div className="text-xs font-bold">{opt.label}</div>
                                            <div className="text-[10px] text-muted-foreground mt-0.5">{opt.desc}</div>
                                        </button>
                                    ))}
                                </div>
                                <InputError message={errors.status} className="mt-1 text-xs" />
                            </div>

                            <div className="pt-4 border-t border-border">
                                <Label htmlFor="sort_order" className="text-xs font-bold">
                                    Menu / Listing Sort Order Number
                                </Label>
                                <Input
                                    id="sort_order"
                                    type="number"
                                    value={data.sort_order}
                                    onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                    className="mt-1 max-w-xs text-xs"
                                />
                                <p className="text-[11px] text-muted-foreground mt-1">
                                    Lower numbers display first (e.g. 1 for Home, 2 for How It Works).
                                </p>
                            </div>
                        </Card>
                    </div>
                )}
            </form>
        </AppLayout>
    );
}
