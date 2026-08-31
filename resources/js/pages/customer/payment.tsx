import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Banknote,
    CheckCircle2,
    Clock,
    FileText,
    Layers,
    Lock,
    Printer,
    QrCode,
    ShieldCheck,
    Sparkles,
    Store,
} from 'lucide-react';
import { FormEvent, useState } from 'react';

interface DocumentItem {
    id: number;
    name: string;
    size: number;
    pages: number;
}

interface PaymentProps {
    shop: {
        name: string;
        slug: string;
        online_payment_enabled?: boolean;
        counter_payment_enabled?: boolean;
        show_currency?: boolean;
        currency_symbol?: string;
        payment_modes?: string[];
    };
    documents: DocumentItem[];
    config: {
        paper_size: string;
        color_mode: string;
        copies: number;
        duplex: boolean;
        orientation: string;
        page_range?: string | null;
    };
    pricing: {
        rate: number;
        subtotal: number;
    };
    checkout_url: string;
    configure_url: string;
}

export default function Payment({
    shop,
    documents,
    config,
    pricing,
    checkout_url,
    configure_url,
}: PaymentProps) {
    const sym = shop.show_currency !== false ? (shop.currency_symbol || '₹') : '';
    const canCounter = shop.counter_payment_enabled !== false;
    const canOnline = shop.online_payment_enabled !== false;

    const [paymentMethod, setPaymentMethod] = useState<'counter' | 'upi'>(canCounter ? 'counter' : 'upi');

    const { data, post, processing, errors } = useForm({
        documents: documents.map((d) => d.id),
        paper_size: config.paper_size,
        color_mode: config.color_mode,
        copies: config.copies,
        duplex: config.duplex,
        orientation: config.orientation,
        page_range: config.page_range || null,
        payment_method: paymentMethod,
    });

    const totalPages = documents.reduce((sum, d) => sum + (d.pages || 1), 0);
    const totalImpressions = totalPages * config.copies;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(checkout_url);
    };

    return (
        <>
            <Head title={`Payment & Checkout | ${shop.name}`} />
            <main className="bg-gradient-to-b from-background via-muted/20 to-muted/40 min-h-screen py-6 px-4 sm:px-6">
                <div className="mx-auto max-w-4xl space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b pb-4">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" asChild className="shrink-0">
                                <Link href={configure_url} title="Back to Configure">
                                    <ArrowLeft className="size-4" />
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                                    <span>Payment & Confirmation</span>
                                </h1>
                                <p className="text-muted-foreground text-sm mt-0.5">
                                    {shop.name} · Step 3 of 3
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge
                                variant="outline"
                                className="text-xs font-normal py-1 px-2.5 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
                            >
                                <ShieldCheck className="size-3 mr-1 inline" />
                                Encrypted & Safe
                            </Badge>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                            {/* Main Content: Order Details & Payment Method Selection */}
                            <div className="space-y-6">
                                {/* Order Summary Card */}
                                <Card className="shadow-xs border">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <FileText className="size-4 text-primary" />
                                            Order & Print Summary
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Files list */}
                                        <div className="space-y-2">
                                            {documents.map((doc) => (
                                                <div
                                                    key={doc.id}
                                                    className="flex items-center justify-between rounded-lg border bg-card/60 p-3 text-sm"
                                                >
                                                    <span className="flex min-w-0 items-center gap-2.5 truncate font-medium">
                                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                                                            <FileText className="size-4" />
                                                        </div>
                                                        <span className="truncate">{doc.name}</span>
                                                    </span>
                                                    <span className="text-muted-foreground text-xs shrink-0 font-medium">
                                                        {doc.pages || 1} page ·{' '}
                                                        {(doc.size / 1024 / 1024).toFixed(1)} MB
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Configuration Badges */}
                                        <div className="rounded-lg bg-muted/40 p-3.5 border text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            <div>
                                                <span className="text-muted-foreground block text-[11px]">
                                                    Paper Size
                                                </span>
                                                <span className="font-semibold text-foreground text-sm">
                                                    {config.paper_size}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground block text-[11px]">
                                                    Color Mode
                                                </span>
                                                <span className="font-semibold text-foreground text-sm">
                                                    {config.color_mode === 'bw'
                                                        ? 'Black & White'
                                                        : 'Color'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground block text-[11px]">
                                                    Copies
                                                </span>
                                                <span className="font-semibold text-foreground text-sm">
                                                    {config.copies}{' '}
                                                    {config.copies === 1 ? 'copy' : 'copies'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground block text-[11px]">
                                                    Side Mode
                                                </span>
                                                <span className="font-semibold text-foreground text-sm">
                                                    {config.duplex ? 'Double Sided' : 'Single Sided'}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                 {/* Payment Method Selection */}
                                <Card className="shadow-xs border">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Banknote className="size-4 text-primary" />
                                            Choose Payment Option
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {/* Option 1: Pay at Counter */}
                                        {canCounter && (
                                            <label
                                                onClick={() => setPaymentMethod('counter')}
                                                className={`relative flex cursor-pointer items-start gap-3.5 rounded-xl border p-4 transition-all ${
                                                    paymentMethod === 'counter'
                                                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                                        : 'border-input bg-card hover:bg-muted/30'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="payment_method"
                                                    value="counter"
                                                    checked={paymentMethod === 'counter'}
                                                    onChange={() => setPaymentMethod('counter')}
                                                    className="sr-only"
                                                />
                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                    <Store className="size-5" />
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-semibold text-sm text-foreground">
                                                            Pay at Shop Counter (Cash / QR)
                                                        </span>
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-[10px] bg-primary/10 text-primary font-medium"
                                                        >
                                                            Recommended
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                                        Sends job directly to the shop printer right now.
                                                        You can pay in cash or via counter UPI when
                                                        collecting your print.
                                                    </p>
                                                </div>
                                            </label>
                                        )}

                                        {/* Option 2: Instant Online/UPI Payment */}
                                        {canOnline && (
                                            <label
                                                onClick={() => setPaymentMethod('upi')}
                                                className={`relative flex cursor-pointer items-start gap-3.5 rounded-xl border p-4 transition-all ${
                                                    paymentMethod === 'upi'
                                                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                                        : 'border-input bg-card hover:bg-muted/30'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="payment_method"
                                                    value="upi"
                                                    checked={paymentMethod === 'upi'}
                                                    onChange={() => setPaymentMethod('upi')}
                                                    className="sr-only"
                                                />
                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                    <QrCode className="size-5" />
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-semibold text-sm text-foreground">
                                                            Direct Online / UPI Payment
                                                        </span>
                                                        <span className="text-[11px] text-muted-foreground">
                                                            GPay · PhonePe · Paytm · Cards
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                                        Pay digitally and queue print job automatically.
                                                    </p>
                                                </div>
                                            </label>
                                        )}

                                        {/* Quick notice */}
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                                            <Clock className="size-3.5 text-primary" />
                                            <span>
                                                Print job will be picked up by the local printer agent
                                                instantly.
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Aside: Sticky Checkout Summary */}
                            <aside>
                                <Card className="sticky top-6 shadow-sm border">
                                    <CardHeader className="pb-3 border-b bg-muted/10">
                                        <CardTitle className="text-base flex items-center justify-between">
                                            <span>Payable Summary</span>
                                            <Badge variant="outline" className="text-[11px]">
                                                {config.copies} × {totalPages} pages
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4 pt-4 text-sm">
                                        <div className="space-y-2 border-b pb-3 text-xs">
                                            <div className="flex justify-between text-muted-foreground">
                                                <span>Total Documents</span>
                                                <span className="font-medium text-foreground">
                                                    {documents.length}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-muted-foreground">
                                                <span>Pages per copy</span>
                                                <span className="font-medium text-foreground">
                                                    {totalPages}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-muted-foreground">
                                                <span>Number of copies</span>
                                                <span className="font-medium text-foreground">
                                                    {config.copies}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-muted-foreground">
                                                <span>Rate per page</span>
                                                <span className="font-medium text-foreground">
                                                    {sym}{pricing.rate}
                                                </span>
                                            </div>
                                            {config.page_range && (
                                                <div className="flex justify-between text-muted-foreground">
                                                    <span>Page Range</span>
                                                    <span className="font-medium font-mono text-foreground">
                                                        {config.page_range}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-muted-foreground">
                                                <span>Total Print Impressions</span>
                                                <span className="font-medium text-foreground">
                                                    {totalImpressions}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Final Amount */}
                                        <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 flex justify-between items-center">
                                            <div>
                                                <span className="text-xs font-medium text-muted-foreground block">
                                                    Total Amount
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    All taxes included
                                                </span>
                                            </div>
                                            <span className="text-3xl font-extrabold text-primary">
                                                {sym}{pricing.subtotal}
                                            </span>
                                        </div>

                                        {errors.documents && (
                                            <Alert variant="destructive">
                                                <AlertDescription>
                                                    {errors.documents}
                                                </AlertDescription>
                                            </Alert>
                                        )}

                                        {/* Submit Button */}
                                        <Button
                                            type="submit"
                                            className="w-full gap-2 text-sm font-semibold shadow-md py-6"
                                            size="lg"
                                            disabled={processing}
                                        >
                                            <Printer className="size-5" />
                                            {processing ? 'Processing Print Job…' : 'Pay & Print Now'}
                                        </Button>

                                        <div className="text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1.5 pt-1">
                                            <Lock className="size-3" />
                                            <span>Safe & Secure 256-bit automated print queue</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </aside>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
}
