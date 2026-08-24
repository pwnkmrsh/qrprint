import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    Printer as PrinterIcon, 
    ChevronLeft, 
    Save, 
    Info, 
    Check, 
    X,
    Cpu,
    AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CustomTextarea } from '@/components/ui/custom-textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Printer {
    id: number;
    uuid: string;
    agent_id: string;
    name: string;
    model: string | null;
    status: string;
    live_status: string;
    is_default: boolean;
    is_active: boolean;
    capabilities: {
        color?: boolean;
        duplex?: boolean;
        paper_sizes?: string[];
    } | null;
    settings: {
        description?: string;
        paper_size?: string;
        orientation?: string;
        color_mode?: string;
        copies?: number;
        scaling?: string;
        duplex?: string;
        allow_color?: boolean;
        allow_bw?: boolean;
        allow_duplex?: boolean;
        max_copies?: number;
    } | null;
    last_seen_at: string | null;
}

interface SettingsProps {
    printer: Printer;
}

export default function Settings({ printer }: SettingsProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Printers Settings', href: '/shop/printers' },
        { title: `${printer.name} Settings`, href: `/shop/printers/${printer.id}/settings` },
    ];

    const capabilities = printer.capabilities || {};
    const hasColorCapability = !!capabilities.color;
    const hasDuplexCapability = !!capabilities.duplex;
    const supportedPaperSizes = capabilities.paper_sizes || ['A4', 'A5', 'Letter'];

    // Initialize Inertia form
    const { data, setData, patch, processing, errors } = useForm({
        name: printer.name,
        description: printer.settings?.description ?? '',
        is_default: printer.is_default,
        // Fallbacks settings
        paper_size: printer.settings?.paper_size ?? 'A4',
        orientation: printer.settings?.orientation ?? 'auto',
        color_mode: printer.settings?.color_mode ?? 'bw',
        copies: printer.settings?.copies ?? 1,
        scaling: printer.settings?.scaling ?? 'fit_to_page',
        duplex: printer.settings?.duplex ?? 'off',
        // Granular permissions
        allow_color: printer.settings?.allow_color ?? hasColorCapability,
        allow_bw: printer.settings?.allow_bw ?? true,
        allow_duplex: printer.settings?.allow_duplex ?? hasDuplexCapability,
        max_copies: printer.settings?.max_copies ?? 20,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('shop.printers.settings.update', printer.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Settings - ${printer.name}`} />

            <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-4xl mx-auto w-full pb-28 select-none">
                
                {/* ── Header ── */}
                <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-2">
                        <Button asChild size="icon" variant="ghost" className="h-9 w-9 rounded-lg border border-border">
                            <Link href={route('shop.printers.index')}>
                                <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-foreground">
                                Printer Configuration
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                Adjust defaults, permissions, and fallback parameters for printer <strong>{printer.name}</strong>
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Form Container ── */}
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* ── Card 1: General Details ── */}
                    <Card className="border border-border shadow-xs rounded-2xl">
                        <CardHeader className="pb-3 border-b bg-muted/10">
                            <CardTitle className="text-sm font-black tracking-wider uppercase text-slate-500 flex items-center gap-2">
                                <Cpu className="h-4.5 w-4.5 text-primary" />
                                <span>General Details</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-muted-foreground">Printer Name</label>
                                    <Input 
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Spool spooler name"
                                        className="rounded-lg h-9 text-xs"
                                        required
                                    />
                                    {errors.name && <p className="text-[10px] text-rose-500 font-bold">{errors.name}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-muted-foreground">Printer Model</label>
                                    <Input 
                                        value={printer.model || 'Unknown Device'}
                                        className="rounded-lg h-9 text-xs bg-slate-50 dark:bg-muted/10 cursor-not-allowed"
                                        disabled
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-muted-foreground">Description</label>
                                <CustomTextarea 
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Explain printer location or specific instructions..."
                                    className="rounded-lg text-xs min-h-[70px]"
                                />
                                {errors.description && <p className="text-[10px] text-rose-500 font-bold">{errors.description}</p>}
                            </div>

                            <div className="flex items-center space-x-2 pt-1.5">
                                <Checkbox 
                                    id="is_default"
                                    checked={data.is_default}
                                    onCheckedChange={(checked) => setData('is_default', !!checked)}
                                />
                                <label htmlFor="is_default" className="text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                                    Set as Default Printer for Shop
                                </label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── Card 2: Default Print Settings ── */}
                    <Card className="border border-border shadow-xs rounded-2xl">
                        <CardHeader className="pb-3 border-b bg-muted/10">
                            <CardTitle className="text-sm font-black tracking-wider uppercase text-slate-500 flex items-center gap-2">
                                <PrinterIcon className="h-4.5 w-4.5 text-primary" />
                                <span>Default Fallback Settings</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Paper Size */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-muted-foreground">Default Paper Size</label>
                                    <Select 
                                        value={data.paper_size}
                                        onValueChange={(val) => setData('paper_size', val)}
                                    >
                                        <SelectTrigger className="rounded-lg h-9 text-xs border-border">
                                            <SelectValue placeholder="Select paper" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {['A4', 'A3', 'A5', 'Letter', 'Legal'].map((size) => {
                                                const isSupported = supportedPaperSizes.includes(size);
                                                return (
                                                    <SelectItem key={size} value={size} disabled={!isSupported}>
                                                        {size} {!isSupported && '(Unsupported by Printer)'}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Orientation */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-muted-foreground">Default Orientation</label>
                                    <Select 
                                        value={data.orientation}
                                        onValueChange={(val) => setData('orientation', val)}
                                    >
                                        <SelectTrigger className="rounded-lg h-9 text-xs border-border">
                                            <SelectValue placeholder="Select orientation" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="auto">Auto-Detect</SelectItem>
                                            <SelectItem value="portrait">Portrait</SelectItem>
                                            <SelectItem value="landscape">Landscape</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Color Mode */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-muted-foreground">Default Color Mode</label>
                                    <Select 
                                        value={data.color_mode}
                                        onValueChange={(val) => setData('color_mode', val)}
                                        disabled={!hasColorCapability}
                                    >
                                        <SelectTrigger className="rounded-lg h-9 text-xs border-border">
                                            <SelectValue placeholder="Select color" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="bw">Black & White (Monochrome)</SelectItem>
                                            <SelectItem value="color" disabled={!hasColorCapability}>
                                                Color Printing {!hasColorCapability && '(Unsupported)'}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {!hasColorCapability && (
                                        <p className="text-[10px] text-amber-600 font-medium flex items-center gap-1">
                                            <Info className="h-3.5 w-3.5" />
                                            <span>Color printing is not supported by this printer.</span>
                                        </p>
                                    )}
                                </div>

                                {/* Duplex Mode */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-muted-foreground">Default Duplex (Double Sided)</label>
                                    <Select 
                                        value={data.duplex}
                                        onValueChange={(val) => setData('duplex', val)}
                                        disabled={!hasDuplexCapability}
                                    >
                                        <SelectTrigger className="rounded-lg h-9 text-xs border-border">
                                            <SelectValue placeholder="Select duplex" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="off">Off (Single Sided)</SelectItem>
                                            <SelectItem value="long_edge" disabled={!hasDuplexCapability}>Long Edge flip</SelectItem>
                                            <SelectItem value="short_edge" disabled={!hasDuplexCapability}>Short Edge flip</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {!hasDuplexCapability && (
                                        <p className="text-[10px] text-amber-600 font-medium flex items-center gap-1">
                                            <Info className="h-3.5 w-3.5" />
                                            <span>Duplex printing is not supported by this printer.</span>
                                        </p>
                                    )}
                                </div>

                                {/* Scaling */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-muted-foreground">Default Scaling</label>
                                    <Select 
                                        value={data.scaling}
                                        onValueChange={(val) => setData('scaling', val)}
                                    >
                                        <SelectTrigger className="rounded-lg h-9 text-xs border-border">
                                            <SelectValue placeholder="Select scaling" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="actual">Actual Size (No Scaling)</SelectItem>
                                            <SelectItem value="fit_to_page">Fit to Page</SelectItem>
                                            <SelectItem value="shrink_to_fit">Shrink to Fit</SelectItem>
                                            <SelectItem value="fill_page">Fill Page</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Copies count */}
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-muted-foreground">Default Copies</label>
                                    <Input 
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={data.copies}
                                        onChange={(e) => setData('copies', parseInt(e.target.value) || 1)}
                                        className="rounded-lg h-9 text-xs"
                                    />
                                    {errors.copies && <p className="text-[10px] text-rose-500 font-bold">{errors.copies}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── Card 3: Permissions & Limits ── */}
                    <Card className="border border-border shadow-xs rounded-2xl">
                        <CardHeader className="pb-3 border-b bg-muted/10">
                            <CardTitle className="text-sm font-black tracking-wider uppercase text-slate-500 flex items-center gap-2">
                                <AlertCircle className="h-4.5 w-4.5 text-primary" />
                                <span>Allowed Permissions & Limits</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Allow Spools Modes</span>
                                    <div className="space-y-2.5">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox 
                                                id="allow_bw"
                                                checked={data.allow_bw}
                                                onCheckedChange={(checked) => setData('allow_bw', !!checked)}
                                            />
                                            <label htmlFor="allow_bw" className="text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer">
                                                Allow Black & White Printing
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox 
                                                id="allow_color"
                                                checked={data.allow_color}
                                                disabled={!hasColorCapability}
                                                onCheckedChange={(checked) => setData('allow_color', !!checked)}
                                            />
                                            <label htmlFor="allow_color" className={`text-xs font-medium cursor-pointer ${!hasColorCapability ? 'text-slate-400 cursor-not-allowed' : 'text-slate-700 dark:text-slate-200'}`}>
                                                Allow Color Printing {!hasColorCapability && '(Unsupported)'}
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox 
                                                id="allow_duplex"
                                                checked={data.allow_duplex}
                                                disabled={!hasDuplexCapability}
                                                onCheckedChange={(checked) => setData('allow_duplex', !!checked)}
                                            />
                                            <label htmlFor="allow_duplex" className={`text-xs font-medium cursor-pointer ${!hasDuplexCapability ? 'text-slate-400 cursor-not-allowed' : 'text-slate-700 dark:text-slate-200'}`}>
                                                Allow Duplex (Double Sided) {!hasDuplexCapability && '(Unsupported)'}
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Spool Limits</span>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Max Allowed Copies Per Job</label>
                                        <Input 
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={data.max_copies}
                                            onChange={(e) => setData('max_copies', parseInt(e.target.value) || 20)}
                                            className="rounded-lg h-9 text-xs"
                                        />
                                        {errors.max_copies && <p className="text-[10px] text-rose-500 font-bold">{errors.max_copies}</p>}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── Sticky Save Action Bar ── */}
                    <div className="flex items-center justify-between p-4 bg-white/95 dark:bg-background/95 backdrop-blur-md border border-border rounded-2xl shadow-lg sticky bottom-4 z-40">
                        <Button 
                            asChild 
                            variant="outline" 
                            className="rounded-lg h-10 px-4 text-xs font-bold border-border"
                        >
                            <Link href={route('shop.printers.index')}>
                                <X className="h-4 w-4 mr-1.5" />
                                <span>Cancel</span>
                            </Link>
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={processing}
                            className="rounded-lg h-10 px-5 text-xs font-bold"
                        >
                            {processing ? (
                                <RefreshCw className="h-4 w-4 animate-spin mr-1.5" />
                            ) : (
                                <Save className="h-4 w-4 mr-1.5" />
                            )}
                            <span>Save Settings</span>
                        </Button>
                    </div>

                </form>
            </div>
        </AppLayout>
    );
}
