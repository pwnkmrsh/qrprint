import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    permission?: string;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface CMSPage {
    id: number;
    title: string;
    slug: string;
    subtitle?: string | null;
    content?: string | null;
    template: 'default' | 'landing_section' | 'full_width' | 'legal';
    status: 'published' | 'draft' | 'archived';
    published_at?: string | null;
    author_id?: number | null;
    author?: User | null;
    meta_title?: string | null;
    meta_description?: string | null;
    meta_keywords?: string | null;
    canonical_url?: string | null;
    og_image?: string | null;
    og_title?: string | null;
    og_description?: string | null;
    is_indexable: boolean;
    is_system: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface DynamicMenuItem {
    id: number;
    menu_id?: number;
    title: string;
    url_type: 'anchor' | 'page' | 'route' | 'custom';
    page_id?: number | null;
    page?: { id: number; title: string; slug: string; url?: string } | null;
    url: string;
    icon?: string | null;
    badge?: string | null;
    target: '_self' | '_blank';
    order: number;
    is_active?: boolean;
}

export interface DynamicMenu {
    id: number;
    name: string;
    location: string;
    description?: string | null;
    is_active: boolean;
    items?: DynamicMenuItem[];
}

