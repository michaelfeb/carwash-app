import { Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
    title: string;
    description?: string;
    accentColor?: 'blue' | 'indigo' | 'violet' | 'purple' | 'amber' | 'emerald' | 'sky' | 'cyan' | 'rose';
    action?: {
        label: string;
        href: string;
        icon?: React.ReactNode;
    };
    children?: React.ReactNode;
}

const accentGradients: Record<NonNullable<PageHeaderProps['accentColor']>, string> = {
    blue: 'from-blue-600 via-blue-700 to-indigo-800',
    indigo: 'from-indigo-600 via-indigo-700 to-violet-800',
    violet: 'from-violet-600 via-violet-700 to-purple-800',
    purple: 'from-purple-600 via-purple-700 to-fuchsia-800',
    amber: 'from-amber-500 via-amber-600 to-orange-700',
    emerald: 'from-emerald-600 via-emerald-700 to-teal-800',
    sky: 'from-sky-500 via-sky-600 to-blue-700',
    cyan: 'from-cyan-500 via-cyan-600 to-teal-700',
    rose: 'from-rose-500 via-rose-600 to-pink-700',
};

const accentTextColors: Record<NonNullable<PageHeaderProps['accentColor']>, string> = {
    blue: 'text-blue-100',
    indigo: 'text-indigo-100',
    violet: 'text-violet-100',
    purple: 'text-purple-100',
    amber: 'text-amber-100',
    emerald: 'text-emerald-100',
    sky: 'text-sky-100',
    cyan: 'text-cyan-100',
    rose: 'text-rose-100',
};

export function PageHeader({ title, description, accentColor = 'blue', action, children }: PageHeaderProps) {
    return (
        <div className={cn('relative overflow-hidden rounded-2xl bg-gradient-to-br px-6 py-6 text-white shadow-lg md:px-8 md:py-8', accentGradients[accentColor])}>
            <div className={cn('absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5')} />
            <div className={cn('absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5')} />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                    {description && <p className={cn('mt-1 text-sm', accentTextColors[accentColor])}>{description}</p>}
                </div>
                <div className="flex items-center gap-2">
                    {children}
                    {action && (
                        <Button asChild className="rounded-xl bg-white/15 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/25 border-0 shadow-none">
                            <Link href={action.href}>
                                {action.icon || <Plus className="mr-2 h-4 w-4" />}
                                {action.label}
                            </Link>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
