import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Banknote,
    Check,
    CheckCircle2,
    Clock,
    CreditCard,
    ExternalLink,
    FileText,
    Layers,
    Lock,
    Printer,
    QrCode,
    ShieldCheck,
    Smartphone,
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
        gateway_provider?: string;
        upi_id?: string;
        merchant_name?: string;
        default_online_submode?: string;
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

    // Default to Online if available
    const [paymentMethod, setPaymentMethod] = useState<'counter' | 'online'>(canOnline ? 'online' : 'counter');
    const [onlineSubMode, setOnlineSubMode] = useState<'upi' | 'card'>(
        shop.default_online_submode === 'card' ? 'card' : 'upi'
    );
    const [copiedUpi, setCopiedUpi] = useState<boolean>(false);

    const { data, post, processing, errors } = useForm({
        documents: documents.map((d) => d.id),
        paper_size: config.paper_size,
        color_mode: config.color_mode,
        copies: config.copies,
        duplex: config.duplex,
        orientation: config.orientation,
        page_range: config.page_range || null,
        payment_method: paymentMethod === 'online' ? (onlineSubMode === 'card' ? 'card' : 'upi') : 'counter',
    });

    const shopUpiId = shop.upi_id || 'merchant@upi';
    const shopMerchantName = shop.merchant_name || shop.name;
    const upiAmount = pricing.subtotal.toFixed(2);
    const upiTransactionNote = `PrintOrder-${shop.slug.substring(0, 8)}`;
    const upiUri = `upi://pay?pa=${encodeURIComponent(shopUpiId)}&pn=${encodeURIComponent(shopMerchantName)}&am=${upiAmount}&cu=INR&tn=${encodeURIComponent(upiTransactionNote)}`;
    const phonepeUri = `phonepe://pay?pa=${encodeURIComponent(shopUpiId)}&pn=${encodeURIComponent(shopMerchantName)}&am=${upiAmount}&cu=INR&tn=${encodeURIComponent(upiTransactionNote)}`;
    const paytmUri = `paytmmp://pay?pa=${encodeURIComponent(shopUpiId)}&pn=${encodeURIComponent(shopMerchantName)}&am=${upiAmount}&cu=INR&tn=${encodeURIComponent(upiTransactionNote)}`;
    const qrCodeImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(upiUri)}`;

    const handleCopyUpiId = () => {
        if (shopUpiId) {
            navigator.clipboard.writeText(shopUpiId);
            setCopiedUpi(true);
            setTimeout(() => setCopiedUpi(false), 2000);
        }
    };

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
                                <Card className="shadow-xs border overflow-hidden">
                                    <CardHeader className="pb-3 bg-muted/15 border-b">
                                        <CardTitle className="text-base flex items-center justify-between">
                                            <span className="flex items-center gap-2">
                                                <Banknote className="size-4 text-primary" />
                                                Choose Payment Option
                                            </span>
                                            <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-medium">
                                                <ShieldCheck className="size-3 mr-1 inline" />
                                                Instant Verification
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 space-y-4">
                                        {/* Primary Selection: Online vs Counter */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {/* Option 1: Direct Online / UPI Payment (Default Selected) */}
                                            {canOnline && (
                                                <label
                                                    onClick={() => setPaymentMethod('online')}
                                                    className={`relative flex cursor-pointer items-start gap-3.5 rounded-xl border p-4 transition-all ${
                                                        paymentMethod === 'online'
                                                            ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-xs'
                                                            : 'border-input bg-card hover:bg-muted/30'
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="payment_method"
                                                        value="online"
                                                        checked={paymentMethod === 'online'}
                                                        onChange={() => setPaymentMethod('online')}
                                                        className="sr-only"
                                                    />
                                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                                                        <QrCode className="size-5" />
                                                    </div>
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-semibold text-sm text-foreground">
                                                                Pay Online (UPI / Card)
                                                            </span>
                                                            <Badge variant="secondary" className="text-[10px] bg-blue-500/10 text-blue-600 font-bold">
                                                                Recommended
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                                            Instant digital payment via GPay, PhonePe, Paytm, BHIM or Cards.
                                                        </p>
                                                    </div>
                                                </label>
                                            )}

                                            {/* Option 2: Pay at Counter */}
                                            {canCounter && (
                                                <label
                                                    onClick={() => setPaymentMethod('counter')}
                                                    className={`relative flex cursor-pointer items-start gap-3.5 rounded-xl border p-4 transition-all ${
                                                        paymentMethod === 'counter'
                                                            ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-xs'
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
                                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                                                        <Store className="size-5" />
                                                    </div>
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-semibold text-sm text-foreground">
                                                                Pay at Shop Counter
                                                            </span>
                                                            <Badge
                                                                variant="secondary"
                                                                className="text-[10px] bg-emerald-500/10 text-emerald-600 font-medium"
                                                            >
                                                                Cash / QR
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                                            Job spools immediately. Pay in cash or QR at counter when collecting print.
                                                        </p>
                                                    </div>
                                                </label>
                                            )}
                                        </div>

                                        {/* Online Sub-selection & Dynamic UPI QR Section */}
                                        {paymentMethod === 'online' && (
                                            <div className="p-4 rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/5 via-background to-muted/20 space-y-4">
                                                {/* Sub-mode Tabs (UPI vs Card) */}
                                                <div className="flex items-center justify-between border-b pb-3">
                                                    <div className="space-y-0.5">
                                                        <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                                                            <Smartphone className="size-4 text-primary" />
                                                            Online Payment Mode
                                                        </span>
                                                        <p className="text-xs text-muted-foreground">
                                                            UPI is selected by default for fast mobile payment.
                                                        </p>
                                                    </div>
                                                    <div className="flex bg-muted/60 p-1 rounded-lg border">
                                                        <button
                                                            type="button"
                                                            onClick={() => setOnlineSubMode('upi')}
                                                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                                                                onlineSubMode === 'upi'
                                                                    ? 'bg-primary text-primary-foreground shadow-xs'
                                                                    : 'text-muted-foreground hover:text-foreground'
                                                            }`}
                                                        >
                                                            <QrCode className="size-3.5" />
                                                            UPI (Default)
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setOnlineSubMode('card')}
                                                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                                                                onlineSubMode === 'card'
                                                                    ? 'bg-primary text-primary-foreground shadow-xs'
                                                                    : 'text-muted-foreground hover:text-foreground'
                                                            }`}
                                                        >
                                                            <CreditCard className="size-3.5" />
                                                            Card / NetBanking
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Sub-option 1: UPI Dynamic QR & App Intent (Default Active) */}
                                                {onlineSubMode === 'upi' && (
                                                    <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4 items-center">
                                                        <div className="flex flex-col items-center justify-center p-3 rounded-xl border bg-background shadow-xs text-center">
                                                            <img
                                                                src={qrCodeImgUrl}
                                                                alt="Scan UPI QR"
                                                                className="size-32 object-contain rounded-md"
                                                            />
                                                            <span className="text-[11px] font-bold text-foreground mt-2">
                                                                Scan & Pay {sym}{pricing.subtotal.toFixed(2)}
                                                            </span>
                                                        </div>

                                                        <div className="space-y-3">
                                                            <div className="space-y-1">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-xs font-semibold text-foreground">
                                                                        Merchant UPI VPA
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={handleCopyUpiId}
                                                                        className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                                                                    >
                                                                        {copiedUpi ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                                                                        {copiedUpi ? 'Copied' : 'Copy ID'}
                                                                    </button>
                                                                </div>
                                                                <div className="p-2.5 rounded-lg border bg-background font-mono text-xs text-foreground flex items-center justify-between">
                                                                    <span className="truncate">{shopUpiId}</span>
                                                                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 shrink-0">
                                                                        {shopMerchantName}
                                                                    </Badge>
                                                                </div>
                                                            </div>

                                                            {/* 1-Tap App Deep-links for Mobile Users */}
                                                            <div className="space-y-1.5">
                                                                <span className="text-[11px] font-semibold text-muted-foreground block">
                                                                    Or Open Directly in UPI App:
                                                                </span>
                                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                                    <a
                                                                        href={phonepeUri}
                                                                        className="p-2 rounded-lg border bg-background hover:bg-muted/40 text-center text-xs font-bold flex items-center justify-center gap-1 transition-colors text-foreground"
                                                                    >
                                                                        <span className="text-purple-600 font-extrabold">Ph</span>onePe
                                                                    </a>
                                                                    <a
                                                                        href={paytmUri}
                                                                        className="p-2 rounded-lg border bg-background hover:bg-muted/40 text-center text-xs font-bold flex items-center justify-center gap-1 transition-colors text-foreground"
                                                                    >
                                                                        <span className="text-sky-500 font-extrabold">Pay</span>tm
                                                                    </a>
                                                                    <a
                                                                        href={upiUri}
                                                                        className="p-2 rounded-lg border bg-background hover:bg-muted/40 text-center text-xs font-bold flex items-center justify-center gap-1 transition-colors text-primary"
                                                                    >
                                                                        <ExternalLink className="size-3" /> GPay / Any
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Sub-option 2: Debit / Credit Card / NetBanking */}
                                                {onlineSubMode === 'card' && (
                                                    <div className="p-4 rounded-xl border bg-background shadow-xs space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <CreditCard className="size-5 text-blue-600" />
                                                                <span className="font-bold text-sm text-foreground">
                                                                    Debit & Credit Cards / NetBanking
                                                                </span>
                                                            </div>
                                                            <Badge variant="outline" className="text-[10px]">
                                                                {shop.gateway_provider ? shop.gateway_provider.toUpperCase() : 'RAZORPAY'}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                                            Secure online payment gateway supporting all Indian & international cards, netbanking and wallets.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Quick notice */}
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                                            <Clock className="size-3.5 text-primary" />
                                            <span>
                                                Print job will be picked up by the local printer agent instantly.
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
                                            className="w-full gap-2 text-sm font-bold shadow-md py-6 rounded-xl"
                                            size="lg"
                                            disabled={processing}
                                        >
                                            {processing ? (
                                                'Processing Print Job…'
                                            ) : paymentMethod === 'counter' ? (
                                                <>
                                                    <Printer className="size-5" />
                                                    Pay at Counter & Print ({sym}{pricing.subtotal.toFixed(2)})
                                                </>
                                            ) : onlineSubMode === 'upi' ? (
                                                <>
                                                    <QrCode className="size-5" />
                                                    Pay via UPI & Print ({sym}{pricing.subtotal.toFixed(2)})
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCard className="size-5" />
                                                    Pay via Card & Print ({sym}{pricing.subtotal.toFixed(2)})
                                                </>
                                            )}
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
