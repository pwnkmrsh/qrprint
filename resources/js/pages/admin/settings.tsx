import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { ShieldAlert, HelpCircle, Phone, Mail, Save } from 'lucide-react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'System Settings',
        href: '/admin/settings',
    },
];

interface SettingsProps {
    settings: {
        support_mobile: string;
        support_email: string;
    };
}

export default function SystemSettings({ settings }: SettingsProps) {
    const { data, setData, post, errors, processing } = useForm({
        support_mobile: settings.support_mobile,
        support_email: settings.support_email,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('admin.settings.update'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('System support contact settings saved successfully!');
            },
            onError: () => {
                toast.error('Failed to save settings. Please verify errors.');
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Global System Settings" />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                        Global System Settings
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage global platform-wide preferences, contact targets, and system settings.
                    </p>
                </div>

                <Card className="border border-border shadow-xs">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <HelpCircle className="w-5 h-5 text-[#A05AFF]" />
                            Merchant Support Settings
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Define the contact credentials used across all shop merchant dashboards for the support trigger module.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-4">
                                {/* Support Phone Number */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="support_mobile" className="text-sm font-semibold flex items-center gap-1.5">
                                        <Phone className="w-4 h-4 text-emerald-600" />
                                        Support WhatsApp Number
                                    </Label>
                                    <Input
                                        id="support_mobile"
                                        type="text"
                                        placeholder="e.g. 919999999999 (include country code, no + or spaces)"
                                        value={data.support_mobile}
                                        onChange={(e) => setData('support_mobile', e.target.value)}
                                        required
                                        className="rounded-xl border border-input focus-visible:ring-primary h-11"
                                    />
                                    <p className="text-[11px] text-muted-foreground">
                                        Enter the WhatsApp mobile number with country code. Customer messages will be redirected here.
                                    </p>
                                    <InputError message={errors.support_mobile} />
                                </div>

                                {/* Support Email */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="support_email" className="text-sm font-semibold flex items-center gap-1.5">
                                        <Mail className="w-4 h-4 text-blue-500" />
                                        Support Email Address
                                    </Label>
                                    <Input
                                        id="support_email"
                                        type="email"
                                        placeholder="support@printsetu.com"
                                        value={data.support_email}
                                        onChange={(e) => setData('support_email', e.target.value)}
                                        required
                                        className="rounded-xl border border-input focus-visible:ring-primary h-11"
                                    />
                                    <p className="text-[11px] text-muted-foreground">
                                        Enter the contact email address that merchants can write to for general inquiries.
                                    </p>
                                    <InputError message={errors.support_email} />
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full sm:w-auto font-bold bg-[#A05AFF] hover:bg-[#9E58FF] text-white rounded-xl px-6 h-11 flex items-center gap-2 cursor-pointer transition-all shadow-xs"
                                >
                                    <Save className="w-4 h-4" />
                                    {processing ? 'Saving Configurations...' : 'Save Support Target Settings'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Security info card */}
                <div className="flex gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-xs text-amber-800 dark:text-amber-300">
                    <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <div>
                        <p className="font-bold">Access Limited to Authorized Operators</p>
                        <p className="mt-0.5 leading-relaxed">
                            These settings impact core merchant troubleshooting channels. Changes take effect globally across all active store panels immediately.
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
