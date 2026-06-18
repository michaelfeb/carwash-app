import { LucideIcon } from 'lucide-react';
import * as React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon?: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
    accentColor?: 'blue' | 'indigo' | 'sky' | 'violet' | 'cyan' | 'emerald' | 'purple' | 'amber';
}

const accentMap: Record<NonNullable<StatsCardProps['accentColor']>, { bubble: string; icon: string; border: string }> = {
    blue:    { bubble: 'bg-blue-100',   icon: 'text-blue-600',   border: 'border-t-blue-500' },
    indigo:  { bubble: 'bg-indigo-100', icon: 'text-indigo-600', border: 'border-t-indigo-500' },
    sky:     { bubble: 'bg-sky-100',    icon: 'text-sky-600',    border: 'border-t-sky-500' },
    violet:  { bubble: 'bg-violet-100', icon: 'text-violet-600', border: 'border-t-violet-500' },
    cyan:    { bubble: 'bg-cyan-100',   icon: 'text-cyan-600',   border: 'border-t-cyan-500' },
    emerald: { bubble: 'bg-emerald-100',icon: 'text-emerald-600',border: 'border-t-emerald-500' },
    purple:  { bubble: 'bg-purple-100', icon: 'text-purple-600', border: 'border-t-purple-500' },
    amber:   { bubble: 'bg-amber-100',  icon: 'text-amber-600',  border: 'border-t-amber-500' },
};

export function StatsCard({ title, value, description, icon: Icon, trend, className, accentColor = 'blue' }: StatsCardProps) {
    const accent = accentMap[accentColor];
    return (
        <Card className={cn(
            'border-t-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5',
            accent.border,
            className,
        )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                {Icon && (
                    <div className={cn('flex h-9 w-9 items-center justify-center rounded-full', accent.bubble)}>
                        <Icon className={cn('h-5 w-5', accent.icon)} />
                    </div>
                )}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-foreground">{value}</div>
                {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
                {trend && (
                    <p className={cn('mt-1 text-xs font-medium', trend.isPositive ? 'text-emerald-600' : 'text-red-500')}>
                        {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% dari periode lalu
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

// Format number to Indonesian Rupiah
export function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

// Format number with thousand separators
export function formatNumber(value: number): string {
    return new Intl.NumberFormat('id-ID').format(value);
}

// Format money input with thousand separators (dots) for input fields
export function formatMoneyInput(value: string | number): string {
    if (value === '' || value === null || value === undefined) return '';

    // Convert to string and remove all non-digit characters
    const numericValue = String(value).replace(/\D/g, '');

    if (numericValue === '') return '';

    // Format with thousand separators
    return new Intl.NumberFormat('id-ID').format(parseInt(numericValue));
}

// Parse formatted money input back to number
export function parseMoneyInput(value: string): number {
    if (!value) return 0;

    // Remove all dots (thousand separators) and parse to number
    const numericValue = value.replace(/\./g, '');
    return parseInt(numericValue) || 0;
}
