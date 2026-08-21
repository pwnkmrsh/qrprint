import { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import FrontHeader from '@/components/front-header';
import FrontFooter from '@/components/front-footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
    QrCode,
    Sparkles,
    ShieldCheck,
    Smartphone,
    Printer,
    CreditCard,
    Zap,
    Lock,
    CheckCircle2,
    ArrowRight,
    Play,
    Check,
    Settings2,
    Handshake,
    Info,
    Mail,
    Phone,
    HelpCircle,
    Sliders,
    Layers,
    FileText,
    TrendingUp,
    Users,
    Laptop,
    Download,
    ExternalLink,
    ChevronDown,
    Building2,
    Clock,
    Award
} from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    // Pricing Billing state
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    // Contact form state
    const [contactForm, setContactForm] = useState({
        name: '',
        phone: '',
        email: '',
        shopName: '',
        message: '',
    });
    const [contactSubmitted, setContactSubmitted] = useState(false);

    // Partner form modal / state
    const [partnerForm, setPartnerForm] = useState({
        fullName: '',
        phone: '',
        city: '',
        currentBusiness: '',
    });
    const [partnerSubmitted, setPartnerSubmitted] = useState(false);

    // FAQ Accordion open item
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setContactSubmitted(true);
    };

    const handlePartnerSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPartnerSubmitted(true);
    };

    return (
        <>
            <Head title="QR Se Print — Cloud QR Printing SaaS for Cyber Cafes & Print Shops">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary selection:text-primary-foreground">
                {/* 1. Header Navigation Menu */}
                <FrontHeader auth={auth} />

                <main className="grow">
                    {/* SECTION 1: HOME (HERO) */}
                    <section id="home" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
                        {/* Background Glow Orbs */}
                        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 blur-[130px] rounded-full pointer-events-none -z-10" />
                        <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center max-w-3xl mx-auto space-y-6">
                                {/* Announcement Badge */}
                                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    <span>Zero WhatsApp Queue • Instant UPI Payment • Auto-Print</span>
                                </div>

                                {/* Main Headline */}
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-balance">
                                    Print Directly from Customer's Phone via{' '}
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-emerald-600 dark:to-emerald-400">
                                        QR Code
                                    </span>
                                </h1>

                                {/* Subtitle */}
                                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed text-balance max-w-2xl mx-auto">
                                    Transform your Cyber Cafe or Print Shop into an automated self-service hub. Customers scan your counter QR, upload files, pay via UPI, and prints start rolling out automatically.
                                </p>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                                    {auth?.user ? (
                                        <Link href={route('dashboard')}>
                                            <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base font-semibold shadow-lg shadow-primary/20 gap-2">
                                                <span>Go to Dashboard</span>
                                                <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    ) : (
                                        <>
                                            <a href="#how-to-setup">
                                                <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base font-semibold shadow-lg shadow-primary/20 gap-2 bg-gradient-to-r from-primary to-primary/90">
                                                    <span>Setup Your Shop in 2 Mins</span>
                                                    <ArrowRight className="h-4 w-4" />
                                                </Button>
                                            </a>
                                            <Link href={route('login')}>
                                                <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-7 text-base font-medium">
                                                    <span>Shop Owner Login</span>
                                                </Button>
                                            </Link>
                                        </>
                                    )}
                                </div>

                                {/* Trust Highlights */}
                                <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        <span>No WhatsApp Number Sharing</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        <span>Auto-Deleted for Privacy</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        <span>Works with All USB & WiFi Printers</span>
                                    </div>
                                </div>
                            </div>

                            {/* Visual Mockup: Print Automation Workflow */}
                            <div className="mt-16 relative max-w-5xl mx-auto">
                                <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-xl p-4 sm:p-6 shadow-2xl">
                                    {/* Mock Header */}
                                    <div className="flex items-center justify-between border-b border-border/80 pb-4 mb-6">
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded-full bg-red-500/80" />
                                            <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                                            <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                                            <span className="text-xs text-muted-foreground ml-2 font-mono">
                                                qrseprint.com/s/cyber-hub-delhi
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-[11px] text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/10">
                                                ● Live Counter Active
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Workflow Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        {/* Step 1 Card */}
                                        <div className="p-4 rounded-xl bg-muted/40 border border-border flex flex-col items-center text-center space-y-2.5">
                                            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                                                <QrCode className="h-6 w-6" />
                                            </div>
                                            <h4 className="font-bold text-sm">1. Customer Scans QR</h4>
                                            <p className="text-xs text-muted-foreground">
                                                Scans stand QR code using any phone camera or browser.
                                            </p>
                                        </div>

                                        {/* Step 2 Card */}
                                        <div className="p-4 rounded-xl bg-muted/40 border border-border flex flex-col items-center text-center space-y-2.5">
                                            <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                                                <FileText className="h-6 w-6" />
                                            </div>
                                            <h4 className="font-bold text-sm">2. Uploads Document</h4>
                                            <p className="text-xs text-muted-foreground">
                                                Selects PDF, JPG, PNG & configures copies, color or duplex.
                                            </p>
                                        </div>

                                        {/* Step 3 Card */}
                                        <div className="p-4 rounded-xl bg-muted/40 border border-border flex flex-col items-center text-center space-y-2.5">
                                            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                                                <CreditCard className="h-6 w-6" />
                                            </div>
                                            <h4 className="font-bold text-sm">3. Pays via UPI</h4>
                                            <p className="text-xs text-muted-foreground">
                                                Instant GPay / PhonePe / Paytm scan with live verification.
                                            </p>
                                        </div>

                                        {/* Step 4 Card */}
                                        <div className="p-4 rounded-xl bg-muted/40 border border-border flex flex-col items-center text-center space-y-2.5">
                                            <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                                                <Printer className="h-6 w-6" />
                                            </div>
                                            <h4 className="font-bold text-sm">4. Auto-Prints in Shop</h4>
                                            <p className="text-xs text-muted-foreground">
                                                Windows Print Agent receives job & spools directly to printer.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stat Numbers */}
                            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-center">
                                <div className="p-4 rounded-xl bg-card border border-border">
                                    <div className="text-2xl sm:text-3xl font-extrabold text-primary">100,000+</div>
                                    <div className="text-xs text-muted-foreground mt-1">Prints Automated</div>
                                </div>
                                <div className="p-4 rounded-xl bg-card border border-border">
                                    <div className="text-2xl sm:text-3xl font-extrabold text-primary">&lt; 3 Sec</div>
                                    <div className="text-xs text-muted-foreground mt-1">Spool Latency</div>
                                </div>
                                <div className="p-4 rounded-xl bg-card border border-border">
                                    <div className="text-2xl sm:text-3xl font-extrabold text-primary">0%</div>
                                    <div className="text-xs text-muted-foreground mt-1">Data Retained</div>
                                </div>
                                <div className="p-4 rounded-xl bg-card border border-border">
                                    <div className="text-2xl sm:text-3xl font-extrabold text-primary">99.9%</div>
                                    <div className="text-xs text-muted-foreground mt-1">Agent Reliability</div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 2: FEATURE */}
                    <section id="feature" className="py-20 bg-muted/30 border-y border-border">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                                <Badge variant="secondary" className="px-3 py-1">
                                    Cutting-Edge Capabilities
                                </Badge>
                                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                                    Built Specifically for the Modern Print Shop
                                </h2>
                                <p className="text-muted-foreground text-sm sm:text-base">
                                    Say goodbye to crowded counters, manual file downloads from WhatsApp, and lost payment receipts.
                                </p>
                            </div>

                            {/* Bento Grid Features */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Feature 1 */}
                                <Card className="p-6 space-y-4 hover:shadow-md transition-shadow">
                                    <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                        <Smartphone className="h-6 w-6" />
                                    </div>
                                    <h3 className="font-bold text-lg">Zero WhatsApp Overload</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Customers don't need to save your personal phone number or message you on WhatsApp. They upload securely through your branded web portal.
                                    </p>
                                </Card>

                                {/* Feature 2 */}
                                <Card className="p-6 space-y-4 hover:shadow-md transition-shadow">
                                    <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                        <Laptop className="h-6 w-6" />
                                    </div>
                                    <h3 className="font-bold text-lg">Windows Background Print Agent</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Our ultralight Windows client connects to your local Canon, HP, Epson, or Brother printers and prints immediately upon payment confirmation.
                                    </p>
                                </Card>

                                {/* Feature 3 */}
                                <Card className="p-6 space-y-4 hover:shadow-md transition-shadow">
                                    <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                        <CreditCard className="h-6 w-6" />
                                    </div>
                                    <h3 className="font-bold text-lg">Instant Payment Verification</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Real-time UPI payment webhooks prevent unpaid printouts. No more "Bhaiya maine pay kar diya" without checking your bank SMS.
                                    </p>
                                </Card>

                                {/* Feature 4 */}
                                <Card className="p-6 space-y-4 hover:shadow-md transition-shadow">
                                    <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                        <Sliders className="h-6 w-6" />
                                    </div>
                                    <h3 className="font-bold text-lg">Smart Live Price Estimator</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Accurate calculations based on Black & White vs Color, A4/A3/Legal sizes, Duplex (Double-sided), and page range settings configured by you.
                                    </p>
                                </Card>

                                {/* Feature 5 */}
                                <Card className="p-6 space-y-4 hover:shadow-md transition-shadow">
                                    <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                        <Lock className="h-6 w-6" />
                                    </div>
                                    <h3 className="font-bold text-lg">Automated Privacy & File Purge</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Customer documents (Aadhaar cards, resumes, legal papers) are permanently erased as soon as the print job finishes, ensuring 100% data security.
                                    </p>
                                </Card>

                                {/* Feature 6 */}
                                <Card className="p-6 space-y-4 hover:shadow-md transition-shadow">
                                    <div className="h-12 w-12 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                                        <TrendingUp className="h-6 w-6" />
                                    </div>
                                    <h3 className="font-bold text-lg">Shop Analytics & Daily Revenue</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Detailed breakdown of daily print count, color split, total earnings, active queue metrics, and printer toner/hardware status.
                                    </p>
                                </Card>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 3: HOW TO SETUP */}
                    <section id="how-to-setup" className="py-20">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                                <Badge variant="secondary" className="px-3 py-1">
                                    Simple 4-Step Onboarding
                                </Badge>
                                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                                    How to Setup Your Shop in 2 Minutes
                                </h2>
                                <p className="text-muted-foreground text-sm sm:text-base">
                                    No technical expertise needed. If you have a computer and a printer, you are ready to go.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {/* Step 1 */}
                                <div className="relative flex flex-col p-6 rounded-2xl bg-card border border-border shadow-xs">
                                    <div className="absolute -top-3.5 left-6 px-3 py-0.5 rounded-full bg-primary text-primary-foreground font-extrabold text-xs">
                                        STEP 01
                                    </div>
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold mb-4 mt-2">
                                        <Building2 className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-bold text-base mb-2">Create Shop Account</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Register your shop, set your shop name (e.g. "Ramesh Cyber Cafe"), and configure your custom rate card for B&W and Color prints.
                                    </p>
                                </div>

                                {/* Step 2 */}
                                <div className="relative flex flex-col p-6 rounded-2xl bg-card border border-border shadow-xs">
                                    <div className="absolute -top-3.5 left-6 px-3 py-0.5 rounded-full bg-primary text-primary-foreground font-extrabold text-xs">
                                        STEP 02
                                    </div>
                                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold mb-4 mt-2">
                                        <Download className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-bold text-base mb-2">Install Windows Agent</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Download our 15MB lightweight Windows desktop application on your shop PC. It automatically links with your connected USB/LAN printers.
                                    </p>
                                </div>

                                {/* Step 3 */}
                                <div className="relative flex flex-col p-6 rounded-2xl bg-card border border-border shadow-xs">
                                    <div className="absolute -top-3.5 left-6 px-3 py-0.5 rounded-full bg-primary text-primary-foreground font-extrabold text-xs">
                                        STEP 03
                                    </div>
                                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold mb-4 mt-2">
                                        <QrCode className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-bold text-base mb-2">Print Your Counter QR</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Download the pre-formatted QR stand poster from your dashboard. Print it and place it on your front counter or glass window.
                                    </p>
                                </div>

                                {/* Step 4 */}
                                <div className="relative flex flex-col p-6 rounded-2xl bg-card border border-border shadow-xs">
                                    <div className="absolute -top-3.5 left-6 px-3 py-0.5 rounded-full bg-primary text-primary-foreground font-extrabold text-xs">
                                        STEP 04
                                    </div>
                                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold mb-4 mt-2">
                                        <Zap className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-bold text-base mb-2">Start Auto-Printing</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Walk-in customers scan the QR, upload files, pay via UPI, and the print job rolls out immediately without any operator intervention.
                                    </p>
                                </div>
                            </div>

                            {/* Interactive Setup CTA Card */}
                            <div className="mt-12 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-background border border-primary/20 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="space-y-2 text-center md:text-left">
                                    <h3 className="text-xl font-bold">Ready to automate your print counter?</h3>
                                    <p className="text-sm text-muted-foreground max-w-xl">
                                        Setup takes less than 2 minutes and no credit card is required to get started.
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Link href={route('login')}>
                                        <Button size="lg" className="font-semibold shadow-md gap-2">
                                            <span>Create Free Account</span>
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 4: PRICING */}
                    <section id="pricing" className="py-20 bg-muted/30 border-y border-border">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
                                <Badge variant="secondary" className="px-3 py-1">
                                    Transparent SaaS Pricing
                                </Badge>
                                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                                    Simple, Transparent Plans for Every Print Shop
                                </h2>
                                <p className="text-muted-foreground text-sm sm:text-base">
                                    Start for free, then upgrade as your daily customer volume grows. No hidden transaction fees.
                                </p>

                                {/* Billing Toggle */}
                                <div className="pt-4 flex items-center justify-center gap-3 text-sm">
                                    <span className={billingCycle === 'monthly' ? 'font-bold text-foreground' : 'text-muted-foreground'}>
                                        Monthly Billing
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                                        className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-primary transition-colors duration-200 ease-in-out focus:outline-hidden"
                                    >
                                        <span
                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${
                                                billingCycle === 'yearly' ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                        />
                                    </button>
                                    <span className={billingCycle === 'yearly' ? 'font-bold text-foreground' : 'text-muted-foreground'}>
                                        Annual (Save 20%)
                                    </span>
                                </div>
                            </div>

                            {/* Pricing Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                                {/* Plan 1: Starter */}
                                <Card className="p-8 flex flex-col justify-between border-border relative">
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-xl">Starter Plan</h3>
                                        <p className="text-xs text-muted-foreground">
                                            Ideal for small stationery shops or testing QR printing.
                                        </p>
                                        <div className="pt-4 pb-2">
                                            <span className="text-4xl font-extrabold">₹0</span>
                                            <span className="text-xs text-muted-foreground"> / free forever</span>
                                        </div>
                                        <ul className="space-y-3 text-xs pt-4 border-t border-border">
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                <span>Up to 100 prints / month</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                <span>1 Connected Printer</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                <span>Standard QR Counter Stand</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                <span>Instant UPI Payments</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="pt-8">
                                        <Link href={route('login')}>
                                            <Button variant="outline" className="w-full font-semibold">
                                                Get Started Free
                                            </Button>
                                        </Link>
                                    </div>
                                </Card>

                                {/* Plan 2: Pro Cyber Cafe (Featured) */}
                                <Card className="p-8 flex flex-col justify-between border-primary shadow-xl relative bg-card">
                                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-primary text-primary-foreground font-extrabold text-xs uppercase tracking-wider shadow-sm">
                                        Most Popular
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-xl">Cyber Cafe Pro</h3>
                                        <p className="text-xs text-muted-foreground">
                                            Built for busy cyber cafes, college Xerox points & book depots.
                                        </p>
                                        <div className="pt-4 pb-2">
                                            <span className="text-4xl font-extrabold">
                                                ₹{billingCycle === 'yearly' ? '399' : '499'}
                                            </span>
                                            <span className="text-xs text-muted-foreground"> / month</span>
                                        </div>
                                        <ul className="space-y-3 text-xs pt-4 border-t border-border">
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                <span className="font-semibold">Unlimited Monthly Prints</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                <span>Connect up to 5 Printers</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                <span>Custom Shop Name & Logo Branding</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                <span>Priority Windows Print Agent Sync</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                <span>Advanced Analytics & Daily Reports</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                <span>WhatsApp Priority Support</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="pt-8">
                                        <Link href={route('login')}>
                                            <Button className="w-full font-semibold shadow-md bg-gradient-to-r from-primary to-primary/90">
                                                Start 14-Day Free Trial
                                            </Button>
                                        </Link>
                                    </div>
                                </Card>

                                {/* Plan 3: Enterprise Network */}
                                <Card className="p-8 flex flex-col justify-between border-border relative">
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-xl">Enterprise Multi-Store</h3>
                                        <p className="text-xs text-muted-foreground">
                                            For large stationery chains, college campus networks & franchises.
                                        </p>
                                        <div className="pt-4 pb-2">
                                            <span className="text-4xl font-extrabold">
                                                ₹{billingCycle === 'yearly' ? '1,199' : '1,499'}
                                            </span>
                                            <span className="text-xs text-muted-foreground"> / month</span>
                                        </div>
                                        <ul className="space-y-3 text-xs pt-4 border-t border-border">
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                <span>Unlimited Branches & Counters</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                <span>Centralized Master Multi-Shop Dashboard</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                <span>Custom Domain & Whitelabel Portal</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                <span>Direct Hardware API Integration</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                <span>Dedicated Account Manager</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="pt-8">
                                        <a href="#contact">
                                            <Button variant="outline" className="w-full font-semibold">
                                                Contact Enterprise Sales
                                            </Button>
                                        </a>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 5: PARTNER PROGRAM */}
                    <section id="partner-program" className="py-20">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                {/* Left Info */}
                                <div className="space-y-6">
                                    <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/10 px-3 py-1 font-semibold">
                                        🤝 Reseller & Hardware Partner Program
                                    </Badge>
                                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                                        Partner with QR Se Print & Earn{' '}
                                        <span className="text-emerald-600 dark:text-emerald-400">
                                            30% Recurring Commission
                                        </span>
                                    </h2>
                                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                                        Are you a printer dealer, IT hardware vendor, POS installer, or cyber cafe association? Onboard print shops to QR Se Print and earn recurring monthly revenue for every active subscriber.
                                    </p>

                                    <div className="space-y-4 pt-2">
                                        <div className="flex items-start gap-3.5">
                                            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                                                <Award className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm">30% Monthly Lifetime Revenue Share</h4>
                                                <p className="text-xs text-muted-foreground">
                                                    Earn recurring payouts every month for every shop that stays subscribed under your partner ID.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3.5">
                                            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                                <QrCode className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm">Free Physical QR Counter Stands Kit</h4>
                                                <p className="text-xs text-muted-foreground">
                                                    We provide premium acrylic counter stands, promotional banners, and demo collateral to place in partner shops.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3.5">
                                            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                                                <Users className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm">Dedicated Partner Support Desk</h4>
                                                <p className="text-xs text-muted-foreground">
                                                    Direct priority assistance for installation, Windows agent troubleshooting, and shop onboarding.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Partner Application Form */}
                                <Card className="p-8 border-border bg-card/90 shadow-xl">
                                    <h3 className="text-xl font-bold mb-1">Apply for Partner Program</h3>
                                    <p className="text-xs text-muted-foreground mb-6">
                                        Fill in your details to receive our partner onboarding kit and commission agreement.
                                    </p>

                                    {partnerSubmitted ? (
                                        <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3 animate-in fade-in">
                                            <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
                                            <h4 className="font-bold text-base text-emerald-600 dark:text-emerald-400">
                                                Partner Application Received!
                                            </h4>
                                            <p className="text-xs text-muted-foreground">
                                                Our channel manager will contact you via WhatsApp/Phone within 4 hours with your partner credentials.
                                            </p>
                                        </div>
                                    ) : (
                                        <form onSubmit={handlePartnerSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-semibold mb-1.5">
                                                    Full Name / Company Name
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={partnerForm.fullName}
                                                    onChange={(e) => setPartnerForm({ ...partnerForm, fullName: e.target.value })}
                                                    placeholder="e.g. Rajesh Sharma"
                                                    className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-background border border-input focus:outline-hidden focus:ring-2 focus:ring-primary"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-semibold mb-1.5">
                                                        WhatsApp / Mobile Number
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        required
                                                        value={partnerForm.phone}
                                                        onChange={(e) => setPartnerForm({ ...partnerForm, phone: e.target.value })}
                                                        placeholder="+91 98765 43210"
                                                        className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-background border border-input focus:outline-hidden focus:ring-2 focus:ring-primary"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold mb-1.5">
                                                        City / State
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={partnerForm.city}
                                                        onChange={(e) => setPartnerForm({ ...partnerForm, city: e.target.value })}
                                                        placeholder="e.g. Patna, Bihar"
                                                        className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-background border border-input focus:outline-hidden focus:ring-2 focus:ring-primary"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold mb-1.5">
                                                    Your Primary Business
                                                </label>
                                                <select
                                                    value={partnerForm.currentBusiness}
                                                    onChange={(e) => setPartnerForm({ ...partnerForm, currentBusiness: e.target.value })}
                                                    className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-background border border-input focus:outline-hidden focus:ring-2 focus:ring-primary"
                                                >
                                                    <option value="">Select your business type</option>
                                                    <option value="hardware">Printer / IT Hardware Dealer</option>
                                                    <option value="association">Cyber Cafe / Xerox Shop Owner</option>
                                                    <option value="reseller">Software & POS Reseller</option>
                                                    <option value="student">Campus Operator / Student Lead</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>

                                            <Button type="submit" className="w-full font-semibold h-11 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
                                                Submit Partner Application
                                            </Button>
                                        </form>
                                    )}
                                </Card>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 6: ABOUT US */}
                    <section id="about" className="py-20 bg-muted/30 border-y border-border">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                                <Badge variant="secondary" className="px-3 py-1">
                                    Our Mission & Vision
                                </Badge>
                                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                                    Empowering 100,000+ Print Counters Across India
                                </h2>
                                <p className="text-muted-foreground text-sm sm:text-base">
                                    We are on a mission to modernize India's unorganized cyber cafe and Xerox shop ecosystem with cloud-speed automation.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <Card className="p-6 space-y-3">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                                        01
                                    </div>
                                    <h3 className="font-bold text-lg">The Problem We Solve</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        For over a decade, printing documents in India meant sending personal files to unfamiliar WhatsApp numbers, crowding shop counters, and waiting while operators searched for files. We built QR Se Print to make printing as frictionless as scanning a UPI QR code.
                                    </p>
                                </Card>

                                <Card className="p-6 space-y-3">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                                        02
                                    </div>
                                    <h3 className="font-bold text-lg">Our Technology</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Engineered with a high-performance Laravel 12 backend, real-time WebSocket print queueing, and a lightweight Windows background spooler that interfaces with local printer drivers without needing cloud-print subscriptions.
                                    </p>
                                </Card>

                                <Card className="p-6 space-y-3">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                                        03
                                    </div>
                                    <h3 className="font-bold text-lg">Shop-Centric Innovation</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        We design every single button and workflow specifically for busy cyber cafe owners. Fast setup, zero maintenance, guaranteed payment receipt reconciliation, and complete peace of mind.
                                    </p>
                                </Card>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 7: DECLARATION */}
                    <section id="declaration" className="py-20">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                                <Badge variant="outline" className="px-3 py-1 text-primary border-primary/20 bg-primary/10 font-semibold">
                                    🔒 Security, Privacy & Legal Declaration
                                </Badge>
                                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                                    Our Formal Security & Privacy Declaration
                                </h2>
                                <p className="text-muted-foreground text-sm sm:text-base">
                                    We hold user privacy and document confidentiality as our highest priority.
                                </p>
                            </div>

                            <div className="max-w-4xl mx-auto space-y-6">
                                {/* Declaration 1 */}
                                <Card className="p-6 border-l-4 border-l-primary flex items-start gap-4">
                                    <ShieldCheck className="h-6 w-6 text-primary shrink-0 mt-1" />
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-base">
                                            1. Zero Data Retention & Immediate File Purge Declaration
                                        </h3>
                                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                            All uploaded customer documents (PDFs, images, identity proofs, resumes) are strictly held in volatile, encrypted storage during the print queue process only. Upon job completion or cancellation, files are permanently shredded and removed from both server and local agent disks within 5 minutes.
                                        </p>
                                    </div>
                                </Card>

                                {/* Declaration 2 */}
                                <Card className="p-6 border-l-4 border-l-emerald-500 flex items-start gap-4">
                                    <Lock className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-1" />
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-base">
                                            2. End-to-End Encryption & Access Control Declaration
                                        </h3>
                                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                            All data transmissions between customer mobile devices, our cloud routers, and local shop print agents utilize TLS 1.3 256-bit encryption. Neither shop owners nor system administrators have access to view or copy customer document contents without explicit customer authorization.
                                        </p>
                                    </div>
                                </Card>

                                {/* Declaration 3 */}
                                <Card className="p-6 border-l-4 border-l-blue-500 flex items-start gap-4">
                                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400 shrink-0 mt-1" />
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-base">
                                            3. Payment Settlement & Non-Tamper Audit Trail
                                        </h3>
                                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                            UPI transactions and payment confirmations are directly authenticated with authorized NPCI payment gateway partners. QR Se Print maintains cryptographic audit session logs ensuring no fraudulent or unverified print jobs are executed.
                                        </p>
                                    </div>
                                </Card>

                                {/* Declaration 4 */}
                                <Card className="p-6 border-l-4 border-l-amber-500 flex items-start gap-4">
                                    <CheckCircle2 className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0 mt-1" />
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-base">
                                            4. Service Level & Hardware Independence Guarantee
                                        </h3>
                                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                            QR Se Print operates with an architecture providing 99.9% uptime. The Windows Agent operates with standard Windows GDI/PostScript printer drivers, ensuring compatibility across all major printer manufacturers without proprietary chipsets or vendor lock-in.
                                        </p>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 8: CONTACT US */}
                    <section id="contact" className="py-20 bg-muted/30 border-t border-border">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                                <Badge variant="secondary" className="px-3 py-1">
                                    Get in Touch
                                </Badge>
                                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                                    Contact Us & Quick Onboarding Support
                                </h2>
                                <p className="text-muted-foreground text-sm sm:text-base">
                                    Have a question, need help with installation, or want custom features for your shop chain? We are here to help.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-6xl mx-auto">
                                {/* Left Quick Contact Channels */}
                                <div className="lg:col-span-5 space-y-6">
                                    <Card className="p-6 space-y-4">
                                        <h3 className="font-bold text-lg">Direct Support Channels</h3>
                                        <div className="space-y-4 text-sm">
                                            <a
                                                href="https://wa.me/919999999999?text=Hello%20QR%20Se%20Print%20Support"
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-3 p-3 rounded-xl bg-muted/60 hover:bg-muted transition-colors"
                                            >
                                                <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold">
                                                    WA
                                                </div>
                                                <div>
                                                    <div className="font-semibold">WhatsApp Quick Help</div>
                                                    <div className="text-xs text-muted-foreground">+91 99999 99999 (9 AM – 9 PM)</div>
                                                </div>
                                            </a>

                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/60">
                                                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                    <Mail className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold">Email Support Desk</div>
                                                    <div className="text-xs text-muted-foreground">support@qrseprint.com</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/60">
                                                <div className="h-9 w-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                                    <Clock className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold">Working Hours</div>
                                                    <div className="text-xs text-muted-foreground">Monday – Saturday, 9:00 AM – 8:00 PM IST</div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>

                                    {/* Quick FAQ Mini Card */}
                                    <Card className="p-6 space-y-3">
                                        <h4 className="font-bold text-sm flex items-center gap-1.5">
                                            <HelpCircle className="h-4 w-4 text-primary" />
                                            <span>Frequently Asked Question</span>
                                        </h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            <strong>Do I need a special printer?</strong>
                                            <br />
                                            No! Any printer (Canon, HP, Epson, Brother) connected to your Windows computer works seamlessly out of the box.
                                        </p>
                                    </Card>
                                </div>

                                {/* Right Interactive Contact Form */}
                                <div className="lg:col-span-7">
                                    <Card className="p-8 border-border bg-card shadow-xl">
                                        <h3 className="text-xl font-bold mb-1">Send us a Message</h3>
                                        <p className="text-xs text-muted-foreground mb-6">
                                            Our technical support team typically responds within 30 minutes.
                                        </p>

                                        {contactSubmitted ? (
                                            <div className="p-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3 animate-in fade-in">
                                                <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400 mx-auto" />
                                                <h4 className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                                                    Message Sent Successfully!
                                                </h4>
                                                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                                                    Thank you for reaching out. A representative has received your request and will contact you shortly.
                                                </p>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setContactSubmitted(false)}
                                                    className="mt-2 text-xs"
                                                >
                                                    Send Another Message
                                                </Button>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleContactSubmit} className="space-y-4">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-semibold mb-1.5">Your Name</label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={contactForm.name}
                                                            onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                                            placeholder="Amit Kumar"
                                                            className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-background border border-input focus:outline-hidden focus:ring-2 focus:ring-primary"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold mb-1.5">Mobile Number</label>
                                                        <input
                                                            type="tel"
                                                            required
                                                            value={contactForm.phone}
                                                            onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                                                            placeholder="+91 98765 43210"
                                                            className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-background border border-input focus:outline-hidden focus:ring-2 focus:ring-primary"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-semibold mb-1.5">Email Address</label>
                                                        <input
                                                            type="email"
                                                            required
                                                            value={contactForm.email}
                                                            onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                                            placeholder="amit@gmail.com"
                                                            className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-background border border-input focus:outline-hidden focus:ring-2 focus:ring-primary"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold mb-1.5">Shop / Business Name</label>
                                                        <input
                                                            type="text"
                                                            value={contactForm.shopName}
                                                            onChange={(e) => setContactForm({ ...contactForm, shopName: e.target.value })}
                                                            placeholder="e.g. Star Cyber Point"
                                                            className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-background border border-input focus:outline-hidden focus:ring-2 focus:ring-primary"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold mb-1.5">Your Message / Query</label>
                                                    <textarea
                                                        rows={4}
                                                        required
                                                        value={contactForm.message}
                                                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                                                        placeholder="How can we help you today?"
                                                        className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-background border border-input focus:outline-hidden focus:ring-2 focus:ring-primary resize-none"
                                                    />
                                                </div>

                                                <Button type="submit" className="w-full font-semibold h-11 shadow-md bg-gradient-to-r from-primary to-primary/90">
                                                    Submit Message
                                                </Button>
                                            </form>
                                        )}
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer Component with all links & copyright */}
                <FrontFooter />
            </div>
        </>
    );
}
