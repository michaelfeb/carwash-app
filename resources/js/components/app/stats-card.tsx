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
}

export function StatsCard({ title, value, description, icon: Icon, trend, className }: StatsCardProps) {
    return (
        <Card className={cn('transition-shadow hover:shadow-md', className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
                {trend && (
                    <p className={cn('mt-1 text-xs', trend.isPositive ? 'text-emerald-600' : 'text-red-600')}>
                        {trend.isPositive ? '+' : '-'}
                        {Math.abs(trend.value)}% from last period
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
