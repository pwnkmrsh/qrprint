import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { FileUp, LockKeyhole, Printer, ShieldCheck } from 'lucide-react';

export default function Shop({ shop }: { shop: { name: string; upload_url: string } }) {
    return <><Head title={`Print Online | ${shop.name}`} /><main className="bg-muted/30 flex min-h-screen items-center justify-center p-4"><Card className="w-full max-w-md"><CardContent className="space-y-7 p-6 text-center"><div className="bg-primary/10 text-primary mx-auto flex size-14 items-center justify-center rounded-2xl"><Printer className="size-7" /></div><div><h1 className="text-2xl font-semibold">{shop.name}</h1><p className="text-muted-foreground mt-2">Print directly from your phone</p></div><Button className="w-full" size="lg" asChild><Link href={shop.upload_url}><FileUp />Upload document</Link></Button><div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground"><span>PDF / JPG / PNG</span><span className="flex items-center justify-center gap-1"><ShieldCheck className="size-3" />Fast & secure</span><span className="flex items-center justify-center gap-1"><LockKeyhole className="size-3" />No WhatsApp</span></div></CardContent></Card></main></>;
}
