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
        if (confirm(`Are you sure you want to delete "${customer.name}"?`)) {
            router.delete(`/customers/${customer.id}`);
        }
    };

    const columns: ColumnDef<Customer>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
        },
        {
            accessorKey: 'phone',
            header: 'Phone',
            cell: ({ row }) => row.original.phone || '-',
        },
        {
            accessorKey: 'address',
            header: 'Address',
            cell: ({ row }) => (
                <span className="max-w-[200px] truncate block">{row.original.address || '-'}</span>
            ),
        },
        {
            accessorKey: 'transactions_count',
            header: 'Visits',
            cell: ({ row }) => row.original.transactions_count || 0,
        },
        {
            accessorKey: 'total_spending',
            header: 'Total Spending',
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
                                Edit
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(row.original)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={[{ title: 'Customers', href: '/customers' }]}>
            <Head title="Customers" />

            <div className="space-y-6 p-4 md:p-6">
                <FlashMessage />

                <PageHeader
                    title="Customers"
                    description="Manage customer data"
                    action={{ label: 'Add Customer', href: '/customers/create' }}
                />

                <DataTable columns={columns} data={customers} searchKey="name" searchPlaceholder="Search customers..." />
            </div>
        </AppLayout>
    );
}
