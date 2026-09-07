import { Link, usePage } from '@inertiajs/react';
import { QrCode, Heart, ShieldCheck, Mail, Phone, MessageSquare, ArrowUpRight, Sparkles, CreditCard, RotateCcw, FileText, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLogo from '@/components/app-logo';

export default function FrontFooter() {
    const pageProps = usePage().props as any;
    const menus = pageProps?.navigation_menus || {};

    const productItems = menus.footer_product?.items || [
        { title: 'Home', url: '/#home', target: '_self' },
        { title: 'How It Works', url: '/#how-it-works', target: '_self' },
        { title: 'Products & Features', url: '/#feature', target: '_self', hasSparkle: true },
        { title: 'Pricing in INR (₹)', url: '/pricing', target: '_self' },
        { title: 'Document Rate Card', url: '/pricing', target: '_self' },
    ];

    const companyItems = menus.footer_company?.items || [
        { title: 'Contact Us', url: '/contact-us', target: '_self' },
        { title: 'Partner Program', url: '/#partner-program', badge: '30%', target: '_self' },
        { title: 'WhatsApp Help Desk', url: 'https://wa.me/919098132966', target: '_blank' },
        { title: 'Shop Onboarding', url: '/register', target: '_self' },
    ];

    const policyItems = menus.footer_trust?.items || [
        { title: 'Contact Us', url: '/contact-us', target: '_self' },
        { title: 'Terms and Conditions', url: '/terms-and-conditions', target: '_self' },
        { title: 'Refunds & Cancellations', url: '/refund-policy', target: '_self' },
        { title: 'Privacy Policy', url: '/privacy-policy', target: '_self' },
        { title: 'Security Declaration', url: '/security-declaration', target: '_self' },
    ];

    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string, target?: string) => {
        if (target === '_blank') return;
        if (href.startsWith('#') || href.startsWith('/#')) {
            const cleanHash = href.replace('/', '');
            if (cleanHash.startsWith('#')) {
                const targetId = cleanHash.replace('#', '');
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                    window.history.pushState(null, '', cleanHash);
                } else if (!window.location.pathname.endsWith('/') && window.location.pathname !== '') {
                    // Navigate to home with hash
                    window.location.href = '/' + cleanHash;
                }
            }
        }
    };

    return (
        <footer className="bg-card border-t border-border mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-12">
                    {/* Brand & Mission */}
                    <div className="lg:col-span-2 space-y-4">
                        <Link
                            href="/"
                            className="flex items-center gap-2.5 group"
                        >
                            <AppLogo />
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                            Next-generation QR code document print automation software for Indian cyber cafes, stationery shops, and campus Xerox centers. Zero WhatsApp queues, automated UPI payments, and direct Windows spooling.
                        </p>
                        <div className="pt-1 space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    All Systems Operational
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Windows Agent v1.4.2
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                <strong>MynaTech Innovations</strong> • Sector 62, Noida, UP 201309, India
                            </p>
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div>
                        <h4 className="font-bold text-sm text-foreground uppercase tracking-wider mb-4">
                            Products & Services
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
                            Company & Support
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
                            Policy & Compliance
                        </h4>
                        <ul className="space-y-2.5 text-sm">
                            {policyItems.map((item: any) => (
                                <li key={item.title}>
                                    <Link
                                        href={item.url}
                                        className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                                    >
                                        <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                                        <span>{item.title}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Cashfree Payment & INR Notice */}
                <div className="py-4 px-5 rounded-2xl bg-muted/40 border border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground mb-8">
                    <div className="flex items-center gap-2 text-center sm:text-left">
                        <CreditCard className="h-4 w-4 text-primary shrink-0" />
                        <span>
                            Online payments securely processed in <strong>Indian Rupees (INR / ₹)</strong> via <strong>Cashfree Payment Gateway</strong> (UPI, Cards, Net Banking).
                        </span>
                    </div>
                    <div className="flex items-center gap-3 font-semibold text-primary">
                        <span>100% RBI & PCI-DSS Compliant</span>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-border/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                    <p>© {new Date().getFullYear()} Print Setu (MynaTech Innovations). All Rights Reserved.</p>
                    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                        <Link
                            href="/contact-us"
                            className="hover:underline hover:text-foreground transition-colors"
                        >
                            Contact Us
                        </Link>
                        <Link
                            href="/terms-and-conditions"
                            className="hover:underline hover:text-foreground transition-colors"
                        >
                            Terms and Conditions
                        </Link>
                        <Link
                            href="/refund-policy"
                            className="hover:underline hover:text-foreground transition-colors"
                        >
                            Refunds & Cancellations
                        </Link>
                        <Link
                            href="/privacy-policy"
                            className="hover:underline hover:text-foreground transition-colors"
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            href="/pricing"
                            className="hover:underline hover:text-foreground transition-colors"
                        >
                            Pricing (INR)
                        </Link>
                        <Link
                            href="/security-declaration"
                            className="hover:underline hover:text-foreground transition-colors"
                        >
                            Security Declaration
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
