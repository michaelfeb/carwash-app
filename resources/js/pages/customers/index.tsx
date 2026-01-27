import { DataTable } from '@/components/app/data-table';
import { FlashMessage } from '@/components/app/flash-message';
import { PageHeader } from '@/components/app/page-header';
import { formatRupiah } from '@/components/app/stats-card';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { type Customer } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

interface CustomersIndexProps {
    customers: Customer[];
}

export default function CustomersIndex({ customers }: CustomersIndexProps) {
    const handleDelete = (customer: Customer) => {
        if (confirm(`Apakah Anda yakin ingin menghapus "${customer.name}"?`)) {
            router.delete(`/customers/${customer.id}`);
        }
    };

    const columns: ColumnDef<Customer>[] = [
        {
            accessorKey: 'name',
            header: 'Nama',
            cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
        },
        {
            accessorKey: 'phone',
            header: 'Telepon',
            cell: ({ row }) => row.original.phone || '-',
        },
        {
            accessorKey: 'address',
            header: 'Alamat',
            cell: ({ row }) => (
                <span className="max-w-[200px] truncate block">{row.original.address || '-'}</span>
            ),
        },
        {
            accessorKey: 'transactions_count',
            header: 'Kunjungan',
            cell: ({ row }) => row.original.transactions_count || 0,
        },
        {
            accessorKey: 'total_spending',
            header: 'Total Pengeluaran',
            cell: ({ row }) => formatRupiah(row.original.total_spending || 0),
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
                            <Link href={`/customers/${row.original.id}/edit`}>
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
        <AppLayout breadcrumbs={[{ title: 'Pelanggan', href: '/customers' }]}>
            <Head title="Pelanggan" />

            <div className="space-y-6 p-4 md:p-6">
                <FlashMessage />

                <PageHeader
                    title="Pelanggan"
                    description="Kelola data pelanggan"
                    action={{ label: 'Tambah Pelanggan', href: '/customers/create' }}
                />

                <DataTable columns={columns} data={customers} searchKey="name" searchPlaceholder="Cari pelanggan..." />
            </div>
        </AppLayout>
    );
}
