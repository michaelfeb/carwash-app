import { FlashMessage } from '@/components/app/flash-message';
import { formatRupiah, StatsCard } from '@/components/app/stats-card';
import { PaymentStatusBadge, WashStatusBadge } from '@/components/app/status-badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type DashboardStats, type Transaction } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Car, Clock, CreditCard, DollarSign, Users, Wrench } from 'lucide-react';

interface DashboardProps {
    stats: DashboardStats;
    recentTransactions: Transaction[];
}

export default function Dashboard({ stats, recentTransactions }: DashboardProps) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
            <Head title="Dashboard" />

            <div className="space-y-6 p-4 md:p-6">
                <FlashMessage />

                {/* Page Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">Welcome back! Here's an overview of your carwash business.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    <StatsCard
                        title="Today's Transactions"
                        value={stats.todayTransactions}
                        description="Cars washed today"
                        icon={Car}
                    />
                    <StatsCard
                        title="Today's Revenue"
                        value={formatRupiah(stats.todayRevenue)}
                        description="Income today"
                        icon={DollarSign}
                    />
                    <StatsCard
                        title="Pending Payments"
                        value={stats.pendingPayments}
                        description="Awaiting payment"
                        icon={CreditCard}
                    />
                    <StatsCard
                        title="Cars In Progress"
                        value={stats.carsInProgress}
                        description="Currently washing"
                        icon={Clock}
                    />
                    <StatsCard
                        title="Total Customers"
                        value={stats.totalCustomers}
                        description="Registered customers"
                        icon={Users}
                    />
                    <StatsCard
                        title="Active Staff"
                        value={stats.activeStaff}
                        description="Available washmen"
                        icon={Wrench}
                    />
                </div>

                {/* Recent Transactions */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Recent Transactions</CardTitle>
                                <CardDescription>Latest 5 transactions from today</CardDescription>
                            </div>
                            <Link href="/transactions" className="text-sm font-medium text-primary hover:underline">
                                View all
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {recentTransactions.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Invoice</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                        <TableHead className="text-center">Wash Status</TableHead>
                                        <TableHead className="text-center">Payment</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentTransactions.map((transaction) => (
                                        <TableRow key={transaction.id}>
                                            <TableCell className="font-medium">{transaction.invoice_number}</TableCell>
                                            <TableCell>{transaction.customer?.name || '-'}</TableCell>
                                            <TableCell>{transaction.carwash_type?.name}</TableCell>
                                            <TableCell className="text-right">{formatRupiah(transaction.price)}</TableCell>
                                            <TableCell className="text-center">
                                                <WashStatusBadge status={transaction.wash_status} />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <PaymentStatusBadge status={transaction.payment_status} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <Car className="h-12 w-12 mb-4" />
                                <p>No transactions yet today</p>
                                <Link href="/transactions/create" className="mt-2 text-primary hover:underline">
                                    Create your first transaction
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
