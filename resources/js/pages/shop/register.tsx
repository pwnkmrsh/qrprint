import { Head, useForm, router } from '@inertiajs/react';
import { 
    Store, 
    User as UserIcon, 
    Phone, 
    MapPin, 
    Building2, 
    Sparkles, 
    CheckCircle2, 
    ArrowRight, 
    LoaderCircle,
    ShieldCheck,
    Printer
} from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ShopRegisterProps {
    user: {
        name: string;
        email: string;
    };
}

interface ShopForm {
    shop_name: string;
    owner_name: string;
    mobile: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
}

export default function ShopRegister({ user }: ShopRegisterProps) {
    const { data, setData, post, processing, errors } = useForm<ShopForm>({
        shop_name: '',
        owner_name: user?.name || '',
        mobile: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('shop.register.store'));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-slate-50 to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <Head title="Register Your Shop - QR Print Setu" />

            <div className="sm:mx-auto sm:w-full sm:max-w-2xl px-4">
                {/* Header Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-indigo-500/20 text-white mb-4">
                        <Printer className="h-7 w-7" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                        Setup Your Print Shop
                    </h1>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                        Complete your shop profile to start receiving automated customer print orders.
                    </p>
                </div>

                {/* Main Registration Card */}
                <Card className="border border-zinc-200/80 dark:border-zinc-800 shadow-xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md">
                    <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/80 pb-5">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-xl font-semibold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                                    <Store className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                    Shop Details
                                </CardTitle>
                                <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                                    Linked with Google account: <span className="font-medium text-zinc-800 dark:text-zinc-200">{user?.email}</span>
                                </CardDescription>
                            </div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Google Verified
                            </span>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-6">
                        <form onSubmit={submit} className="space-y-6">
                            {/* Row 1: Shop Name & Owner Name */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label htmlFor="shop_name" className="text-sm font-medium flex items-center gap-1.5">
                                        <Store className="h-4 w-4 text-zinc-400" />
                                        Shop Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="shop_name"
                                        type="text"
                                        required
                                        autoFocus
                                        value={data.shop_name}
                                        onChange={(e) => setData('shop_name', e.target.value)}
                                        placeholder="e.g. Metro Xerox & Print Hub"
                                        disabled={processing}
                                        className="h-10 bg-zinc-50/50 dark:bg-zinc-800/50"
                                    />
                                    <InputError message={errors.shop_name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="owner_name" className="text-sm font-medium flex items-center gap-1.5">
                                        <UserIcon className="h-4 w-4 text-zinc-400" />
                                        Owner Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="owner_name"
                                        type="text"
                                        required
                                        value={data.owner_name}
                                        onChange={(e) => setData('owner_name', e.target.value)}
                                        placeholder="Your full name"
                                        disabled={processing}
                                        className="h-10 bg-zinc-50/50 dark:bg-zinc-800/50"
                                    />
                                    <InputError message={errors.owner_name} />
                                </div>
                            </div>

                            {/* Row 2: Mobile Number */}
                            <div className="space-y-2">
                                <Label htmlFor="mobile" className="text-sm font-medium flex items-center gap-1.5">
                                    <Phone className="h-4 w-4 text-zinc-400" />
                                    Mobile Number <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="mobile"
                                    type="tel"
                                    required
                                    value={data.mobile}
                                    onChange={(e) => setData('mobile', e.target.value)}
                                    placeholder="e.g. 9876543210"
                                    disabled={processing}
                                    className="h-10 bg-zinc-50/50 dark:bg-zinc-800/50"
                                />
                                <InputError message={errors.mobile} />
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                    Used for order notifications and customer inquiries.
                                </p>
                            </div>

                            {/* Row 3: Full Address */}
                            <div className="space-y-2">
                                <Label htmlFor="address" className="text-sm font-medium flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4 text-zinc-400" />
                                    Shop Address <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="address"
                                    type="text"
                                    required
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="Shop No., Building, Street / Landmark"
                                    disabled={processing}
                                    className="h-10 bg-zinc-50/50 dark:bg-zinc-800/50"
                                />
                                <InputError message={errors.address} />
                            </div>

                            {/* Row 4: City, State, Pincode */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="city" className="text-sm font-medium flex items-center gap-1.5">
                                        <Building2 className="h-4 w-4 text-zinc-400" />
                                        City <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="city"
                                        type="text"
                                        required
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        placeholder="e.g. Mumbai"
                                        disabled={processing}
                                        className="h-10 bg-zinc-50/50 dark:bg-zinc-800/50"
                                    />
                                    <InputError message={errors.city} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="state" className="text-sm font-medium">
                                        State <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="state"
                                        type="text"
                                        required
                                        value={data.state}
                                        onChange={(e) => setData('state', e.target.value)}
                                        placeholder="e.g. Maharashtra"
                                        disabled={processing}
                                        className="h-10 bg-zinc-50/50 dark:bg-zinc-800/50"
                                    />
                                    <InputError message={errors.state} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="pincode" className="text-sm font-medium">
                                        Pincode <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="pincode"
                                        type="text"
                                        required
                                        maxLength={10}
                                        value={data.pincode}
                                        onChange={(e) => setData('pincode', e.target.value)}
                                        placeholder="e.g. 400001"
                                        disabled={processing}
                                        className="h-10 bg-zinc-50/50 dark:bg-zinc-800/50"
                                    />
                                    <InputError message={errors.pincode} />
                                </div>
                            </div>

                            {/* Features highlights badge bar */}
                            <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/60 p-4 border border-zinc-200/60 dark:border-zinc-800 space-y-2">
                                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                    <Sparkles className="h-4 w-4 text-indigo-500" />
                                    What happens next?
                                </div>
                                <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1 pl-5 list-disc">
                                    <li>Instant unique QR print stand poster generated for your counter.</li>
                                    <li>Connect your desktop printer agent for touchless cloud printing.</li>
                                    <li>Manage pricing, payment modes, and order history in real-time.</li>
                                </ul>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full h-11 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium shadow-md shadow-indigo-500/20 text-base flex items-center justify-center gap-2 rounded-lg"
                                >
                                    {processing ? (
                                        <>
                                            <LoaderCircle className="h-5 w-5 animate-spin" />
                                            Setting up your shop...
                                        </>
                                    ) : (
                                        <>
                                            Complete Registration & Go to Dashboard
                                            <ArrowRight className="h-5 w-5" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Footer security badge */}
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Your shop and printer details are securely encrypted and protected.</span>
                </div>
            </div>
        </div>
    );
}
