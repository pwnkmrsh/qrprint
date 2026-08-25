import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    Home,
    CircleDollarSign,
    Settings2,
    Sparkles,
    Mail,
    Menu,
    X,
    QrCode,
    ArrowRight,
    LayoutDashboard,
    LogIn,
    ChevronRight,
    ShieldCheck,
    FileText,
    Lock,
    Phone,
    HelpCircle,
    Layers,
    Zap,
    Store,
    Users,
} from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import AppLogo from '@/components/app-logo';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    Home,
    Sparkles,
    CircleDollarSign,
    Settings2,
    Mail,
    ShieldCheck,
    FileText,
    Lock,
    Phone,
    HelpCircle,
    Layers,
    Zap,
    Store,
    Users,
    QrCode,
};

interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    target?: string;
}

export const FRONT_NAV_ITEMS: NavItem[] = [
    { name: 'Home', href: '#home', icon: Home },
    { name: 'How It Works', href: '#how-it-works', icon: Sparkles },
    { name: 'Pricing', href: '#pricing', icon: CircleDollarSign },
    { name: 'How to Setup', href: '#how-to-setup', icon: Settings2 },
    { name: 'Feature', href: '#feature', icon: Sparkles },
    { name: 'Contact Us', href: '#contact', icon: Mail },
];

interface FrontHeaderProps {
    auth?: {
        user?: {
            id: number;
            name: string;
            email: string;
        } | null;
    };
}

