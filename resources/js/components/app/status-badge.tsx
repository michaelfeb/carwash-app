import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const statusBadgeVariants = cva(
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
    {
        variants: {
            variant: {
                default: 'bg-primary/10 text-primary',
                success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                secondary: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof statusBadgeVariants> {
    children: React.ReactNode;
}

export function StatusBadge({ className, variant, children, ...props }: StatusBadgeProps) {
    return (
        <span className={cn(statusBadgeVariants({ variant }), className)} {...props}>
            {children}
        </span>
    );
}

// Pre-defined status mappings for common use cases
export function WashStatusBadge({ status }: { status: 'waiting' | 'washing' | 'done' }) {
    const config = {
        waiting: { variant: 'secondary' as const, label: 'Menunggu' },
        washing: { variant: 'warning' as const, label: 'Dicuci' },
        done: { variant: 'success' as const, label: 'Selesai' },
    };

    const { variant, label } = config[status];
    return <StatusBadge variant={variant}>{label}</StatusBadge>;
}

export function PaymentStatusBadge({ status }: { status: 'unpaid' | 'paid' }) {
    const config = {
        unpaid: { variant: 'danger' as const, label: 'Belum Bayar' },
        paid: { variant: 'success' as const, label: 'Lunas' },
    };

    const { variant, label } = config[status];
    return <StatusBadge variant={variant}>{label}</StatusBadge>;
}

export function ActiveStatusBadge({ isActive }: { isActive: boolean }) {
    return (
        <StatusBadge variant={isActive ? 'success' : 'secondary'}>
            {isActive ? 'Aktif' : 'Nonaktif'}
        </StatusBadge>
    );
}

export function RoleBadge({ role }: { role: 'owner' | 'cashier' }) {
    const config = {
        owner: { variant: 'info' as const, label: 'Pemilik' },
        cashier: { variant: 'secondary' as const, label: 'Kasir' },
    };

    const { variant, label } = config[role];
    return <StatusBadge variant={variant}>{label}</StatusBadge>;
}
