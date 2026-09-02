import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ 
    items = [], 
    position, 
    label 
}: { 
    items: NavItem[]; 
    position: 'left' | 'right'; 
    label?: string; 
}) {
    const page = usePage();
    if (items.length === 0) return null;

    // Helper to extract pathname without query params or hash
    const isUrlActive = (href: string, currentUrl: string) => {
        const cleanHref = href.split('?')[0].split('#')[0];
        const cleanCurrent = currentUrl.split('?')[0].split('#')[0];
        return cleanHref === cleanCurrent;
    };

    return (
        <SidebarGroup className="px-2 py-1">
            {label && (
                <SidebarGroupLabel className={`flex w-full text-[10px] font-bold uppercase tracking-wider text-muted-foreground/75 ${position === 'right' ? 'justify-end' : 'justify-start'}`}>
                    {label}
                </SidebarGroupLabel>
            )}
            <SidebarMenu>
                {items.map((item) => {
                    const active = isUrlActive(item.href, page.url);
                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton 
                                asChild 
                                isActive={active} 
                                tooltip={{ children: item.title }}
                                className={`transition-all duration-200 ${
                                    active
                                        ? 'bg-gradient-to-r from-[#A05AFF] to-[#9E58FF] !text-white data-[active=true]:!text-white hover:bg-gradient-to-r hover:from-[#A05AFF]/90 hover:to-[#9E58FF]/90 hover:!text-white font-semibold shadow-xs'
                                        : 'hover:bg-muted/60 text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <Link
                                    href={item.href}
                                    prefetch
                                    className={`flex items-center gap-2 w-full ${position === 'right' ? 'justify-end text-right' : 'justify-start text-left'}`}
                                >
                                    {/* Icon order based on position */}
                                    {position === 'right' ? (
                                        <>
                                            <span>{item.title}</span>
                                            {item.icon && <item.icon className="h-5 w-5" />}
                                        </>
                                    ) : (
                                        <>
                                            {item.icon && <item.icon className="h-5 w-5" />}
                                            <span>{item.title}</span>
                                        </>
                                    )}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
