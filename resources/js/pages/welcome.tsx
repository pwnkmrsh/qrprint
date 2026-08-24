import { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import FrontHeader from '@/components/front-header';
import FrontFooter from '@/components/front-footer';
import { PrinterBrandLogo } from '@/components/printer-logos';
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
    Pause,
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
    ArrowUpRight,
    ChevronDown,
    Building2,
    Clock,
    Award,
    FileUp,
    SlidersHorizontal,
    UploadCloud,
    ScanLine,
    CheckCheck,
    RefreshCw
} from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    // Hero Graphic Step State (0: Scan QR, 1: Upload, 2: Preference, 3: UPI Pay, 4: Auto Print)
    const [heroStep, setHeroStep] = useState<number>(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);

    // Auto-advance hero graphic animation every 3.8 seconds
    useEffect(() => {
        if (!isAutoPlaying) return;
        const timer = setInterval(() => {
            setHeroStep((prev) => (prev + 1) % 5);
        }, 3800);
        return () => clearInterval(timer);
    }, [isAutoPlaying]);

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

    const heroStepsData = [
        {
            step: '01',
            title: 'Scan QR from Mobile',
            short: '1. Scan QR',
            icon: QrCode,
            tag: 'Instant Camera Launch',
            color: 'from-primary to-primary/80',
        },
        {
            step: '02',
            title: 'Upload Your Document',
            short: '2. Upload Doc',
            icon: FileUp,
            tag: 'PDF, Images, Docs',
            color: 'from-primary to-primary/80',
        },
        {
            step: '03',
            title: 'Set Print Preference',
            short: '3. Preferences',
            icon: SlidersHorizontal,
            tag: 'B&W/Color & Duplex',
            color: 'from-primary to-primary/80',
        },
        {
            step: '04',
            title: 'Pay Online via UPI',
            short: '4. Pay Online',
            icon: CreditCard,
            tag: 'Instant Webhook Sync',
            color: 'from-primary to-primary/80',
        },
        {
            step: '05',
            title: 'Get Your Prints',
            short: '5. Auto-Print',
            icon: Printer,
            tag: 'Zero-Touch Tray Spool',
            color: 'from-primary to-primary/80',
        },
    ];

    const SUPPORTED_PRINTER_BRANDS = [
        { name: 'HP', sub: 'LaserJet & Smart Tank' },
        { name: 'Canon', sub: 'imageRUNNER & PIXMA' },
        { name: 'Epson', sub: 'EcoTank & WorkForce' },
        { name: 'Brother', sub: 'DCP & HL Series' },
        { name: 'Xerox', sub: 'WorkCentre & VersaLink' },
        { name: 'Konica Minolta', sub: 'bizhub Digital' },
        { name: 'Ricoh', sub: 'Aficio & MP Series' },
        { name: 'Kyocera', sub: 'TASKalfa & ECOSYS' },
        { name: 'Samsung', sub: 'ProXpress Laser' },
        { name: 'Pantum', sub: 'P & M Mono Series' },
        { name: 'TVS Electronics', sub: 'POS & Billing' },
        { name: 'Toshiba', sub: 'e-STUDIO Copiers' },
    ];

    return (
        <>
            <Head title="Print Setu — Cloud QR Printing SaaS for Cyber Cafes & Print Shops">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary selection:text-primary-foreground">
                {/* 1. Header Navigation Menu */}
                <FrontHeader auth={auth} />

                <main className="grow">
                    {/* SECTION 1: HOME (HERO - 2 COLUMN VERTICAL SPLIT) */}
                    <section id="home" className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden bg-background">
                        {/* Background Glow Orbs */}
                        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-primary/15 blur-[130px] rounded-full pointer-events-none -z-10" />
                        <div className="absolute top-1/3 right-10 w-[450px] h-[350px] bg-primary/10 blur-[130px] rounded-full pointer-events-none -z-10" />

                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">

                                {/* PART 1: LEFT HERO CONTENT (6 cols) */}
                                <div className="lg:col-span-6 space-y-6 text-left">
                                    {/* Announcement Badge */}
                                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-xs font-semibold text-primary">
                                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                                        <span>Zero WhatsApp Queue • Instant UPI • Auto-Print</span>
                                    </div>

                                    {/* Main Headline */}
                                    <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight leading-[1.12] text-balance">
                                        Print Directly from Customer's Phone via{' '}
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/90 to-sky-600">
                                            QR Code
                                        </span>
                                    </h1>

                                    {/* Subtitle */}
                                    <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                                        Transform your Cyber Cafe, Stationery or Print Shop into an automated self-service hub. Customers scan your counter QR, upload files, pay via UPI, and prints start rolling out automatically.
                                    </p>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                                        {auth?.user ? (
                                            <Button asChild size="lg" className="w-full sm:w-auto h-12 px-8 text-base font-semibold shadow-lg shadow-primary/25 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                                                <Link href="/dashboard">
                                                    <span>Go to Dashboard</span>
                                                    <ArrowRight className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        ) : (
                                            <>
                                                <Button asChild size="lg" className="w-full sm:w-auto h-12 px-7 text-base font-semibold shadow-lg shadow-primary/25 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                                                    <Link href="/register">
                                                        <span>Setup Shop in 2 Mins</span>
                                                        <ArrowRight className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-12 px-6 text-base font-semibold bg-card hover:bg-muted text-foreground border-border">
                                                    <Link href="/login">
                                                        <span>Shop Owner Login</span>
                                                    </Link>
                                                </Button>
                                            </>
                                        )}
                                    </div>

                                    {/* Trust Highlights */}
                                    <div className="pt-2 flex flex-wrap items-center gap-y-2.5 gap-x-5 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <CheckCircle2 className="h-4 w-4 text-primary" />
                                            <span>No WhatsApp Number Sharing</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <CheckCircle2 className="h-4 w-4 text-primary" />
                                            <span>Auto-Deleted for Privacy</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <CheckCircle2 className="h-4 w-4 text-primary" />
                                            <span>Works with All USB & WiFi Printers</span>
                                        </div>
                                    </div>
                                </div>

                                {/* PART 2: RIGHT HERO GRAPHICS MODE ANIMATION (6 cols) */}
                                <div className="lg:col-span-6 relative">
                                    <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">


                                        {/* Interactive Step Navigator Tabs */}
                                        <div className="grid grid-cols-5 p-1.5 bg-muted/30 border-b border-border text-[11px] font-medium gap-1">
                                            {heroStepsData.map((item, idx) => {
                                                const isActive = heroStep === idx;
                                                const Icon = item.icon;
                                                return (
                                                    <button
                                                        key={item.short}
                                                        type="button"
                                                        onClick={() => {
                                                            setHeroStep(idx);
                                                            setIsAutoPlaying(false);
                                                        }}
                                                        className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-center transition-all ${isActive
                                                            ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                                                            }`}
                                                    >
                                                        <Icon className="h-3.5 w-3.5 shrink-0" />
                                                        <span className="truncate text-[10px] sm:text-[11px]">{item.short}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Graphics Mode Display Canvas */}
                                        <div className="p-6 min-h-[340px] flex flex-col justify-between bg-card relative">

                                            {/* STEP 0: QR SCANNER GRAPHIC ANIMATION */}
                                            {heroStep === 0 && (
                                                <div className="flex flex-col items-center justify-center text-center space-y-4 py-2 animate-in fade-in zoom-in-95 duration-100">
                                                    <div className="relative p-5 rounded-2xl bg-card border-2 border-primary/50 shadow-xl flex items-center justify-center overflow-hidden">
                                                        {/* Animated Laser Scanning Beam */}
                                                        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_#00ABE4] animate-pulse top-1/2 -translate-y-1/2" />
                                                        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
                                                        <QrCode className="h-28 w-28 text-foreground" />
                                                        <div className="absolute bottom-1 bg-card/95 px-2 py-0.5 rounded text-[9px] font-mono border border-border font-semibold text-primary">
                                                            SCAN TO PRINT
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1 max-w-sm">
                                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                                                            <Smartphone className="h-3.5 w-3.5" />
                                                            <span>Step 1: Scan Stand QR from Phone</span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Customer points standard phone camera or Paytm app at the counter stand. Branded shop portal opens instantly without app download.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* STEP 1: UPLOAD DOCUMENT GRAPHIC */}
                                            {heroStep === 1 && (
                                                <div className="flex flex-col items-center justify-center text-center space-y-4 py-2 animate-in fade-in zoom-in-95 duration-100">
                                                    <div className="w-full max-w-sm p-4 rounded-xl bg-card border border-border shadow-lg space-y-3">
                                                        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-between">
                                                            <div className="flex items-center gap-3 text-left">
                                                                <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
                                                                    <FileText className="h-5 w-5" />
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold text-xs">Govt_ID_Resume.pdf</div>
                                                                    <div className="text-[10px] text-muted-foreground">2 Pages • 1.8 MB • Encrypted</div>
                                                                </div>
                                                            </div>
                                                            <CheckCircle2 className="h-5 w-5 text-primary" />
                                                        </div>

                                                        {/* Progress bar */}
                                                        <div className="space-y-1 text-left">
                                                            <div className="flex justify-between text-[10px] font-semibold">
                                                                <span>Upload Complete</span>
                                                                <span className="text-primary font-bold">100%</span>
                                                            </div>
                                                            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                                                                <div className="h-full bg-primary rounded-full w-full animate-pulse" />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1 max-w-sm">
                                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                                                            <UploadCloud className="h-3.5 w-3.5" />
                                                            <span>Step 2: Upload Files Directly</span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Select PDF, Word, or JPG images directly from phone files without WhatsApp number sharing.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* STEP 2: PRINT PREFERENCES GRAPHIC */}
                                            {heroStep === 2 && (
                                                <div className="flex flex-col items-center justify-center text-center space-y-4 py-2 animate-in fade-in zoom-in-95 duration-100">
                                                    <div className="w-full max-w-sm p-4 rounded-xl bg-card border border-border shadow-lg space-y-3 text-left">
                                                        <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                                                            <div className="p-2 rounded-lg bg-primary text-primary-foreground text-center font-bold">
                                                                ● Black & White (₹2/pg)
                                                            </div>
                                                            <div className="p-2 rounded-lg bg-muted text-muted-foreground text-center">
                                                                Color (₹10/pg)
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between text-xs pt-1 border-t border-border">
                                                            <span className="text-muted-foreground">Copies & Duplex:</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="px-2 py-0.5 rounded bg-muted font-bold">2 Copies</span>
                                                                <span className="px-2 py-0.5 rounded bg-primary/15 text-primary font-semibold text-[10px]">
                                                                    Duplex: ON
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="p-2 rounded-lg bg-muted/60 border border-border flex items-center justify-between text-xs font-bold">
                                                            <span>Calculated Total Amount:</span>
                                                            <span className="text-sm text-primary font-extrabold">₹8.00</span>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1 max-w-sm">
                                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                                                            <SlidersHorizontal className="h-3.5 w-3.5" />
                                                            <span>Step 3: Live Preference & Price Calc</span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Real-time rate card calculation according to your custom shop pricing settings.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* STEP 3: PAY ONLINE VIA UPI GRAPHIC */}
                                            {heroStep === 3 && (
                                                <div className="flex flex-col items-center justify-center text-center space-y-4 py-2 animate-in fade-in zoom-in-95 duration-100">
                                                    <div className="w-full max-w-sm p-4 rounded-xl bg-card border border-primary/40 shadow-lg space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="text-xs font-bold text-left">
                                                                <div>UPI Payment Gateway</div>
                                                                <div className="text-[10px] text-muted-foreground">GPay / PhonePe / Paytm / BHIM</div>
                                                            </div>
                                                            <Badge className="bg-primary text-primary-foreground font-mono text-[10px]">
                                                                Live Webhook
                                                            </Badge>
                                                        </div>

                                                        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center gap-3 text-left">
                                                            <CheckCircle2 className="h-8 w-8 text-primary shrink-0" />
                                                            <div>
                                                                <div className="font-extrabold text-sm text-primary">
                                                                    Payment Confirmed: ₹8.00
                                                                </div>
                                                                <div className="text-[10px] text-muted-foreground font-mono">
                                                                    Txn ID: UPI/2026/89410 • Verified in 1.4s
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1 max-w-sm">
                                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                                                            <CreditCard className="h-3.5 w-3.5" />
                                                            <span>Step 4: Automated Instant Verification</span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            No need to check bank SMS or ask "bhaiya pay ho gaya". Print spools only on verified payments.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* STEP 4: PRINTER ANIMATION GRAPHIC */}
                                            {heroStep === 4 && (
                                                <div className="flex flex-col items-center justify-center text-center space-y-3 py-2 animate-in fade-in zoom-in-95 duration-100">
                                                    {/* Animated Printer Graphic */}
                                                    <div className="relative w-48 p-4 rounded-xl bg-card border-2 border-primary shadow-xl flex flex-col items-center">
                                                        {/* Printer Top Slot */}
                                                        <div className="w-32 h-2 rounded-full bg-muted border border-border mb-2" />

                                                        {/* Status LED */}
                                                        <div className="flex items-center gap-1.5 mb-2 text-[10px] font-mono text-primary font-bold">
                                                            <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
                                                            <span>PRINTING JOB...</span>
                                                        </div>

                                                        {/* Ejected Document Animation */}
                                                        <div className="w-28 h-16 rounded-md bg-muted/40 border border-border shadow-md p-2 flex flex-col gap-1 animate-bounce duration-1000">
                                                            <div className="h-1.5 w-12 bg-primary/70 rounded-full" />
                                                            <div className="h-1 w-20 bg-muted-foreground/30 rounded-full" />
                                                            <div className="h-1 w-16 bg-muted-foreground/30 rounded-full" />
                                                            <div className="h-1 w-22 bg-muted-foreground/30 rounded-full" />
                                                        </div>

                                                        <div className="mt-2 text-[10px] font-bold text-muted-foreground">
                                                            Canon / HP Windows Spooler
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1 max-w-sm">
                                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                                                            <Printer className="h-3.5 w-3.5" />
                                                            <span>Step 5: Direct Printer Tray Spooling</span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Windows background agent immediately feeds job to printer. Files are permanently shredded after printing.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Bottom Step Indicator Bar */}
                                            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-bold text-primary">
                                                        Step {heroStep + 1} of 5:
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                        {heroStepsData[heroStep].title}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {heroStepsData.map((_, idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => {
                                                                setHeroStep(idx);
                                                                setIsAutoPlaying(false);
                                                            }}
                                                            className={`h-1.5 rounded-full transition-all ${heroStep === idx
                                                                ? 'w-6 bg-primary'
                                                                : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60'
                                                                }`}
                                                            aria-label={`Go to step ${idx + 1}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION: ALL SUPPORTED PRINTER LOGO CAROUSEL (SINGLE LINE) */}
                    <section className="py-6 bg-muted/30 border-y border-border overflow-hidden">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-3 text-center">
                            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                                Works seamlessly with all leading printer brands via USB, LAN & Wi-Fi
                            </p>
                        </div>

                        {/* Single-Line Infinite Marquee */}
                        <div className="relative w-full overflow-hidden">
                            <div className="animate-marquee gap-3 sm:gap-4 px-2 items-center">
                                {[...SUPPORTED_PRINTER_BRANDS, ...SUPPORTED_PRINTER_BRANDS, ...SUPPORTED_PRINTER_BRANDS].map((brand, idx) => (
                                    <div
                                        key={`printer-logo-${brand.name}-${idx}`}
                                        className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-card border border-border/80 shadow-2xs hover:border-primary hover:shadow-xs transition-all shrink-0 group cursor-default"
                                    >
                                        <div className="h-5 flex items-center justify-center shrink-0">
                                            <PrinterBrandLogo brand={brand.name} className="h-4 sm:h-4.5 max-h-5 max-w-[80px] w-auto object-contain transition-transform group-hover:scale-105" />
                                        </div>
                                        <span className="text-[11px] text-muted-foreground font-medium hidden sm:inline whitespace-nowrap pl-2 border-l border-border/70">
                                            {brand.sub}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* SECTION 2: HOW IT WORKS (CUSTOMER 5 STEPS HIGHLIGHT) */}
                    <section id="how-it-works" className="py-24 relative overflow-hidden bg-card border-y border-border">
                        {/* Ambient Glows */}
                        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-primary/10 blur-[140px] rounded-full pointer-events-none -z-10" />
                        <div className="absolute top-1/3 right-0 w-96 h-96 bg-primary/10 blur-[140px] rounded-full pointer-events-none -z-10" />

                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            {/* Section Header */}
                            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                                <Badge variant="secondary" className="px-3.5 py-1 text-xs font-semibold gap-1.5 bg-primary/10 text-primary border-primary/20">
                                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                                    <span>Instant Customer Experience</span>
                                </Badge>
                                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-balance">
                                    Print in{' '}
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/90 to-sky-600">
                                        5 Simple Steps
                                    </span>
                                </h2>
                                <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto text-balance">
                                    No app installation, zero WhatsApp number sharing, and no waiting in counter queues. Anyone with a smartphone can print independently in under 30 seconds.
                                </p>
                            </div>

                            {/* 5-Step Process Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5 relative">
                                {/* Step 1 */}
                                <div className="relative group p-6 rounded-2xl bg-muted/40 hover:bg-card border border-border hover:border-primary transition-all duration-100 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-black tracking-wider uppercase">
                                                STEP 01
                                            </span>
                                            <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold group-hover:scale-110 transition-transform shadow-sm shadow-primary/20">
                                                <QrCode className="h-5 w-5" />
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-base text-foreground mb-2">
                                            Scan the QR from mobile
                                        </h3>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Scan the counter stand QR code with any smartphone camera, Google Lens, Paytm, or mobile browser. Opens the shop's branded print page instantly.
                                        </p>
                                    </div>
                                    <div className="mt-5 pt-3 border-t border-border flex items-center gap-1.5 text-[11px] font-medium text-primary">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        <span>No App Download Needed</span>
                                    </div>
                                </div>

                                {/* Step 2 */}
                                <div className="relative group p-6 rounded-2xl bg-muted/40 hover:bg-card border border-border hover:border-primary transition-all duration-100 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-black tracking-wider uppercase">
                                                STEP 02
                                            </span>
                                            <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold group-hover:scale-110 transition-transform shadow-sm shadow-primary/20">
                                                <FileUp className="h-5 w-5" />
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-base text-foreground mb-2">
                                            Upload Your Document
                                        </h3>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Select PDF files, Word docs, photos, Aadhaar cards, or resumes directly from phone files or WhatsApp downloads with full 256-bit encryption.
                                        </p>
                                    </div>
                                    <div className="mt-5 pt-3 border-t border-border flex items-center gap-1.5 text-[11px] font-medium text-primary">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        <span>PDF, DOCX, JPG & PNG</span>
                                    </div>
                                </div>

                                {/* Step 3 */}
                                <div className="relative group p-6 rounded-2xl bg-muted/40 hover:bg-card border border-border hover:border-primary transition-all duration-100 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-black tracking-wider uppercase">
                                                STEP 03
                                            </span>
                                            <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold group-hover:scale-110 transition-transform shadow-sm shadow-primary/20">
                                                <SlidersHorizontal className="h-5 w-5" />
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-base text-foreground mb-2">
                                            Set Print Preference
                                        </h3>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Choose Black & White vs Color, number of copies, page ranges (e.g. 1-5), portrait/landscape, and single or double-sided (duplex) with real-time rate card pricing.
                                        </p>
                                    </div>
                                    <div className="mt-5 pt-3 border-t border-border flex items-center gap-1.5 text-[11px] font-medium text-primary">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        <span>Live Price Calculation</span>
                                    </div>
                                </div>

                                {/* Step 4 */}
                                <div className="relative group p-6 rounded-2xl bg-muted/40 hover:bg-card border border-border hover:border-primary transition-all duration-100 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-black tracking-wider uppercase">
                                                STEP 04
                                            </span>
                                            <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold group-hover:scale-110 transition-transform shadow-sm shadow-primary/20">
                                                <CreditCard className="h-5 w-5" />
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-base text-foreground mb-2">
                                            Pay Online
                                        </h3>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Pay the exact calculated amount seamlessly via UPI (Google Pay, PhonePe, Paytm, BHIM, Cred) with automated instant webhook confirmation.
                                        </p>
                                    </div>
                                    <div className="mt-5 pt-3 border-t border-border flex items-center gap-1.5 text-[11px] font-medium text-primary">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        <span>Instant 2-Sec UPI Sync</span>
                                    </div>
                                </div>

                                {/* Step 5 */}
                                <div className="relative group p-6 rounded-2xl bg-muted/40 hover:bg-card border border-border hover:border-primary transition-all duration-100 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-black tracking-wider uppercase">
                                                STEP 05
                                            </span>
                                            <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold group-hover:scale-110 transition-transform shadow-sm shadow-primary/20">
                                                <Printer className="h-5 w-5" />
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-base text-foreground mb-2">
                                            Get Your Prints
                                        </h3>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            The shop's connected printer triggers immediately via the lightweight Windows Print Agent. Collect your freshly printed documents right from the tray.
                                        </p>
                                    </div>
                                    <div className="mt-5 pt-3 border-t border-border flex items-center gap-1.5 text-[11px] font-medium text-primary">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        <span>Files Auto-Purged Post Print</span>
                                    </div>
                                </div>
                            </div>

                            {/* Step Flow Banner / Timeline Visual */}
                            <div className="mt-12 p-6 rounded-2xl bg-muted/50 border border-border flex flex-col lg:flex-row items-center justify-between gap-6 shadow-sm">
                                <div className="flex items-center gap-3.5">
                                    <div className="h-11 w-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
                                        <Zap className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-foreground">Zero-Touch Automation: Under 30 Seconds</h4>
                                        <p className="text-xs text-muted-foreground">Self-service flow designed specifically for Indian Cyber Cafes, Xerox Shops & Stationery Hubs.</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold">
                                    <span className="px-3 py-1.5 rounded-lg bg-card border border-border shadow-xs text-foreground">
                                        Scan QR
                                    </span>
                                    <span className="text-muted-foreground">→</span>
                                    <span className="px-3 py-1.5 rounded-lg bg-card border border-border shadow-xs text-foreground">
                                        Upload Doc
                                    </span>
                                    <span className="text-muted-foreground">→</span>
                                    <span className="px-3 py-1.5 rounded-lg bg-card border border-border shadow-xs text-foreground">
                                        Set Preference
                                    </span>
                                    <span className="text-muted-foreground">→</span>
                                    <span className="px-3 py-1.5 rounded-lg bg-card border border-border shadow-xs text-foreground">
                                        Pay Online
                                    </span>
                                    <span className="text-muted-foreground">→</span>
                                    <span className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-bold shadow-xs">
                                        Get Your Prints
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 2: FEATURE */}
                    <section id="feature" className="py-20 bg-background border-y border-border">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                                <Badge variant="secondary" className="px-3 py-1 bg-primary/10 text-primary border-primary/20">
                                    Cutting-Edge Capabilities
                                </Badge>
                                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-balance">
                                    Built Specifically for the Modern Print Shop
                                </h2>
                                <p className="text-muted-foreground text-sm sm:text-base">
                                    Say goodbye to crowded counters, manual file downloads from WhatsApp, and lost payment receipts.
                                </p>
                            </div>

                            {/* Bento Grid Features */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Feature 1 */}
                                <Card className="p-6 space-y-4 hover:shadow-lg hover:border-primary/50 transition-all bg-card border-border">
                                    <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                        <Smartphone className="h-6 w-6" />
                                    </div>
                                    <h3 className="font-bold text-lg">Zero WhatsApp Overload</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Customers don't need to save your personal phone number or message you on WhatsApp. They upload securely through your branded web portal.
                                    </p>
                                </Card>

                                {/* Feature 2 */}
                                <Card className="p-6 space-y-4 hover:shadow-lg hover:border-primary/50 transition-all bg-card border-border">
                                    <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                        <Laptop className="h-6 w-6" />
                                    </div>
                                    <h3 className="font-bold text-lg">Windows Background Print Agent</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Our ultralight Windows client connects to your local Canon, HP, Epson, or Brother printers and prints immediately upon payment confirmation.
                                    </p>
                                </Card>

                                {/* Feature 3 */}
                                <Card className="p-6 space-y-4 hover:shadow-lg hover:border-primary/50 transition-all bg-card border-border">
                                    <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                        <CreditCard className="h-6 w-6" />
                                    </div>
                                    <h3 className="font-bold text-lg">Instant Payment Verification</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Real-time UPI payment webhooks prevent unpaid printouts. No more "Bhaiya maine pay kar diya" without checking your bank SMS.
                                    </p>
                                </Card>

                                {/* Feature 4 */}
                                <Card className="p-6 space-y-4 hover:shadow-lg hover:border-primary/50 transition-all bg-card border-border">
                                    <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                        <Sliders className="h-6 w-6" />
                                    </div>
                                    <h3 className="font-bold text-lg">Smart Live Price Estimator</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Accurate calculations based on Black & White vs Color, A4/A3/Legal sizes, Duplex (Double-sided), and page range settings configured by you.
                                    </p>
                                </Card>

                                {/* Feature 5 */}
                                <Card className="p-6 space-y-4 hover:shadow-lg hover:border-primary/50 transition-all bg-card border-border">
                                    <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                        <Lock className="h-6 w-6" />
                                    </div>
                                    <h3 className="font-bold text-lg">Automated Privacy & File Purge</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Customer documents (Aadhaar cards, resumes, legal papers) are permanently erased as soon as the print job finishes, ensuring 100% data security.
                                    </p>
                                </Card>

                                {/* Feature 6 */}
                                <Card className="p-6 space-y-4 hover:shadow-lg hover:border-primary/50 transition-all bg-card border-border">
                                    <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
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
                    <section id="how-to-setup" className="py-20 bg-card">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                                <Badge variant="secondary" className="px-3 py-1 bg-primary/10 text-primary border-primary/20">
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
                                <div className="relative flex flex-col p-6 rounded-2xl bg-muted/30 border border-border shadow-xs hover:border-primary transition-all">
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
                                <div className="relative flex flex-col p-6 rounded-2xl bg-muted/30 border border-border shadow-xs hover:border-primary transition-all">
                                    <div className="absolute -top-3.5 left-6 px-3 py-0.5 rounded-full bg-primary text-primary-foreground font-extrabold text-xs">
                                        STEP 02
                                    </div>
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold mb-4 mt-2">
                                        <Download className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-bold text-base mb-2">Install Windows Agent</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Download our 15MB lightweight Windows desktop application on your shop PC. It automatically links with your connected USB/LAN printers.
                                    </p>
                                </div>

                                {/* Step 3 */}
                                <div className="relative flex flex-col p-6 rounded-2xl bg-muted/30 border border-border shadow-xs hover:border-primary transition-all">
                                    <div className="absolute -top-3.5 left-6 px-3 py-0.5 rounded-full bg-primary text-primary-foreground font-extrabold text-xs">
                                        STEP 03
                                    </div>
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold mb-4 mt-2">
                                        <QrCode className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-bold text-base mb-2">Print Your Counter QR</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Download the pre-formatted QR stand poster from your dashboard. Print it and place it on your front counter or glass window.
                                    </p>
                                </div>

                                {/* Step 4 */}
                                <div className="relative flex flex-col p-6 rounded-2xl bg-muted/30 border border-border shadow-xs hover:border-primary transition-all">
                                    <div className="absolute -top-3.5 left-6 px-3 py-0.5 rounded-full bg-primary text-primary-foreground font-extrabold text-xs">
                                        STEP 04
                                    </div>
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold mb-4 mt-2">
                                        <Zap className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-bold text-base mb-2">Start Auto-Printing</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Walk-in customers scan the QR, upload files, pay via UPI, and the print job rolls out immediately without any operator intervention.
                                    </p>
                                </div>
                            </div>

                            {/* Interactive Setup CTA Card */}
                            <div className="mt-12 rounded-2xl bg-gradient-to-r from-primary/15 via-primary/5 to-card border border-primary/25 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="space-y-2 text-center md:text-left">
                                    <h3 className="text-xl font-bold">Ready to automate your print counter?</h3>
                                    <p className="text-sm text-muted-foreground max-w-xl">
                                        Setup takes less than 2 minutes and no credit card is required to get started.
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button asChild size="lg" className="font-semibold shadow-md gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                                        <Link href="/register">
                                            <span>Create Free Account</span>
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 4: PRICING */}
                    <section id="pricing" className="py-20 bg-background border-y border-border">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
                                <Badge variant="secondary" className="px-3 py-1 bg-primary/10 text-primary border-primary/20">
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
                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-primary-foreground shadow-lg ring-0 transition duration-200 ease-in-out ${billingCycle === 'yearly' ? 'translate-x-5' : 'translate-x-0'
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
                                <Card className="p-8 flex flex-col justify-between border-border bg-card relative shadow-sm">
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
                                                <Check className="h-4 w-4 text-primary" />
                                                <span>Up to 100 prints / month</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-primary" />
                                                <span>1 Connected Printer</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-primary" />
                                                <span>Standard QR Counter Stand</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-primary" />
                                                <span>Instant UPI Payments</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="pt-8">
                                        <Button asChild variant="outline" className="w-full font-semibold border-border bg-card hover:bg-muted text-foreground">
                                            <Link href="/register">
                                                Get Started Free
                                            </Link>
                                        </Button>
                                    </div>
                                </Card>

                                {/* Plan 2: Pro Cyber Cafe (Featured) */}
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
                                            <span className="text-xs text-muted-foreground"> / month</span>
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
                                                <span>WhatsApp Priority Support</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="pt-8">
                                        <Button asChild className="w-full font-semibold shadow-md bg-primary hover:bg-primary/90 text-primary-foreground">
                                            <Link href="/register">
                                                Start 14-Day Free Trial
                                            </Link>
                                        </Button>
                                    </div>
                                </Card>

                                {/* Plan 3: Enterprise Network */}
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
                                            <span className="text-xs text-muted-foreground"> / month</span>
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
                                        <a href="#contact">
                                            <Button variant="outline" className="w-full font-semibold border-border bg-card hover:bg-muted text-foreground">
                                                Contact Enterprise Sales
                                            </Button>
                                        </a>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 5: PARTNER PROGRAM */}
                    <section id="partner-program" className="py-20 bg-card">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                {/* Left Info */}
                                <div className="space-y-6">
                                    <Badge variant="outline" className="text-primary border-primary/20 bg-primary/10 px-3 py-1 font-semibold">
                                        🤝 Reseller & Hardware Partner Program
                                    </Badge>
                                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                                        Partner with QRPrintSetu & Earn{' '}
                                        <span className="text-primary">
                                            30% Recurring Commission
                                        </span>
                                    </h2>
                                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                                        Are you a printer dealer, IT hardware vendor, POS installer, or cyber cafe association? Onboard print shops to QRPrintSetu and earn recurring monthly revenue for every active subscriber.
                                    </p>

                                    <div className="space-y-4 pt-2">
                                        <div className="flex items-start gap-3.5">
                                            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
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
                                            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
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
                                <Card className="p-8 border-border bg-background shadow-xl">
                                    <h3 className="text-xl font-bold mb-1">Apply for Partner Program</h3>
                                    <p className="text-xs text-muted-foreground mb-6">
                                        Fill in your details to receive our partner onboarding kit and commission agreement.
                                    </p>

                                    {partnerSubmitted ? (
                                        <div className="p-6 rounded-xl bg-primary/10 border border-primary/20 text-center space-y-3 animate-in fade-in">
                                            <CheckCircle2 className="h-10 w-10 text-primary mx-auto" />
                                            <h4 className="font-bold text-base text-primary">
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
                                                    className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-card border border-input focus:outline-hidden focus:ring-2 focus:ring-primary"
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
                                                        className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-card border border-input focus:outline-hidden focus:ring-2 focus:ring-primary"
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
                                                        className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-card border border-input focus:outline-hidden focus:ring-2 focus:ring-primary"
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
                                                    className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-card border border-input focus:outline-hidden focus:ring-2 focus:ring-primary"
                                                >
                                                    <option value="">Select your business type</option>
                                                    <option value="hardware">Printer / IT Hardware Dealer</option>
                                                    <option value="association">Cyber Cafe / Xerox Shop Owner</option>
                                                    <option value="reseller">Software & POS Reseller</option>
                                                    <option value="student">Campus Operator / Student Lead</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>

                                            <Button type="submit" className="w-full font-semibold h-11 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
                                                Submit Partner Application
                                            </Button>
                                        </form>
                                    )}
                                </Card>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 6: DECLARATION */}
                    <section id="declaration" className="py-20 bg-background border-t border-border">
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
                                <Card className="p-6 border-l-4 border-l-primary flex items-start gap-4 bg-card border-border">
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
                                <Card className="p-6 border-l-4 border-l-primary flex items-start gap-4 bg-card border-border">
                                    <Lock className="h-6 w-6 text-primary shrink-0 mt-1" />
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
                                <Card className="p-6 border-l-4 border-l-primary flex items-start gap-4 bg-card border-border">
                                    <FileText className="h-6 w-6 text-primary shrink-0 mt-1" />
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-base">
                                            3. Payment Settlement & Non-Tamper Audit Trail
                                        </h3>
                                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                            UPI transactions and payment confirmations are directly authenticated with authorized NPCI payment gateway partners. QRPrintSetu maintains cryptographic audit session logs ensuring no fraudulent or unverified print jobs are executed.
                                        </p>
                                    </div>
                                </Card>

                                {/* Declaration 4 */}
                                <Card className="p-6 border-l-4 border-l-primary flex items-start gap-4 bg-card border-border">
                                    <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-1" />
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-base">
                                            4. Service Level & Hardware Independence Guarantee
                                        </h3>
                                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                            QRPrintSetu operates with an architecture providing 99.9% uptime. The Windows Agent operates with standard Windows GDI/PostScript printer drivers, ensuring compatibility across all major printer manufacturers without proprietary chipsets or vendor lock-in.
                                        </p>
                                    </div>
                                </Card>
                            </div>

                            {/* Open Dedicated Legal Pages in New Tabs */}
                            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs">
                                <a
                                    href="/privacy-policy"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-card border border-border text-foreground hover:text-primary hover:border-primary transition-colors font-medium shadow-xs"
                                >
                                    <span>Open Privacy Policy</span>
                                    <ArrowUpRight className="h-3.5 w-3.5 text-primary" />
                                </a>
                                <a
                                    href="/terms-of-service"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-card border border-border text-foreground hover:text-primary hover:border-primary transition-colors font-medium shadow-xs"
                                >
                                    <span>Open Terms of Service</span>
                                    <ArrowUpRight className="h-3.5 w-3.5 text-primary" />
                                </a>
                                <a
                                    href="/security-declaration"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary font-semibold hover:bg-primary/15 transition-colors shadow-xs"
                                >
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    <span>Open Security Declaration Page</span>
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                </a>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 7: CONTACT US */}
                    <section id="contact" className="py-20 bg-muted/40 border-t border-border">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                                <Badge variant="secondary" className="px-3 py-1 bg-primary/10 text-primary border-primary/20">
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
                                    <Card className="p-6 space-y-4 bg-card border-border">
                                        <h3 className="font-bold text-lg">Direct Support Channels</h3>
                                        <div className="space-y-4 text-sm">
                                            <a
                                                href="https://wa.me/919098132966?text=Hello%20QRPrintSetu%20Support"
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-3 p-3 rounded-xl bg-muted/60 hover:bg-primary/10 transition-colors border border-transparent hover:border-primary/20"
                                            >
                                                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">
                                                    WA
                                                </div>
                                                <div>
                                                    <div className="font-semibold">WhatsApp Quick Help</div>
                                                    <div className="text-xs text-muted-foreground">+91 90981 32966 (9 AM – 9 PM)</div>
                                                </div>
                                            </a>

                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/60">
                                                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                    <Mail className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold">Email Support Desk</div>
                                                    <div className="text-xs text-muted-foreground">QRPrintSetuin@gmail.com</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/60">
                                                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
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
                                    <Card className="p-6 space-y-3 bg-card border-border">
                                        <h4 className="font-bold text-sm flex items-center gap-1.5 text-primary">
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
                                            <div className="p-8 rounded-xl bg-primary/10 border border-primary/20 text-center space-y-3 animate-in fade-in">
                                                <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
                                                <h4 className="font-bold text-lg text-primary">
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
                                                            placeholder="Mihr Kumar"
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
                                                            placeholder="+91 90981 32966"
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
                                                            placeholder="mihr@gmail.com"
                                                            className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-background border border-input focus:outline-hidden focus:ring-2 focus:ring-primary"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold mb-1.5">Shop / Business Name</label>
                                                        <input
                                                            type="text"
                                                            value={contactForm.shopName}
                                                            onChange={(e) => setContactForm({ ...contactForm, shopName: e.target.value })}
                                                            placeholder="e.g. CSC Center"
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

                                                <Button type="submit" className="w-full font-semibold h-11 shadow-md bg-primary hover:bg-primary/90 text-primary-foreground">
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
