import { Head, Link, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import FrontHeader from '@/components/front-header';
import FrontFooter from '@/components/front-footer';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    RefreshCw,
    ShieldCheck,
    Clock,
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    CreditCard,
    HelpCircle,
    Mail,
    Phone,
    FileCheck2,
    XCircle,
    RotateCcw,
    Zap
} from 'lucide-react';

export default function RefundPolicy() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Refunds & Cancellations Policy — Print Setu | Cashfree Gateway Policy">
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
                                    <Link href="/terms-and-conditions">Terms of Service</Link>
                                </Button>
                                <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                                    <Link href="/privacy-policy">Privacy Policy</Link>
                                </Button>
                                <Button asChild variant="ghost" size="sm" className="text-xs text-primary font-semibold hover:bg-primary/10">
                                    <Link href="/contact-us">Contact Support</Link>
                                </Button>
                            </div>
                        </div>

                        {/* Page Header */}
                        <div className="space-y-4 pb-10 border-b border-border">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
                                <RotateCcw className="h-3.5 w-3.5" />
                                <span>Official Cashfree Payment Gateway Policy</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
                                Refunds & Cancellations Policy
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5 text-primary" />
                                    Last Updated: August 2026
                                </span>
                                <span>•</span>
                                <span>Standard Turnaround: 5–7 Business Days</span>
                                <span>•</span>
                                <span className="text-primary font-semibold">100% Source Account Reversal</span>
                            </div>
                        </div>

                        {/* Key Pillars Highlights */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-10">
                            <Card className="p-5 bg-card border-border space-y-2">
                                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                                    <RefreshCw className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-sm">Failed Print Auto-Refund</h3>
                                <p className="text-xs text-muted-foreground">
                                    If your payment is debited but the printer encounters a jam, ink error, or hardware failure, a full refund is initiated.
                                </p>
                            </Card>

                            <Card className="p-5 bg-card border-border space-y-2">
                                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                                    <CreditCard className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-sm">Direct Source Reversal</h3>
                                <p className="text-xs text-muted-foreground">
                                    Refunds are sent directly back to your original payment mode (UPI, Debit Card, Credit Card, or Net Banking) via Cashfree.
                                </p>
                            </Card>

                            <Card className="p-5 bg-card border-border space-y-2">
                                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                                    <Clock className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-sm">5–7 Working Days</h3>
                                <p className="text-xs text-muted-foreground">
                                    Standard banking turnaround is 5 to 7 business days from the moment a refund is approved by our system.
                                </p>
                            </Card>
                        </div>

                        {/* Main Policy Content Sections */}
                        <div className="space-y-12 text-sm text-foreground/90 leading-relaxed">
                            {/* Section 1 */}
                            <section className="space-y-4">
                                <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                                    <span>1. Overview & Policy Objective</span>
                                </h2>
                                <p>
                                    At <strong>Print Setu</strong> (operated by <strong>MynaTech Innovations</strong>), we are committed to providing a transparent, smooth, and fair digital printing experience. This Refunds and Cancellations Policy governs online payments processed through our platform via <strong>Cashfree Payment Gateway</strong> in Indian Rupees (INR / ₹) for both walk-in retail print customers and subscribed shop owners.
                                </p>
                            </section>

                            {/* Section 2 */}
                            <section className="space-y-4">
                                <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                                    <span>2. Cancellation Policy</span>
                                </h2>
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-foreground text-sm">A. Walk-in Customer Print Jobs:</h3>
                                    <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground">
                                        <li>
                                            <strong>Before Printing:</strong> Customers may cancel their print session at any point before clicking "Pay" or before the print job is sent to the local printer spooler. Once cancelled, no charges are incurred.
                                        </li>
                                        <li>
                                            <strong>After Printing Has Commenced:</strong> Once the payment is verified and the physical printer has started dispensing ink/toner onto paper, the physical materials are consumed; hence, completed print jobs cannot be cancelled.
                                        </li>
                                    </ul>

                                    <h3 className="font-semibold text-foreground text-sm pt-2">B. Shop Owner / Merchant SaaS Subscriptions:</h3>
                                    <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground">
                                        <li>
                                            Shop owners may cancel their monthly or annual SaaS subscription plan at any time from the <strong>Shop Settings &gt; Billing</strong> dashboard.
                                        </li>
                                        <li>
                                            Upon cancellation, access to premium features (e.g. multi-printer support, custom branding, priority spooling) will continue until the end of the current prepaid billing period. No further recurring charges will be deducted.
                                        </li>
                                    </ul>
                                </div>
                            </section>

                            {/* Section 3 */}
                            <section className="space-y-4">
                                <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                                    <span>3. Refund Eligibility & Qualified Scenarios</span>
                                </h2>
                                <p>
                                    You are entitled to a 100% full refund under the following valid circumstances:
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                    <div className="p-3.5 rounded-xl bg-card border border-border space-y-1.5">
                                        <div className="font-semibold text-xs text-primary flex items-center gap-1.5">
                                            <CheckCircle2 className="h-4 w-4" />
                                            <span>Hardware / Printer Error</span>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground">
                                            The payment succeeded via Cashfree, but the shop's printer suffered a paper jam, out-of-ink condition, power cut, or Windows Agent disconnection.
                                        </p>
                                    </div>

                                    <div className="p-3.5 rounded-xl bg-card border border-border space-y-1.5">
                                        <div className="font-semibold text-xs text-primary flex items-center gap-1.5">
                                            <CheckCircle2 className="h-4 w-4" />
                                            <span>Double / Excess Deduction</span>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground">
                                            A banking gateway glitch caused multiple debits from your bank account or UPI app for a single print order.
                                        </p>
                                    </div>

                                    <div className="p-3.5 rounded-xl bg-card border border-border space-y-1.5">
                                        <div className="font-semibold text-xs text-primary flex items-center gap-1.5">
                                            <CheckCircle2 className="h-4 w-4" />
                                            <span>Session Timeout / Unprocessed Job</span>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground">
                                            The amount was deducted, but the gateway webhook timed out before generating an active print job token.
                                        </p>
                                    </div>

                                    <div className="p-3.5 rounded-xl bg-card border border-border space-y-1.5">
                                        <div className="font-semibold text-xs text-primary flex items-center gap-1.5">
                                            <CheckCircle2 className="h-4 w-4" />
                                            <span>7-Day Shopkeeper Money-Back</span>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground">
                                            New shop owners purchasing their first paid SaaS tier can request a full refund within 7 days if their hardware is incompatible.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Section 4 */}
                            <section className="space-y-4">
                                <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                                    <span>4. Non-Refundable Scenarios</span>
                                </h2>
                                <p>
                                    Refunds will not be issued in the following cases:
                                </p>
                                <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground">
                                    <li>Documents printed successfully according to the customer's selected preferences (e.g. customer uploaded an incorrect file or selected color instead of B&W by mistake).</li>
                                    <li>Print quality issues arising directly from low-resolution or corrupted customer files uploaded to the kiosk.</li>
                                    <li>Requests made after more than 7 days from the transaction date.</li>
                                </ul>
                            </section>

                            {/* Section 5 */}
                            <section className="space-y-4">
                                <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                                    <span>5. Refund Method, Process & Settlement Timeline</span>
                                </h2>
                                <Card className="p-6 bg-card border-border space-y-4">
                                    <div className="space-y-2">
                                        <h3 className="font-bold text-sm text-foreground">A. Original Payment Mode Reversal:</h3>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            All refunds are electronically processed through the <strong>Cashfree Payment Gateway API</strong> and credited strictly back to the original source account (UPI VPA, Credit Card, Debit Card, or Net Banking account) used during the transaction. No cash or third-party transfers are permitted.
                                        </p>
                                    </div>

                                    <div className="space-y-2 pt-2 border-t border-border">
                                        <h3 className="font-bold text-sm text-foreground">B. Standard Timeline:</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                            <div className="p-3 rounded-lg bg-muted/60 space-y-1">
                                                <div className="font-semibold text-foreground">UPI / Instant VPA:</div>
                                                <div className="text-muted-foreground">24 to 48 business hours</div>
                                            </div>
                                            <div className="p-3 rounded-lg bg-muted/60 space-y-1">
                                                <div className="font-semibold text-foreground">Debit / Credit Card & Net Banking:</div>
                                                <div className="text-muted-foreground">5 to 7 business working days</div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </section>

                            {/* Section 6 */}
                            <section className="space-y-4">
                                <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                                    <span>6. How to Request a Refund</span>
                                </h2>
                                <p>
                                    If your transaction meets any of the refund criteria, you can initiate a refund through any of the following channels:
                                </p>
                                <div className="space-y-3 text-xs">
                                    <div className="p-4 rounded-xl bg-card border border-border space-y-2">
                                        <div className="font-bold text-sm text-foreground">Method 1: Direct Counter Operator Resolution</div>
                                        <p className="text-muted-foreground">
                                            Ask the cyber cafe / stationery shop operator at the counter. The operator can click <strong>"Cancel & Refund"</strong> directly from their shop dashboard to trigger an instant gateway refund API call.
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-xl bg-card border border-border space-y-2">
                                        <div className="font-bold text-sm text-foreground">Method 2: Email or WhatsApp Support Desk</div>
                                        <p className="text-muted-foreground">
                                            Send an email to <a href="mailto:mynatech.in@gmail.com" className="text-primary hover:underline font-medium">mynatech.in@gmail.com</a> or WhatsApp message to <a href="https://wa.me/919098132966" className="text-primary hover:underline font-medium">+91 90981 32966</a> with the following details:
                                        </p>
                                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                            <li>Order ID / Session Token (e.g., <code>PRN-89410</code> or <code>s/abc-123</code>)</li>
                                            <li>Transaction Amount in INR (₹)</li>
                                            <li>Cashfree Payment Reference / UPI UTR Number</li>
                                            <li>Brief description of the printer or system issue</li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            {/* Section 7 */}
                            <section className="space-y-4 pb-4">
                                <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                                    <span>7. Contact Information for Refund Inquiries</span>
                                </h2>
                                <Card className="p-6 bg-card border-border space-y-3">
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        For questions, chargeback inquiries, or status updates on your refund, please reach out to our dedicated support desk:
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                                        <div>
                                            <div className="font-semibold text-foreground">Corporate Support Desk</div>
                                            <div className="text-muted-foreground">MynaTech Innovations (Print Setu)</div>
                                            <div className="text-muted-foreground">Sector 62, Noida, Uttar Pradesh – 201309, India</div>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-foreground">Direct Support Channels</div>
                                            <div className="text-muted-foreground">Email: mynatech.in@gmail.com</div>
                                            <div className="text-muted-foreground">Phone / WhatsApp: +91 90981 32966</div>
                                            <div className="text-muted-foreground">Hours: Mon – Sat, 9:00 AM – 8:00 PM IST</div>
                                        </div>
                                    </div>
                                </Card>
                            </section>
                        </div>
                    </div>
                </main>

                <FrontFooter />
            </div>
        </>
    );
}
