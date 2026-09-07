import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarGroup } from '@/components/ui/sidebar';
import { useLayout } from '@/contexts/LayoutContext';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { 
    LayoutGrid, 
    Lock, 
    QrCode, 
    Shield, 
    Users, 
    Printer, 
    Store, 
    History, 
    FileText, 
    Menu, 
    Settings, 
    CreditCard, 
    ShoppingBag, 
    Cpu,
    LifeBuoy,
    Copy,
    DollarSign,
    Sliders
} from 'lucide-react';
import AppLogo from './app-logo';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

/* -------------------------------------------------------------
 * Shop Owner Menu Groups (Focused & Clean)
 * ------------------------------------------------------------- */
const shopOperationsGroup: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Job History & Spool',
        href: '/shop/jobs',
        icon: History,
    },
    {
        title: 'Counter QR Poster',
        href: '/dashboard/qr/print',
        icon: QrCode,
    },
];

const shopSettingsGroup: NavItem[] = [
    {
        title: 'Shop Profile & Pricing',
        href: '/shop/settings',
        icon: Store,
    },
    {
        title: 'Payment Gateway & UPI',
        href: '/shop/settings?tab=payment',
        icon: CreditCard,
    },
    {
        title: 'Printer Hardware',
        href: '/shop/printers',
        icon: Printer,
    },
];

/* -------------------------------------------------------------
 * Super Admin Menu Groups (Full Platform Access)
 * ------------------------------------------------------------- */
const superAdminPlatformGroup: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Shops Management',
        href: '/admin/shops',
        icon: Store,
    },
    {
        title: 'Customer Orders',
        href: '/admin/orders',
        icon: ShoppingBag,
    },
    {
        title: 'Payments Hub',
        href: '/admin/payments',
        icon: CreditCard,
    },
    {
        title: 'Customer Directory',
        href: '/admin/customers',
        icon: Users,
    },
    {
        title: 'Hardware Print Jobs',
        href: '/admin/print-jobs',
        icon: Printer,
    },
    {
        title: 'Print Bridge Agents',
        href: '/admin/print-agents',
        icon: Cpu,
    },
    {
        title: 'Global System Settings',
        href: '/admin/settings',
        icon: Settings,
    },
];

const superAdminAdministrationGroup: NavItem[] = [
    {
        title: 'Users',
        href: '/users',
        icon: Users,
        permission: 'access-users-module',
    },
    {
        title: 'Roles',
        href: '/roles',
        icon: Shield,
        permission: 'access-roles-module',
    },
    {
        title: 'Permissions',
        href: '/permissions',
        icon: Lock,
        permission: 'access-permissions-module',
    },
    {
        title: 'Pages (CMS)',
        href: '/pages',
        icon: FileText,
        permission: 'access-pages-module',
    },
    {
        title: 'Menu Manager',
        href: '/menus',
        icon: Menu,
        permission: 'access-menus-module',
    },
];

