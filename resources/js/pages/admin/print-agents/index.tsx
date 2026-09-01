import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Cpu, 
    Printer, 
    Wifi, 
    WifiOff, 
    Clock, 
    Store,
    CheckCircle2
} from 'lucide-react';

interface AgentItem {
    agent_id: string;
    is_online: boolean;
    last_seen: string;
    last_seen_raw?: string;
    shop_title: string;
    owner_name: string;
    printers_count: number;
    printers: {
        id: number;
        name: string;
        model: string;
        status: string;
        is_default: boolean;
    }[];
}

interface PrintAgentsProps {
    agents: AgentItem[];
    stats: {
        total_agents: number;
        online_agents: number;
        offline_agents: number;
        total_printers: number;
    };
}

export default function AdminPrintAgentsIndex({ agents, stats }: PrintAgentsProps) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Super Admin', href: '/admin/settings' }, { title: 'Print Agents', href: '/admin/print-agents' }]}>
            <Head title="Hardware Print Agents - Super Admin" />

            <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-6">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-primary/10 text-primary rounded-xl">
                                <Cpu className="size-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-foreground">Hardware Print Agents</h1>
                                <p className="text-sm text-muted-foreground">
                                    Real-time heartbeat monitoring of local client machines pulling spooled print jobs.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="shadow-xs border">
                        <CardContent className="p-4">
                            <span className="text-xs text-muted-foreground font-medium">Registered Agents</span>
                            <div className="text-2xl font-extrabold mt-1">{stats.total_agents}</div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-xs border">
                        <CardContent className="p-4">
                            <span className="text-xs text-muted-foreground font-medium">Active (Heartbeat Alive)</span>
                            <div className="text-2xl font-extrabold mt-1 text-emerald-600">{stats.online_agents}</div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-xs border">
                        <CardContent className="p-4">
                            <span className="text-xs text-muted-foreground font-medium">Offline Agents</span>
                            <div className="text-2xl font-extrabold mt-1 text-rose-500">{stats.offline_agents}</div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-xs border">
                        <CardContent className="p-4">
                            <span className="text-xs text-muted-foreground font-medium">Attached Printers</span>
                            <div className="text-2xl font-extrabold mt-1 text-primary">{stats.total_printers}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Agent Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {agents.map((agent) => (
                        <Card key={agent.agent_id} className="shadow-xs border hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3 border-b">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1.5 rounded-lg ${agent.is_online ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-500'}`}>
                                            {agent.is_online ? <Wifi className="size-4" /> : <WifiOff className="size-4" />}
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm font-mono font-bold">{agent.agent_id}</CardTitle>
                                            <span className="text-[11px] text-muted-foreground">{agent.shop_title}</span>
                                        </div>
                                    </div>
                                    <Badge className={agent.is_online ? 'bg-emerald-600 text-white gap-1' : 'bg-rose-500 text-white gap-1'}>
                                        {agent.is_online ? 'ONLINE' : 'OFFLINE'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shop Owner:</span>
                                    <span className="font-semibold text-foreground">{agent.owner_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Last Heartbeat Seen:</span>
                                    <span className="font-medium">{agent.last_seen}</span>
                                </div>

                                <div className="space-y-1.5 pt-2 border-t">
                                    <span className="font-semibold text-muted-foreground block text-[11px]">
                                        Bound Printers ({agent.printers.length})
                                    </span>
                                    <div className="space-y-1">
                                        {agent.printers.map((p) => (
                                            <div key={p.id} className="p-2 rounded-lg bg-muted/40 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Printer className="size-3.5 text-primary" />
                                                    <span className="font-semibold">{p.name}</span>
                                                    {p.is_default && (
                                                        <Badge variant="outline" className="text-[9px] py-0 px-1">Default</Badge>
                                                    )}
                                                </div>
                                                <Badge variant="secondary" className="text-[10px] uppercase">
                                                    {p.status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
