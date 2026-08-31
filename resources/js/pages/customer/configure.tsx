import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, router } from '@inertiajs/react';
import {
    ArrowRight,
    CheckCircle2,
    Copy,
    CreditCard,
    FileText,
    Layers,
    Palette,
    Printer,
    Sparkles,
} from 'lucide-react';
import { useEffect, useState } from 'react';

type PaperSize = 'A4' | 'A3' | 'Letter' | 'Legal';
type ColorMode = 'bw' | 'color';
type Orientation = 'portrait' | 'landscape';
type PageSelectionType = 'all' | 'range' | 'odd' | 'even' | 'first';

type Config = {
    paper_size: PaperSize;
    color_mode: ColorMode;
    copies: number;
    duplex: boolean;
    orientation: Orientation;
    page_selection_type: PageSelectionType;
    page_range: string;
};

interface DocumentItem {
    id: number;
    name: string;
    size: number;
    pages: number;
}

interface ConfigureProps {
    shop: {
        name: string;
        slug: string;
    };
    documents: DocumentItem[];
    estimate_url: string;
    payment_url: string;
}

export default function Configure({
    shop,
    documents,
    estimate_url,
    payment_url,
}: ConfigureProps) {
    const [config, setConfig] = useState<Config>({
        paper_size: 'A4',
        color_mode: 'bw',
        copies: 1,
        duplex: false,
        orientation: 'portrait',
        page_selection_type: 'all',
        page_range: '',
    });

    const [total, setTotal] = useState<number | null>(null);
    const [rate, setRate] = useState<number>(2);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const totalPages = documents.reduce((sum, document) => sum + (document.pages || 1), 0);

    const getComputedPageRange = (): string | null => {
        if (config.page_selection_type === 'first') return '1';
        if (config.page_selection_type === 'odd') return 'odd';
        if (config.page_selection_type === 'even') return 'even';
        if (config.page_selection_type === 'range') return config.page_range.trim() || null;
        return null;
    };

    useEffect(() => {
        let active = true;
        setLoading(true);
        const csrf =
            document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

        fetch(estimate_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-CSRF-TOKEN': csrf,
            },
            body: JSON.stringify({
                paper_size: config.paper_size,
                color_mode: config.color_mode,
                copies: config.copies,
                duplex: config.duplex,
                orientation: config.orientation,
                page_range: getComputedPageRange(),
                documents: documents.map((document) => document.id),
            }),
        })
            .then(async (response) => {
                const body = await response.json();
                if (!response.ok) {
                    throw new Error(body.message || 'Unable to calculate estimate.');
                }
                if (active) {
                    setTotal(body.estimate.subtotal);
                    setRate(body.estimate.rate);
                    setError(null);
                }
            })
            .catch((reason) => {
                if (active) {
                    setError(reason.message);
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [config, documents, estimate_url]);

    const set = <K extends keyof Config>(key: K, value: Config[K]) => {
        setConfig((current) => ({ ...current, [key]: value }));
    };

    const handleContinueToPayment = () => {
        router.visit(payment_url, {
            method: 'get',
            data: {
                documents: documents.map((d) => d.id).join(','),
                paper_size: config.paper_size,
                color_mode: config.color_mode,
                copies: config.copies,
                duplex: config.duplex ? '1' : '0',
                orientation: config.orientation,
                page_range: getComputedPageRange() ?? '',
            },
        });
    };

    return (
        <>
            <Head title={`Configure Print | ${shop.name}`} />
            <main className="bg-gradient-to-b from-background via-muted/20 to-muted/40 min-h-screen py-6 px-4 sm:px-6">
                <div className="mx-auto max-w-5xl space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b pb-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Printer className="size-4" />
                                </span>
                                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                                    Configure Print
                                </h1>
                            </div>
                            <p className="text-muted-foreground text-sm mt-1">
                                {shop.name} · Step 2 of 3
                            </p>
                        </div>
                        <Badge variant="outline" className="w-fit text-xs font-normal py-1 px-2.5">
                            <Sparkles className="size-3 text-primary mr-1" />
                            Instant Cloud Queue
                        </Badge>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                        {/* Main Configuration Columns */}
                        <div className="space-y-6">
                            {/* Selected Files */}
                            <Card className="shadow-xs border">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center justify-between">
                                        <span className="flex items-center gap-2">
                                            <FileText className="size-4 text-primary" />
                                            Selected Documents ({documents.length})
                                        </span>
                                        <span className="text-xs text-muted-foreground font-normal">
                                            {totalPages} total {totalPages === 1 ? 'page' : 'pages'}
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {documents.map((document) => (
                                        <div
                                            key={document.id}
                                            className="flex items-center justify-between rounded-lg border bg-card/60 p-3 text-sm transition-colors hover:bg-muted/40"
                                        >
                                            <span className="flex min-w-0 items-center gap-2.5 truncate font-medium">
                                                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                                                    <FileText className="size-4" />
                                                </div>
                                                <span className="truncate">{document.name}</span>
                                            </span>
                                            <span className="text-muted-foreground shrink-0 text-xs font-medium bg-muted px-2 py-1 rounded">
                                                {document.pages || 1} page · {(document.size / 1024 / 1024).toFixed(1)} MB
                                            </span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Print Options */}
                            <Card className="shadow-xs border">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Palette className="size-4 text-primary" />
                                        Print Options
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    {/* Paper Size & Color Mode */}
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">
                                                Paper Size
                                            </label>
                                            <select
                                                value={config.paper_size}
                                                onChange={(e) =>
                                                    set('paper_size', e.target.value as PaperSize)
                                                }
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:border-ring focus:ring-1 focus:ring-ring outline-none"
                                            >
                                                <option value="A4">A4 (Standard)</option>
                                                <option value="A3">A3 (Large)</option>
                                                <option value="Letter">Letter</option>
                                                <option value="Legal">Legal</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">
                                                Color Mode
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => set('color_mode', 'bw')}
                                                    className={`flex items-center justify-center gap-2 rounded-md border p-2 text-sm font-medium transition-all ${
                                                        config.color_mode === 'bw'
                                                            ? 'border-primary bg-primary/10 text-primary font-semibold'
                                                            : 'border-input bg-background hover:bg-muted text-muted-foreground'
                                                    }`}
                                                >
                                                    <span className="size-3 rounded-full bg-foreground inline-block" />
                                                    Black & White
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => set('color_mode', 'color')}
                                                    className={`flex items-center justify-center gap-2 rounded-md border p-2 text-sm font-medium transition-all ${
                                                        config.color_mode === 'color'
                                                            ? 'border-primary bg-primary/10 text-primary font-semibold'
                                                            : 'border-input bg-background hover:bg-muted text-muted-foreground'
                                                    }`}
                                                >
                                                    <span className="size-3 rounded-full bg-gradient-to-r from-red-500 via-green-500 to-blue-500 inline-block" />
                                                    Color
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Copies & Orientation */}
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground flex items-center justify-between">
                                                <span>Copies</span>
                                                <span className="text-xs text-muted-foreground font-normal">
                                                    Max 99
                                                </span>
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() =>
                                                        set('copies', Math.max(1, config.copies - 1))
                                                    }
                                                    disabled={config.copies <= 1}
                                                >
                                                    -
                                                </Button>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="99"
                                                    value={config.copies}
                                                    onChange={(e) =>
                                                        set(
                                                            'copies',
                                                            Math.max(1, Math.min(99, Number(e.target.value) || 1))
                                                        )
                                                    }
                                                    className="w-full text-center rounded-md border border-input bg-background px-3 py-2 text-sm font-semibold shadow-xs focus:border-ring focus:ring-1 focus:ring-ring outline-none"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() =>
                                                        set('copies', Math.min(99, config.copies + 1))
                                                    }
                                                    disabled={config.copies >= 99}
                                                >
                                                    +
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">
                                                Orientation
                                            </label>
                                            <select
                                                value={config.orientation}
                                                onChange={(e) =>
                                                    set(
                                                        'orientation',
                                                        e.target.value as Orientation
                                                    )
                                                }
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:border-ring focus:ring-1 focus:ring-ring outline-none"
                                            >
                                                <option value="portrait">Portrait</option>
                                                <option value="landscape">Landscape</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Pages Selection */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground flex items-center justify-between">
                                            <span>Pages to Print</span>
                                            <span className="text-xs text-muted-foreground font-normal">
                                                Total {totalPages} {totalPages === 1 ? 'page' : 'pages'}
                                            </span>
                                        </label>
                                        <select
                                            value={config.page_selection_type}
                                            onChange={(e) =>
                                                set(
                                                    'page_selection_type',
                                                    e.target.value as PageSelectionType
                                                )
                                            }
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:border-ring focus:ring-1 focus:ring-ring outline-none"
                                        >
                                            <option value="all">All Pages (1-{totalPages})</option>
                                            <option value="range">Custom Page Range (e.g. 1-3, 5)</option>
                                            <option value="odd">Odd Pages Only (1, 3, 5...)</option>
                                            <option value="even">Even Pages Only (2, 4, 6...)</option>
                                            <option value="first">First Page Only (Page 1)</option>
                                        </select>
                                    </div>

                                    {/* Custom Page Range Box */}
                                    {config.page_selection_type === 'range' && (
                                        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2 animate-in fade-in duration-200">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-semibold text-foreground">
                                                    Enter Page Range
                                                </label>
                                                <span className="text-[11px] text-muted-foreground">
                                                    e.g. 1-3, 5, 8-10
                                                </span>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="e.g. 1-3, 5"
                                                value={config.page_range}
                                                onChange={(e) => set('page_range', e.target.value)}
                                                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm font-mono shadow-xs focus:border-ring focus:ring-1 focus:ring-ring outline-none"
                                            />
                                            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mr-1">
                                                    Presets:
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => set('page_range', '1')}
                                                    className="px-2 py-0.5 rounded-md border bg-background text-[11px] font-medium hover:bg-muted"
                                                >
                                                    Page 1
                                                </button>
                                                {totalPages >= 3 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => set('page_range', `1-${Math.min(3, totalPages)}`)}
                                                        className="px-2 py-0.5 rounded-md border bg-background text-[11px] font-medium hover:bg-muted"
                                                    >
                                                        Pages 1-{Math.min(3, totalPages)}
                                                    </button>
                                                )}
                                                {totalPages >= 5 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => set('page_range', `1-${Math.min(5, totalPages)}`)}
                                                        className="px-2 py-0.5 rounded-md border bg-background text-[11px] font-medium hover:bg-muted"
                                                    >
                                                        Pages 1-{Math.min(5, totalPages)}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Duplex / Double Side Checkbox */}
                                    <div className="rounded-lg border bg-muted/20 p-3">
                                        <label className="flex items-center gap-3 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={config.duplex}
                                                onChange={(e) => set('duplex', e.target.checked)}
                                                className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                            <div className="text-sm">
                                                <div className="font-medium text-foreground flex items-center gap-1.5">
                                                    <Layers className="size-3.5 text-primary" />
                                                    Double-sided printing (Duplex)
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Print on both sides of the sheet where supported
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Aside: Sticky Price Summary & Continue to Payment */}
                        <aside>
                            <Card className="sticky top-6 shadow-sm border">
                                <CardHeader className="pb-3 border-b bg-muted/10">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <CreditCard className="size-4 text-primary" />
                                        Price Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-4 text-sm">
                                    <div className="space-y-2.5 border-b pb-3.5">
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Files</span>
                                            <span className="font-medium text-foreground">
                                                {documents.length}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Pages</span>
                                            <span className="font-medium text-foreground">
                                                {totalPages}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Copies</span>
                                            <span className="font-medium text-foreground">
                                                {config.copies}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Print Mode</span>
                                            <span className="font-medium text-foreground">
                                                {config.color_mode === 'bw'
                                                    ? 'Black & White'
                                                    : 'Color'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Paper Size</span>
                                            <span className="font-medium text-foreground">
                                                {config.paper_size}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Duplex</span>
                                            <span className="font-medium text-foreground">
                                                {config.duplex ? 'Double Sided' : 'Single Sided'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-muted-foreground pt-1 text-xs">
                                            <span>Rate per page</span>
                                            <span>₹{rate}</span>
                                        </div>
                                    </div>

                                    {error && (
                                        <Alert variant="destructive">
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    )}

                                    <div className="rounded-lg bg-primary/5 p-3 flex justify-between items-baseline">
                                        <div>
                                            <span className="text-xs text-muted-foreground block">
                                                Estimated Total
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                ({totalPages * config.copies} impressions)
                                            </span>
                                        </div>
                                        <span className="text-2xl font-bold text-primary">
                                            {loading ? '…' : total === null ? '…' : `₹${total}`}
                                        </span>
                                    </div>

                                    <p className="text-muted-foreground text-xs leading-relaxed">
                                        Final price is confirmed by the shop before payment.
                                    </p>

                                    <Button
                                        className="w-full gap-2 text-sm font-semibold shadow-xs"
                                        size="lg"
                                        disabled={total === null || !!error || loading}
                                        onClick={handleContinueToPayment}
                                    >
                                        <CreditCard className="size-4" />
                                        Continue to Payment
                                        <ArrowRight className="size-4 ml-auto" />
                                    </Button>
                                </CardContent>
                            </Card>
                        </aside>
                    </div>
                </div>
            </main>
        </>
    );
}
