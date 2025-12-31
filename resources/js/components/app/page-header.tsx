import { Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';

interface PageHeaderProps {
    title: string;
    description?: string;
    action?: {
        label: string;
        href: string;
        icon?: React.ReactNode;
    };
    children?: React.ReactNode;
}

export function PageHeader({ title, description, action, children }: PageHeaderProps) {
    return (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                {description && <p className="mt-1 text-muted-foreground">{description}</p>}
            </div>
            <div className="flex items-center gap-2">
                {children}
                {action && (
                    <Button asChild>
                        <Link href={action.href}>
                            {action.icon || <Plus className="mr-2 h-4 w-4" />}
                            {action.label}
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    );
}
