import { DataTable } from '@/components/app/data-table';
import { FlashMessage } from '@/components/app/flash-message';
import { PageHeader } from '@/components/app/page-header';
import { formatRupiah } from '@/components/app/stats-card';
import { PaymentStatusBadge, WashStatusBadge } from '@/components/app/status-badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { type PaginatedData, type PaymentMethod, type Transaction } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Calendar, Check, CreditCard, Eye, Filter, Search, Trash2 } from 'lucide-react';
import * as React from 'react';

interface TransactionsIndexProps {
    transactions: PaginatedData<Transaction>;
    paymentMethods: PaymentMethod[];
    filters: {
        wash_status?: string;
        payment_status?: string;
        date_from?: string;
        date_to?: string;
        search?: string;
    };
}

export default function TransactionsIndex({ transactions, paymentMethods, filters }: TransactionsIndexProps) {
    const [search, setSearch] = React.useState(filters.search || '');
    const [washStatus, setWashStatus] = React.useState(filters.wash_status || '');
    const [paymentStatus, setPaymentStatus] = React.useState(filters.payment_status || '');

    // Modal State
    const [selectedTransaction, setSelectedTransaction] = React.useState<Transaction | null>(null);
    const [modalWashStatus, setModalWashStatus] = React.useState<string>('');
    const [modalPaymentStatus, setModalPaymentStatus] = React.useState<string>('');
    const [modalPaymentMethodId, setModalPaymentMethodId] = React.useState<string>('');

    // Update modal state when a transaction is selected
    React.useEffect(() => {
        if (selectedTransaction) {
            setModalWashStatus(selectedTransaction.wash_status);
            setModalPaymentStatus(selectedTransaction.payment_status);
            setModalPaymentMethodId(String(selectedTransaction.payment_method_id || ''));
        }
    }, [selectedTransaction]);

    const handleSearch = () => {
        router.get(
            '/transactions',
            {
                search,
                wash_status: washStatus || undefined,
                payment_status: paymentStatus || undefined,
            },
            { preserveState: true }
        );
    };

    const handleDelete = (transaction: Transaction) => {
        if (confirm(`Apakah Anda yakin ingin menghapus transaksi ${transaction.invoice_number}?`)) {
            router.delete(`/transactions/${transaction.id}`);
        }
    };

    const handleStatusUpdate = () => {
        if (!selectedTransaction) return;

        router.put(
            `/transactions/${selectedTransaction.id}/status`,
            {
                wash_status: modalWashStatus,
                payment_status: modalPaymentStatus,
                payment_method_id: modalPaymentMethodId || undefined,
            },
            {
                onSuccess: () => {
                    setSelectedTransaction(null);
                },
            }
        );
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSearch();
    };

    // Define columns
    const columns: ColumnDef<Transaction>[] = [
        {
            accessorKey: 'invoice_number',
            header: 'Faktur',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">
                        {new Date(row.original.created_at).toLocaleDateString('id-ID')}
                    </span>
                    <span className="text-sm font-semibold">{row.original.invoice_number}</span>
                </div>
            ),
        },
        {
            accessorKey: 'customer_id',
            header: 'Pelanggan',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span>{row.original.customer?.name || 'Pelanggan Langsung'}</span>
                    {row.original.customer?.phone && (
                        <span className="text-xs text-muted-foreground">{row.original.customer.phone}</span>
                    )}
                </div>
            ),
        },
        {
            header: 'Layanan',
            cell: ({ row }) => (
                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    {row.original.carwash_type?.name}
                </span>
            ),
        },
        {
            accessorKey: 'license_plate',
            header: 'Kendaraan',
            cell: ({ row }) =>
                row.original.license_plate ? (
                    <span className="font-mono text-xs">{row.original.license_plate}</span>
                ) : (
                    <span className="text-muted-foreground">-</span>
                ),
        },
        {
            accessorKey: 'price',
            header: () => <div className="text-right">Harga</div>,
            cell: ({ row }) => <div className="text-right font-medium">{formatRupiah(row.original.price)}</div>,
        },
        {
            accessorKey: 'wash_status',
            header: () => <div className="text-center">Status</div>,
            cell: ({ row }) => (
                <div className="flex justify-center">
                    <WashStatusBadge status={row.original.wash_status} />
                </div>
            ),
        },
        {
            accessorKey: 'payment_status',
            header: () => <div className="text-center">Pembayaran</div>,
            cell: ({ row }) => (
                <div className="flex justify-center">
                    <PaymentStatusBadge status={row.original.payment_status} />
                </div>
            ),
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => (
                <div className="flex items-center justify-center gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 text-primary hover:text-primary"
                                    onClick={() => setSelectedTransaction(row.original)}
                                >
                                    <Check className="h-4 w-4" />
                                    <span className="sr-only">Ubah Status</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Ubah Status</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" asChild className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                    <Link href={`/transactions/${row.original.id}`}>
                                        <Eye className="h-4 w-4" />
                                        <span className="sr-only">Lihat</span>
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Lihat Detail</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 text-red-600 hover:text-red-600"
                                    onClick={() => handleDelete(row.original)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Hapus</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Hapus Transaksi</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={[{ title: 'Transaksi', href: '/transactions' }]}>
            <Head title="Transaksi" />

            <div className="space-y-6 p-4 md:p-6">
                <FlashMessage />

                <PageHeader
                    title="Transaksi"
                    description="Kelola dan lacak transaksi cuci mobil."
                    action={{ label: 'Transaksi Baru', href: '/transactions/create' }}
                />

                {/* Filters Toolbar */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
                        <div className="relative w-full md:max-w-xs">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Cari faktur, plat..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="pl-9"
                            />
                        </div>

                        <div className="flex gap-2">
                            <Select value={washStatus} onValueChange={setWashStatus}>
                                <SelectTrigger className="w-[140px]">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Filter className="h-3.5 w-3.5" />
                                        <span className="text-foreground">
                                            {washStatus ? (washStatus === 'all' ? 'Semua Status' : washStatus === 'waiting' ? 'Menunggu' : washStatus === 'washing' ? 'Dicuci' : 'Selesai') : 'Status'}
                                        </span>
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="waiting">Menunggu</SelectItem>
                                    <SelectItem value="washing">Dicuci</SelectItem>
                                    <SelectItem value="done">Selesai</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                                <SelectTrigger className="w-[150px]">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <CreditCard className="h-3.5 w-3.5" />
                                        <span className="text-foreground">
                                            {paymentStatus ? (paymentStatus === 'all' ? 'Semua Pembayaran' : paymentStatus === 'unpaid' ? 'Belum Bayar' : 'Lunas') : 'Pembayaran'}
                                        </span>
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Pembayaran</SelectItem>
                                    <SelectItem value="unpaid">Belum Bayar</SelectItem>
                                    <SelectItem value="paid">Lunas</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button variant="secondary" onClick={handleSearch}>
                                Terapkan
                            </Button>
                        </div>
                    </div>
                </div>

                {/* DataTable with explicit actions & server-side pagination */}
                <DataTable
                    columns={columns}
                    data={transactions.data}
                    meta={transactions}
                    hideSearch={true}
                />

                {/* Status Update Modal */}
                <Dialog open={!!selectedTransaction} onOpenChange={(open) => !open && setSelectedTransaction(null)}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Perbarui Status
                            </DialogTitle>
                            <DialogDescription>
                                Ubah status cuci atau pembayaran untuk {selectedTransaction?.invoice_number}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status Cuci</label>
                                <Select value={modalWashStatus} onValueChange={setModalWashStatus}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="waiting">Menunggu</SelectItem>
                                        <SelectItem value="washing">Dicuci</SelectItem>
                                        <SelectItem value="done">Selesai</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status Pembayaran</label>
                                <Select value={modalPaymentStatus} onValueChange={setModalPaymentStatus}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="unpaid">Belum Bayar</SelectItem>
                                        <SelectItem value="paid">Lunas</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {modalPaymentStatus === 'paid' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Metode Pembayaran</label>
                                    <Select value={modalPaymentMethodId} onValueChange={setModalPaymentMethodId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih metode" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {paymentMethods.map((method) => (
                                                <SelectItem key={method.id} value={String(method.id)}>
                                                    {method.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="secondary" onClick={() => setSelectedTransaction(null)}>
                                Batal
                            </Button>
                            <Button onClick={handleStatusUpdate}>Simpan perubahan</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
