import { Head, Link, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import FrontHeader from '@/components/front-header';
import FrontFooter from '@/components/front-footer';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft,
    Clock,
    FileText,
    ShieldCheck,
    Sparkles,
    AlertTriangle,
    Eye,
    Globe,
    Share2,
    Calendar
} from 'lucide-react';

interface PublicPageProps {
    page: {
        id: number;
        title: string;
        slug: string;
        subtitle?: string | null;
        content?: string | null;
        template: string;
        status: string;
        published_at?: string | null;
        updated_at?: string | null;
        meta_title: string;
        meta_description: string;
        meta_keywords?: string | null;
        canonical_url?: string | null;
        og_image?: string | null;
        og_title?: string | null;
        og_description?: string | null;
        is_indexable: boolean;
    };
    isPreview?: boolean;
}

export default function PublicPageShow({ page, isPreview }: PublicPageProps) {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title={page.meta_title}>
                <meta name="description" content={page.meta_description} />
                {page.meta_keywords && <meta name="keywords" content={page.meta_keywords} />}
                {page.canonical_url && <link rel="canonical" href={page.canonical_url} />}
                <meta name="robots" content={page.is_indexable ? 'index, follow' : 'noindex, nofollow'} />

                {/* OpenGraph */}
                <meta property="og:title" content={page.og_title || page.meta_title} />
                <meta property="og:description" content={page.og_description || page.meta_description} />
                {page.og_image && <meta property="og:image" content={page.og_image} />}
                <meta property="og:type" content="article" />

                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary selection:text-primary-foreground">
                <FrontHeader auth={auth} />

                {/* Draft Preview Warning Banner */}
                {isPreview && (
                    <div className="fixed top-16 inset-x-0 z-40 bg-amber-500 text-amber-950 px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md">
                        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
                            <AlertTriangle className="h-4 w-4 shrink-0" />
                            <span>
                                <strong>Admin Draft Preview Mode:</strong> This page is currently saved as Draft and is only visible to authenticated administrators.
                            </span>
                            <Button asChild size="sm" variant="outline" className="ml-auto h-7 text-xs bg-white text-black border-none hover:bg-white/90">
                                <Link href={route('pages.edit', page.id)}>
                                    Edit in Admin
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}

                <main className={`grow pt-28 pb-20 md:pt-36 ${isPreview ? 'mt-8' : ''}`}>
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

                        {/* Breadcrumbs & Navigation */}
                        <div className="flex items-center justify-between gap-4">
                            <Button asChild variant="outline" size="sm" className="gap-2 text-xs border-border bg-card hover:bg-muted">
                                <Link href="/">
                                    <ArrowLeft className="h-3.5 w-3.5" />
                                    <span>Back to Home</span>
                                </Link>
                            </Button>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                                <span>/p/{page.slug}</span>
                            </div>
                        </div>

                        {/* Page Header */}
                        <div className="space-y-4 pb-8 border-b border-border">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
                                <Sparkles className="h-3.5 w-3.5" />
                                <span>Official QRPrintSetu Guide & Documentation</span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-balance leading-[1.15]">
                                {page.title}
                            </h1>

                            {page.subtitle && (
                                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                                    {page.subtitle}
                                </p>
                            )}

                            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2">
                                {page.published_at && (
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5 text-primary" />
                                        <span>Published: {page.published_at}</span>
                                    </span>
                                )}
                                {page.updated_at && (
                                    <>
                                        <span>•</span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5 text-primary" />
                                            <span>Updated: {page.updated_at}</span>
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Page Body Content */}
                        <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80 prose-img:rounded-xl prose-img:shadow-md text-base leading-relaxed">
                            {page.content ? (
                                <div
                                    dangerouslySetInnerHTML={{ __html: page.content }}
                                    className="space-y-4 font-sans"
                                />
                            ) : (
                                <div className="p-12 text-center text-muted-foreground bg-card rounded-2xl border border-border">
                                    <FileText className="h-10 w-10 mx-auto mb-2 text-muted-foreground/40" />
                                    <p className="font-semibold text-foreground">Content is being updated</p>
                                    <p className="text-xs mt-1">Please check back shortly or explore our counter automation tools.</p>
                                </div>
                            )}
                        </div>

                        {/* Quick CTA Card */}
                        <Card className="p-8 rounded-2xl bg-gradient-to-r from-primary/15 via-primary/5 to-card border border-primary/25 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="space-y-1.5 text-center sm:text-left">
                                <h3 className="text-lg font-bold">Automate your print counter today</h3>
                                <p className="text-xs text-muted-foreground max-w-md">
                                    Join hundreds of cyber cafes across India saving hours every day with zero-touch QR printing.
                                </p>
                            </div>
                            <Button asChild size="lg" className="font-semibold shadow-md bg-primary hover:bg-primary/90 text-primary-foreground">
                                <Link href="/register">
                                    <span>Setup Free Shop</span>
                                </Link>
                            </Button>
                        </Card>
                    </div>
                </main>

                <FrontFooter />
            </div>
        </>
    );
}
