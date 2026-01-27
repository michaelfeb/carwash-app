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
        <AppLayout breadcrumbs={[{ title: 'Dasbor', href: '/dashboard' }]}>
            <Head title="Dasbor" />

            <div className="space-y-6 p-4 md:p-6">
                <FlashMessage />

                {/* Page Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Dasbor</h1>
                    <p className="text-muted-foreground">Selamat datang! Berikut ringkasan bisnis cuci mobil Anda.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    <StatsCard
                        title="Transaksi Hari Ini"
                        value={stats.todayTransactions}
                        description="Mobil dicuci hari ini"
                        icon={Car}
                    />
                    <StatsCard
                        title="Pendapatan Hari Ini"
                        value={formatRupiah(stats.todayRevenue)}
                        description="Penghasilan hari ini"
                        icon={DollarSign}
                    />
                    <StatsCard
                        title="Pembayaran Tertunda"
                        value={stats.pendingPayments}
                        description="Menunggu pembayaran"
                        icon={CreditCard}
                    />
                    <StatsCard
                        title="Mobil Sedang Dicuci"
                        value={stats.carsInProgress}
                        description="Sedang dalam proses"
                        icon={Clock}
                    />
                    <StatsCard
                        title="Total Pelanggan"
                        value={stats.totalCustomers}
                        description="Pelanggan terdaftar"
                        icon={Users}
                    />
                    <StatsCard
                        title="Staf Aktif"
                        value={stats.activeStaff}
                        description="Pencuci tersedia"
                        icon={Wrench}
                    />
                </div>

                {/* Recent Transactions */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Transaksi Terbaru</CardTitle>
                                <CardDescription>5 transaksi terakhir hari ini</CardDescription>
                            </div>
                            <Link href="/transactions" className="text-sm font-medium text-primary hover:underline">
                                Lihat semua
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {recentTransactions.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Faktur</TableHead>
                                        <TableHead>Pelanggan</TableHead>
                                        <TableHead>Jenis</TableHead>
                                        <TableHead className="text-right">Harga</TableHead>
                                        <TableHead className="text-center">Status Cuci</TableHead>
                                        <TableHead className="text-center">Pembayaran</TableHead>
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
                                <p>Belum ada transaksi hari ini</p>
                                <Link href="/transactions/create" className="mt-2 text-primary hover:underline">
                                    Buat transaksi pertama Anda
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
