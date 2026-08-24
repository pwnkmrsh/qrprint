import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Head, Link } from '@inertiajs/react';
import { FileUp, LockKeyhole, Printer, ShieldCheck, Phone, MapPin, Sparkles, Banknote, QrCode, Store } from 'lucide-react';

interface ShopProps {
    shop: {
        name: string;
        slug: string;
        email?: string;
        mobile_number?: string;
        address?: string;
        logo_url?: string | null;
        upload_url: string;
        pricing?: {
            bw_price_per_page: number;
            color_price_per_page: number;
            scanner_price_per_page: number;
            currency_symbol: string;
            show_currency: boolean;
            online_payment_enabled: boolean;
            counter_payment_enabled: boolean;
        };
    };
}

export default function Shop({ shop }: ShopProps) {
    const sym = shop.pricing?.show_currency !== false ? (shop.pricing?.currency_symbol || '₹') : '';
    const bwRate = shop.pricing?.bw_price_per_page ?? 2.0;
    const colorRate = shop.pricing?.color_price_per_page ?? 10.0;
    const scannerRate = shop.pricing?.scanner_price_per_page ?? 5.0;

    return (
        <>
            <Head title={`Print Online | ${shop.name}`} />
            <main className="bg-gradient-to-b from-background via-muted/30 to-muted/60 flex min-h-screen items-center justify-center p-4 sm:p-6">
                <Card className="w-full max-w-md border-border shadow-lg rounded-3xl overflow-hidden backdrop-blur-xs">
                    <div className="h-2 bg-gradient-to-r from-primary via-purple-500 to-indigo-500" />
                    <CardContent className="space-y-6 p-6 sm:p-8 text-center">
                        {/* Logo or Icon */}
                        {shop.logo_url ? (
                            <div className="mx-auto size-20 rounded-2xl border bg-background p-2 shadow-xs flex items-center justify-center">
                                <img src={shop.logo_url} alt={shop.name} className="size-full object-contain rounded-xl" />
                            </div>
                        ) : (
                            <div className="bg-primary/10 text-primary mx-auto flex size-16 items-center justify-center rounded-2xl shadow-xs">
                                <Printer className="size-8" />
                            </div>
                        )}

                        {/* Title & Tagline */}
                        <div className="space-y-1.5">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">{shop.name}</h1>
                            <p className="text-xs sm:text-sm text-muted-foreground">Self-Service Instant Cloud & QR Printing</p>
                        </div>

                        {/* Pricing Rate Cards configured by Shop Owner */}
                        <div className="space-y-2">
                            <div className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
                                Current Print & Scan Rates
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="p-2.5 rounded-xl border bg-card/60 shadow-2xs space-y-0.5">
                                    <div className="text-[11px] text-muted-foreground font-medium">B/W Print</div>
                                    <div className="text-sm font-extrabold text-foreground">{sym}{Number(bwRate).toFixed(2)}<span className="text-[10px] font-normal text-muted-foreground">/pg</span></div>
                                </div>
                                <div className="p-2.5 rounded-xl border border-purple-500/30 bg-purple-500/5 shadow-2xs space-y-0.5">
                                    <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">Color Print</div>
                                    <div className="text-sm font-extrabold text-purple-600 dark:text-purple-400">{sym}{Number(colorRate).toFixed(2)}<span className="text-[10px] font-normal text-muted-foreground">/pg</span></div>
                                </div>
                                <div className="p-2.5 rounded-xl border bg-card/60 shadow-2xs space-y-0.5">
                                    <div className="text-[11px] text-muted-foreground font-medium">Scan 1-Pg</div>
                                    <div className="text-sm font-extrabold text-foreground">{sym}{Number(scannerRate).toFixed(2)}<span className="text-[10px] font-normal text-muted-foreground">/pg</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Shop Info (Phone & Address if available) */}
                        {(shop.mobile_number || shop.address) && (
                            <div className="rounded-xl bg-muted/40 p-3 space-y-1.5 text-xs text-muted-foreground border border-border/60 text-left">
                                {shop.mobile_number && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="size-3.5 text-primary shrink-0" />
                                        <span className="font-medium text-foreground">{shop.mobile_number}</span>
                                    </div>
                                )}
                                {shop.address && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="size-3.5 text-primary shrink-0" />
                                        <span className="truncate">{shop.address}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Payment Options Supported Badge */}
                        <div className="flex items-center justify-center gap-2 flex-wrap text-xs">
                            {shop.pricing?.counter_payment_enabled !== false && (
                                <Badge variant="outline" className="gap-1 py-1 px-2.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-medium">
                                    <Store className="size-3" /> Pay at Counter (Cash/UPI)
                                </Badge>
                            )}
                            {shop.pricing?.online_payment_enabled !== false && (
                                <Badge variant="outline" className="gap-1 py-1 px-2.5 bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30 font-medium">
                                    <QrCode className="size-3" /> Online UPI & Cards
                                </Badge>
                            )}
                        </div>

                        {/* Upload CTA Button */}
                        <Button className="w-full py-6 text-base font-semibold shadow-md rounded-2xl cursor-pointer" size="lg" asChild>
                            <Link href={shop.upload_url}>
                                <FileUp className="mr-2 size-5" />
                                Scan & Upload Documents
                            </Link>
                        </Button>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-2 text-[11px] text-muted-foreground pt-2 border-t border-border/60">
                            <span className="flex items-center justify-center gap-1 font-medium">
                                <Sparkles className="size-3 text-primary" />
                                PDF · Img · Office
                            </span>
                            <span className="flex items-center justify-center gap-1 font-medium">
                                <ShieldCheck className="size-3 text-emerald-500" />
                                100% Secure
                            </span>
                            <span className="flex items-center justify-center gap-1 font-medium">
                                <LockKeyhole className="size-3 text-blue-500" />
                                Auto Deleted
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </>
    );
}
