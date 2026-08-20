import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Head } from '@inertiajs/react';
import { Download, FileText, Printer } from 'lucide-react';
import { useState } from 'react';

interface Props { qrPrint: { title: string }; document: { original_name: string; mime_type: string; file_url: string }; create_job_url: string }

export default function Document({ qrPrint, document, create_job_url: createJobUrl }: Props) {
    const [status, setStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const isPdf = document.mime_type.toLowerCase() === 'application/pdf';
    const isImage = ['image/jpeg', 'image/jpg', 'image/png'].includes(document.mime_type.toLowerCase());

    const createJob = async () => {
        setSubmitting(true); setError(null);
        try {
            const response = await fetch(createJobUrl, { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: '{}' });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || `Request failed (${response.status})`);
            setStatus(`Print job #${data.job_id} has been queued.`);
        } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to create the print job.'); }
        finally { setSubmitting(false); }
    };

    return (
        <><Head title={`${document.original_name} - ${qrPrint.title}`} /><main className="bg-muted/30 min-h-screen p-4 sm:p-8"><div className="mx-auto max-w-5xl"><Card><CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between"><div><CardTitle>{document.original_name}</CardTitle><CardDescription>{qrPrint.title}</CardDescription></div><div className="flex gap-2"><Button variant="outline" asChild><a href={document.file_url} target="_blank" rel="noreferrer"><Download />Download</a></Button><Button onClick={createJob} disabled={submitting || status !== null}><Printer />{submitting ? 'Queueing…' : status ? 'Job queued' : 'Print now'}</Button></div></CardHeader><CardContent className="grid gap-4">{status && <Alert><AlertDescription>{status} The local print agent will process it shortly.</AlertDescription></Alert>}{error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}<div className="bg-background min-h-100 overflow-hidden rounded-lg border">{isPdf ? <iframe src={document.file_url} title={document.original_name} className="h-[70vh] w-full" /> : isImage ? <img src={document.file_url} alt={document.original_name} className="mx-auto max-h-[70vh] max-w-full object-contain" /> : <div className="flex min-h-72 flex-col items-center justify-center gap-3"><FileText className="text-muted-foreground size-10" /><p className="text-muted-foreground">Preview is unavailable for this file type.</p></div>}</div></CardContent></Card></div></main></>
    );
}
