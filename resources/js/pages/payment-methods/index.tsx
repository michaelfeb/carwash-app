import { DataTable } from '@/components/app/data-table';
import { FlashMessage } from '@/components/app/flash-message';
import { PageHeader } from '@/components/app/page-header';
import { ActiveStatusBadge } from '@/components/app/status-badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { type PaymentMethod } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

interface PaymentMethodsIndexProps {
    paymentMethods: PaymentMethod[];
}

export default function PaymentMethodsIndex({ paymentMethods }: PaymentMethodsIndexProps) {
    const handleDelete = (method: PaymentMethod) => {
        if (confirm(`Apakah Anda yakin ingin menghapus "${method.name}"?`)) {
            router.delete(`/payment-methods/${method.id}`);
        }
    };

    const columns: ColumnDef<PaymentMethod>[] = [
        {
            accessorKey: 'name',
            header: 'Nama',
            cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
        },
        {
            accessorKey: 'transactions_count',
            header: 'Kali Digunakan',
            cell: ({ row }) => row.original.transactions_count || 0,
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            cell: ({ row }) => <ActiveStatusBadge isActive={row.original.is_active} />,
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`/payment-methods/${row.original.id}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Ubah
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(row.original)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={[{ title: 'Metode Pembayaran', href: '/payment-methods' }]}>
            <Head title="Metode Pembayaran" />

            <div className="space-y-6 p-4 md:p-6">
                <FlashMessage />

                <PageHeader
                    title="Metode Pembayaran"
                    description="Kelola metode pembayaran yang tersedia"
                    action={{ label: 'Tambah Metode', href: '/payment-methods/create' }}
                />

                <DataTable columns={columns} data={paymentMethods} searchKey="name" searchPlaceholder="Cari metode..." />
            </div>
        </AppLayout>
    );
}