export default function FrontHeader({ auth }: FrontHeaderProps) {
    const pageProps = usePage().props as any;
    const dynamicHeaderItems = pageProps?.navigation_menus?.header?.items || [];

    const navItems: NavItem[] = dynamicHeaderItems.length > 0
        ? dynamicHeaderItems.map((item: any) => ({
            name: item.title,
            href: item.url,
            icon: item.icon && ICON_MAP[item.icon] ? ICON_MAP[item.icon] : Sparkles,
            badge: item.badge,
            target: item.target || '_self',
        }))
        : FRONT_NAV_ITEMS;

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('home');

    // Handle scroll to hash on initial load or hash change
    useEffect(() => {
        const scrollToHash = () => {
            if (window.location.hash) {
                const targetId = window.location.hash.replace('#', '');
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    setTimeout(() => {
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                        setActiveSection(targetId);
                    }, 150);
                }
            }
        };

        scrollToHash();
        window.addEventListener('hashchange', scrollToHash);
        return () => window.removeEventListener('hashchange', scrollToHash);
    }, []);

    // Handle scroll effects & active section detection
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);

            // Determine active section
            const sections = FRONT_NAV_ITEMS.map((item) => item.href.replace('#', ''));
            const scrollPosition = window.scrollY + 120;

            for (let i = sections.length - 1; i >= 0; i--) {
                const section = document.getElementById(sections[i]);
                if (section) {
                    const top = section.offsetTop;
                    const height = section.offsetHeight;
                    if (scrollPosition >= top && scrollPosition < top + height) {
                        setActiveSection(sections[i]);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [mobileMenuOpen]);

    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string, target?: string) => {
        if (target === '_blank') return;
        if (href.startsWith('#')) {
            e.preventDefault();
            const targetId = href.replace('#', '');
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
                setActiveSection(targetId);
                setMobileMenuOpen(false);
                window.history.pushState(null, '', href);
            } else {
                // If the element doesn't exist on this page (e.g. on /privacy-policy), navigate to home with hash
                window.location.href = '/' + href;
            }
        }
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
                scrolled
                    ? 'bg-white/95 dark:bg-background/95 backdrop-blur-lg border-b border-gray-200 dark:border-border shadow-sm'
                    : 'bg-white/80 dark:bg-background/80 backdrop-blur-sm border-b border-transparent'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* ── Brand Logo ── */}
                    <a
                        href="#home"
                        onClick={(e) => scrollToSection(e, '#home')}
                        className="flex items-center gap-2 group shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-lg -ml-1 pl-1"
                    >
                        <AppLogo />
                    </a>

                    {/* ── Desktop Navigation (xl+) ── */}
                    <nav className="hidden xl:flex items-center gap-0.5">
                        {navItems.map((item) => {
                            const isCurrent = activeSection === item.href.replace('#', '');
                            return (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    target={item.target}
                                    onClick={(e) => scrollToSection(e, item.href, item.target)}
                                    className={`relative px-3 py-2 text-[13px] font-medium rounded-lg transition-colors duration-150 flex items-center gap-1.5 ${
                                        isCurrent
                                            ? 'text-primary bg-primary/[0.06] font-semibold'
                                            : 'text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground hover:bg-gray-100/60 dark:hover:bg-muted/60'
                                    }`}
                                >
                                    <span>{item.name}</span>
                                    {item.badge && (
                                        <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-primary/15 text-primary border border-primary/20">
                                            {item.badge}
                                        </span>
                                    )}
                                    {/* Active indicator dot */}
                                    {isCurrent && (
                                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-[3px] w-4 rounded-full bg-primary" />
                                    )}
                                </a>
                            );
                        })}
                    </nav>

                    {/* ── Tablet Navigation (lg to xl) ── */}
                    <nav className="hidden lg:flex xl:hidden items-center gap-0.5">
                        {navItems.map((item) => {
                            const isCurrent = activeSection === item.href.replace('#', '');
                            return (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    target={item.target}
                                    onClick={(e) => scrollToSection(e, item.href, item.target)}
                                    className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 flex items-center gap-1 ${
                                        isCurrent
                                            ? 'text-primary bg-primary/[0.06] font-semibold'
                                            : 'text-gray-500 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground'
                                    }`}
                                >
                                    <span>{item.name}</span>
                                    {item.badge && (
                                        <span className="text-[9px] px-1 py-0.2 rounded-full font-bold bg-primary/15 text-primary">
                                            {item.badge}
                                        </span>
                                    )}
                                </a>
                            );
                        })}
                    </nav>

                    {/* ── Right CTA Actions ── */}
                    <div className="flex items-center gap-2">
                        {auth?.user ? (
                            <Link
                                href="/dashboard"
                                className={cn(buttonVariants({ size: 'sm' }), 'h-9 gap-1.5 font-semibold rounded-lg shadow-sm')}
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                <span>Dashboard</span>
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'h-9 px-2.5 sm:px-3 gap-1.5 font-medium text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground hover:bg-gray-100/80 dark:hover:bg-muted rounded-lg inline-flex')}
                                >
                                    <LogIn className="h-4 w-4" />
                                    <span>Login</span>
                                </Link>
                                <Link
                                    href="/register"
                                    className={cn(buttonVariants({ size: 'sm' }), 'h-9 gap-1.5 font-semibold rounded-lg shadow-sm hidden sm:inline-flex')}
                                >
                                    <span>Get Started</span>
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </>
                        )}

                        {/* ── Mobile Menu Toggle ── */}
                        <button
                            className="lg:hidden inline-flex items-center justify-center h-9 w-9 rounded-lg border border-gray-200 dark:border-border text-gray-600 dark:text-muted-foreground hover:bg-gray-100/80 dark:hover:bg-muted hover:text-gray-900 dark:hover:text-foreground transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle menu"
                            aria-expanded={mobileMenuOpen}
                        >
                            {mobileMenuOpen ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Mobile Slide-Over Menu ── */}
            {mobileMenuOpen && (
                <>
                    {/* Backdrop overlay */}
                    <div
                        className="lg:hidden fixed inset-0 top-16 bg-black/20 dark:bg-black/40 backdrop-blur-[2px] z-40 animate-in fade-in duration-150"
                        onClick={() => setMobileMenuOpen(false)}
                    />

                    {/* Panel */}
                    <div className="lg:hidden fixed inset-x-0 top-16 z-50 bg-white dark:bg-background border-b border-gray-200 dark:border-border shadow-lg animate-in slide-in-from-top-2 fade-in duration-200 max-h-[calc(100dvh-4rem)] overflow-y-auto">
                        <div className="max-w-lg mx-auto px-4 py-5 space-y-5">

                            {/* Navigation links */}
                            <nav className="space-y-0.5">
                                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-muted-foreground px-3 pb-2">
                                    Navigate
                                </p>
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isCurrent = activeSection === item.href.replace('#', '');
                                    return (
                                        <a
                                            key={item.name}
                                            href={item.href}
                                            target={item.target}
                                            onClick={(e) => scrollToSection(e, item.href, item.target)}
                                            className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                                                isCurrent
                                                    ? 'bg-primary/[0.06] text-primary font-semibold'
                                                    : 'text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground hover:bg-gray-50 dark:hover:bg-muted/60'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon className={`h-4 w-4 ${isCurrent ? 'text-primary' : 'text-gray-400 dark:text-muted-foreground'}`} />
                                                <span>{item.name}</span>
                                                {item.badge && (
                                                    <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-primary/15 text-primary border border-primary/20">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </div>
                                            <ChevronRight className={`h-4 w-4 ${isCurrent ? 'text-primary/60' : 'text-gray-300 dark:text-muted-foreground/50'}`} />
                                        </a>
                                    );
                                })}
                            </nav>

                            {/* Divider */}
                            <div className="border-t border-gray-100 dark:border-border" />

                            {/* Mobile Auth Actions */}
                            <div className="space-y-2.5">
                                {auth?.user ? (
                                    <Link
                                        href="/dashboard"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={cn(buttonVariants(), 'w-full justify-center gap-2 h-11 font-semibold rounded-lg shadow-sm')}
                                    >
                                        <LayoutDashboard className="h-4 w-4" />
                                        <span>Open Dashboard</span>
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-center gap-2 h-11 font-medium rounded-lg border-gray-200 dark:border-border text-gray-700 dark:text-foreground hover:bg-gray-50 dark:hover:bg-muted')}
                                        >
                                            <LogIn className="h-4 w-4" />
                                            <span>Shop Owner Login</span>
                                        </Link>
                                        <Link
                                            href="/register"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={cn(buttonVariants(), 'w-full justify-center gap-2 h-11 font-semibold rounded-lg shadow-sm')}
                                        >
                                            <span>Setup Your Shop Free</span>
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </>
                                )}
                            </div>

                            {/* Quick Contact */}
                            <div className="pt-2 border-t border-gray-100 dark:border-border text-center">
                                <p className="text-xs text-gray-400 dark:text-muted-foreground mb-1">Need help?</p>
                                <a
                                    href="https://wa.me/919098132966?text=Hi%20QRPrintSetu,%20I%20want%20to%20setup%20my%20shop"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                                >
                                    WhatsApp Support: +91 90981 32966
                                </a>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </header>
    );
}
