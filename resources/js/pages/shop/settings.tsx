import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import { 
    Store, 
    Printer as PrinterIcon, 
    Activity, 
    DollarSign, 
    CreditCard, 
    CheckCircle2, 
    XCircle, 
    RefreshCw, 
    UploadCloud, 
    ExternalLink, 
    Copy, 
    Check, 
    Eye, 
    EyeOff, 
    Cpu, 
    Zap, 
    Layers, 
    Phone, 
    Mail, 
    MapPin, 
    ShieldCheck, 
    Sparkles,
    AlertCircle,
    ScanLine,
    QrCode,
    Smartphone
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Shop Settings',
        href: '/shop/settings',
    },
];

interface DetectedPrinter {
    name: string;
    driver: string;
    port: string;
    is_default: boolean;
    status: string;
    status_text: string;
    is_color_capable: boolean;
}

interface PrinterStatusItem {
    name: string;
    status: 'online' | 'offline' | 'busy' | 'error';
    status_text: string;
    driver: string;
    port: string;
    last_checked: string;
    capabilities: any;
}

interface ShopSettingsProps {
    shop: {
        id: number;
        uuid: string;
        title: string;
        print_token: string;
        is_active: boolean;
        customer_url: string;
    };
    settings: {
        id: number;
        shop_name: string;
        email: string;
        address: string;
        mobile_number: string;
        logo_url: string | null;
        bw_printer_name: string;
        color_printer_name: string;
        auto_detect_enabled: boolean;
        bw_price_per_page: number;
        color_price_per_page: number;
        scanner_price_per_page: number;
        online_payment_enabled: boolean;
        counter_payment_enabled: boolean;
        show_currency: boolean;
        currency_symbol: string;
        payment_modes: string[];
        gateway_provider?: string;
        upi_id?: string;
        merchant_name?: string;
        default_online_submode?: string;
        webhook_secret?: string;
        api_key_id: string;
        secret_key: string;
        webhook_url: string;
    };
    printers: any[];
    detectedPrinters: DetectedPrinter[];
    bwStatus: PrinterStatusItem;
    colorStatus: PrinterStatusItem;
    activeTab?: string;
}

