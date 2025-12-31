import { DataTable } from '@/components/app/data-table';
import { FlashMessage } from '@/components/app/flash-message';
import { PageHeader } from '@/components/app/page-header';
import { formatRupiah } from '@/components/app/stats-card';
import { ActiveStatusBadge } from '@/components/app/status-badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { type Staff } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

interface StaffsIndexProps {
    staffs: Staff[];
}

export default function StaffsIndex({ staffs }: StaffsIndexProps) {
    const handleDelete = (staff: Staff) => {
        if (confirm(`Are you sure you want to delete "${staff.name}"?`)) {
            router.delete(`/staffs/${staff.id}`);
        }
    };

    const columns: ColumnDef<Staff>[] = [
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
            accessorKey: 'transactions_count',
            header: 'Total Jobs',
            cell: ({ row }) => row.original.transactions_count || 0,
        },
        {
            accessorKey: 'total_earnings',
            header: 'Total Earnings',
            cell: ({ row }) => formatRupiah(row.original.total_earnings || 0),
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
                            <Link href={`/staffs/${row.original.id}/edit`}>
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
        <AppLayout breadcrumbs={[{ title: 'Staffs', href: '/staffs' }]}>
            <Head title="Staffs" />

            <div className="space-y-6 p-4 md:p-6">
                <FlashMessage />

                <PageHeader
                    title="Staffs"
                    description="Manage washmen staff members"
                    action={{ label: 'Add Staff', href: '/staffs/create' }}
                />

                <DataTable columns={columns} data={staffs} searchKey="name" searchPlaceholder="Search staffs..." />
            </div>
        </AppLayout>
    );
}
