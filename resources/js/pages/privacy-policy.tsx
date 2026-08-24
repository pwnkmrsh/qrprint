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
    Mail,
    Smartphone,
    EyeOff,
    ExternalLink
} from 'lucide-react';

export default function PrivacyPolicy() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Privacy Policy — QRPrintSetu">
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
                                    <Link href="/terms-of-service">
                                        Terms of Service
                                    </Link>
                                </Button>
                                <Button asChild variant="ghost" size="sm" className="text-xs text-primary font-semibold hover:bg-primary/10">
                                    <Link href="/security-declaration">
                                        Security Declaration
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        {/* Page Header */}
                        <div className="space-y-4 pb-10 border-b border-border">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                <span>Official Privacy Declaration</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
                                Privacy Policy
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5 text-primary" />
                                    Last Updated: August 24, 2026
                                </span>
                                <span>•</span>
                                <span>Version 2.4</span>
                                <span>•</span>
                                <span className="text-primary font-semibold">Strict Zero-Retention Guarantee</span>
                            </div>
                        </div>

                        {/* Key Pillars Highlights */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-10">
                            <Card className="p-5 bg-card border-border space-y-2">
                                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                                    <Trash2 className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-sm">Automatic File Shredding</h3>
                                <p className="text-xs text-muted-foreground">
                                    Files are permanently deleted immediately upon print completion or within 5 minutes.
                                </p>
                            </Card>

                            <Card className="p-5 bg-card border-border space-y-2">
                                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                                    <EyeOff className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-sm">Zero Number Sharing</h3>
                                <p className="text-xs text-muted-foreground">
                                    No WhatsApp number exchanges, contact saves, or chat history exposure.
                                </p>
                            </Card>

                            <Card className="p-5 bg-card border-border space-y-2">
                                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-sm">256-Bit TLS Encryption</h3>
                                <p className="text-xs text-muted-foreground">
                                    All documents transit via encrypted tunnels directly from mobile to local printer spool.
                                </p>
                            </Card>
                        </div>

                        {/* Policy Content */}
                        <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">
                            {/* Section 1 */}
                            <section className="space-y-3">
                                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    <span className="text-primary font-mono text-sm">01.</span>
                                    Introduction & Core Philosophy
                                </h2>
                                <p>
                                    Welcome to QRPrintSetu ("we", "our", "us", or "QRPrintSetu"). We operate a cloud-assisted QR print automation platform built specifically for cyber cafes, campus Xerox counters, book depots, and stationery centers across India.
                                </p>
                                <p>
                                    Our fundamental architecture is engineered around the principle of <strong>Zero Data Retention</strong>. We believe your sensitive personal documents (such as Aadhaar cards, PAN cards, resumes, academic marksheets, financial statements, and confidential letters) belong exclusively to you.
                                </p>
                            </section>

                            {/* Section 2 */}
                            <section className="space-y-3">
                                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    <span className="text-primary font-mono text-sm">02.</span>
                                    Information We Process
                                </h2>
                                <p>
                                    Depending on how you interact with QRPrintSetu, we process the following categories of data:
                                </p>
                                <div className="space-y-2 pl-2">
                                    <div className="p-3.5 rounded-xl bg-card border border-border">
                                        <h4 className="font-bold text-foreground text-xs mb-1">A. End-Customer Uploaded Documents (Ephemeral Only)</h4>
                                        <p className="text-xs">
                                            Files uploaded by walk-in customers (PDF, Word, PNG, JPG) are held in memory/volatile disk solely for the duration of the print queue transmission. Content is never indexed, stored permanently, scanned for advertising, or shared with third parties.
                                        </p>
                                    </div>
                                    <div className="p-3.5 rounded-xl bg-card border border-border">
                                        <h4 className="font-bold text-foreground text-xs mb-1">B. Print Job Metadata</h4>
                                        <p className="text-xs">
                                            Non-confidential technical parameters including page count, color preference (B&W vs Color), copy count, timestamp, transaction ID, and printer status code.
                                        </p>
                                    </div>
                                    <div className="p-3.5 rounded-xl bg-card border border-border">
                                        <h4 className="font-bold text-foreground text-xs mb-1">C. Shop Owner Account Information</h4>
                                        <p className="text-xs">
                                            When a shop registers, we store their business name, contact mobile number, email address, custom rate cards, and linked printer identifiers.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Section 3 */}
                            <section className="space-y-3">
                                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    <span className="text-primary font-mono text-sm">03.</span>
                                    Automated 5-Minute Document Shredding Policy
                                </h2>
                                <p>
                                    We maintain an automated garbage collection routine that triggers in two ways:
                                </p>
                                <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs sm:text-sm">
                                    <li>
                                        <strong>Immediate purge:</strong> As soon as the shop's local Windows Print Agent signals successful paper spooling from the tray.
                                    </li>
                                    <li>
                                        <strong>Time-based purge:</strong> If a job is abandoned or unpaid, the uploaded file is permanently erased automatically within 5 minutes.
                                    </li>
                                </ul>
                            </section>

                            {/* Section 4 */}
                            <section className="space-y-3">
                                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    <span className="text-primary font-mono text-sm">04.</span>
                                    Payment Processing & Financial Data
                                </h2>
                                <p>
                                    All digital payments (UPI via Google Pay, PhonePe, Paytm, BHIM, Cred) are processed through RBI-authorized payment gateway partners. QRPrintSetu does not store credit card numbers, UPI PINs, or bank account credentials. We only receive cryptographic webhook confirmations indicating whether payment succeeded.
                                </p>
                            </section>

                            {/* Section 5 */}
                            <section className="space-y-3">
                                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    <span className="text-primary font-mono text-sm">05.</span>
                                    Data Security Measures
                                </h2>
                                <p>
                                    We implement strict technical safeguards including TLS 1.3 encryption for in-transit communication, token-based session verification for shop QR codes, and isolated local spool sandboxing on the shop agent.
                                </p>
                            </section>

                            {/* Section 6 */}
                            <section className="space-y-3">
                                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    <span className="text-primary font-mono text-sm">06.</span>
                                    Contact & Grievance Redressal
                                </h2>
                                <p>
                                    If you have any questions, concerns, or inquiries regarding this Privacy Policy, please contact our Data Protection Officer:
                                </p>
                                <div className="p-4 rounded-xl bg-card border border-border space-y-1.5 text-xs text-foreground">
                                    <div className="font-bold">QRPrintSetu Privacy & Compliance Desk</div>
                                    <div>Email: <a href="mailto:QRPrintSetuin@gmail.com" className="text-primary underline">QRPrintSetuin@gmail.com</a></div>
                                    <div>WhatsApp Help: <a href="https://wa.me/919098132966" target="_blank" rel="noopener noreferrer" className="text-primary underline">+91 90981 32966</a></div>
                                    <div>Availability: Monday to Saturday (9:00 AM – 8:00 PM IST)</div>
                                </div>
                            </section>
                        </div>

                        {/* Bottom Action */}
                        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-xs text-muted-foreground">
                                Read our companion <Link href="/security-declaration" className="text-primary font-semibold underline">Security Declaration</Link> for detailed hardware architecture specs.
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