export function AppSidebar() {
    const { auth, system_settings } = usePage().props as any;
    const permissions: string[] = auth?.permissions || [];
    const roles: string[] = auth?.roles || [];
    const shopToken = auth?.shop?.print_token || 'DEMO_A5D76E37';
    const supportMobile = system_settings?.support_mobile || '9098132966';
    const supportEmail = system_settings?.support_email || 'mynatech.in@gmail.com';

    const isSuperAdmin = roles.some((r: string) => ['super-admin', 'SUPER ADMIN'].includes(r)) || permissions.includes('access-users-module');

    const { position } = useLayout();

    const [isSupportOpen, setIsSupportOpen] = useState(false);
    const [supportProblem, setSupportProblem] = useState('');

    const filteredAdmin = superAdminAdministrationGroup.filter((item) => !item.permission || permissions.includes(item.permission));

    return (
        <>
            <Sidebar side={position} collapsible="icon" variant="inset">
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link href="/dashboard" prefetch>
                                    <AppLogo position={position} />
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarContent className="gap-4">
                    {isSuperAdmin ? (
                        <>
                            {/* Super Admin Sections */}
                            <NavMain label="Platform Management" items={superAdminPlatformGroup} position={position} />
                            <NavMain label="Administration" items={filteredAdmin} position={position} />
                        </>
                    ) : (
                        <>
                            {/* Shop Owner Primary Sections */}
                            <NavMain label="Shop Operations" items={shopOperationsGroup} position={position} />
                            <NavMain label="Shop Settings" items={shopSettingsGroup} position={position} />
                        </>
                    )}

                    {/* Need Support Sidebar Menu Item */}
                    <SidebarGroup className="px-2 mt-auto">
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton 
                                    type="button"
                                    onClick={() => setIsSupportOpen(true)}
                                    className="w-full text-muted-foreground hover:text-[#A05AFF] hover:bg-[#A05AFF]/5 transition-all cursor-pointer flex items-center gap-2"
                                >
                                    <LifeBuoy className="h-5 w-5 text-[#A05AFF]" />
                                    <span>Need Support?</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroup>
                </SidebarContent>

                <SidebarFooter>
                    <NavUser position={position} />
                </SidebarFooter>
            </Sidebar>

            <Dialog open={isSupportOpen} onOpenChange={setIsSupportOpen}>
                <DialogContent className="sm:max-w-[420px] rounded-2xl p-6 bg-card border border-border shadow-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-foreground text-base font-extrabold">
                            <LifeBuoy className="h-5 w-5 text-[#A05AFF]" />
                            Need Support?
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Get instant help from our technical support team via WhatsApp or email at <span className="text-[#A05AFF] font-semibold">{supportEmail}</span>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-3">
                        {/* Shop ID Display */}
                        <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Your Shop ID (automatic)</span>
                            <div className="flex items-center justify-between bg-muted/60 border rounded-xl px-3 py-2 border-border/80">
                                <code className="font-mono font-bold text-[#A05AFF] select-all text-sm">{shopToken}</code>
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => {
                                        navigator.clipboard.writeText(shopToken);
                                        toast.success('Shop ID copied to clipboard!');
                                    }}
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Problem Input Description */}
                        <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">✍️ Write your problem</span>
                            <textarea
                                value={supportProblem}
                                onChange={(e) => setSupportProblem(e.target.value)}
                                placeholder="e.g. Print not coming out / Printer list not showing / Payment issue..."
                                rows={3}
                                className="w-full text-sm rounded-xl border border-input bg-background px-3 py-2 shadow-xs focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-2 flex flex-col gap-2">
                        <Button 
                            type="button"
                            onClick={() => {
                                if (!supportProblem.trim()) {
                                    toast.error('Please describe your problem first.');
                                    return;
                                }
                                const message = `Hi Support, I need help.\n\nShop ID: ${shopToken}\nProblem: ${supportProblem.trim()}`;
                                const whatsappUrl = `https://api.whatsapp.com/send?phone=${supportMobile}&text=${encodeURIComponent(message)}`;
                                window.open(whatsappUrl, '_blank');
                                setIsSupportOpen(false);
                                setSupportProblem('');
                            }}
                            className="w-full font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-2 h-11 cursor-pointer transition-all shadow-sm"
                        >
                            <svg className="h-5 w-5 fill-current text-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.69 1.977 14.22 .953 11.59 1.95c-5.44 0-9.865 4.371-9.869 9.802-.001 1.722.463 3.4 1.34 4.907l-.974 3.564 3.654-.959zm12.39-4.933c-.33-.165-1.951-.963-2.251-1.072-.3-.11-.518-.165-.736.165-.218.33-.843 1.072-1.033 1.29-.19.218-.379.247-.708.082-1.659-.83-2.83-1.448-3.962-3.393-.301-.518.301-.482.862-1.603.092-.185.046-.347-.023-.512-.069-.165-.736-1.775-1.009-2.434-.265-.643-.533-.553-.736-.563-.19-.01-.409-.012-.628-.012-.218 0-.573.082-.873.411-.3.33-1.145 1.12-1.145 2.73s1.173 3.161 1.336 3.379c.165.218 2.308 3.525 5.59 4.949.78.339 1.39.541 1.866.699.784.248 1.498.213 2.062.128.629-.094 1.952-.797 2.227-1.568.275-.77.275-1.43.193-1.568-.083-.138-.303-.221-.633-.386z"/>
                            </svg>
                            <span>Send on WhatsApp</span>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
