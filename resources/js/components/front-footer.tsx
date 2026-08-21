import { QrCode, Heart, ShieldCheck, Mail, Phone, MessageSquare, ArrowUpRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FrontFooter() {
    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (href.startsWith('#')) {
            e.preventDefault();
            const targetId = href.replace('#', '');
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
                window.history.pushState(null, '', href);
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
                            <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md shadow-primary/20">
                                <QrCode className="h-5 w-5" />
                            </div>
                            <span className="font-extrabold text-xl tracking-tight">QR Se Print</span>
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
                            <li>
                                <a
                                    href="#home"
                                    onClick={(e) => scrollToSection(e, '#home')}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Home
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#feature"
                                    onClick={(e) => scrollToSection(e, '#feature')}
                                    className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                                >
                                    <span>Features</span>
                                    <Sparkles className="h-3 w-3 text-amber-500" />
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#how-to-setup"
                                    onClick={(e) => scrollToSection(e, '#how-to-setup')}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    How to Setup
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#pricing"
                                    onClick={(e) => scrollToSection(e, '#pricing')}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Pricing Plans
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-sm text-foreground uppercase tracking-wider mb-4">
                            Company & Partner
                        </h4>
                        <ul className="space-y-2.5 text-sm">
                            <li>
                                <a
                                    href="#about"
                                    onClick={(e) => scrollToSection(e, '#about')}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    About Us
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#partner-program"
                                    onClick={(e) => scrollToSection(e, '#partner-program')}
                                    className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline flex items-center gap-1"
                                >
                                    <span>Partner Program</span>
                                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 border border-emerald-500/20 font-bold">
                                        30%
                                    </span>
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#contact"
                                    onClick={(e) => scrollToSection(e, '#contact')}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Contact Us
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://wa.me/919999999999"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                                >
                                    <span>WhatsApp Support</span>
                                    <ArrowUpRight className="h-3 w-3" />
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-sm text-foreground uppercase tracking-wider mb-4">
                            Trust & Security
                        </h4>
                        <ul className="space-y-2.5 text-sm">
                            <li>
                                <a
                                    href="#declaration"
                                    onClick={(e) => scrollToSection(e, '#declaration')}
                                    className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                                >
                                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                                    <span>Declaration & Privacy</span>
                                </a>
                            </li>
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
                    <p>© {new Date().getFullYear()} QR Se Print. Built for India's Print Shop Revolution.</p>
                    <div className="flex items-center gap-6">
                        <a href="#declaration" onClick={(e) => scrollToSection(e, '#declaration')} className="hover:underline">
                            Privacy Policy
                        </a>
                        <a href="#declaration" onClick={(e) => scrollToSection(e, '#declaration')} className="hover:underline">
                            Terms of Service
                        </a>
                        <a href="#declaration" onClick={(e) => scrollToSection(e, '#declaration')} className="hover:underline">
                            Security Declaration
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
