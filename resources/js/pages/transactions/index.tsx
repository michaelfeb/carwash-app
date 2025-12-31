import { FlashMessage } from '@/components/app/flash-message';
import { PageHeader } from '@/components/app/page-header';
import { formatRupiah } from '@/components/app/stats-card';
import { PaymentStatusBadge, WashStatusBadge } from '@/components/app/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type PaginatedData, type Transaction } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, MoreHorizontal, Search, Trash2 } from 'lucide-react';
import * as React from 'react';

interface TransactionsIndexProps {
    transactions: PaginatedData<Transaction>;
    filters: {
        wash_status?: string;
        payment_status?: string;
        date_from?: string;
        date_to?: string;
        search?: string;
    };
}

export default function TransactionsIndex({ transactions, filters }: TransactionsIndexProps) {
    const [search, setSearch] = React.useState(filters.search || '');
    const [washStatus, setWashStatus] = React.useState(filters.wash_status || '');
    const [paymentStatus, setPaymentStatus] = React.useState(filters.payment_status || '');

    const handleSearch = () => {
        router.get('/transactions', {
            search,
            wash_status: washStatus || undefined,
            payment_status: paymentStatus || undefined,
        }, { preserveState: true });
    };

    const handleDelete = (transaction: Transaction) => {
        if (confirm(`Are you sure you want to delete transaction ${transaction.invoice_number}?`)) {
            router.delete(`/transactions/${transaction.id}`);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSearch();
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Transactions', href: '/transactions' }]}>
            <Head title="Transactions" />

            <div className="space-y-6 p-4 md:p-6">
                <FlashMessage />

                <PageHeader
                    title="Transactions"
                    description="Manage car wash transactions"
                    action={{ label: 'New Transaction', href: '/transactions/create' }}
                />

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by invoice, plate, or customer..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <Select value={washStatus} onValueChange={setWashStatus}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Wash Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="waiting">Waiting</SelectItem>
                                    <SelectItem value="washing">Washing</SelectItem>
                                    <SelectItem value="done">Done</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Payment" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Payment</SelectItem>
                                    <SelectItem value="unpaid">Unpaid</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={handleSearch}>Search</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Plate</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                    <TableHead className="text-center">Wash</TableHead>
                                    <TableHead className="text-center">Payment</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.data.length > 0 ? (
                                    transactions.data.map((transaction) => (
                                        <TableRow key={transaction.id}>
                                            <TableCell className="font-medium">{transaction.invoice_number}</TableCell>
                                            <TableCell>{transaction.customer?.name || '-'}</TableCell>
                                            <TableCell>{transaction.carwash_type?.name}</TableCell>
                                            <TableCell>{transaction.license_plate || '-'}</TableCell>
                                            <TableCell className="text-right">{formatRupiah(transaction.price)}</TableCell>
                                            <TableCell className="text-center">
                                                <WashStatusBadge status={transaction.wash_status} />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <PaymentStatusBadge status={transaction.payment_status} />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/transactions/${transaction.id}`}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-red-600"
                                                            onClick={() => handleDelete(transaction)}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center">
                                            No transactions found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {transactions.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing {transactions.from} to {transactions.to} of {transactions.total} entries
                        </p>
                        <div className="flex gap-2">
                            {transactions.links.map((link, index) => (
                                <Button
                                    key={index}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url)}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
