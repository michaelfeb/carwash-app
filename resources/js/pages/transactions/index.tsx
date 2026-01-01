import { FlashMessage } from '@/components/app/flash-message';
import { PageHeader } from '@/components/app/page-header';
import { formatRupiah } from '@/components/app/stats-card';
import { PaymentStatusBadge, WashStatusBadge } from '@/components/app/status-badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type PaginatedData, type Transaction } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowUpDown,
    Calendar,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    CreditCard,
    Eye,
    FileText,
    Filter,
    MoreHorizontal,
    Search,
    Trash2,
} from 'lucide-react';
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
        if (confirm(`Are you sure you want to delete transaction ${transaction.invoice_number}?`)) {
            router.delete(`/transactions/${transaction.id}`);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSearch();
    };

    // Auto-search when filters change (optional, but nice for modern UX)
    // React.useEffect(() => { handleSearch() }, [washStatus, paymentStatus]); 
    // Keeping manual for now to match strict requirements, or maybe just button.
    // User didn't ask for auto-search.

    return (
        <AppLayout breadcrumbs={[{ title: 'Transactions', href: '/transactions' }]}>
            <Head title="Transactions" />

            <div className="space-y-6 p-4 md:p-6">
                <FlashMessage />

                <PageHeader
                    title="Transactions"
                    description="Manage and track car wash transactions."
                    action={{ label: 'New Transaction', href: '/transactions/create' }}
                />

                {/* Filters Toolbar */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
                        <div className="relative w-full md:max-w-xs">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search invoice, plate..."
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
                                        <span className="text-foreground">{washStatus ? (washStatus === 'all' ? 'All Status' : washStatus) : 'Status'}</span>
                                    </div>
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
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <CreditCard className="h-3.5 w-3.5" />
                                        <span className="text-foreground">{paymentStatus ? (paymentStatus === 'all' ? 'All Payment' : paymentStatus) : 'Payment'}</span>
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Payment</SelectItem>
                                    <SelectItem value="unpaid">Unpaid</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button variant="secondary" onClick={handleSearch}>
                                Apply
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Modern Table */}
                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                                <TableHead className="w-[180px]">Invoice</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Service</TableHead>
                                <TableHead>Vehicle</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-center">Payment</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.data.length > 0 ? (
                                transactions.data.map((transaction) => (
                                    <TableRow key={transaction.id} className="group">
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(transaction.created_at).toLocaleDateString()}
                                                </span>
                                                <span className="text-sm font-semibold">{transaction.invoice_number}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>{transaction.customer?.name || 'Walk-in Customer'}</span>
                                                {transaction.customer?.phone && (
                                                    <span className="text-xs text-muted-foreground">{transaction.customer.phone}</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                                {transaction.carwash_type?.name}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {transaction.license_plate ? (
                                                <span className="font-mono text-xs">{transaction.license_plate}</span>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatRupiah(transaction.price)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <WashStatusBadge status={transaction.wash_status} />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <PaymentStatusBadge status={transaction.payment_status} />
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Open menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-[160px]">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMetadataItem invoice={transaction.invoice_number} />
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/transactions/${transaction.id}`}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Details
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
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
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <FileText className="h-8 w-8 opacity-50" />
                                            <p>No transactions found matching your filters.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {transactions.last_page > 1 && (
                    <div className="flex items-center justify-between border-t pt-4">
                        <p className="text-sm text-muted-foreground">
                            Showing <span className="font-medium">{transactions.from}</span> to{' '}
                            <span className="font-medium">{transactions.to}</span> of{' '}
                            <span className="font-medium">{transactions.total}</span> results
                        </p>
                        <div className="flex gap-2">
                            {transactions.links.map((link, index) => {
                                // Simple logic to render previous/next icons
                                let label = link.label;
                                let isIcon = false;
                                if (label.includes('&laquo;')) {
                                    label = 'Previous';
                                    isIcon = true;
                                } else if (label.includes('&raquo;')) {
                                    label = 'Next';
                                    isIcon = true;
                                }

                                return (
                                    <Button
                                        key={index}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        className={!link.url ? 'pointer-events-none opacity-50' : ''}
                                        onClick={() => link.url && router.get(link.url)}
                                        disabled={!link.url}
                                    >
                                        {isIcon ? (
                                            label === 'Previous' ? (
                                                <ChevronLeft className="h-4 w-4" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4" />
                                            )
                                        ) : (
                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                        )}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

// Helper component for dropdown metadata to avoid hook rules in loop if needed, 
// though here it's just a static item.
function DropdownMetadataItem({ invoice }: { invoice: string }) {
    return (
        <span className="hidden px-2 py-1.5 text-xs text-muted-foreground">
            {invoice}
        </span>
    );
}
