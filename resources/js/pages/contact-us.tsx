import { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import FrontHeader from '@/components/front-header';
import FrontFooter from '@/components/front-footer';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Mail,
    Phone,
    MapPin,
    Clock,
    MessageSquare,
    ShieldCheck,
    CheckCircle2,
    ArrowLeft,
    Send,
    Building2,
    UserCheck,
    HelpCircle,
    ExternalLink,
    Headphones,
    FileText
} from 'lucide-react';

export default function ContactUs() {
    const { auth } = usePage<SharedData>().props;

    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        category: 'general',
        message: '',
    });

    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <>
            <Head title="Contact Us — Print Setu | Official Support & Grievance Desk">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary selection:text-primary-foreground">
                <FrontHeader auth={auth} />

                <main className="grow pt-28 pb-20 md:pt-36">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
                                    <Link href="/terms-and-conditions">Terms & Conditions</Link>
                                </Button>
                                <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                                    <Link href="/refund-policy">Refund Policy</Link>
                                </Button>
                                <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                                    <Link href="/privacy-policy">Privacy Policy</Link>
                                </Button>
                            </div>
                        </div>

                        {/* Page Header */}
                        <div className="space-y-4 pb-10 border-b border-border text-center sm:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
                                <Headphones className="h-3.5 w-3.5" />
                                <span>Official Support & Corporate Desk</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
                                Contact Us
                            </h1>
                            <p className="text-base text-muted-foreground max-w-2xl">
                                We are here to assist you with customer print orders, shop onboarding, Cashfree payment gateway inquiries, technical support, and merchant partner queries.
                            </p>
                        </div>

                        {/* Contact Information Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-10">
                            {/* Card 1: Operating Address */}
                            <Card className="p-6 bg-card border-border flex flex-col justify-between space-y-3">
                                <div className="space-y-3">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-bold text-sm text-foreground">Registered Address</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        <strong>MynaTech Innovations (Print Setu)</strong><br />
                                        Sector 62, Noida,<br />
                                        Uttar Pradesh – 201309,<br />
                                        India
                                    </p>
                                </div>
                                <div className="pt-2 text-[11px] text-primary font-semibold flex items-center gap-1">
                                    <Building2 className="h-3.5 w-3.5" />
                                    <span>Headquarters (India)</span>
                                </div>
                            </Card>

                            {/* Card 2: Email Desk */}
                            <Card className="p-6 bg-card border-border flex flex-col justify-between space-y-3">
                                <div className="space-y-3">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-bold text-sm text-foreground">Email Support</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        General & Support:<br />
                                        <a href="mailto:mynatech.in@gmail.com" className="text-primary font-medium hover:underline">
                                            mynatech.in@gmail.com
                                        </a><br />
                                        Merchant / Billing:<br />
                                        <a href="mailto:support@printsetu.in" className="text-primary font-medium hover:underline">
                                            support@printsetu.in
                                        </a>
                                    </p>
                                </div>
                                <div className="pt-2 text-[11px] text-muted-foreground">
                                    Avg response time: &lt; 2 hours
                                </div>
                            </Card>

                            {/* Card 3: Phone & WhatsApp */}
                            <Card className="p-6 bg-card border-border flex flex-col justify-between space-y-3">
                                <div className="space-y-3">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                                        <Phone className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-bold text-sm text-foreground">Phone & WhatsApp</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Direct Hotline:<br />
                                        <a href="tel:+919098132966" className="text-primary font-medium hover:underline">
                                            +91 90981 32966
                                        </a><br />
                                        WhatsApp Desk:<br />
                                        <a href="https://wa.me/919098132966" target="_blank" rel="noreferrer" className="text-primary font-medium hover:underline">
                                            +91 90981 32966 (Chat)
                                        </a>
                                    </p>
                                </div>
                                <div className="pt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span>Live WhatsApp Available</span>
                                </div>
                            </Card>

                            {/* Card 4: Operating Hours */}
                            <Card className="p-6 bg-card border-border flex flex-col justify-between space-y-3">
                                <div className="space-y-3">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-bold text-sm text-foreground">Working Hours</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        <strong>Monday – Saturday:</strong><br />
                                        9:00 AM – 8:00 PM IST<br />
                                        <strong>Sunday:</strong><br />
                                        Emergency server/payment monitoring only
                                    </p>
                                </div>
                                <div className="pt-2 text-[11px] text-muted-foreground">
                                    Timezone: Indian Standard Time (IST)
                                </div>
                            </Card>
                        </div>

                        {/* Interactive Form & Grievance Details Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                            {/* Left: Contact Form */}
                            <div className="lg:col-span-7">
                                <Card className="p-8 border-border bg-card shadow-xl">
                                    <h3 className="text-xl font-bold mb-1">Send Us a Direct Message</h3>
                                    <p className="text-xs text-muted-foreground mb-6">
                                        Fill in your details below and our customer support team will respond promptly.
                                    </p>

                                    {submitted ? (
                                        <div className="p-8 rounded-xl bg-primary/10 border border-primary/20 text-center space-y-3 animate-in fade-in">
                                            <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
                                            <h4 className="font-bold text-lg text-primary">
                                                Message Dispatched Successfully!
                                            </h4>
                                            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                                                Thank you for reaching out. Your ticket has been logged and an executive will contact you at <strong>{form.email || form.phone}</strong> shortly.
                                            </p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setSubmitted(false)}
                                                className="mt-2 text-xs"
                                            >
                                                Submit Another Query
                                            </Button>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-semibold mb-1.5">
                                                        Your Full Name <span className="text-destructive">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={form.name}
                                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                                        placeholder="e.g. Ramesh Kumar"
                                                        className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-background border border-input focus:outline-hidden focus:ring-2 focus:ring-primary"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold mb-1.5">
                                                        Mobile / WhatsApp Number <span className="text-destructive">*</span>
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        required
                                                        value={form.phone}
                                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                                        placeholder="+91 98765 43210"
                                                        className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-background border border-input focus:outline-hidden focus:ring-2 focus:ring-primary"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-semibold mb-1.5">
                                                        Email Address <span className="text-destructive">*</span>
                                                    </label>
                                                    <input
                                                        type="email"
                                                        required
                                                        value={form.email}
                                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                                        placeholder="name@example.com"
                                                        className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-background border border-input focus:outline-hidden focus:ring-2 focus:ring-primary"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold mb-1.5">
                                                        Inquiry Category
                                                    </label>
                                                    <select
                                                        value={form.category}
                                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                                        className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-background border border-input focus:outline-hidden focus:ring-2 focus:ring-primary"
                                                    >
                                                        <option value="general">General Information</option>
                                                        <option value="payment">Payment & Cashfree Gateway Query</option>
                                                        <option value="refund">Refund / Print Job Issue</option>
                                                        <option value="shop-onboarding">Print Shop Registration & Windows Agent</option>
                                                        <option value="partner">Reseller / Partner Program</option>
                                                        <option value="grievance">Grievance & Legal</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold mb-1.5">
                                                    Subject / Order or Session ID
                                                </label>
                                                <input
                                                    type="text"
                                                    value={form.subject}
                                                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                                    placeholder="e.g. Question regarding Session #PRN-89410"
                                                    className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-background border border-input focus:outline-hidden focus:ring-2 focus:ring-primary"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold mb-1.5">
                                                    Detailed Message <span className="text-destructive">*</span>
                                                </label>
                                                <textarea
                                                    rows={4}
                                                    required
                                                    value={form.message}
                                                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                                                    placeholder="Describe your question, request, or issue with transaction reference if applicable..."
                                                    className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-background border border-input focus:outline-hidden focus:ring-2 focus:ring-primary resize-none"
                                                />
                                            </div>

                                            <Button type="submit" className="w-full font-semibold h-11 shadow-md bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                                                <Send className="h-4 w-4" />
                                                <span>Send Support Message</span>
                                            </Button>
                                        </form>
                                    )}
                                </Card>
                            </div>

                            {/* Right: Grievance Officer & Payment Gateway Details */}
                            <div className="lg:col-span-5 space-y-6">
                                {/* Grievance Redressal Card */}
                                <Card className="p-6 bg-card border-border space-y-4">
                                    <div className="flex items-center gap-2 text-primary font-bold text-sm">
                                        <UserCheck className="h-5 w-5" />
                                        <span>Grievance Redressal Officer</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        In accordance with the Information Technology Act 2000 and rules made thereunder, as well as RBI payment guidelines, the contact details of the Grievance Officer are provided below:
                                    </p>
                                    <div className="p-3.5 rounded-xl bg-muted/60 space-y-1.5 text-xs">
                                        <div className="font-semibold text-foreground">Officer Name: Grievance Desk Manager</div>
                                        <div className="text-muted-foreground"><strong>Designation:</strong> Compliance & Operations Lead</div>
                                        <div className="text-muted-foreground"><strong>Entity:</strong> MynaTech Innovations (Print Setu)</div>
                                        <div className="text-muted-foreground"><strong>Address:</strong> Sector 62, Noida, UP 201309, India</div>
                                        <div className="text-muted-foreground">
                                            <strong>Email:</strong>{' '}
                                            <a href="mailto:mynatech.in@gmail.com" className="text-primary hover:underline">
                                                mynatech.in@gmail.com
                                            </a>
                                        </div>
                                        <div className="text-muted-foreground"><strong>Redressal Turnaround:</strong> Within 48 business hours</div>
                                    </div>
                                </Card>

                                {/* Payment Gateway Partner Notice */}
                                <Card className="p-6 bg-card border-border space-y-3">
                                    <div className="flex items-center gap-2 text-primary font-bold text-sm">
                                        <ShieldCheck className="h-5 w-5" />
                                        <span>Payment Gateway Partner</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Online payments on Print Setu are securely facilitated by <strong>Cashfree Payments India Pvt. Ltd.</strong> in Indian Rupees (INR / ₹). All UPI, Net Banking, and Card transactions comply with RBI mandates and 256-bit PCI-DSS standards.
                                    </p>
                                    <div className="pt-2 flex flex-wrap gap-2 text-xs">
                                        <Button asChild variant="outline" size="sm" className="text-xs border-border bg-card hover:bg-muted">
                                            <Link href="/refund-policy" className="gap-1.5">
                                                <FileText className="h-3.5 w-3.5 text-primary" />
                                                <span>Refunds & Cancellations Policy</span>
                                            </Link>
                                        </Button>
                                    </div>
                                </Card>

                                {/* Quick WhatsApp Direct Connect */}
                                <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-card border border-emerald-500/25 flex items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-sm text-foreground">Need Urgent Assistance?</h4>
                                        <p className="text-xs text-muted-foreground">Message our WhatsApp support directly for immediate guidance.</p>
                                    </div>
                                    <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 gap-1.5 shadow-sm">
                                        <a href="https://wa.me/919098132966?text=Hello%20PrintSetu%20Support" target="_blank" rel="noreferrer">
                                            <MessageSquare className="h-3.5 w-3.5" />
                                            <span>WhatsApp</span>
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <FrontFooter />
            </div>
        </>
    );
}
