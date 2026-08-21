import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import {
    Home,
    CircleDollarSign,
    Settings2,
    Sparkles,
    Info,
    Mail,
    ShieldCheck,
    Handshake,
    Menu,
    X,
    QrCode,
    ArrowRight,
    LayoutDashboard,
    LogIn,
    ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
}

export const FRONT_NAV_ITEMS: NavItem[] = [
    { name: 'Home', href: '#home', icon: Home },
    { name: 'Pricing', href: '#pricing', icon: CircleDollarSign },
    { name: 'How to Setup', href: '#how-to-setup', icon: Settings2 },
    { name: 'Feature', href: '#feature', icon: Sparkles },
    { name: 'About', href: '#about', icon: Info },
    { name: 'Contact Us', href: '#contact', icon: Mail },
    { name: 'Declaration', href: '#declaration', icon: ShieldCheck },
    { name: 'Partner Program', href: '#partner-program', icon: Handshake, badge: 'Earn 30%' },
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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('home');

    // Handle scroll effects & active section detection
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);

            // Determine active section
            const sections = FRONT_NAV_ITEMS.map((item) => item.href.replace('#', ''));
            const scrollPosition = window.scrollY + 100;

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

    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (href.startsWith('#')) {
            e.preventDefault();
            const targetId = href.replace('#', '');
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
                setActiveSection(targetId);
                setMobileMenuOpen(false);
                window.history.pushState(null, '', href);
            }
        }
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled
                    ? 'bg-background/85 backdrop-blur-md border-b border-border shadow-xs py-3'
                    : 'bg-background/60 backdrop-blur-xs border-b border-transparent py-4'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    {/* Brand Logo */}
                    <a
                        href="#home"
                        onClick={(e) => scrollToSection(e, '#home')}
                        className="flex items-center gap-2.5 group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-lg p-1 -m-1"
                    >
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary via-primary/90 to-primary/70 text-primary-foreground flex items-center justify-center shadow-md shadow-primary/20 group-hover:scale-105 transition-transform duration-200">
                            <QrCode className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-extrabold text-lg tracking-tight flex items-center gap-1.5">
                                QR Se Print
                                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                                    SaaS
                                </span>
                            </span>
                            <span className="text-[11px] text-muted-foreground font-medium -mt-1 hidden sm:block">
                                Print Automation for Cyber Cafes
                            </span>
                        </div>
                    </a>

                    {/* Desktop Navigation Menu */}
                    <nav className="hidden xl:flex items-center gap-1 bg-muted/60 p-1.5 rounded-full border border-border/80 shadow-inner">
                        {FRONT_NAV_ITEMS.map((item) => {
                            const isCurrent = activeSection === item.href.replace('#', '');
                            return (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    onClick={(e) => scrollToSection(e, item.href)}
                                    className={`relative px-3.5 py-1.5 text-xs font-medium rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                                        isCurrent
                                            ? 'bg-background text-foreground shadow-xs font-semibold'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                                    }`}
                                >
                                    <span>{item.name}</span>
                                    {item.badge && (
                                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                            {item.badge}
                                        </span>
                                    )}
                                </a>
                            );
                        })}
                    </nav>

                    {/* Compact Navigation for Medium Screens (lg to xl) */}
                    <nav className="hidden lg:flex xl:hidden items-center gap-1 bg-muted/60 p-1 rounded-full border border-border/80">
                        {FRONT_NAV_ITEMS.slice(0, 5).map((item) => {
                            const isCurrent = activeSection === item.href.replace('#', '');
                            return (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    onClick={(e) => scrollToSection(e, item.href)}
                                    className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                                        isCurrent
                                            ? 'bg-background text-foreground shadow-xs font-semibold'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {item.name}
                                </a>
                            );
                        })}
                        <a
                            href="#partner-program"
                            onClick={(e) => scrollToSection(e, '#partner-program')}
                            className="px-2.5 py-1 text-xs font-medium rounded-full text-emerald-600 dark:text-emerald-400 hover:bg-background/50"
                        >
                            Partner
                        </a>
                    </nav>

                    {/* Right CTA Actions */}
                    <div className="flex items-center gap-2.5">
                        {auth?.user ? (
                            <Link href={route('dashboard')}>
                                <Button size="sm" className="gap-1.5 shadow-sm font-semibold">
                                    <LayoutDashboard className="h-4 w-4" />
                                    <span>Dashboard</span>
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link href={route('login')} className="hidden sm:inline-flex">
                                    <Button variant="ghost" size="sm" className="gap-1.5 font-medium">
                                        <LogIn className="h-4 w-4" />
                                        <span>Shop Login</span>
                                    </Button>
                                </Link>
                                <a
                                    href="#how-to-setup"
                                    onClick={(e) => scrollToSection(e, '#how-to-setup')}
                                    className="hidden sm:inline-flex"
                                >
                                    <Button size="sm" className="gap-1.5 shadow-sm font-semibold bg-gradient-to-r from-primary to-primary/90 hover:opacity-95">
                                        <span>Get Started</span>
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </Button>
                                </a>
                            </>
                        )}

                        {/* Mobile Menu Toggle Button */}
                        <Button
                            variant="outline"
                            size="icon"
                            className="xl:hidden h-9 w-9 rounded-lg"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle menu"
                            aria-expanded={mobileMenuOpen}
                        >
                            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Drawer Menu */}
            {mobileMenuOpen && (
                <div className="xl:hidden fixed inset-x-0 top-[60px] bottom-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border animate-in fade-in slide-in-from-top-4 duration-200 overflow-y-auto">
                    <div className="max-w-md mx-auto px-4 py-6 flex flex-col gap-4">
                        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2">
                            Navigation Menu
                        </div>

                        <div className="grid gap-1 bg-card rounded-2xl border border-border/80 p-2 shadow-xs">
                            {FRONT_NAV_ITEMS.map((item) => {
                                const Icon = item.icon;
                                const isCurrent = activeSection === item.href.replace('#', '');
                                return (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        onClick={(e) => scrollToSection(e, item.href)}
                                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                            isCurrent
                                                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className={`h-4 w-4 ${isCurrent ? 'text-primary-foreground' : 'text-primary'}`} />
                                            <span>{item.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {item.badge && (
                                                <Badge
                                                    variant="secondary"
                                                    className={`text-[10px] px-2 py-0.5 ${
                                                        isCurrent
                                                            ? 'bg-primary-foreground/20 text-primary-foreground border-transparent'
                                                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                                    }`}
                                                >
                                                    {item.badge}
                                                </Badge>
                                            )}
                                            <ChevronRight className={`h-4 w-4 opacity-60 ${isCurrent ? 'text-primary-foreground' : ''}`} />
                                        </div>
                                    </a>
                                );
                            })}
                        </div>

                        {/* Mobile Auth Actions */}
                        <div className="pt-2 flex flex-col gap-2.5">
                            {auth?.user ? (
                                <Link href={route('dashboard')} onClick={() => setMobileMenuOpen(false)}>
                                    <Button className="w-full justify-center gap-2 h-11 text-base font-semibold shadow-md">
                                        <LayoutDashboard className="h-4 w-4" />
                                        <span>Open Dashboard</span>
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('login')} onClick={() => setMobileMenuOpen(false)}>
                                        <Button variant="outline" className="w-full justify-center gap-2 h-11 font-medium">
                                            <LogIn className="h-4 w-4" />
                                            <span>Shop Owner Login</span>
                                        </Button>
                                    </Link>
                                    <a
                                        href="#how-to-setup"
                                        onClick={(e) => scrollToSection(e, '#how-to-setup')}
                                    >
                                        <Button className="w-full justify-center gap-2 h-11 text-base font-semibold shadow-md bg-gradient-to-r from-primary to-primary/90">
                                            <span>Setup Your Shop Free</span>
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </a>
                                </>
                            )}
                        </div>

                        {/* Quick Contact info in mobile */}
                        <div className="mt-4 pt-4 border-t border-border text-center text-xs text-muted-foreground flex flex-col items-center gap-1">
                            <span>Need direct assistance?</span>
                            <a
                                href="https://wa.me/919999999999?text=Hi%20QR%20Se%20Print,%20I%20want%20to%20setup%20my%20shop"
                                target="_blank"
                                rel="noreferrer"
                                className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                            >
                                WhatsApp Support: +91 99999 99999
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
