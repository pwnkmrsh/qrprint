import { Head, Link, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import FrontHeader from '@/components/front-header';
import FrontFooter from '@/components/front-footer';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    ShieldCheck,
    Lock,
    Trash2,
    FileText,
    ArrowLeft,
    CheckCircle2,
    Clock,
    Server,
    Cpu,
    Zap,
    KeyRound
} from 'lucide-react';

export default function SecurityDeclaration() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Security & Privacy Declaration — QRPrintSetu">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary selection:text-primary-foreground">
                <FrontHeader auth={auth} />

                <main className="grow pt-28 pb-20 md:pt-36">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Breadcrumbs & Navigation */}
                        <div className="flex items-center justify-between gap-4 mb-8">
                            <Button asChild variant="outline" size="sm" className="gap-2 text-xs border-border bg-card hover:bg-muted">
                                <Link href="/">
                                    <ArrowLeft className="h-3.5 w-3.5" />
                                    <span>Back to Home</span>
                                </Link>
                            </Button>
                            <div className="flex items-center gap-2">
                                <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                                    <Link href="/privacy-policy">
                                        Privacy Policy
                                    </Link>
                                </Button>
                                <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                                    <Link href="/terms-of-service">
                                        Terms of Service
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        {/* Page Header */}
                        <div className="space-y-4 pb-10 border-b border-border">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                <span>Formal Technical Assurance</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
                                Security & Privacy Declaration
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5 text-primary" />
                                    Effective: August 2026
                                </span>
                                <span>•</span>
                                <span>Document Ref: Q2P-SEC-2026-V2</span>
                                <span>•</span>
                                <span className="text-primary font-semibold">99.9% Uptime Hardware SLA</span>
                            </div>
                        </div>

                        {/* Core Pillars */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-10">
                            <Card className="p-5 bg-card border-border space-y-2">
                                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                                    <Trash2 className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-sm">0 Data Retention</h3>
                                <p className="text-xs text-muted-foreground">
                                    Files permanently purged within 5 minutes of printing.
                                </p>
                            </Card>

                            <Card className="p-5 bg-card border-border space-y-2">
                                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-sm">TLS 1.3 Encryption</h3>
                                <p className="text-xs text-muted-foreground">
                                    Bank-grade 256-bit encryption on all data paths.
                                </p>
                            </Card>

                            <Card className="p-5 bg-card border-border space-y-2">
                                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                                    <KeyRound className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-sm">Zero Operator Access</h3>
                                <p className="text-xs text-muted-foreground">
                                    Shop staff cannot view or download uploaded files.
                                </p>
                            </Card>

                            <Card className="p-5 bg-card border-border space-y-2">
                                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                                    <Zap className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-sm">All Printers Supported</h3>
                                <p className="text-xs text-muted-foreground">
                                    Canon, HP, Epson, Brother via Windows GDI spooling.
                                </p>
                            </Card>
                        </div>

                        {/* Four Core Formal Declarations */}
                        <div className="space-y-8 my-10">
                            {/* Declaration 1 */}
                            <Card className="p-7 border-l-4 border-l-primary bg-card border-border space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                        <ShieldCheck className="h-4 w-4" />
                                    </div>
                                    <h3 className="font-bold text-lg text-foreground">
                                        Declaration 1: Zero Data Retention & Immediate File Purge
                                    </h3>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    All uploaded customer documents (including government ID proofs, Aadhaar cards, PAN cards, resumes, academic certificates, court affidavits, and medical reports) are strictly treated as ephemeral data. Files reside in volatile, encrypted storage solely for the duration of the print queue transmission.
                                </p>
                                <div className="p-3.5 rounded-lg bg-muted/40 border border-border text-xs space-y-1.5">
                                    <div className="font-semibold text-foreground">Purge Triggers & Verification:</div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                                        <span>Instant Shred: On local Windows spooler tray feed completion.</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                                        <span>Automated Timeout: 5-minute hard expiry for abandoned/unpaid sessions.</span>
                                    </div>
                                </div>
                            </Card>

                            {/* Declaration 2 */}
                            <Card className="p-7 border-l-4 border-l-primary bg-card border-border space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                        <Lock className="h-4 w-4" />
                                    </div>
                                    <h3 className="font-bold text-lg text-foreground">
                                        Declaration 2: End-to-End Encryption & Zero Operator Access
                                    </h3>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    All data communications between customer mobile devices, our cloud routers, and the local shop Windows Print Agent utilize TLS 1.3 cryptographic protocols with AES-256 bit encryption.
                                </p>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Neither shop owners, cyber cafe staff, nor QRPrintSetu system administrators possess access to inspect, copy, or download customer document contents. The document flows straight to the printer driver.
                                </p>
                            </Card>

                            {/* Declaration 3 */}
                            <Card className="p-7 border-l-4 border-l-primary bg-card border-border space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                        <FileText className="h-4 w-4" />
                                    </div>
                                    <h3 className="font-bold text-lg text-foreground">
                                        Declaration 3: Payment Settlement & Non-Tamper Audit Trail
                                    </h3>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    UPI transactions and payment confirmations are directly authenticated through authorized NPCI payment gateway endpoints. QRPrintSetu maintains strict cryptographic webhook signatures ensuring that no fraudulent, unverified, or unpaid print jobs are ever transmitted to the physical printer.
                                </p>
                            </Card>

                            {/* Declaration 4 */}
                            <Card className="p-7 border-l-4 border-l-primary bg-card border-border space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                        <Cpu className="h-4 w-4" />
                                    </div>
                                    <h3 className="font-bold text-lg text-foreground">
                                        Declaration 4: Hardware Independence & 99.9% Uptime Guarantee
                                    </h3>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    QRPrintSetu operates with standard Windows GDI and PostScript printer subsystems. This guarantees seamless compatibility across all major printer manufacturers (Canon, HP, Epson, Brother, Ricoh, Konica Minolta) without requiring proprietary dongles or hardware vendor lock-in.
                                </p>
                            </Card>
                        </div>

                        {/* Compliance Inquiries */}
                        <div className="p-6 rounded-2xl bg-card border border-border space-y-3">
                            <h4 className="font-bold text-base text-foreground">Compliance & Security Inquiries</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                For vulnerability disclosures, enterprise security audits, or compliance verifications, please reach out to our dedicated technical team:
                            </p>
                            <div className="flex flex-wrap items-center gap-6 text-xs text-foreground pt-1">
                                <div>Email: <a href="mailto:mynatech.in@gmail.com" className="text-primary underline">mynatech.in@gmail.com</a></div>
                                <div>WhatsApp Support: <a href="https://wa.me/919098132966" target="_blank" rel="noopener noreferrer" className="text-primary underline">+91 90981 32966</a></div>
                            </div>
                        </div>

                        {/* Bottom Action */}
                        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-xs text-muted-foreground">
                                Also review our <Link href="/privacy-policy" className="text-primary font-semibold underline">Privacy Policy</Link> and <Link href="/terms-of-service" className="text-primary font-semibold underline">Terms of Service</Link>.
                            </div>
                            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                                <Link href="/">
                                    Return to QRPrintSetu Home
                                </Link>
                            </Button>
                        </div>
                    </div>
                </main>

                <FrontFooter />
            </div>
        </>
    );
}
