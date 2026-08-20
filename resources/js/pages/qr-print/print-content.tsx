import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Head } from '@inertiajs/react';
import { Printer } from 'lucide-react';

interface Props { qrPrint: { title: string; uuid: string; content: string; printed_url: string } }

export default function PrintContent({ qrPrint }: Props) {
    const print = async () => {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
        await fetch(qrPrint.printed_url, { method: 'POST', headers: { Accept: 'application/json', 'X-CSRF-TOKEN': csrfToken } }).catch(() => undefined);
        window.print();
    };

    return (
        <><Head title={`${qrPrint.title} - Print`} /><main className="bg-muted/30 min-h-screen p-4 sm:p-8 print:bg-white print:p-0"><div className="no-print mx-auto mb-4 flex max-w-4xl justify-end"><Button onClick={print}><Printer />Print document</Button></div><Card className="mx-auto max-w-4xl print:border-0 print:shadow-none"><CardHeader className="border-b text-center"><CardTitle className="text-2xl">{qrPrint.title}</CardTitle><p className="text-muted-foreground text-sm">Document ID: {qrPrint.uuid}</p></CardHeader><CardContent className="whitespace-pre-wrap pt-6 text-base leading-7">{qrPrint.content}</CardContent></Card></main></>
    );
}
