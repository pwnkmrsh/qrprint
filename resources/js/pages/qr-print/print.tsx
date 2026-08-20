import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, useForm } from '@inertiajs/react';
import { FileUp, Printer } from 'lucide-react';
import { FormEvent } from 'react';

interface Props { qrPrint: { title: string; upload_url: string } }

export default function Print({ qrPrint }: Props) {
    const { data, setData, post, processing, errors } = useForm({ document: null as File | null });
    const submit = (event: FormEvent) => { event.preventDefault(); post(qrPrint.upload_url, { forceFormData: true }); };

    return (
        <><Head title={`${qrPrint.title} - Print`} /><main className="bg-muted/30 flex min-h-screen items-center justify-center p-4"><Card className="w-full max-w-lg"><CardHeader><div className="bg-primary/10 mb-2 flex size-11 items-center justify-center rounded-full"><Printer className="text-primary" /></div><CardTitle>{qrPrint.title}</CardTitle><CardDescription>Choose a PDF or image to send to the local printer.</CardDescription></CardHeader><CardContent><form onSubmit={submit} className="grid gap-5"><div className="grid gap-2"><Label htmlFor="document">Document</Label><Input id="document" type="file" accept=".pdf,.jpg,.jpeg,.png" required onChange={(event) => setData('document', event.target.files?.[0] ?? null)} />{errors.document && <Alert variant="destructive"><AlertDescription>{errors.document}</AlertDescription></Alert>}<p className="text-muted-foreground text-xs">PDF, JPG, or PNG up to 10 MB.</p></div><Button type="submit" disabled={processing || !data.document}><FileUp />{processing ? 'Uploading…' : 'Upload document'}</Button></form></CardContent></Card></main></>
    );
}
