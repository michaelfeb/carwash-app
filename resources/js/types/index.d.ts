import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

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
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    role: 'owner' | 'cashier';
    is_active: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

// Carwash App Models
export interface CarwashType {
    id: number;
    name: string;
    size_category: string;
    min_price: number;
    max_price: number;
    description: string | null;
    is_active: boolean;
    transactions_count?: number;
    created_at: string;
    updated_at: string;
}

export interface Staff {
    id: number;
    name: string;
    phone: string | null;
    is_active: boolean;
    transactions_count?: number;
    total_earnings?: number;
    transaction_earnings?: number;
    created_at: string;
    updated_at: string;
}

export interface Customer {
    id: number;
    name: string;
    phone: string | null;
    address: string | null;
    notes: string | null;
    transactions_count?: number;
    total_spending?: number;
    created_at: string;
    updated_at: string;
}

export interface PaymentMethod {
    id: number;
    name: string;
    is_active: boolean;
    transactions_count?: number;
    created_at: string;
    updated_at: string;
}

export interface TransactionStaff {
    id: number;
    staff_id: number;
    staff?: Staff;
}

export interface Transaction {
    id: number;
    invoice_number: string;
    customer_id: number | null;
    carwash_type_id: number;
    user_id: number;
    payment_method_id: number | null;
    license_plate: string | null;
    price: number;
    owner_share: number;      // 60% of price
    staff_pool: number;       // 40% of price
    payment_status: 'unpaid' | 'paid';
    wash_status: 'waiting' | 'washing' | 'done';
    paid_at: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    customer?: Customer;
    carwash_type?: CarwashType;
    user?: User;
    payment_method?: PaymentMethod;
    staffs?: Staff[];
}

export interface WeeklyStaffEarning {
    id: number;
    staff_id: number;
    week_start: string;
    week_end: string;
    total_pool: number;
    staff_count: number;
    earning: number;
    transaction_count: number;
    is_paid: boolean;
    paid_at: string | null;
    created_at: string;
    updated_at: string;
    staff?: Staff;
}

// Pagination
export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

// Dashboard Stats
export interface DashboardStats {
    todayTransactions: number;
    todayRevenue: number;
    pendingPayments: number;
    carsInProgress: number;
    totalCustomers: number;
    activeStaff: number;
}

// Flash Messages
export interface FlashMessages {
    success?: string;
    error?: string;
}
