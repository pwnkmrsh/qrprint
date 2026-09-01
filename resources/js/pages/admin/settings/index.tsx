import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
    Settings, 
    CreditCard, 
    Printer, 
    CheckCircle2, 
    AlertCircle, 
    Copy, 
    Check, 
    Eye, 
    EyeOff, 
    Radio, 
    Sparkles, 
    ShieldCheck, 
    Globe, 
    Loader2
} from 'lucide-react';

interface SettingsProps {
    settings: {
        general: {
            app_name: string;
            currency_symbol: string;
            currency_code: string;
            support_email: string;
            support_phone: string;
            timezone: string;
        };
        cashfree: {
            app_id: string;
            secret_key: string;
            environment: 'sandbox' | 'production';
            webhook_secret: string;
            webhook_url: string;
            api_version: string;
        };
        print: {
            max_files_per_session: number;
            max_file_size_mb: number;
            allowed_extensions: string[];
            default_paper_size: string;
            default_color_mode: string;
            default_scaling: string;
            agent_heartbeat_timeout_seconds: number;
        };
    };
}

export default function AdminSettingsIndex({ settings }: SettingsProps) {
    const [activeTab, setActiveTab] = useState<'general' | 'cashfree' | 'print'>('cashfree');
    const [copiedWebhook, setCopiedWebhook] = useState(false);
    const [showSecretKey, setShowSecretKey] = useState(false);
    const [testLoading, setTestLoading] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

    // General Form
    const generalForm = useForm({
        app_name: settings.general.app_name || 'Print Setu',
        currency_symbol: settings.general.currency_symbol || '₹',
        currency_code: settings.general.currency_code || 'INR',
        support_email: settings.general.support_email || '',
        support_phone: settings.general.support_phone || '',
        timezone: settings.general.timezone || 'Asia/Kolkata',
    });

    // Cashfree Form
    const cashfreeForm = useForm({
        app_id: settings.cashfree.app_id || '',
        secret_key: settings.cashfree.secret_key || '',
        environment: settings.cashfree.environment || 'sandbox',
        webhook_secret: settings.cashfree.webhook_secret || '',
    });

    // Print Form
    const printForm = useForm({
        max_files_per_session: settings.print.max_files_per_session || 10,
        max_file_size_mb: settings.print.max_file_size_mb || 20,
        default_paper_size: settings.print.default_paper_size || 'A4',
        default_color_mode: settings.print.default_color_mode || 'bw',
        default_scaling: settings.print.default_scaling || 'actual',
        agent_heartbeat_timeout_seconds: settings.print.agent_heartbeat_timeout_seconds || 180,
    });

    const handleCopyWebhook = () => {
        if (navigator.clipboard && settings.cashfree.webhook_url) {
            navigator.clipboard.writeText(settings.cashfree.webhook_url);
            setCopiedWebhook(true);
            setTimeout(() => setCopiedWebhook(false), 2000);
        }
    };

    const handleTestCashfree = async () => {
        if (!cashfreeForm.data.app_id || !cashfreeForm.data.secret_key) {
            setTestResult({
                success: false,
                message: 'Please enter both App ID and Secret Key to test.',
            });
            return;
        }

        setTestLoading(true);
        setTestResult(null);

        try {
            const res = await fetch(route('admin.settings.cashfree.test'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    app_id: cashfreeForm.data.app_id,
                    secret_key: cashfreeForm.data.secret_key,
                    environment: cashfreeForm.data.environment,
                }),
            });

            const data = await res.json();
            setTestResult(data);
        } catch (err: any) {
            setTestResult({
                success: false,
                message: 'Connection test failed: ' + (err.message || 'Network error'),
            });
        } finally {
            setTestLoading(false);
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Super Admin', href: '/admin/settings' }, { title: 'Settings', href: '/admin/settings' }]}>
            <Head title="Platform Settings - Super Admin" />

            <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
                {/* Header Banner */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-6">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-primary/10 text-primary rounded-xl">
                                <Settings className="size-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-foreground">Global Platform Settings</h1>
                                <p className="text-sm text-muted-foreground">
                                    Configure global defaults, payment gateways (Cashfree), and automated print spooling rules.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="px-3 py-1 text-xs gap-1.5 border-primary/30 bg-primary/5 text-primary">
                            <ShieldCheck className="size-3.5" /> Super Admin Access
                        </Badge>
                    </div>
                </div>

                <div className="flex bg-muted/60 p-1 rounded-xl max-w-md border">
                    <button
                        type="button"
                        onClick={() => setActiveTab('general')}
                        className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                            activeTab === 'general'
                                ? 'bg-primary text-primary-foreground shadow-xs'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Globe className="size-4" /> General
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('cashfree')}
                        className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                            activeTab === 'cashfree'
                                ? 'bg-primary text-primary-foreground shadow-xs'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <CreditCard className="size-4" /> Cashfree PG
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('print')}
                        className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                            activeTab === 'print'
                                ? 'bg-primary text-primary-foreground shadow-xs'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Printer className="size-4" /> Print Rules
                    </button>
                </div>

                {/* ------------------------------------------------ */}
                {/* TAB 1: GENERAL SETTINGS */}
                {/* ------------------------------------------------ */}
                {activeTab === 'general' && (
                        <Card className="shadow-xs border">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Globe className="size-5 text-primary" /> General Platform Configuration
                                </CardTitle>
                                <CardDescription>
                                    App branding, default display currencies, support contacts and timezone.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={(e) => { e.preventDefault(); generalForm.post(route('admin.settings.general')); }} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <Label htmlFor="app_name">Application Brand Name</Label>
                                            <Input
                                                id="app_name"
                                                value={generalForm.data.app_name}
                                                onChange={(e) => generalForm.setData('app_name', e.target.value)}
                                                placeholder="Print Setu"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="timezone">Server Timezone</Label>
                                            <Input
                                                id="timezone"
                                                value={generalForm.data.timezone}
                                                onChange={(e) => generalForm.setData('timezone', e.target.value)}
                                                placeholder="Asia/Kolkata"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="currency_symbol">Currency Symbol</Label>
                                            <Input
                                                id="currency_symbol"
                                                value={generalForm.data.currency_symbol}
                                                onChange={(e) => generalForm.setData('currency_symbol', e.target.value)}
                                                placeholder="₹"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="currency_code">ISO Currency Code</Label>
                                            <Input
                                                id="currency_code"
                                                value={generalForm.data.currency_code}
                                                onChange={(e) => generalForm.setData('currency_code', e.target.value)}
                                                placeholder="INR"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="support_email">Customer Support Email</Label>
                                            <Input
                                                id="support_email"
                                                type="email"
                                                value={generalForm.data.support_email}
                                                onChange={(e) => generalForm.setData('support_email', e.target.value)}
                                                placeholder="support@printsetu.com"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="support_phone">Customer Helpline Number</Label>
                                            <Input
                                                id="support_phone"
                                                value={generalForm.data.support_phone}
                                                onChange={(e) => generalForm.setData('support_phone', e.target.value)}
                                                placeholder="+91 98765 43210"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4 border-t">
                                        <Button type="submit" disabled={generalForm.processing}>
                                            {generalForm.processing ? 'Saving...' : 'Save General Settings'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {/* ------------------------------------------------ */}
                    {/* TAB 2: CASHFREE PAYMENT GATEWAY */}
                    {/* ------------------------------------------------ */}
                    {activeTab === 'cashfree' && (
                        <Card className="shadow-xs border">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <CreditCard className="size-5 text-emerald-600" />
                                            Cashfree Payments Gateway Setup
                                        </CardTitle>
                                        <CardDescription>
                                            Power UPI Intent (GPay, PhonePe, Paytm), Cards, and NetBanking checkout for customer print orders.
                                        </CardDescription>
                                    </div>
                                    <Badge className={cashfreeForm.data.environment === 'production' ? 'bg-emerald-600 text-white' : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'}>
                                        {cashfreeForm.data.environment === 'production' ? '● LIVE / PRODUCTION' : '⚡ TEST / SANDBOX'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <form onSubmit={(e) => { e.preventDefault(); cashfreeForm.post(route('admin.settings.cashfree')); }} className="space-y-6">
                                    {/* Environment Selection */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Gateway Environment Mode</Label>
                                        <div className="grid grid-cols-2 gap-4 max-w-md">
                                            <button
                                                type="button"
                                                onClick={() => cashfreeForm.setData('environment', 'sandbox')}
                                                className={`p-3.5 rounded-xl border text-left transition-all ${
                                                    cashfreeForm.data.environment === 'sandbox'
                                                        ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30 text-foreground font-semibold'
                                                        : 'border-border bg-background text-muted-foreground hover:border-border/80'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm">Sandbox (Test Mode)</span>
                                                    <Badge variant="outline" className="text-[10px]">Test API</Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">Uses test cards and mock UPI VPAs.</p>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => cashfreeForm.setData('environment', 'production')}
                                                className={`p-3.5 rounded-xl border text-left transition-all ${
                                                    cashfreeForm.data.environment === 'production'
                                                        ? 'border-emerald-600 bg-emerald-600/10 ring-2 ring-emerald-600/30 text-foreground font-semibold'
                                                        : 'border-border bg-background text-muted-foreground hover:border-border/80'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm">Production (Live Mode)</span>
                                                    <Badge className="bg-emerald-600 text-white text-[10px]">Real Money</Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">Processes live bank settlements.</p>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Credentials Inputs */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <Label htmlFor="cf_app_id" className="text-sm font-semibold">
                                                Cashfree App ID (Client ID) <span className="text-rose-500">*</span>
                                            </Label>
                                            <Input
                                                id="cf_app_id"
                                                value={cashfreeForm.data.app_id}
                                                onChange={(e) => cashfreeForm.setData('app_id', e.target.value)}
                                                placeholder="e.g. 1234567890abcdef"
                                                className="font-mono text-sm"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Available in your Cashfree Merchant Dashboard &gt; Developers &gt; API Keys.
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="cf_secret_key" className="text-sm font-semibold">
                                                Cashfree Secret Key (Client Secret) <span className="text-rose-500">*</span>
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="cf_secret_key"
                                                    type={showSecretKey ? 'text' : 'password'}
                                                    value={cashfreeForm.data.secret_key}
                                                    onChange={(e) => cashfreeForm.setData('secret_key', e.target.value)}
                                                    placeholder="••••••••••••••••••••••••"
                                                    className="font-mono text-sm pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowSecretKey(!showSecretKey)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                >
                                                    {showSecretKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                                </button>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Keep your secret key strictly confidential.
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="cf_webhook_secret" className="text-sm font-semibold">
                                                Webhook Secret Key (Optional)
                                            </Label>
                                            <Input
                                                id="cf_webhook_secret"
                                                value={cashfreeForm.data.webhook_secret}
                                                onChange={(e) => cashfreeForm.setData('webhook_secret', e.target.value)}
                                                placeholder="Webhook signing secret"
                                                className="font-mono text-sm"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Used for cryptographic HMAC signature verification on webhook events.
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold">Cashfree API Version</Label>
                                            <Input
                                                value={settings.cashfree.api_version}
                                                disabled
                                                className="bg-muted text-muted-foreground font-mono text-sm"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Standard REST API v2023-08-01 with Drop JS SDK v3 support.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Webhook URL Endpoint Box */}
                                    <div className="p-4 rounded-xl border bg-muted/20 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Radio className="size-4 text-emerald-600 animate-pulse" />
                                                <span className="font-semibold text-xs text-foreground">Cashfree Webhook Endpoint URL</span>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleCopyWebhook}
                                                className="h-7 text-xs gap-1.5"
                                            >
                                                {copiedWebhook ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                                                {copiedWebhook ? 'Copied' : 'Copy URL'}
                                            </Button>
                                        </div>
                                        <div className="p-2.5 bg-background rounded-lg border font-mono text-xs text-foreground truncate select-all">
                                            {settings.cashfree.webhook_url}
                                        </div>
                                        <p className="text-[11px] text-muted-foreground">
                                            Paste this URL into your Cashfree Dashboard under <strong>Developers &gt; Webhooks &gt; Add Endpoint</strong> with events <code>ORDER_PAID_WEBHOOK</code> and <code>PAYMENT_SUCCESS_WEBHOOK</code>.
                                        </p>
                                    </div>

                                    {/* Connection Test Result */}
                                    {testResult && (
                                        <Alert variant={testResult.success ? 'default' : 'destructive'} className={testResult.success ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300' : ''}>
                                            {testResult.success ? <CheckCircle2 className="size-4 text-emerald-600" /> : <AlertCircle className="size-4" />}
                                            <AlertTitle>{testResult.success ? 'Connected Successfully' : 'Connection Failed'}</AlertTitle>
                                            <AlertDescription>{testResult.message}</AlertDescription>
                                        </Alert>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleTestCashfree}
                                            disabled={testLoading}
                                            className="w-full sm:w-auto gap-2"
                                        >
                                            {testLoading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4 text-amber-500" />}
                                            Test Cashfree Credentials
                                        </Button>

                                        <Button type="submit" disabled={cashfreeForm.processing} className="w-full sm:w-auto">
                                            {cashfreeForm.processing ? 'Saving...' : 'Save Cashfree Settings'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {/* ------------------------------------------------ */}
                    {/* TAB 3: PRINT RULES */}
                    {/* ------------------------------------------------ */}
                    {activeTab === 'print' && (
                        <Card className="shadow-xs border">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Printer className="size-5 text-primary" /> Automated Print Spooling & Limits
                                </CardTitle>
                                <CardDescription>
                                    Platform-wide constraints for document file sizes, allowed formats, and print agent timeouts.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={(e) => { e.preventDefault(); printForm.post(route('admin.settings.print')); }} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <Label htmlFor="max_files_per_session">Max Documents per Print Session</Label>
                                            <Input
                                                id="max_files_per_session"
                                                type="number"
                                                min="1"
                                                max="50"
                                                value={printForm.data.max_files_per_session}
                                                onChange={(e) => printForm.setData('max_files_per_session', parseInt(e.target.value) || 10)}
                                            />
                                            <p className="text-xs text-muted-foreground">Default limit of batch uploads per customer checkout (Default: 10).</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="max_file_size_mb">Max File Size per Document (MB)</Label>
                                            <Input
                                                id="max_file_size_mb"
                                                type="number"
                                                min="1"
                                                max="100"
                                                value={printForm.data.max_file_size_mb}
                                                onChange={(e) => printForm.setData('max_file_size_mb', parseInt(e.target.value) || 20)}
                                            />
                                            <p className="text-xs text-muted-foreground">File upload limit per single document (Default: 20 MB).</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="default_paper_size">Default Paper Size</Label>
                                            <Input
                                                id="default_paper_size"
                                                value={printForm.data.default_paper_size}
                                                onChange={(e) => printForm.setData('default_paper_size', e.target.value)}
                                                placeholder="A4"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="agent_timeout">Print Agent Heartbeat Timeout (Seconds)</Label>
                                            <Input
                                                id="agent_timeout"
                                                type="number"
                                                min="30"
                                                max="3600"
                                                value={printForm.data.agent_heartbeat_timeout_seconds}
                                                onChange={(e) => printForm.setData('agent_heartbeat_timeout_seconds', parseInt(e.target.value) || 180)}
                                            />
                                            <p className="text-xs text-muted-foreground">Mark local print agents as offline if no heartbeat received within this window.</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4 border-t">
                                        <Button type="submit" disabled={printForm.processing}>
                                            {printForm.processing ? 'Saving...' : 'Save Print Rules'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}
            </div>
        </AppLayout>
    );
}
