import { Head, Link, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import FrontHeader from '@/components/front-header';
import FrontFooter from '@/components/front-footer';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    FileCheck2,
    ShieldAlert,
    Scale,
    ArrowLeft,
    Clock,
    CheckCircle2,
    Laptop,
    CreditCard
} from 'lucide-react';

export default function TermsOfService() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Terms of Service — QRPrintSetu">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary selection:text-primary-foreground">
                <FrontHeader auth={auth} />

                <main className="grow pt-28 pb-20 md:pt-36">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Breadcrumbs & Navigation */}
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
                                <Scale className="h-3.5 w-3.5" />
                                <span>Platform Agreement</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
                                Terms of Service
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5 text-primary" />
                                    Last Updated: August 24, 2026
                                </span>
                                <span>•</span>
                                <span>Version 2.4</span>
                                <span>•</span>
                                <span className="text-primary font-semibold">Standard Commercial SaaS Terms</span>
                            </div>
                        </div>

                        {/* Key Pillars Highlights */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-10">
                            <Card className="p-5 bg-card border-border space-y-2">
                                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                                    <Laptop className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-sm">Shop Hardware Setup</h3>
                                <p className="text-xs text-muted-foreground">
                                    Works with any standard Windows PC and USB/WiFi connected printer.
                                </p>
                            </Card>

                            <Card className="p-5 bg-card border-border space-y-2">
                                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                                    <CreditCard className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-sm">Instant UPI Webhooks</h3>
                                <p className="text-xs text-muted-foreground">
                                    Print queues release jobs solely after verified real-time payment authentication.
                                </p>
                            </Card>

                            <Card className="p-5 bg-card border-border space-y-2">
                                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                                    <ShieldAlert className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-sm">Lawful Content Only</h3>
                                <p className="text-xs text-muted-foreground">
                                    Users are solely responsible for ensuring uploaded material complies with applicable Indian laws.
                                </p>
                            </Card>
                        </div>

                        {/* Terms Content */}
                        <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">
                            {/* Section 1 */}
                            <section className="space-y-3">
                                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    <span className="text-primary font-mono text-sm">01.</span>
                                    Acceptance of Terms
                                </h2>
                                <p>
                                    By accessing or using the QRPrintSetu SaaS platform, web portal, or Windows Print Agent desktop application, you agree to be bound by these Terms of Service ("Terms"). If you do not agree with any part of these Terms, you must not use our software or services.
                                </p>
                            </section>

                            {/* Section 2 */}
                            <section className="space-y-3">
                                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    <span className="text-primary font-mono text-sm">02.</span>
                                    Description of Services
                                </h2>
                                <p>
                                    QRPrintSetu provides a decentralized self-service print automation gateway. It enables walk-in consumers to scan a physical counter QR code, upload documents through a mobile browser, configure output preferences, complete digital UPI transactions, and automatically route print jobs to the shop's physical printer through our local Windows Agent.
                                </p>
                            </section>

                            {/* Section 3 */}
                            <section className="space-y-3">
                                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    <span className="text-primary font-mono text-sm">03.</span>
                                    Shop Owner Accounts & Responsibilities
                                </h2>
                                <p>
                                    Print shop owners and cyber cafe operators registering on QRPrintSetu agree to:
                                </p>
                                <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs sm:text-sm">
                                    <li>Provide accurate business details and valid contact information.</li>
                                    <li>Maintain their physical printer hardware, paper stock, and toner ink levels in functioning order.</li>
                                    <li>Accurately configure per-page rate cards for Black & White, Color, and duplex printing options.</li>
                                    <li>Ensure the shop computer running the Windows Print Agent is powered on and connected to the internet during operational hours.</li>
                                </ul>
                            </section>

                            {/* Section 4 */}
                            <section className="space-y-3">
                                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    <span className="text-primary font-mono text-sm">04.</span>
                                    Customer Document Guidelines & Prohibited Content
                                </h2>
                                <p>
                                    Walk-in customers and end-users agree not to upload any content that:
                                </p>
                                <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs sm:text-sm">
                                    <li>Infringes upon third-party copyrights, patents, or intellectual property rights.</li>
                                    <li>Contains malware, infected binaries, virus scripts, or malicious macros.</li>
                                    <li>Violates the Indian Penal Code, Information Technology Act 2000, or other governing statutes.</li>
                                    <li>Involves counterfeit currency, forged official stamps, or fraudulent identity templates.</li>
                                </ul>
                            </section>

                            {/* Section 5 */}
                            <section className="space-y-3">
                                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    <span className="text-primary font-mono text-sm">05.</span>
                                    Payments, Subscriptions & Refunds
                                </h2>
                                <p>
                                    <strong>Shop SaaS Subscriptions:</strong> Paid plans (Cyber Cafe Pro, Enterprise) are billed monthly or annually as selected. Subscriptions can be cancelled at any time before renewal.
                                </p>
                                <p>
                                    <strong>Customer Print Payments:</strong> Print job fees are settled directly from the customer to the shop payment settlement channel via UPI. If a hardware jam or printer error prevents document printing, the shop owner will resolve the print reprint locally on counter.
                                </p>
                            </section>

                            {/* Section 6 */}
                            <section className="space-y-3">
                                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    <span className="text-primary font-mono text-sm">06.</span>
                                    Limitation of Liability
                                </h2>
                                <p>
                                    To the maximum extent permitted by law, QRPrintSetu shall not be liable for indirect, incidental, or consequential damages resulting from local printer hardware malfunctions, power cuts at shop premises, paper jams, or third-party telecom disruptions.
                                </p>
                            </section>

                            {/* Section 7 */}
                            <section className="space-y-3">
                                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    <span className="text-primary font-mono text-sm">07.</span>
                                    Governing Law & Jurisdiction
                                </h2>
                                <p>
                                    These Terms shall be governed by and construed in accordance with the laws of the Republic of India. Any disputes arising hereunder shall be subject to the exclusive jurisdiction of the competent courts located in India.
                                </p>
                            </section>

                            {/* Section 8 */}
                            <section className="space-y-3">
                                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    <span className="text-primary font-mono text-sm">08.</span>
                                    Contact Support
                                </h2>
                                <div className="p-4 rounded-xl bg-card border border-border space-y-1.5 text-xs text-foreground">
                                    <div className="font-bold">QRPrintSetu Legal & Operations Team</div>
                                    <div>Email: <a href="mailto:QRPrintSetuin@gmail.com" className="text-primary underline">QRPrintSetuin@gmail.com</a></div>
                                    <div>WhatsApp Help: <a href="https://wa.me/919098132966" target="_blank" rel="noopener noreferrer" className="text-primary underline">+91 90981 32966</a></div>
                                </div>
                            </section>
                        </div>

                        {/* Bottom Action */}
                        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-xs text-muted-foreground">
                                Also view our <Link href="/privacy-policy" className="text-primary font-semibold underline">Privacy Policy</Link> and <Link href="/security-declaration" className="text-primary font-semibold underline">Security Declaration</Link>.
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
