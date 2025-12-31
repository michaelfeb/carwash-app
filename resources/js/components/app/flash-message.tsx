import { usePage } from '@inertiajs/react';
import { CheckCircle, XCircle } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

interface FlashMessages {
    success?: string;
    error?: string;
}

export function FlashMessage() {
    const { flash } = usePage<{ flash: FlashMessages }>().props;
    const [visible, setVisible] = React.useState(true);

    React.useEffect(() => {
        if (flash?.success || flash?.error) {
            setVisible(true);
            const timer = setTimeout(() => setVisible(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    if (!visible || (!flash?.success && !flash?.error)) {
        return null;
    }

    const isSuccess = !!flash?.success;
    const message = flash?.success || flash?.error;

    return (
        <div
            className={cn(
                'mb-4 flex items-center gap-3 rounded-lg border p-4 shadow-sm transition-all',
                isSuccess
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                    : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200',
            )}
        >
            {isSuccess ? <CheckCircle className="h-5 w-5 flex-shrink-0" /> : <XCircle className="h-5 w-5 flex-shrink-0" />}
            <p className="text-sm font-medium">{message}</p>
            <button
                onClick={() => setVisible(false)}
                className="ml-auto rounded-md p-1 hover:bg-black/5 dark:hover:bg-white/5"
            >
                <XCircle className="h-4 w-4" />
            </button>
        </div>
    );
}
