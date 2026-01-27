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
import { type CarwashType } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

interface CarwashTypesIndexProps {
    carwashTypes: CarwashType[];
}

export default function CarwashTypesIndex({ carwashTypes }: CarwashTypesIndexProps) {
    const handleDelete = (type: CarwashType) => {
        if (confirm(`Apakah Anda yakin ingin menghapus "${type.name}"?`)) {
            router.delete(`/carwash-types/${type.id}`);
        }
    };

    const columns: ColumnDef<CarwashType>[] = [
        {
            accessorKey: 'name',
            header: 'Nama',
            cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
        },
        {
            accessorKey: 'size_category',
            header: 'Kategori',
            cell: ({ row }) => <span className="capitalize">{row.original.size_category}</span>,
        },
        {
            id: 'price_range',
            header: 'Rentang Harga',
            cell: ({ row }) => (
                <span>
                    {formatRupiah(row.original.min_price)} - {formatRupiah(row.original.max_price)}
                </span>
            ),
        },
        {
            accessorKey: 'transactions_count',
            header: 'Total Digunakan',
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
                            <Link href={`/carwash-types/${row.original.id}/edit`}>
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
        <AppLayout breadcrumbs={[{ title: 'Jenis Cuci', href: '/carwash-types' }]}>
            <Head title="Jenis Cuci" />

            <div className="space-y-6 p-4 md:p-6">
                <FlashMessage />

                <PageHeader
                    title="Jenis Cuci"
                    description="Kelola jenis cuci mobil dan harga"
                    action={{ label: 'Tambah Jenis', href: '/carwash-types/create' }}
                />

                <DataTable columns={columns} data={carwashTypes} searchKey="name" searchPlaceholder="Cari jenis..." />
            </div>
        </AppLayout>
    );
}
