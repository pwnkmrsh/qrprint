import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Printer as PrinterIcon, 
    Settings, 
    Activity, 
    CheckCircle2, 
    XCircle, 
    RefreshCw, 
    ShieldAlert,
    Cpu,
    Check,
    AlertTriangle,
    Plus,
    Clock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Printers Settings',
        href: '/shop/printers',
    },
];

interface Printer {
    id: number;
    uuid: string;
    agent_id: string;
    name: string;
    model: string | null;
    status: 'online' | 'offline' | 'busy' | 'error';
    live_status: 'online' | 'offline' | 'busy' | 'error'; // appended dynamic attribute
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

interface IndexProps {
    printers: Printer[];
    qrPrint: {
        title: string;
    };
}

export default function Index({ printers, qrPrint }: IndexProps) {
    const [testingId, setTestingId] = useState<number | null>(null);
    const [connectingId, setConnectingId] = useState<number | null>(null);
    const [deactivatingPrinter, setDeactivatingPrinter] = useState<Printer | null>(null);
    const [activatingPrinter, setActivatingPrinter] = useState<Printer | null>(null);

    // Filter active and inactive printers
    const activePrinters = printers.filter(p => p.is_active);
    const inactivePrinters = printers.filter(p => !p.is_active);

    const handleTestPrint = (id: number) => {
        setTestingId(id);
        router.post(route('shop.printers.test-print', id), {}, {
            onFinish: () => setTestingId(null)
        });
    };

    const handleTestConnection = (id: number) => {
        setConnectingId(id);
        router.post(route('shop.printers.test-connection', id), {}, {
            onFinish: () => setConnectingId(null)
        });
    };

    const handleSetDefault = (id: number) => {
        router.post(route('shop.printers.set-default', id));
    };

    const handleConfirmDeactivate = () => {
        if (!deactivatingPrinter) return;
        router.post(route('shop.printers.deactivate', deactivatingPrinter.id), {}, {
            onFinish: () => setDeactivatingPrinter(null)
        });
    };

    const handleConfirmActivate = () => {
        if (!activatingPrinter) return;
        router.post(route('shop.printers.activate', activatingPrinter.id), {}, {
            onFinish: () => setActivatingPrinter(null)
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'online':
                return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold text-[10px]">🟢 ONLINE</Badge>;
            case 'busy':
                return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold text-[10px] animate-pulse">🟡 BUSY</Badge>;
            case 'error':
                return <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 font-bold text-[10px]">⚠️ ERROR</Badge>;
            default:
                return <Badge className="bg-slate-500/10 text-slate-600 border-slate-500/20 font-bold text-[10px]">🔴 OFFLINE</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Printers" />

            <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full pb-24 select-none">
                
                {/* ── Page Header ── */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-card border border-border rounded-2xl p-5 shadow-xs">
                    <div>
                        <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-foreground flex items-center gap-2">
                            <PrinterIcon className="h-5 w-5 text-primary" />
                            <span>My Printers</span>
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Manage default printing configs, verify agent spools, and execute printer connection tests for <strong>{qrPrint.title}</strong>
                        </p>
                    </div>
                </div>

                {/* ── Active Printers Grid ── */}
                <div className="space-y-4">
                    <h2 className="text-sm font-black tracking-wider uppercase text-slate-500">
                        Active Printers ({activePrinters.length})
                    </h2>
                    
                    {activePrinters.length === 0 ? (
                        <Card className="border-dashed border-2 border-border p-8 text-center text-sm text-muted-foreground flex flex-col items-center justify-center space-y-3 rounded-2xl">
                            <PrinterIcon className="h-10 w-10 text-slate-300" />
                            <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-200">No active printers registered.</p>
                                <p className="text-xs text-slate-500 mt-0.5">Run the MynaTech Local Printer Agent locally to auto-register your printer spool.</p>
                            </div>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {activePrinters.map((printer) => {
                                const lastSeenDate = printer.last_seen_at ? new Date(printer.last_seen_at) : null;
                                return (
                                    <Card key={printer.id} className="border border-border shadow-xs rounded-2xl overflow-hidden flex flex-col justify-between">
                                        <CardHeader className="pb-3 border-b bg-muted/10 flex flex-row justify-between items-start">
                                            <div className="space-y-1">
                                                <CardTitle className="text-base font-bold text-slate-900 dark:text-foreground flex items-center gap-1.5">
                                                    <PrinterIcon className="h-4.5 w-4.5 text-primary" />
                                                    {printer.name}
                                                </CardTitle>
                                                <CardDescription className="text-xs">
                                                    Model: {printer.model || 'Unknown Device'}
                                                </CardDescription>
                                            </div>
                                            <div className="flex flex-col items-end gap-1.5">
                                                {getStatusBadge(printer.live_status)}
                                                {printer.is_default && (
                                                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-extrabold uppercase">
                                                        ✓ DEFAULT
                                                    </Badge>
                                                )}
                                            </div>
                                        </CardHeader>
                                        
                                        <CardContent className="p-5 space-y-4 flex-1">
                                            {/* Local Agent Metadata */}
                                            <div className="grid grid-cols-2 gap-3 text-xs border-b border-border pb-3">
                                                <div className="space-y-0.5">
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Local Agent</span>
                                                    <p className="font-semibold text-slate-800 dark:text-slate-200">{printer.agent_id}</p>
                                                </div>
                                                <div className="space-y-0.5">
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Last Heartbeat</span>
                                                    <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                                                        <Clock className="h-3 w.5-3 text-muted-foreground" />
                                                        {lastSeenDate ? lastSeenDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Supported capabilities */}
                                            <div>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Capabilities</span>
                                                <div className="flex flex-wrap gap-1">
                                                    <Badge variant="outline" className="text-[9px] font-normal py-0 px-2 bg-muted/40">
                                                        {printer.capabilities?.color ? 'Color Mode' : 'Black & White'}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-[9px] font-normal py-0 px-2 bg-muted/40">
                                                        {printer.capabilities?.duplex ? 'Duplex Duplex' : 'Simplex'}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-[9px] font-normal py-0 px-2 bg-muted/40">
                                                        Paper: {printer.capabilities?.paper_sizes?.join(', ') || 'A4'}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Custom printer fallback settings */}
                                            <div className="bg-slate-50 dark:bg-muted/10 p-3 rounded-xl border border-border text-xs space-y-1">
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Defaults</span>
                                                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-600 dark:text-slate-300">
                                                    <p>Paper size: <strong className="text-slate-800 dark:text-slate-200">{printer.settings?.paper_size || 'A4'}</strong></p>
                                                    <p>Color mode: <strong className="text-slate-800 dark:text-slate-200">{printer.settings?.color_mode === 'color' ? 'Color' : 'B&W'}</strong></p>
                                                    <p>Duplex: <strong className="text-slate-800 dark:text-slate-200">{printer.settings?.duplex || 'off'}</strong></p>
                                                    <p>Copies: <strong className="text-slate-800 dark:text-slate-200">{printer.settings?.copies || 1}x</strong></p>
                                                </div>
                                            </div>
                                        </CardContent>

                                        {/* Action buttons footer */}
                                        <CardFooter className="p-4 border-t bg-muted/5 flex flex-wrap gap-2 justify-between">
                                            <div className="flex gap-2">
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    onClick={() => handleTestConnection(printer.id)}
                                                    disabled={connectingId === printer.id}
                                                    className="h-8 text-xs font-bold rounded-lg border-border"
                                                >
                                                    {connectingId === printer.id ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : <Activity className="h-3 w-3 mr-1" />}
                                                    <span>Test Conn</span>
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    onClick={() => handleTestPrint(printer.id)}
                                                    disabled={testingId === printer.id}
                                                    className="h-8 text-xs font-bold rounded-lg border-border"
                                                >
                                                    {testingId === printer.id ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : <PrinterIcon className="h-3 w-3 mr-1" />}
                                                    <span>Test Print</span>
                                                </Button>
                                            </div>
                                            
                                            <div className="flex gap-1.5">
                                                {!printer.is_default && (
                                                    <Button 
                                                        size="sm" 
                                                        variant="ghost" 
                                                        onClick={() => handleSetDefault(printer.id)}
                                                        className="h-8 text-xs font-semibold rounded-lg hover:bg-slate-100"
                                                    >
                                                        Set Default
                                                    </Button>
                                                )}
                                                <Button 
                                                    asChild 
                                                    size="sm" 
                                                    variant="outline" 
                                                    className="h-8 text-xs font-bold rounded-lg border-border"
                                                >
                                                    <Link href={route('shop.printers.settings', printer.id)}>
                                                        <Settings className="h-3 w-3 mr-1" />
                                                        <span>Settings</span>
                                                    </Link>
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="ghost" 
                                                    onClick={() => setDeactivatingPrinter(printer)}
                                                    className="h-8 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                                                >
                                                    Deactivate
                                                </Button>
                                            </div>
                                        </CardFooter>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ── Inactive Printers Section ── */}
                {inactivePrinters.length > 0 && (
                    <div className="space-y-4 mt-6 border-t border-border pt-6">
                        <h2 className="text-sm font-black tracking-wider uppercase text-slate-500">
                            Deactivated Printers ({inactivePrinters.length})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-75">
                            {inactivePrinters.map((printer) => (
                                <Card key={printer.id} className="border border-dashed border-border shadow-none rounded-2xl overflow-hidden flex flex-col justify-between bg-muted/10">
                                    <CardHeader className="pb-3 flex flex-row justify-between items-center">
                                        <div>
                                            <CardTitle className="text-base font-bold text-slate-600 dark:text-muted-foreground flex items-center gap-1.5">
                                                <PrinterIcon className="h-4.5 w-4.5" />
                                                {printer.name}
                                            </CardTitle>
                                            <p className="text-xs text-muted-foreground">Model: {printer.model || 'Unknown'}</p>
                                        </div>
                                        <Badge variant="outline" className="bg-slate-100 text-slate-500 font-bold text-[10px]">🔴 DEACTIVATED</Badge>
                                    </CardHeader>
                                    <CardFooter className="p-4 border-t bg-muted/5 flex justify-end">
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            onClick={() => setActivatingPrinter(printer)}
                                            className="h-8 text-xs font-bold rounded-lg border-border"
                                        >
                                            Activate Printer
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Confirm Deactivation Dialog ── */}
                <Dialog open={!!deactivatingPrinter} onOpenChange={() => setDeactivatingPrinter(null)}>
                    <DialogContent className="max-w-md rounded-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-extrabold text-slate-900">Deactivate this printer?</DialogTitle>
                            <DialogDescription className="text-xs">
                                Printer <strong>{deactivatingPrinter?.name}</strong> will no longer receive new customer print jobs. Spooled historical jobs will remain accessible in logs.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-4 flex gap-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="rounded-lg h-9" 
                                onClick={() => setDeactivatingPrinter(null)}
                            >
                                Cancel
                            </Button>
                            <Button 
                                variant="destructive" 
                                size="sm" 
                                className="rounded-lg h-9 font-bold"
                                onClick={handleConfirmDeactivate}
                            >
                                Deactivate
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* ── Confirm Activation Dialog ── */}
                <Dialog open={!!activatingPrinter} onOpenChange={() => setActivatingPrinter(null)}>
                    <DialogContent className="max-w-md rounded-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-extrabold text-slate-900">Activate this printer?</DialogTitle>
                            <DialogDescription className="text-xs">
                                Reactivate printer <strong>{activatingPrinter?.name}</strong> to allow customer print sessions to spool documents onto it.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-4 flex gap-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="rounded-lg h-9" 
                                onClick={() => setActivatingPrinter(null)}
                            >
                                Cancel
                            </Button>
                            <Button 
                                size="sm" 
                                className="rounded-lg h-9 font-bold"
                                onClick={handleConfirmActivate}
                            >
                                Activate
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </div>
        </AppLayout>
    );
}
