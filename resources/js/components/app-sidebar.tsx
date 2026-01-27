import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem, type User } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    Car,
    ClipboardList,
    CreditCard,
    FileText,
    LayoutGrid,
    Settings,
    UserCircle,
    Users,
    Wrench,
} from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const isOwner = auth.user.role === 'owner';

    // Navigation items for all users
    const mainNavItems: NavItem[] = [
        {
            title: 'Dasbor',
            href: '/dashboard',
            icon: LayoutGrid,
        },
        {
            title: 'Transaksi',
            href: '/transactions',
            icon: ClipboardList,
        },
        {
            title: 'Pelanggan',
            href: '/customers',
            icon: UserCircle,
        },
        {
            title: 'Laporan',
            href: '/reports',
            icon: FileText,
        },
    ];

    // Owner-only navigation items
    const ownerNavItems: NavItem[] = [
        {
            title: 'Pengguna',
            href: '/users',
            icon: Users,
        },
        {
            title: 'Staf',
            href: '/staffs',
            icon: Wrench,
        },
        {
            title: 'Jenis Cuci',
            href: '/carwash-types',
            icon: Car,
        },
        {
            title: 'Metode Pembayaran',
            href: '/payment-methods',
            icon: CreditCard,
        },
    ];

    const footerNavItems: NavItem[] = [
        {
            title: 'Pengaturan',
            href: '/settings/profile',
            icon: Settings,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} label="Menu" />
                {isOwner && <NavMain items={ownerNavItems} label="Manajemen" />}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
