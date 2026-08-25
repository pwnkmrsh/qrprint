import { usePage } from '@inertiajs/react';
import { QrCode, Heart, ShieldCheck, Mail, Phone, MessageSquare, ArrowUpRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLogo from '@/components/app-logo';

export default function FrontFooter() {
    const pageProps = usePage().props as any;
    const menus = pageProps?.navigation_menus || {};

    const productItems = menus.footer_product?.items || [
        { title: 'Home', url: '#home', target: '_self' },
        { title: 'How It Works', url: '#how-it-works', target: '_self' },
        { title: 'Features', url: '#feature', target: '_self', hasSparkle: true },
        { title: 'How to Setup', url: '#how-to-setup', target: '_self' },
        { title: 'Pricing Plans', url: '#pricing', target: '_self' },
    ];

    const companyItems = menus.footer_company?.items || [
        { title: 'Partner Program', url: '#partner-program', badge: '30%', target: '_self' },
        { title: 'Contact Us', url: '#contact', target: '_self' },
        { title: 'WhatsApp Support', url: 'https://wa.me/919098132966', target: '_blank' },
    ];

    const trustItems = menus.footer_trust?.items || [
        { title: 'Declaration & Privacy', url: '/security-declaration', target: '_blank' },
        { title: 'Privacy Policy', url: '/privacy-policy', target: '_blank' },
        { title: 'Terms of Service', url: '/terms-of-service', target: '_blank' },
    ];

    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string, target?: string) => {
        if (target === '_blank') return;
        if (href.startsWith('#')) {
            e.preventDefault();
            const targetId = href.replace('#', '');
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
                window.history.pushState(null, '', href);
            } else {
                window.location.href = '/' + href;
            }
        }
    };

    return (
        <footer className="bg-card border-t border-border mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-12">
                    {/* Brand & Mission */}
                    <div className="lg:col-span-2 space-y-4">
                        <a
                            href="#home"
                            onClick={(e) => scrollToSection(e, '#home')}
                            className="flex items-center gap-2.5 group"
                        >
                            <AppLogo />
                        </a>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                            Next-generation QR code print automation software for Indian cyber cafes, stationery shops, and campus Xerox centers. Zero WhatsApp queues, automated UPI payments, and direct Windows spooling.
                        </p>
                        <div className="flex items-center gap-3 pt-2">
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                All Systems Operational
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Windows Agent v1.4.2
                            </div>
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div>
                        <h4 className="font-bold text-sm text-foreground uppercase tracking-wider mb-4">
                            Product
                        </h4>
                        <ul className="space-y-2.5 text-sm">
                            {productItems.map((item: any) => (
                                <li key={item.title}>
                                    <a
                                        href={item.url}
                                        target={item.target}
                                        onClick={(e) => scrollToSection(e, item.url, item.target)}
                                        className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                                    >
                                        <span>{item.title}</span>
                                        {item.hasSparkle && <Sparkles className="h-3 w-3 text-amber-500" />}
                                        {item.badge && (
                                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold">
                                                {item.badge}
                                            </span>
                                        )}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-sm text-foreground uppercase tracking-wider mb-4">
                            Company & Partner
                        </h4>
                        <ul className="space-y-2.5 text-sm">
                            {companyItems.map((item: any) => (
                                <li key={item.title}>
                                    <a
                                        href={item.url}
                                        target={item.target}
                                        onClick={(e) => scrollToSection(e, item.url, item.target)}
                                        className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                                    >
                                        <span>{item.title}</span>
                                        {item.badge && (
                                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                                                {item.badge}
                                            </span>
                                        )}
                                        {item.target === '_blank' && <ArrowUpRight className="h-3 w-3 text-muted-foreground/60" />}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-sm text-foreground uppercase tracking-wider mb-4">
                            Trust & Security
                        </h4>
                        <ul className="space-y-2.5 text-sm">
                            {trustItems.map((item: any) => (
                                <li key={item.title}>
                                    <a
                                        href={item.url}
                                        target={item.target}
                                        onClick={(e) => scrollToSection(e, item.url, item.target)}
                                        className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                                    >
                                        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                                        <span>{item.title}</span>
                                        {item.target === '_blank' && <ArrowUpRight className="h-3 w-3 text-muted-foreground/60" />}
                                    </a>
                                </li>
                            ))}
                            <li>
                                <span className="text-muted-foreground text-xs block leading-relaxed mt-2 p-2.5 rounded-lg bg-muted/60 border border-border/60">
                                    Files are auto-purged immediately after printing. No logs, no data retention.
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                    <p>© {new Date().getFullYear()} Print Setu. Built for India's Print Shop Revolution.</p>
                    <div className="flex items-center gap-6">
                        <a
                            href="/privacy-policy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline hover:text-foreground transition-colors"
                        >
                            Privacy Policy
                        </a>
                        <a
                            href="/terms-of-service"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline hover:text-foreground transition-colors"
                        >
                            Terms of Service
                        </a>
                        <a
                            href="/security-declaration"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline hover:text-foreground transition-colors"
                        >
                            Security Declaration
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
