import { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import FrontHeader from '@/components/front-header';
import FrontFooter from '@/components/front-footer';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    CircleDollarSign,
    Check,
    ArrowRight,
    ArrowLeft,
    Sparkles,
    Printer,
    FileText,
    ShieldCheck,
    CreditCard,
    Layers,
    Laptop,
    HelpCircle,
    SlidersHorizontal,
    QrCode,
    Clock,
    PhoneCall,
    Building2,
    Calculator
} from 'lucide-react';

export default function PricingPage() {
    const { auth } = usePage<SharedData>().props;
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    // Interactive Rate Card Calculator State
    const [calcColor, setCalcColor] = useState<'bw' | 'color'>('bw');
    const [calcPages, setCalcPages] = useState<number>(5);
    const [calcCopies, setCalcCopies] = useState<number>(1);
    const [calcDuplex, setCalcDuplex] = useState<boolean>(false);

    // Calculate sample price in INR
    const baseRate = calcColor === 'bw' ? (calcDuplex ? 1.75 : 2.0) : (calcDuplex ? 9.0 : 10.0);
    const estimatedINR = (calcPages * baseRate * calcCopies).toFixed(2);

    return (
        <>
            <Head title="Products, Services & Pricing in INR (₹) — Print Setu">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary selection:text-primary-foreground">
                <FrontHeader auth={auth} />

                <main className="grow pt-28 pb-20 md:pt-36">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Breadcrumbs & Navigation */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                            <Button asChild variant="outline" size="sm" className="gap-2 text-xs border-border bg-card hover:bg-muted">
                                <Link href="/">
                                    <ArrowLeft className="h-3.5 w-3.5" />
                                    <span>Back to Home</span>
                                </Link>
                            </Button>
                            <div className="flex flex-wrap items-center gap-2">
                                <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                                    <Link href="/terms-and-conditions">Terms & Conditions</Link>
                                </Button>
                                <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                                    <Link href="/refund-policy">Refund Policy</Link>
                                </Button>
                                <Button asChild variant="ghost" size="sm" className="text-xs text-primary font-semibold hover:bg-primary/10">
                                    <Link href="/contact-us">Contact Us</Link>
                                </Button>
                            </div>
                        </div>

                        {/* Page Header */}
                        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
                                <CircleDollarSign className="h-3.5 w-3.5" />
                                <span>Official Rate Card & SaaS Pricing in Indian Rupees (INR / ₹)</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
                                Products, Services & Pricing
                            </h1>
                            <p className="text-base text-muted-foreground leading-relaxed">
                                Complete transparency for walk-in retail print customers and shop owners. All services are charged and settled strictly in <strong>Indian Rupees (INR / ₹)</strong> with zero hidden fees.
                            </p>
                        </div>

                        {/* SECTION 1: PRODUCTS & SERVICES CATALOG */}
                        <div className="mb-20 space-y-8">
                            <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                    <h2 className="text-2xl font-bold tracking-tight">1. Services & Product Offerings</h2>
                                    <p className="text-xs text-muted-foreground">Comprehensive cloud-driven document print solutions for retail counters.</p>
                                </div>
                                <Badge variant="outline" className="text-xs text-primary border-primary/25 bg-primary/5 w-fit">
                                    All Hardware Brands Supported
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Service 1 */}
                                <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all space-y-3">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-bold text-base">Self-Service QR Printing</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Walk-in customers scan the countertop QR code, upload documents (PDF, DOCX, JPG, PNG), select preferences, and pay via UPI in seconds.
                                    </p>
                                    <div className="pt-2 text-[11px] font-semibold text-primary">
                                        Starting at ₹2.00 INR / page
                                    </div>
                                </Card>

                                {/* Service 2 */}
                                <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all space-y-3">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                                        <Laptop className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-bold text-base">Windows Spooler Agent</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Lightweight desktop background client linking local Canon, HP, Epson, Brother & Konica Minolta printers with real-time cloud job release.
                                    </p>
                                    <div className="pt-2 text-[11px] font-semibold text-primary">
                                        Included in All Plans
                                    </div>
                                </Card>

                                {/* Service 3 */}
                                <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all space-y-3">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                                        <QrCode className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-bold text-base">Countertop Acrylic QR Stands</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Pre-formatted acrylic shop counter stands and high-resolution posters with custom shop branding for easy walk-in customer scanning.
                                    </p>
                                    <div className="pt-2 text-[11px] font-semibold text-primary">
                                        Free Starter Physical Kit
                                    </div>
                                </Card>

                                {/* Service 4 */}
                                <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all space-y-3">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                                        <Building2 className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-bold text-base">Enterprise Multi-Store SaaS</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Centralized multi-counter and franchise dashboard for college campuses, stationery chains, and large printing facilities.
                                    </p>
                                    <div className="pt-2 text-[11px] font-semibold text-primary">
                                        ₹1,199 to ₹1,499 INR / month
                                    </div>
                                </Card>
                            </div>
                        </div>

                        {/* SECTION 2: RETAIL DOCUMENT PRINTING RATE CARD & ESTIMATOR */}
                        <div className="mb-20 p-8 rounded-3xl bg-muted/40 border border-border">
                            <div className="max-w-4xl mx-auto space-y-8">
                                <div className="text-center space-y-2">
                                    <Badge variant="secondary" className="px-3 py-1 text-xs font-semibold bg-primary/10 text-primary border-primary/20">
                                        <Calculator className="h-3.5 w-3.5 mr-1" />
                                        Retail Consumer Print Rate Card
                                    </Badge>
                                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                                        Standard Document Printing Rates in INR (₹)
                                    </h2>
                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                        Shopkeepers can configure custom rate cards from their dashboard. Below is our standard default retail rate structure in Indian Rupees:
                                    </p>
                                </div>

                                {/* Rate Card Table */}
                                <div className="overflow-x-auto rounded-2xl border border-border bg-card">
                                    <table className="w-full text-left text-xs sm:text-sm">
                                        <thead className="bg-muted/60 text-muted-foreground uppercase text-[11px] font-bold border-b border-border">
                                            <tr>
                                                <th className="p-4">Print Service Type</th>
                                                <th className="p-4">Paper Size / Spec</th>
                                                <th className="p-4">Single Sided Rate (INR)</th>
                                                <th className="p-4">Duplex / Double Sided (INR)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border font-medium">
                                            <tr>
                                                <td className="p-4 font-bold text-foreground">Black & White (Mono)</td>
                                                <td className="p-4 text-muted-foreground">A4 Standard 75 GSM</td>
                                                <td className="p-4 text-primary font-bold">₹2.00 INR / page</td>
                                                <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold">₹3.50 INR / sheet (₹1.75/side)</td>
                                            </tr>
                                            <tr>
                                                <td className="p-4 font-bold text-foreground">Black & White (Mono)</td>
                                                <td className="p-4 text-muted-foreground">Legal / FS Size</td>
                                                <td className="p-4 text-primary font-bold">₹3.00 INR / page</td>
                                                <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold">₹5.00 INR / sheet</td>
                                            </tr>
                                            <tr>
                                                <td className="p-4 font-bold text-foreground">Color Document Print</td>
                                                <td className="p-4 text-muted-foreground">A4 Standard Graphics</td>
                                                <td className="p-4 text-primary font-bold">₹10.00 INR / page</td>
                                                <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold">₹18.00 INR / sheet (₹9.00/side)</td>
                                            </tr>
                                            <tr>
                                                <td className="p-4 font-bold text-foreground">High-Gloss Photo / Certificate</td>
                                                <td className="p-4 text-muted-foreground">180 GSM Glossy Paper</td>
                                                <td className="p-4 text-primary font-bold">₹25.00 INR / page</td>
                                                <td className="p-4 text-muted-foreground">N/A (Single side only)</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Live Rate Calculator Interactive Box */}
                                <Card className="p-6 bg-card border-border space-y-4">
                                    <div className="flex items-center justify-between border-b border-border pb-3">
                                        <h3 className="font-bold text-sm flex items-center gap-1.5">
                                            <SlidersHorizontal className="h-4 w-4 text-primary" />
                                            <span>Interactive Print Cost Estimator</span>
                                        </h3>
                                        <span className="text-xs text-muted-foreground">Real-time Calculation</span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                                        {/* Color Selection */}
                                        <div className="space-y-1.5">
                                            <label className="font-semibold block text-muted-foreground">Color Mode</label>
                                            <div className="grid grid-cols-2 gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setCalcColor('bw')}
                                                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-colors ${calcColor === 'bw' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                                                >
                                                    B&W
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setCalcColor('color')}
                                                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-colors ${calcColor === 'color' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                                                >
                                                    Color
                                                </button>
                                            </div>
                                        </div>

                                        {/* Page Count */}
                                        <div className="space-y-1.5">
                                            <label className="font-semibold block text-muted-foreground">Page Count</label>
                                            <input
                                                type="number"
                                                min={1}
                                                max={500}
                                                value={calcPages}
                                                onChange={(e) => setCalcPages(Math.max(1, parseInt(e.target.value) || 1))}
                                                className="w-full px-3 py-1.5 rounded-lg border border-input bg-background font-mono text-xs"
                                            />
                                        </div>

                                        {/* Copies */}
                                        <div className="space-y-1.5">
                                            <label className="font-semibold block text-muted-foreground">Copies</label>
                                            <input
                                                type="number"
                                                min={1}
                                                max={50}
                                                value={calcCopies}
                                                onChange={(e) => setCalcCopies(Math.max(1, parseInt(e.target.value) || 1))}
                                                className="w-full px-3 py-1.5 rounded-lg border border-input bg-background font-mono text-xs"
                                            />
                                        </div>

                                        {/* Duplex Toggle */}
                                        <div className="space-y-1.5">
                                            <label className="font-semibold block text-muted-foreground">Duplex Print</label>
                                            <button
                                                type="button"
                                                onClick={() => setCalcDuplex(!calcDuplex)}
                                                className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold transition-colors ${calcDuplex ? 'bg-emerald-600 text-white' : 'bg-muted text-muted-foreground'}`}
                                            >
                                                {calcDuplex ? 'Double-Sided: YES' : 'Single-Sided'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
                                        <div className="text-xs text-muted-foreground">
                                            Estimated calculation for {calcPages} page(s) × {calcCopies} copy/copies ({calcColor.toUpperCase()}, {calcDuplex ? 'Duplex' : 'Single Sided'}):
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-muted-foreground">Total:</span>
                                            <span className="text-2xl font-black text-primary">₹{estimatedINR} INR</span>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>

                        {/* SECTION 3: SHOP OWNER SAAS PLANS */}
                        <div className="mb-20 space-y-12">
                            <div className="text-center max-w-3xl mx-auto space-y-4">
                                <Badge variant="secondary" className="px-3 py-1 bg-primary/10 text-primary border-primary/20">
                                    Shopkeeper SaaS Subscriptions
                                </Badge>
                                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                                    Print Shop Subscription Plans in INR (₹)
                                </h2>
                                <p className="text-muted-foreground text-sm">
                                    Affordable monthly and annual software subscriptions for cyber cafes, xerox points, and campus book depots.
                                </p>

                                {/* Billing Toggle */}
                                <div className="pt-2 flex items-center justify-center gap-3 text-sm">
                                    <span className={billingCycle === 'monthly' ? 'font-bold text-foreground' : 'text-muted-foreground'}>
                                        Monthly Billing
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                                        className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-primary transition-colors duration-200 ease-in-out focus:outline-hidden"
                                    >
                                        <span
                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-primary-foreground shadow-lg ring-0 transition duration-200 ease-in-out ${
                                                billingCycle === 'yearly' ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                        />
                                    </button>
                                    <span className={billingCycle === 'yearly' ? 'font-bold text-foreground' : 'text-muted-foreground'}>
                                        Annual (Save 20%)
                                    </span>
                                </div>
                            </div>

                            {/* Pricing Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                                {/* Starter Plan */}
                                <Card className="p-8 flex flex-col justify-between border-border bg-card relative shadow-sm">
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-xl">Starter Plan</h3>
                                        <p className="text-xs text-muted-foreground">
                                            Ideal for small stationery shops or testing QR printing.
                                        </p>
                                        <div className="pt-4 pb-2">
                                            <span className="text-4xl font-extrabold">₹0</span>
                                            <span className="text-xs text-muted-foreground"> INR / free forever</span>
                                        </div>
                                        <ul className="space-y-3 text-xs pt-4 border-t border-border">
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-primary" />
                                                <span>Up to 100 prints / month</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-primary" />
                                                <span>1 Connected USB/WiFi Printer</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-primary" />
                                                <span>Standard QR Counter Stand PDF</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-primary" />
                                                <span>Instant UPI Payments (Cashfree)</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="pt-8">
                                        <Button asChild variant="outline" className="w-full font-semibold border-border bg-card hover:bg-muted text-foreground">
                                            <Link href="/register">Get Started Free</Link>
                                        </Button>
                                    </div>
                                </Card>

                                {/* Pro Plan */}
                                <Card className="p-8 flex flex-col justify-between border-2 border-primary shadow-xl relative bg-card ring-4 ring-primary/10">
                                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-primary text-primary-foreground font-extrabold text-xs uppercase tracking-wider shadow-sm">
                                        Most Popular
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-xl text-primary">Cyber Cafe Pro</h3>
                                        <p className="text-xs text-muted-foreground">
                                            Built for busy cyber cafes, college Xerox points & book depots.
                                        </p>
                                        <div className="pt-4 pb-2">
                                            <span className="text-4xl font-extrabold">
                                                ₹{billingCycle === 'yearly' ? '399' : '499'}
                                            </span>
                                            <span className="text-xs text-muted-foreground"> INR / month</span>
                                            {billingCycle === 'yearly' && (
                                                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold pt-0.5">
                                                    Billed annually at ₹4,788 INR / year
                                                </div>
                                            )}
                                        </div>
                                        <ul className="space-y-3 text-xs pt-4 border-t border-border">
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-primary" />
                                                <span className="font-semibold">Unlimited Monthly Prints</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-primary" />
                                                <span>Connect up to 5 Printers</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-primary" />
                                                <span>Custom Shop Name & Logo Branding</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-primary" />
                                                <span>Priority Windows Print Agent Sync</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-primary" />
                                                <span>Advanced Analytics & Daily Reports</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-primary" />
                                                <span>WhatsApp Priority Support Desk</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="pt-8">
                                        <Button asChild className="w-full font-semibold shadow-md bg-primary hover:bg-primary/90 text-primary-foreground">
                                            <Link href="/register">Start 14-Day Free Trial</Link>
                                        </Button>
                                    </div>
                                </Card>

                                {/* Enterprise Plan */}
                                <Card className="p-8 flex flex-col justify-between border-border bg-card relative shadow-sm">
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-xl">Enterprise Multi-Store</h3>
                                        <p className="text-xs text-muted-foreground">
                                            For large stationery chains, college campus networks & franchises.
                                        </p>
                                        <div className="pt-4 pb-2">
                                            <span className="text-4xl font-extrabold">
                                                ₹{billingCycle === 'yearly' ? '1,199' : '1,499'}
                                            </span>
                                            <span className="text-xs text-muted-foreground"> INR / month</span>
                                            {billingCycle === 'yearly' && (
                                                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold pt-0.5">
                                                    Billed annually at ₹14,388 INR / year
                                                </div>
                                            )}
                                        </div>
                                        <ul className="space-y-3 text-xs pt-4 border-t border-border">
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-primary" />
                                                <span>Unlimited Branches & Counters</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-primary" />
                                                <span>Centralized Master Multi-Shop Dashboard</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-primary" />
                                                <span>Custom Domain & Whitelabel Portal</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-primary" />
                                                <span>Direct Hardware API Integration</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-primary" />
                                                <span>Dedicated Account Manager</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="pt-8">
                                        <Button asChild variant="outline" className="w-full font-semibold border-border bg-card hover:bg-muted text-foreground">
                                            <Link href="/contact-us">Contact Enterprise Sales</Link>
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        </div>

                        {/* SECTION 4: PAYMENT SECURITY & COMPLIANCE BADGE */}
                        <div className="p-8 rounded-3xl bg-card border border-border flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                            <div className="space-y-2 text-center md:text-left">
                                <div className="inline-flex items-center gap-2 text-xs font-bold text-primary">
                                    <ShieldCheck className="h-4 w-4" />
                                    <span>PCI-DSS Compliant & RBI Authorized</span>
                                </div>
                                <h3 className="text-lg font-bold text-foreground">
                                    100% Secure Payments via Cashfree Payment Gateway
                                </h3>
                                <p className="text-xs text-muted-foreground max-w-2xl">
                                    All digital transactions on Print Setu are processed in Indian Rupees (INR / ₹) via Cashfree Payments India Pvt. Ltd. supporting UPI (Google Pay, PhonePe, Paytm, BHIM), Debit & Credit Cards (Visa, MasterCard, RuPay), and Net Banking.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2 shrink-0">
                                <Button asChild variant="outline" size="sm" className="text-xs border-border bg-card hover:bg-muted">
                                    <Link href="/refund-policy">Refunds Policy</Link>
                                </Button>
                                <Button asChild variant="outline" size="sm" className="text-xs border-border bg-card hover:bg-muted">
                                    <Link href="/terms-and-conditions">Terms & Conditions</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </main>

                <FrontFooter />
            </div>
        </>
    );
}
