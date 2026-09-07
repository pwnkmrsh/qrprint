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
    CreditCard,
    ShieldCheck,
    Building2,
    Mail,
    Phone,
    RotateCcw
} from 'lucide-react';

export default function TermsOfService() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Terms and Conditions — Print Setu | Cashfree Gateway Agreement">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary selection:text-primary-foreground">
                <FrontHeader auth={auth} />

                <main className="grow pt-28 pb-20 md:pt-36">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Breadcrumbs & Navigation */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                            <Button asChild variant="outline" size="sm" className="gap-2 text-xs border-border bg-card hover:bg-muted">
                                <Link href="/">
                                    <ArrowLeft className="h-3.5 w-3.5" />
                                    <span>Back to Home</span>
                                </Link>
                            </Button>
                            <div className="flex flex-wrap items-center gap-2">
                                <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                                    <Link href="/pricing">Pricing in INR</Link>
                                </Button>
                                <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                                    <Link href="/refund-policy">Refund Policy</Link>
                                </Button>
                                <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                                    <Link href="/privacy-policy">Privacy Policy</Link>
                                </Button>
                                <Button asChild variant="ghost" size="sm" className="text-xs text-primary font-semibold hover:bg-primary/10">
                                    <Link href="/contact-us">Contact Us</Link>
                                </Button>
                            </div>
                        </div>

                        {/* Page Header */}
                        <div className="space-y-4 pb-10 border-b border-border">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
                                <Scale className="h-3.5 w-3.5" />
                                <span>Platform Legal Agreement & Terms of Service</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
                                Terms and Conditions
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5 text-primary" />
                                    Last Updated: August 2026
                                </span>
                                <span>•</span>
                                <span>Version 2.5</span>
                                <span>•</span>
                                <span className="text-primary font-semibold">Indian Rupees (INR / ₹) Gateway Terms</span>
                            </div>
                        </div>

                        {/* Key Highlights */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-10">
                            <Card className="p-5 bg-card border-border space-y-2">
                                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                                    <Laptop className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-sm">Self-Service QR Cloud</h3>
                                <p className="text-xs text-muted-foreground">
                                    Enables walk-in customers and shops to automate document printing seamlessly.
                                </p>
                            </Card>

                            <Card className="p-5 bg-card border-border space-y-2">
                                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                                    <CreditCard className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-sm">INR Payments (Cashfree)</h3>
                                <p className="text-xs text-muted-foreground">
                                    All billing and retail print fees are processed in Indian Rupees (INR / ₹) via Cashfree Payment Gateway.
                                </p>
                            </Card>

                            <Card className="p-5 bg-card border-border space-y-2">
                                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                                    <ShieldAlert className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-sm">Lawful Content Only</h3>
                                <p className="text-xs text-muted-foreground">
                                    Users are strictly prohibited from uploading copyrighted, illegal, or malicious documents.
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
                                    Welcome to <strong>Print Setu</strong> ("Platform", "we", "us", or "our"), operated by <strong>MynaTech Innovations</strong> (Sector 62, Noida, Uttar Pradesh 201309, India). By accessing, registering, or using our website (<a href="/" className="text-primary hover:underline">printsetu.in</a>), web application, customer mobile print portal, or Windows Print Agent desktop software, you agree to be legally bound by these Terms and Conditions ("Terms"). If you disagree with any portion of these Terms, you must cease using our services immediately.
                                </p>
                            </section>

                            {/* Section 2 */}
                            <section className="space-y-3">
                                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    <span className="text-primary font-mono text-sm">02.</span>
                                    Description of Products & Services
                                </h2>
                                <p>
                                    Print Setu provides cloud-based document printing automation and retail kiosk solutions, including:
                                </p>
                                <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs sm:text-sm">
                                    <li><strong>Self-Service QR Printing:</strong> Walk-in retail customers scan a shop counter QR code, upload documents (PDF, DOCX, XLSX, PPTX, JPG, PNG), choose print preferences (Black & White vs Color, single vs double-sided duplex), and pay online.</li>
                                    <li><strong>Windows Desktop Spooler Agent:</strong> Desktop software installed on the shopkeeper's PC that receives authenticated print jobs and releases them directly to USB/Wi-Fi connected printers (Canon, HP, Epson, Brother, Ricoh, Xerox, etc.).</li>
                                    <li><strong>Shopkeeper SaaS Platform:</strong> Cloud dashboard for print shop owners to manage rate cards, monitor daily revenue, connect multiple printers, and manage queues.</li>
                                    <li><strong>Merchant Counter Stands:</strong> Physical acrylic QR stands and shop promotional collateral.</li>
                                </ul>
                            </section>

                            {/* Section 3 */}
                            <section className="space-y-3">
                                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    <span className="text-primary font-mono text-sm">03.</span>
                                    Pricing, Currency & Payment Terms
                                </h2>
                                <div className="space-y-2">
                                    <p>
                                        <strong>Currency of Transaction:</strong> All transactions, whether for retail document printing or monthly/annual shop SaaS subscriptions, are priced, billed, and processed exclusively in <strong>Indian Rupees (INR / ₹)</strong>.
                                    </p>
                                    <p>
                                        <strong>Payment Gateway:</strong> Digital payments on the platform are securely facilitated by <strong>Cashfree Payments India Pvt. Ltd.</strong> ("Cashfree") in compliance with Reserve Bank of India (RBI) directives and PCI-DSS Level 1 standards. We accept UPI (Google Pay, PhonePe, Paytm, BHIM, Cred), Debit/Credit Cards (Visa, MasterCard, RuPay), and Net Banking.
                                    </p>
                                    <p>
                                        <strong>Taxes:</strong> All applicable taxes (including Goods and Services Tax - GST) are clearly displayed during final checkout before payment confirmation.
                                    </p>
                                </div>
                            </section>

                            {/* Section 4 */}
                            <section className="space-y-3">
                                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    <span className="text-primary font-mono text-sm">04.</span>
                                    Cancellations & Refunds
                                </h2>
                                <p>
                                    All cancellation and refund requests are governed strictly by our dedicated{' '}
                                    <Link href="/refund-policy" className="text-primary font-semibold underline">
                                        Refunds and Cancellations Policy
                                    </Link>
                                    . In summary:
                                </p>
                                <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs sm:text-sm">
                                    <li>Print jobs can be cancelled at any time prior to printer spooling.</li>
                                    <li>In the event of hardware jams, printer disconnection, or double payment deductions, refunds are processed back to the customer's original payment method via Cashfree within <strong>5 to 7 business working days</strong>.</li>
                                    <li>Shop owners may cancel SaaS subscriptions at any time before the subsequent billing cycle.</li>
                                </ul>
                            </section>

                            {/* Section 5 */}
                            <section className="space-y-3">
                                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    <span className="text-primary font-mono text-sm">05.</span>
                                    Shop Owner Accounts & Responsibilities
                                </h2>
                                <p>
                                    Print shop owners and cyber cafe operators registering on Print Setu agree to:
                                </p>
                                <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs sm:text-sm">
                                    <li>Provide accurate business details and valid contact information.</li>
                                    <li>Maintain their physical printer hardware, paper stock, and toner ink levels in functioning order.</li>
                                    <li>Accurately configure per-page rate cards for Black & White, Color, and duplex printing options in Indian Rupees (INR).</li>
                                    <li>Ensure the shop computer running the Windows Print Agent is powered on and connected to the internet during operational hours.</li>
                                </ul>
                            </section>

                            {/* Section 6 */}
                            <section className="space-y-3">
                                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    <span className="text-primary font-mono text-sm">06.</span>
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

                            {/* Section 7 */}
                            <section className="space-y-3">
                                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    <span className="text-primary font-mono text-sm">07.</span>
                                    Privacy & Document Shredding Guarantee
                                </h2>
                                <p>
                                    We maintain a strict zero-retention policy. Uploaded document files are held temporarily in volatile memory solely for the purpose of transferring to the shop's local Windows spooler, and are permanently erased within 5 minutes of printing. For complete details, refer to our{' '}
                                    <Link href="/privacy-policy" className="text-primary font-semibold underline">
                                        Privacy Policy
                                    </Link>
                                    .
                                </p>
                            </section>

                            {/* Section 8 */}
                            <section className="space-y-3">
                                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    <span className="text-primary font-mono text-sm">08.</span>
                                    Limitation of Liability
                                </h2>
                                <p>
                                    To the maximum extent permitted by law, Print Setu and MynaTech Innovations shall not be liable for indirect, incidental, or consequential damages resulting from local shop hardware malfunctions, local electrical power cuts, incorrect customer file uploads, or third-party telecom network disruptions.
                                </p>
                            </section>

                            {/* Section 9 */}
                            <section className="space-y-3">
                                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    <span className="text-primary font-mono text-sm">09.</span>
                                    Governing Law & Jurisdiction
                                </h2>
                                <p>
                                    These Terms shall be governed by, interpreted, and construed in accordance with the laws of the Republic of India. Any disputes, claims, or controversies arising under these Terms shall be subject to the exclusive jurisdiction of the competent courts in Uttar Pradesh / New Delhi, India.
                                </p>
                            </section>

                            {/* Section 10 */}
                            <section className="space-y-3">
                                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    <span className="text-primary font-mono text-sm">10.</span>
                                    Official Contact & Legal Notices
                                </h2>
                                <Card className="p-5 bg-card border-border space-y-2 text-xs text-foreground">
                                    <div className="font-bold text-sm">MynaTech Innovations (Print Setu)</div>
                                    <div className="text-muted-foreground">Registered Address: Sector 62, Noida, Uttar Pradesh – 201309, India</div>
                                    <div className="text-muted-foreground">Official Email: <a href="mailto:mynatech.in@gmail.com" className="text-primary underline">mynatech.in@gmail.com</a> / <a href="mailto:support@printsetu.in" className="text-primary underline">support@printsetu.in</a></div>
                                    <div className="text-muted-foreground">Phone / WhatsApp Support: <a href="https://wa.me/919098132966" target="_blank" rel="noopener noreferrer" className="text-primary underline">+91 90981 32966</a></div>
                                </Card>
                            </section>
                        </div>

                        {/* Bottom Action */}
                        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-xs text-muted-foreground">
                                Also view our <Link href="/privacy-policy" className="text-primary font-semibold underline">Privacy Policy</Link>, <Link href="/refund-policy" className="text-primary font-semibold underline">Refunds Policy</Link>, and <Link href="/contact-us" className="text-primary font-semibold underline">Contact Us</Link>.
                            </div>
                            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                                <Link href="/">
                                    Return to Home
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