export default function ShopSettings({
    shop,
    settings,
    printers,
    detectedPrinters: initialDetectedPrinters,
    bwStatus: initialBwStatus,
    colorStatus: initialColorStatus,
    activeTab: propActiveTab,
}: ShopSettingsProps) {
    const [currentTab, setCurrentTab] = useState<string>(propActiveTab || 'shop-profile');
    const [detectedList, setDetectedList] = useState<DetectedPrinter[]>(initialDetectedPrinters || []);
    const [isDetecting, setIsDetecting] = useState(false);
    const [bwLiveStatus, setBwLiveStatus] = useState<PrinterStatusItem>(initialBwStatus);
    const [colorLiveStatus, setColorLiveStatus] = useState<PrinterStatusItem>(initialColorStatus);
    const [isRefreshingStatus, setIsRefreshingStatus] = useState(false);
    const [isPrintingBwTest, setIsPrintingBwTest] = useState(false);
    const [isPrintingColorTest, setIsPrintingColorTest] = useState(false);
    const [copiedWebhook, setCopiedWebhook] = useState(false);
    const [showSecretKey, setShowSecretKey] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(settings.logo_url);

    // Tab 1: Profile Form
    const profileForm = useForm({
        shop_name: settings.shop_name,
        email: settings.email,
        address: settings.address,
        mobile_number: settings.mobile_number,
        logo: null as File | null,
    });

    // Tab 2: Printer Setup Form
    const printerForm = useForm({
        bw_printer_name: settings.bw_printer_name || (detectedList[0]?.name ?? ''),
        color_printer_name: settings.color_printer_name || (detectedList[1]?.name ?? detectedList[0]?.name ?? ''),
        auto_detect_enabled: settings.auto_detect_enabled,
    });

    // Tab 4: Pricing Form
    const pricingForm = useForm({
        bw_price_per_page: settings.bw_price_per_page,
        color_price_per_page: settings.color_price_per_page,
        scanner_price_per_page: settings.scanner_price_per_page,
    });

    // Tab 5: Payment Form
    const paymentForm = useForm({
        online_payment_enabled: settings.online_payment_enabled,
        counter_payment_enabled: settings.counter_payment_enabled,
        show_currency: settings.show_currency,
        currency_symbol: settings.currency_symbol,
        payment_modes: settings.payment_modes,
        gateway_provider: settings.gateway_provider || 'razorpay',
        upi_id: settings.upi_id || '',
        merchant_name: settings.merchant_name || settings.shop_name || '',
        default_online_submode: settings.default_online_submode || 'upi',
        api_key_id: settings.api_key_id,
        secret_key: settings.secret_key,
        webhook_secret: settings.webhook_secret || '',
        webhook_url: settings.webhook_url,
    });

    // Handle Tab 1 Profile Submit
    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.post(route('shop.settings.profile.update'), {
            forceFormData: true,
            onSuccess: () => toast.success('Shop Profile updated successfully!'),
            onError: () => toast.error('Failed to update shop profile. Please check the fields.'),
        });
    };

    // Handle Logo Change
    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            profileForm.setData('logo', file);
            const reader = new FileReader();
            reader.onload = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle Auto-Detect Button
    const handleAutoDetect = async () => {
        setIsDetecting(true);
        try {
            const res = await fetch(route('shop.settings.auto-detect-printers'));
            const data = await res.json();
            if (data.success) {
                setDetectedList(data.printers);
                if (data.printers.length > 0) {
                    // Auto select suggested
                    if (!printerForm.data.bw_printer_name) {
                        printerForm.setData('bw_printer_name', data.printers[0].name);
                    }
                    const colorCandidate = data.printers.find((p: DetectedPrinter) => p.is_color_capable) || data.printers[1] || data.printers[0];
                    if (!printerForm.data.color_printer_name && colorCandidate) {
                        printerForm.setData('color_printer_name', colorCandidate.name);
                    }
                }
                toast.success(`Found ${data.count} attached printer(s) on your system.`);
            }
        } catch (err) {
            toast.error('Could not auto-detect printers. Please check hardware connection.');
        } finally {
            setIsDetecting(false);
        }
    };

    // Handle Tab 2 Printer Submit
    const handlePrinterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        printerForm.post(route('shop.settings.printer.update'), {
            onSuccess: () => {
                toast.success('Printer configuration saved successfully!');
                handleRefreshStatus();
            },
            onError: () => toast.error('Failed to save printer settings.'),
        });
    };

    // Handle Tab 3 Refresh Status
    const handleRefreshStatus = async () => {
        setIsRefreshingStatus(true);
        try {
            const res = await fetch(route('shop.settings.printer-status'));
            const data = await res.json();
            if (data.success) {
                setBwLiveStatus(data.bwStatus);
                setColorLiveStatus(data.colorStatus);
                toast.success('Printer statuses refreshed!');
            }
        } catch (err) {
            toast.error('Failed to refresh status.');
        } finally {
            setIsRefreshingStatus(false);
        }
    };

    // Handle Test Print
    const handleTestPrint = (type: 'bw' | 'color') => {
        if (type === 'bw') setIsPrintingBwTest(true);
        if (type === 'color') setIsPrintingColorTest(true);

        router.post(
            route('shop.settings.print-test'),
            { type },
            {
                onFinish: () => {
                    if (type === 'bw') setIsPrintingBwTest(false);
                    if (type === 'color') setIsPrintingColorTest(false);
                },
                onSuccess: () => toast.success(`Test page sent to ${type.toUpperCase()} printer!`),
                onError: () => toast.error('Could not send test print job.'),
            }
        );
    };

    // Handle Tab 4 Pricing Submit
    const handlePricingSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        pricingForm.post(route('shop.settings.pricing.update'), {
            onSuccess: () => toast.success('Pricing rates updated successfully!'),
            onError: () => toast.error('Failed to update pricing rates.'),
        });
    };

    // Handle Tab 5 Payment Submit
    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        paymentForm.post(route('shop.settings.payment.update'), {
            onSuccess: () => toast.success('Payment settings saved successfully!'),
            onError: () => toast.error('Failed to update payment settings.'),
        });
    };

    // Toggle Payment Mode
    const togglePaymentMode = (mode: string) => {
        const current = paymentForm.data.payment_modes || [];
        if (current.includes(mode)) {
            paymentForm.setData('payment_modes', current.filter((m) => m !== mode));
        } else {
            paymentForm.setData('payment_modes', [...current, mode]);
        }
    };

    // Copy Webhook URL
    const copyWebhook = () => {
        if (settings.webhook_url) {
            navigator.clipboard.writeText(settings.webhook_url);
            setCopiedWebhook(true);
            toast.success('Webhook URL copied to clipboard!');
            setTimeout(() => setCopiedWebhook(false), 2000);
        }
    };

    const tabs = [
        { id: 'shop-profile', label: 'Shop Profile', icon: Store, desc: 'Name, email, contact & branding' },
        { id: 'printer', label: 'Printer Setup', icon: PrinterIcon, desc: 'Auto-detect & hardware selection' },
        { id: 'printer-status', label: 'Printer Status', icon: Activity, desc: 'Live diagnostics & test print' },
        { id: 'pricing', label: 'Pricing Rates', icon: DollarSign, desc: 'B/W, Color & Scanner rate card' },
        { id: 'payment', label: 'Payment Settings', icon: CreditCard, desc: 'Online, Counter, UPI & API keys' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Shop Settings & Hardware Configuration" />

            <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                {/* Header Banner */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-background border border-primary/20 p-6 sm:p-8 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-background/80 text-primary border-primary/30 px-3 py-1 font-medium">
                                    <Sparkles className="w-3.5 h-3.5 mr-1 inline" /> Hardware & Store Control
                                </Badge>
                                <span className="text-xs text-muted-foreground">Token: <code className="bg-muted px-1.5 py-0.5 rounded">{shop.print_token}</code></span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                {settings.shop_name || shop.title}
                            </h1>
                            <p className="text-sm text-muted-foreground max-w-2xl">
                                Configure your store branding, auto-detect and assign attached B/W and Color printers, verify real-time status, manage rate cards, and configure payments.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <Button variant="outline" size="sm" asChild className="gap-1.5 bg-background shadow-xs">
                                <a href={shop.customer_url} target="_blank" rel="noreferrer">
                                    <ExternalLink className="w-4 h-4 text-primary" />
                                    Customer Shop Page
                                </a>
                            </Button>
                            <Button 
                                variant="default" 
                                size="sm" 
                                className="gap-1.5"
                                onClick={() => {
                                    setCurrentTab('printer-status');
                                    handleRefreshStatus();
                                }}
                            >
                                <Activity className="w-4 h-4" />
                                Test Diagnostics
                            </Button>
                        </div>
                    </div>

                    {/* Quick Live Status Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-border/60">
                        <div className="flex items-center gap-2.5">
                            <div className="size-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <div className="text-xs">
                                <p className="font-medium text-foreground">B/W Printer</p>
                                <p className="text-muted-foreground truncate max-w-[140px]">{bwLiveStatus.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <div className={`size-2.5 rounded-full ${colorLiveStatus.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                            <div className="text-xs">
                                <p className="font-medium text-foreground">Color Printer</p>
                                <p className="text-muted-foreground truncate max-w-[140px]">{colorLiveStatus.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <DollarSign className="w-4 h-4 text-primary" />
                            <div className="text-xs">
                                <p className="font-medium text-foreground">Rates (B/W · Color)</p>
                                <p className="text-muted-foreground">{settings.currency_symbol}{settings.bw_price_per_page} · {settings.currency_symbol}{settings.color_price_per_page}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <CreditCard className="w-4 h-4 text-primary" />
                            <div className="text-xs">
                                <p className="font-medium text-foreground">Payment Modes</p>
                                <p className="text-muted-foreground">{(settings.payment_modes || []).length} Enabled</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation Navigation Bar */}
                <div className="flex overflow-x-auto no-scrollbar gap-2 p-1.5 bg-muted/50 rounded-xl border border-border/80">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = currentTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setCurrentTab(tab.id)}
                                className={`flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-medium transition-all shrink-0 cursor-pointer ${
                                    isActive
                                        ? 'bg-background text-foreground shadow-xs border border-border font-semibold'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                                }`}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* TAB 1: SHOP PROFILE */}
                {currentTab === 'shop-profile' && (
                    <Card className="border-border shadow-xs">
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Store className="w-5 h-5 text-primary" /> Shop Profile & Branding
                            </CardTitle>
                            <CardDescription>
                                Set your shop's official business name, support email, contact number, physical address, and logo.
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={handleProfileSubmit}>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Logo Upload Box */}
                                    <div className="space-y-3">
                                        <Label className="text-sm font-semibold">Shop Logo</Label>
                                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary/50 transition-colors bg-muted/20">
                                            {logoPreview ? (
                                                <div className="relative group">
                                                    <img
                                                        src={logoPreview}
                                                        alt="Shop Logo"
                                                        className="w-32 h-32 object-contain rounded-lg border bg-background p-1"
                                                    />
                                                    <div className="mt-2 text-xs text-muted-foreground">Click below to change</div>
                                                </div>
                                            ) : (
                                                <div className="py-6 flex flex-col items-center">
                                                    <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                                                        <UploadCloud className="w-6 h-6" />
                                                    </div>
                                                    <p className="text-xs font-medium text-foreground">Upload store logo</p>
                                                    <p className="text-[11px] text-muted-foreground mt-0.5">PNG, JPG, SVG up to 4MB</p>
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                id="logo-upload"
                                                accept="image/*"
                                                onChange={handleLogoChange}
                                                className="hidden"
                                            />
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                className="mt-3 cursor-pointer"
                                                onClick={() => document.getElementById('logo-upload')?.click()}
                                            >
                                                {logoPreview ? 'Replace Logo' : 'Select Image'}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Inputs Column */}
                                    <div className="md:col-span-2 space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="shop_name">Shop Name <span className="text-destructive">*</span></Label>
                                                <div className="relative">
                                                    <Store className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="shop_name"
                                                        className="pl-9"
                                                        placeholder="e.g. Pawan Cyber Cafe & Print Point"
                                                        value={profileForm.data.shop_name}
                                                        onChange={(e) => profileForm.setData('shop_name', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                {profileForm.errors.shop_name && (
                                                    <p className="text-xs text-destructive">{profileForm.errors.shop_name}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="email">Shop Email</Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        className="pl-9"
                                                        placeholder="e.g. contact@pawancyber.com"
                                                        value={profileForm.data.email}
                                                        onChange={(e) => profileForm.setData('email', e.target.value)}
                                                    />
                                                </div>
                                                {profileForm.errors.email && (
                                                    <p className="text-xs text-destructive">{profileForm.errors.email}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="mobile_number">Mobile / WhatsApp Number</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="mobile_number"
                                                    className="pl-9"
                                                    placeholder="e.g. +91 98765 43210"
                                                    value={profileForm.data.mobile_number}
                                                    onChange={(e) => profileForm.setData('mobile_number', e.target.value)}
                                                />
                                            </div>
                                            {profileForm.errors.mobile_number && (
                                                <p className="text-xs text-destructive">{profileForm.errors.mobile_number}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="address">Shop Physical Address</Label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="address"
                                                    className="pl-9"
                                                    placeholder="e.g. Shop 12, Cyber Complex, Main Road, City"
                                                    value={profileForm.data.address}
                                                    onChange={(e) => profileForm.setData('address', e.target.value)}
                                                />
                                            </div>
                                            {profileForm.errors.address && (
                                                <p className="text-xs text-destructive">{profileForm.errors.address}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end border-t border-border pt-4">
                                <Button type="submit" disabled={profileForm.processing} className="min-w-32">
                                    {profileForm.processing ? 'Saving...' : 'Save Profile'}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                )}

                {/* TAB 2: PRINTER SETUP & AUTO-DETECT */}
                {currentTab === 'printer' && (
                    <Card className="border-border shadow-xs">
                        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <PrinterIcon className="w-5 h-5 text-primary" /> Printer Selection & Auto-Detection
                                </CardTitle>
                                <CardDescription>
                                    Scan printers attached to your PC/Laptop via USB or local network, and configure dedicated B/W and Color spool targets.
                                </CardDescription>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleAutoDetect}
                                disabled={isDetecting}
                                className="gap-2 shrink-0 bg-primary/5 hover:bg-primary/10 border-primary/30 text-primary"
                            >
                                <RefreshCw className={`w-4 h-4 ${isDetecting ? 'animate-spin' : ''}`} />
                                {isDetecting ? 'Scanning PC Printers...' : 'Auto-Detect Attached Printers'}
                            </Button>
                        </CardHeader>
                        <form onSubmit={handlePrinterSubmit}>
                            <CardContent className="space-y-6">
                                {/* Attached Printers Live List */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                            <Cpu className="w-3.5 h-3.5 text-primary" /> Detected Hardware on System ({detectedList.length})
                                        </Label>
                                        <span className="text-[11px] text-muted-foreground">Auto-synced via Windows Print Spooler</span>
                                    </div>

                                    {detectedList.length === 0 ? (
                                        <div className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">
                                            No local printers detected yet. Click "Auto-Detect Attached Printers" above to scan.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {detectedList.map((p, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-start justify-between p-3.5 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/40 transition-colors"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`p-2 rounded-lg ${p.is_color_capable ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'}`}>
                                                            <PrinterIcon className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-sm text-foreground">{p.name}</span>
                                                                {p.is_default && <Badge variant="secondary" className="text-[10px] py-0">Default</Badge>}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                                Driver: {p.driver} · Port: <span className="font-mono">{p.port}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Badge
                                                        variant={p.status === 'online' ? 'default' : 'outline'}
                                                        className={`text-xs ${p.status === 'online' ? 'bg-emerald-600 hover:bg-emerald-600' : 'text-muted-foreground'}`}
                                                    >
                                                        {p.status_text}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Printer Assignment Selectors */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                                    {/* B/W Printer Selection */}
                                    <div className="space-y-3 p-4 rounded-xl border border-border/80 bg-background shadow-xs">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="bw_printer_name" className="text-sm font-semibold flex items-center gap-1.5">
                                                <div className="size-3 rounded-full bg-slate-900 dark:bg-slate-100" />
                                                Black & White Printer <span className="text-destructive">*</span>
                                            </Label>
                                            <Badge variant="outline" className="text-[11px]">Monochrome</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Select the printer to process B/W document print orders.</p>
                                        
                                        <select
                                            id="bw_printer_name"
                                            value={printerForm.data.bw_printer_name}
                                            onChange={(e) => printerForm.setData('bw_printer_name', e.target.value)}
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
                                            required
                                        >
                                            <option value="">-- Choose B/W Printer --</option>
                                            {detectedList.map((p, i) => (
                                                <option key={i} value={p.name}>
                                                    {p.name} ({p.port})
                                                </option>
                                            ))}
                                            {/* Registered fallback printers */}
                                            {printers.map((p, i) => (
                                                !detectedList.some(d => d.name === p.name) && (
                                                    <option key={`db-${i}`} value={p.name}>
                                                        {p.name} (Registered)
                                                    </option>
                                                )
                                            ))}
                                        </select>
                                        {printerForm.errors.bw_printer_name && (
                                            <p className="text-xs text-destructive">{printerForm.errors.bw_printer_name}</p>
                                        )}
                                    </div>

                                    {/* Color Printer Selection */}
                                    <div className="space-y-3 p-4 rounded-xl border border-border/80 bg-background shadow-xs">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="color_printer_name" className="text-sm font-semibold flex items-center gap-1.5">
                                                <div className="size-3 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />
                                                Color Printer
                                            </Label>
                                            <Badge variant="outline" className="text-[11px] text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-800">
                                                Multi-Color
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Select the printer to process color document and photo print jobs.</p>

                                        <select
                                            id="color_printer_name"
                                            value={printerForm.data.color_printer_name}
                                            onChange={(e) => printerForm.setData('color_printer_name', e.target.value)}
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
                                        >
                                            <option value="">-- Same as B/W or Choose Color Printer --</option>
                                            {detectedList.map((p, i) => (
                                                <option key={i} value={p.name}>
                                                    {p.name} ({p.port}) {p.is_color_capable ? '🎨' : ''}
                                                </option>
                                            ))}
                                            {printers.map((p, i) => (
                                                !detectedList.some(d => d.name === p.name) && (
                                                    <option key={`db-c-${i}`} value={p.name}>
                                                        {p.name} (Registered)
                                                    </option>
                                                )
                                            ))}
                                        </select>
                                        {printerForm.errors.color_printer_name && (
                                            <p className="text-xs text-destructive">{printerForm.errors.color_printer_name}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Auto Detect On-Start Toggle */}
                                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/60">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-medium">Automatic Hardware Sync</Label>
                                        <p className="text-xs text-muted-foreground">Keep printer status and USB changes continuously synchronized in background.</p>
                                    </div>
                                    <Switch
                                        checked={printerForm.data.auto_detect_enabled}
                                        onCheckedChange={(checked) => printerForm.setData('auto_detect_enabled', checked)}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end border-t border-border pt-4">
                                <Button type="submit" disabled={printerForm.processing} className="min-w-32">
                                    {printerForm.processing ? 'Saving...' : 'Save Configuration'}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                )}

                {/* TAB 3: PRINTER STATUS & TEST PRINT */}
                {currentTab === 'printer-status' && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-primary" /> Live Hardware Diagnostics
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Real-time connection verification and test print dispatch for both B/W and Color units.
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleRefreshStatus}
                                disabled={isRefreshingStatus}
                                className="gap-2 bg-background shadow-xs"
                            >
                                <RefreshCw className={`w-4 h-4 ${isRefreshingStatus ? 'animate-spin' : ''}`} />
                                {isRefreshingStatus ? 'Refreshing...' : 'Refresh Status'}
                            </Button>
                        </div>

                        {/* Dual Status Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* B/W Printer Card */}
                            <Card className="border-border shadow-xs overflow-hidden">
                                <div className="h-2 bg-slate-800 dark:bg-slate-200" />
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <Badge variant="outline" className="font-semibold text-xs bg-slate-100 dark:bg-slate-800">
                                            B/W Printer Target
                                        </Badge>
                                        <Badge
                                            className={
                                                bwLiveStatus.status === 'online'
                                                    ? 'bg-emerald-600 hover:bg-emerald-600 text-white'
                                                    : 'bg-destructive hover:bg-destructive text-white'
                                            }
                                        >
                                            <span className="size-1.5 rounded-full bg-white mr-1.5 animate-pulse" />
                                            {bwLiveStatus.status_text}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-lg mt-2 truncate">{bwLiveStatus.name}</CardTitle>
                                    <CardDescription>
                                        Driver: {bwLiveStatus.driver}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div className="flex justify-between py-1.5 border-b border-border/50 text-xs">
                                        <span className="text-muted-foreground">Spool Port</span>
                                        <span className="font-mono font-medium">{bwLiveStatus.port}</span>
                                    </div>
                                    <div className="flex justify-between py-1.5 border-b border-border/50 text-xs">
                                        <span className="text-muted-foreground">Color Mode</span>
                                        <span className="font-medium">Monochrome (Grayscale)</span>
                                    </div>
                                    <div className="flex justify-between py-1.5 text-xs">
                                        <span className="text-muted-foreground">Last Checked</span>
                                        <span className="text-muted-foreground">{bwLiveStatus.last_checked}</span>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-muted/20 border-t border-border pt-4">
                                    <Button
                                        type="button"
                                        variant="default"
                                        className="w-full gap-2"
                                        disabled={isPrintingBwTest || bwLiveStatus.name === 'Not Configured'}
                                        onClick={() => handleTestPrint('bw')}
                                    >
                                        <PrinterIcon className={`w-4 h-4 ${isPrintingBwTest ? 'animate-bounce' : ''}`} />
                                        {isPrintingBwTest ? 'Sending Test Page...' : 'Print B/W Test Page'}
                                    </Button>
                                </CardFooter>
                            </Card>

                            {/* Color Printer Card */}
                            <Card className="border-border shadow-xs overflow-hidden">
                                <div className="h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <Badge variant="outline" className="font-semibold text-xs bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200">
                                            Color Printer Target
                                        </Badge>
                                        <Badge
                                            className={
                                                colorLiveStatus.status === 'online'
                                                    ? 'bg-emerald-600 hover:bg-emerald-600 text-white'
                                                    : 'bg-amber-600 hover:bg-amber-600 text-white'
                                            }
                                        >
                                            <span className="size-1.5 rounded-full bg-white mr-1.5 animate-pulse" />
                                            {colorLiveStatus.status_text}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-lg mt-2 truncate">{colorLiveStatus.name}</CardTitle>
                                    <CardDescription>
                                        Driver: {colorLiveStatus.driver}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div className="flex justify-between py-1.5 border-b border-border/50 text-xs">
                                        <span className="text-muted-foreground">Spool Port</span>
                                        <span className="font-mono font-medium">{colorLiveStatus.port}</span>
                                    </div>
                                    <div className="flex justify-between py-1.5 border-b border-border/50 text-xs">
                                        <span className="text-muted-foreground">Color Mode</span>
                                        <span className="font-medium text-purple-600 dark:text-purple-400 font-semibold">Full Color CMYK / RGB</span>
                                    </div>
                                    <div className="flex justify-between py-1.5 text-xs">
                                        <span className="text-muted-foreground">Last Checked</span>
                                        <span className="text-muted-foreground">{colorLiveStatus.last_checked}</span>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-muted/20 border-t border-border pt-4">
                                    <Button
                                        type="button"
                                        variant="default"
                                        className="w-full gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                                        disabled={isPrintingColorTest || colorLiveStatus.name === 'Not Configured'}
                                        onClick={() => handleTestPrint('color')}
                                    >
                                        <PrinterIcon className={`w-4 h-4 ${isPrintingColorTest ? 'animate-bounce' : ''}`} />
                                        {isPrintingColorTest ? 'Sending Test Page...' : 'Print Color Test Page'}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                )}

                {/* TAB 4: PRICING RATE SETTING */}
                {currentTab === 'pricing' && (
                    <Card className="border-border shadow-xs">
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-primary" /> Pricing Rate Settings
                            </CardTitle>
                            <CardDescription>
                                Configure your per-page rates for black & white printing, color printing, and document scanning services.
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={handlePricingSubmit}>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    {/* B/W Rate */}
                                    <div className="p-5 rounded-2xl border border-border/80 bg-background shadow-xs space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 flex items-center justify-center font-bold">
                                                B/W
                                            </div>
                                            <Badge variant="outline">Monochrome</Badge>
                                        </div>
                                        <div>
                                            <Label htmlFor="bw_price_per_page" className="text-sm font-semibold">
                                                B/W Print Per Page Price
                                            </Label>
                                            <p className="text-xs text-muted-foreground mt-0.5">Standard single/duplex B&W impressions.</p>
                                        </div>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-muted-foreground font-semibold">
                                                {settings.currency_symbol}
                                            </span>
                                            <Input
                                                id="bw_price_per_page"
                                                type="number"
                                                step="0.50"
                                                min="0"
                                                className="pl-8 text-lg font-bold"
                                                value={pricingForm.data.bw_price_per_page}
                                                onChange={(e) => pricingForm.setData('bw_price_per_page', parseFloat(e.target.value) || 0)}
                                                required
                                            />
                                        </div>
                                        {pricingForm.errors.bw_price_per_page && (
                                            <p className="text-xs text-destructive">{pricingForm.errors.bw_price_per_page}</p>
                                        )}
                                    </div>

                                    {/* Color Rate */}
                                    <div className="p-5 rounded-2xl border border-border/80 bg-background shadow-xs space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="size-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                                                CLR
                                            </div>
                                            <Badge variant="outline" className="text-purple-600 border-purple-300 dark:border-purple-800">
                                                Color Print
                                            </Badge>
                                        </div>
                                        <div>
                                            <Label htmlFor="color_price_per_page" className="text-sm font-semibold">
                                                Color Print Per Page Price
                                            </Label>
                                            <p className="text-xs text-muted-foreground mt-0.5">Vibrant full-color documents & graphics.</p>
                                        </div>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-muted-foreground font-semibold">
                                                {settings.currency_symbol}
                                            </span>
                                            <Input
                                                id="color_price_per_page"
                                                type="number"
                                                step="0.50"
                                                min="0"
                                                className="pl-8 text-lg font-bold"
                                                value={pricingForm.data.color_price_per_page}
                                                onChange={(e) => pricingForm.setData('color_price_per_page', parseFloat(e.target.value) || 0)}
                                                required
                                            />
                                        </div>
                                        {pricingForm.errors.color_price_per_page && (
                                            <p className="text-xs text-destructive">{pricingForm.errors.color_price_per_page}</p>
                                        )}
                                    </div>

                                    {/* Scanner Rate */}
                                    <div className="p-5 rounded-2xl border border-border/80 bg-background shadow-xs space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="size-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                                <ScanLine className="w-5 h-5" />
                                            </div>
                                            <Badge variant="outline" className="text-amber-600 border-amber-300 dark:border-amber-800">
                                                Scanner
                                            </Badge>
                                        </div>
                                        <div>
                                            <Label htmlFor="scanner_price_per_page" className="text-sm font-semibold">
                                                Scanner - 1 Page Price
                                            </Label>
                                            <p className="text-xs text-muted-foreground mt-0.5">High-resolution digitizing scan service.</p>
                                        </div>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-muted-foreground font-semibold">
                                                {settings.currency_symbol}
                                            </span>
                                            <Input
                                                id="scanner_price_per_page"
                                                type="number"
                                                step="0.50"
                                                min="0"
                                                className="pl-8 text-lg font-bold"
                                                value={pricingForm.data.scanner_price_per_page}
                                                onChange={(e) => pricingForm.setData('scanner_price_per_page', parseFloat(e.target.value) || 0)}
                                                required
                                            />
                                        </div>
                                        {pricingForm.errors.scanner_price_per_page && (
                                            <p className="text-xs text-destructive">{pricingForm.errors.scanner_price_per_page}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Live Customer Preview Card */}
                                <div className="p-4 rounded-xl bg-muted/30 border border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                            <Sparkles className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">Customer Estimate Sync</p>
                                            <p className="text-xs text-muted-foreground">Changing rates dynamically updates customer checkout and invoice totals automatically.</p>
                                        </div>
                                    </div>
                                    <div className="text-sm font-mono font-medium px-3 py-1 bg-background rounded-md border text-foreground shrink-0">
                                        Sample: 5 pgs B/W = {settings.currency_symbol}{(pricingForm.data.bw_price_per_page * 5).toFixed(2)}
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end border-t border-border pt-4">
                                <Button type="submit" disabled={pricingForm.processing} className="min-w-32">
                                    {pricingForm.processing ? 'Saving...' : 'Save Pricing Rates'}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                )}

                {/* TAB 5: PAYMENT SETTING */}
                {currentTab === 'payment' && (
                    <Card className="border-border shadow-xs">
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-primary" /> Payment Gateway & UPI Configuration
                            </CardTitle>
                            <CardDescription>
                                Configure online payment gateway, direct UPI VPA, default checkout options (Pay Online with UPI selected by default), and API credentials.
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={handlePaymentSubmit}>
                            <CardContent className="space-y-6">
                                {/* Payment Mode & Currency Display Row */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Payment Mode Selector */}
                                    <div className="lg:col-span-2 space-y-3">
                                        <Label className="text-sm font-semibold">Payment Mode</Label>
                                        <p className="text-xs text-muted-foreground">Configure how you'll take money from customers — counter, online or both.</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            {[
                                                { id: 'both', label: '💳 Online + Counter', desc: 'The customer gets both options' },
                                                { id: 'online', label: '🌐 Online Only', desc: 'Online payment only, no counter' },
                                                { id: 'counter', label: '💵 Counter Only', desc: 'Cash at the counter only' },
                                            ].map((mode) => {
                                                const isSelected = (mode.id === 'both' && paymentForm.data.online_payment_enabled && paymentForm.data.counter_payment_enabled) ||
                                                                   (mode.id === 'online' && paymentForm.data.online_payment_enabled && !paymentForm.data.counter_payment_enabled) ||
                                                                   (mode.id === 'counter' && !paymentForm.data.online_payment_enabled && paymentForm.data.counter_payment_enabled);
                                                
                                                const selectMode = () => {
                                                    paymentForm.setData({
                                                        ...paymentForm.data,
                                                        online_payment_enabled: mode.id === 'both' || mode.id === 'online',
                                                        counter_payment_enabled: mode.id === 'both' || mode.id === 'counter'
                                                    });
                                                };

                                                return (
                                                    <button
                                                        key={mode.id}
                                                        type="button"
                                                        onClick={selectMode}
                                                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-full ${
                                                            isSelected
                                                                ? 'border-primary bg-primary/[0.02] shadow-xs text-foreground ring-1 ring-primary/40 font-semibold'
                                                                : 'border-border bg-background text-muted-foreground hover:border-border/80'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between w-full mb-1">
                                                            <span className="font-semibold text-sm text-foreground">{mode.label}</span>
                                                            {isSelected ? (
                                                                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                                            ) : (
                                                                <div className="size-4 rounded-full border border-muted-foreground/40 shrink-0" />
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] text-muted-foreground mt-1 leading-tight">{mode.desc}</p>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Currency Display Selector */}
                                    <div className="space-y-3">
                                        <Label className="text-sm font-semibold">Currency Settings</Label>
                                        <p className="text-xs text-muted-foreground font-normal">Toggle how pricing is formatted.</p>
                                        <div className="p-4 rounded-xl border border-border/80 bg-background shadow-xs flex items-center justify-between h-[calc(100%-2.5rem)]">
                                            <div className="space-y-0.5">
                                                <Label className="text-sm font-semibold">Currency Display</Label>
                                                <p className="text-xs text-muted-foreground">Show {paymentForm.data.currency_symbol} symbol in UI</p>
                                            </div>
                                            <Switch
                                                checked={paymentForm.data.show_currency}
                                                onCheckedChange={(c) => paymentForm.setData('show_currency', c)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 1: Payment Gateway Provider Selection */}
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label className="text-sm font-semibold text-foreground">Payment Gateway Provider</Label>
                                            <p className="text-xs text-muted-foreground">Choose your payment aggregator or direct bank UPI routing for online payments.</p>
                                        </div>
                                        <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                                            UPI + Card Supported
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                        {[
                                            {
                                                id: 'razorpay',
                                                name: 'Razorpay',
                                                badge: 'Recommended',
                                                desc: 'Instant UPI Intent, Dynamic QR, Cards, NetBanking & Auto-webhooks',
                                            },
                                            {
                                                id: 'phonepe',
                                                name: 'PhonePe Payment Gateway',
                                                badge: 'Popular',
                                                desc: 'Direct PhonePe UPI Switch, Merchant QR, Cards & Fast Settlements',
                                            },
                                            {
                                                id: 'paytm',
                                                name: 'Paytm Payment Gateway',
                                                badge: 'All-in-One',
                                                desc: 'Paytm UPI, QR, Postpaid, Wallets & Debit/Credit Cards',
                                            },
                                            {
                                                id: 'cashfree',
                                                name: 'Cashfree Payments',
                                                badge: 'Low Fee',
                                                desc: 'Seamless UPI Intent, Card tokenization & instant webhooks',
                                            },
                                            {
                                                id: 'direct_upi',
                                                name: 'Direct UPI VPA / QR',
                                                badge: '0% Fee',
                                                desc: 'Direct bank transfer to your UPI ID without intermediate gateway fee',
                                            },
                                            {
                                                id: 'stripe',
                                                name: 'Stripe Payments',
                                                badge: 'Global',
                                                desc: 'International credit & debit cards with 3D Secure verification',
                                            },
                                        ].map((prov) => {
                                            const isSelected = paymentForm.data.gateway_provider === prov.id;
                                            return (
                                                <button
                                                    key={prov.id}
                                                    type="button"
                                                    onClick={() => paymentForm.setData('gateway_provider', prov.id)}
                                                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                                                        isSelected
                                                            ? 'border-primary bg-primary/5 shadow-xs text-foreground ring-2 ring-primary/40'
                                                            : 'border-border bg-background text-muted-foreground hover:border-border/80'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-semibold text-sm text-foreground">{prov.name}</span>
                                                        <Badge variant={isSelected ? 'default' : 'secondary'} className="text-[10px] py-0 px-1.5 font-normal">
                                                            {prov.badge}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground line-clamp-2">{prov.desc}</p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Section 2: Online Payment & Merchant Details */}
                                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="w-5 h-5 text-primary" />
                                            <h4 className="font-semibold text-sm text-foreground">Online Payment & Merchant Information</h4>
                                        </div>
                                        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs">
                                            Gateway Active
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="upi_id" className="text-xs font-semibold">
                                                Shop UPI ID / VPA
                                            </Label>
                                            <Input
                                                id="upi_id"
                                                placeholder="e.g. 9876543210@paytm or shop@okhdfcbank"
                                                value={paymentForm.data.upi_id}
                                                onChange={(e) => paymentForm.setData('upi_id', e.target.value)}
                                                className="bg-background text-sm font-mono"
                                            />
                                            <p className="text-[11px] text-muted-foreground">
                                                Optional shop VPA identifier for direct settlement records.
                                            </p>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="merchant_name" className="text-xs font-semibold">
                                                Merchant Display Name
                                            </Label>
                                            <Input
                                                id="merchant_name"
                                                placeholder="e.g. ABC Cyber Cafe"
                                                value={paymentForm.data.merchant_name}
                                                onChange={(e) => paymentForm.setData('merchant_name', e.target.value)}
                                                className="bg-background text-sm"
                                            />
                                            <p className="text-[11px] text-muted-foreground">
                                                Business name displayed on customer receipts and checkout.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3: Accepted Payment Modes Multi-Selector */}
                                <div className="space-y-3 pt-2">
                                    <Label className="text-sm font-semibold">Accepted Payment Modes</Label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {[
                                            { id: 'cash', label: 'Cash', desc: 'Direct counter cash' },
                                            { id: 'upi', label: 'UPI', desc: 'GPay, PhonePe, Paytm' },
                                            { id: 'card', label: 'Card', desc: 'Debit & Credit cards' },
                                            { id: 'wallet', label: 'Wallet', desc: 'Prepaid balances' },
                                        ].map((mode) => {
                                            const isSelected = (paymentForm.data.payment_modes || []).includes(mode.id);
                                            return (
                                                <button
                                                    key={mode.id}
                                                    type="button"
                                                    onClick={() => togglePaymentMode(mode.id)}
                                                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                                                        isSelected
                                                            ? 'border-primary bg-primary/5 shadow-xs text-foreground ring-1 ring-primary/40'
                                                            : 'border-border bg-background text-muted-foreground hover:border-border/80'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-semibold text-sm text-foreground">{mode.label}</span>
                                                        {isSelected ? (
                                                            <CheckCircle2 className="w-4 h-4 text-primary" />
                                                        ) : (
                                                            <div className="size-4 rounded-full border border-muted-foreground/40" />
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">{mode.desc}</p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Section 4: API Key & Secret Group */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
                                    <div className="space-y-2">
                                        <Label htmlFor="api_key_id">Gateway API Key ID / Merchant ID</Label>
                                        <Input
                                            id="api_key_id"
                                            placeholder="e.g. rzp_live_xxxxxxxxxxxxxx"
                                            value={paymentForm.data.api_key_id}
                                            onChange={(e) => paymentForm.setData('api_key_id', e.target.value)}
                                        />
                                        <p className="text-xs text-muted-foreground">Public Merchant / Key ID for payment gateway initialization.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="secret_key">Gateway Secret Key</Label>
                                        <div className="relative">
                                            <Input
                                                id="secret_key"
                                                type={showSecretKey ? 'text' : 'password'}
                                                placeholder="e.g. ••••••••••••••••••••••••"
                                                value={paymentForm.data.secret_key}
                                                onChange={(e) => paymentForm.setData('secret_key', e.target.value)}
                                                className="pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowSecretKey(!showSecretKey)}
                                                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                                            >
                                                {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Never share your secret key. Stored securely.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="webhook_secret">Webhook Secret / Signing Key</Label>
                                        <Input
                                            id="webhook_secret"
                                            placeholder="e.g. whsec_xxxxxxxxxxxxxx"
                                            value={paymentForm.data.webhook_secret}
                                            onChange={(e) => paymentForm.setData('webhook_secret', e.target.value)}
                                        />
                                        <p className="text-xs text-muted-foreground">Used to cryptographically verify payment notifications.</p>
                                    </div>
                                </div>

                                {/* Section 5: Webhook URL Copyable Box */}
                                <div className="space-y-2 pt-2">
                                    <Label htmlFor="webhook_url">Webhook Notification Endpoint</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="webhook_url"
                                            readOnly
                                            value={paymentForm.data.webhook_url}
                                            className="font-mono text-xs bg-muted/30"
                                        />
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            className="shrink-0 gap-1.5"
                                            onClick={copyWebhook}
                                        >
                                            {copiedWebhook ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                                            {copiedWebhook ? 'Copied' : 'Copy URL'}
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Paste this URL into your payment gateway dashboard (Razorpay, PhonePe, Paytm, Stripe) to receive instant print trigger webhooks.
                                    </p>
                                </div>

                                {/* Section 6: Customer Checkout Experience Preview */}
                                <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="size-4 text-primary" />
                                            <span className="font-semibold text-xs text-foreground uppercase tracking-wider">
                                                Customer Checkout Preview
                                            </span>
                                        </div>
                                        <Badge variant="outline" className="text-[11px] bg-background">
                                            {paymentForm.data.gateway_provider.toUpperCase()} Gateway
                                        </Badge>
                                    </div>

                                    <div className="rounded-xl border border-primary/40 bg-background p-4 shadow-sm space-y-3">
                                        <div className="flex items-center justify-between border-b pb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="size-6 rounded-md bg-blue-500/10 text-blue-600 flex items-center justify-center">
                                                    <QrCode className="size-3.5" />
                                                </div>
                                                <span className="font-bold text-sm text-foreground">Pay Online (UPI / Card)</span>
                                            </div>
                                            <Badge className="bg-primary text-primary-foreground text-[10px]">
                                                Pre-selected
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                            <div className="p-3 rounded-lg border-2 border-emerald-500 bg-emerald-500/5 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        <Smartphone className="size-4 text-emerald-600" />
                                                        <span className="font-bold text-xs text-emerald-950 dark:text-emerald-200">
                                                            🟢 UPI (GPay / PhonePe / Paytm / QR)
                                                        </span>
                                                    </div>
                                                    <Badge className="bg-emerald-600 text-white text-[9px] py-0 px-1 font-bold">
                                                        Default Active
                                                    </Badge>
                                                </div>
                                                <p className="text-[11px] text-muted-foreground">
                                                    UPI ID: <span className="font-mono text-foreground font-semibold">{paymentForm.data.upi_id || 'shop@upi'}</span>
                                                </p>
                                                <div className="flex gap-1">
                                                    <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded font-bold">GPay</span>
                                                    <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded font-bold">PhonePe</span>
                                                    <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded font-bold">Paytm</span>
                                                    <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded font-bold">BHIM</span>
                                                </div>
                                            </div>

                                            <div className="p-3 rounded-lg border border-border bg-card/60 space-y-2 opacity-75">
                                                <div className="flex items-center gap-1.5">
                                                    <CreditCard className="size-4 text-muted-foreground" />
                                                    <span className="font-semibold text-xs text-foreground">
                                                        Debit / Credit Cards & NetBanking
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-muted-foreground">
                                                    Visa, MasterCard, RuPay, NetBanking & Wallets via {paymentForm.data.gateway_provider}.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end border-t border-border pt-4">
                                <Button type="submit" disabled={paymentForm.processing} className="min-w-36 gap-2">
                                    {paymentForm.processing ? 'Saving...' : 'Save Payment Settings'}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
