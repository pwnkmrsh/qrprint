import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { CheckCircle2, Copy, ExternalLink, QrCode } from 'lucide-react';
import { FormEvent, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'QR Print', href: '/qr-print' }];

interface QrPrint {
    id: number;
    title: string;
    print_count: number;
    is_active: boolean;
    created_at: string | null;
    qr_url: string;
    print_url: string;
}

interface Props {
    prints: QrPrint[];
}

export default function QrPrintIndex({ prints }: Props) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
    const { data, setData, post, processing, errors, reset } = useForm({ title: '', content: '' });
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        post(route('qr-print.store'), { onSuccess: () => reset() });
    };

    const copyUrl = async (print: QrPrint) => {
        await navigator.clipboard.writeText(print.print_url);
        setCopiedId(print.id);
        window.setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="QR Print" />
            <div className="flex flex-1 flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold">QR Print</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Create a QR code that opens a mobile upload and print page.</p>
                </div>

                {flash?.success && <Alert><CheckCircle2 /><AlertDescription>{flash.success}</AlertDescription></Alert>}
                {flash?.error && <Alert variant="destructive"><AlertDescription>{flash.error}</AlertDescription></Alert>}

                <Card>
                    <CardHeader>
                        <CardTitle>Create QR code</CardTitle>
                        <CardDescription>Enter a title and optional text for this print destination.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Document title</Label>
                                <Input id="title" value={data.title} onChange={(event) => setData('title', event.target.value)} placeholder="Example: Reception printer" required />
                                {errors.title && <p className="text-destructive text-sm">{errors.title}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="content">Content (optional)</Label>
                                <textarea id="content" value={data.content} onChange={(event) => setData('content', event.target.value)} placeholder="Optional printable text" className="border-input min-h-24 rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2" />
                                {errors.content && <p className="text-destructive text-sm">{errors.content}</p>}
                            </div>
                            <div><Button type="submit" disabled={processing}><QrCode />{processing ? 'Generating…' : 'Generate QR'}</Button></div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Generated QR codes</CardTitle>
                        <CardDescription>{prints.length} print destination{prints.length === 1 ? '' : 's'} created.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {prints.length === 0 ? (
                            <p className="text-muted-foreground py-8 text-center text-sm">No QR codes created yet.</p>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {prints.map((print) => (
                                    <div key={print.id} className="rounded-lg border p-4">
                                        <div className="mb-3 flex items-start justify-between gap-3"><div><h2 className="font-medium">{print.title}</h2><p className="text-muted-foreground text-xs">{print.print_count} print request{print.print_count === 1 ? '' : 's'}</p></div><span className={print.is_active ? 'rounded-full bg-green-100 px-2 py-1 text-xs text-green-700' : 'rounded-full bg-muted px-2 py-1 text-xs'}>{print.is_active ? 'Active' : 'Inactive'}</span></div>
                                        <img src={print.qr_url} alt={`QR code for ${print.title}`} className="mx-auto size-48" />
                                        <p className="text-muted-foreground mt-3 break-all text-xs">{print.print_url}</p>
                                        <div className="mt-3 flex gap-2"><Button variant="outline" size="sm" onClick={() => copyUrl(print)}><Copy />{copiedId === print.id ? 'Copied' : 'Copy link'}</Button><Button variant="outline" size="sm" asChild><a href={print.print_url} target="_blank" rel="noreferrer"><ExternalLink />Open</a></Button></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
