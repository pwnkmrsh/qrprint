import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
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
    Cpu 
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Global Settings',
        href: '/admin/settings',
        icon: Settings,
    },
    {
        title: 'Payments Hub',
        href: '/admin/payments',
        icon: CreditCard,
    },
    {
        title: 'Orders',
        href: '/admin/orders',
        icon: ShoppingBag,
    },
    {
        title: 'Shops',
        href: '/admin/shops',
        icon: Store,
    },
    {
        title: 'Customers',
        href: '/admin/customers',
        icon: Users,
    },
    {
        title: 'Print Jobs',
        href: '/admin/print-jobs',
        icon: Printer,
    },
    {
        title: 'Print Agents',
        href: '/admin/print-agents',
        icon: Cpu,
    },
    {
        title: 'Job History',
        href: '/shop/jobs',
        icon: History,
    },
    {
        title: 'Shop Settings',
        href: '/shop/settings',
        icon: Store,
    },
    {
        title: 'Printer Settings',
        href: '/shop/printers',
        icon: Printer,
    },
    {
        title: 'QR Print',
        href: '/qr-print',
        icon: QrCode,
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
    {
        title: 'Permissions',
        href: '/permissions',
        icon: Lock,
        permission: 'access-permissions-module',
    },
    {
        title: 'Roles',
        href: '/roles',
        icon: Shield,
        permission: 'access-roles-module',
    },
    {
        title: 'Users',
        href: '/users',
        icon: Users,
        permission: 'access-users-module',
    },
];



export function AppSidebar() {
    const { auth } = usePage().props as any;
    const roles = auth.roles;
    const permissions = auth.permissions;

    const { position } = useLayout();

    const filteredNavItems = mainNavItems.filter((item) => !item.permission || permissions.includes(item.permission));

    return (
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

            <SidebarContent>
                <NavMain items={filteredNavItems} position={position} />
            </SidebarContent>

            <SidebarFooter>
                {/* <NavFooter items={footerNavItems} className="mt-auto" position={position} /> */}
                <NavUser position={position} />
            </SidebarFooter>
        </Sidebar>
    );
}
