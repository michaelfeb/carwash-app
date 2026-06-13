import { RevenueAreaChart } from '@/components/app/revenue-area-chart';
import { ServicePieChart } from '@/components/app/service-pie-chart';
import { FlashMessage } from '@/components/app/flash-message';
import { formatRupiah, StatsCard } from '@/components/app/stats-card';
import { PaymentStatusBadge, WashStatusBadge } from '@/components/app/status-badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type DashboardStats, type RevenueChartData, type ServiceChartData, type Transaction } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Car, Clock, CreditCard, DollarSign, ListOrdered, PlusCircle, Users, Wrench } from 'lucide-react';

interface DashboardProps {
    stats: DashboardStats;
    recentTransactions: Transaction[];
    revenueChart: RevenueChartData[];
    serviceChart: ServiceChartData[];
}

export default function Dashboard({ stats, recentTransactions, revenueChart, serviceChart }: DashboardProps) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Dasbor', href: '/dashboard' }]}>
            <Head title="Dasbor" />

            <div className="space-y-8 p-4 md:p-6">
                <FlashMessage />

                {/* Page Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
                            Dasbor
                        </h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            Selamat datang! Berikut ringkasan bisnis cuci mobil Anda.
                        </p>
                    </div>
                    <Link
                        href="/transactions/create"
                        className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md"
                    >
                        <PlusCircle className="h-4 w-4" />
                        Transaksi Baru
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    <StatsCard
                        title="Transaksi Hari Ini"
                        value={stats.todayTransactions}
                        description="Mobil dicuci hari ini"
                        icon={Car}
                        accentColor="blue"
                    />
                    <StatsCard
                        title="Pendapatan Hari Ini"
                        value={formatRupiah(stats.todayRevenue)}
                        description="Penghasilan hari ini"
                        icon={DollarSign}
                        accentColor="indigo"
                    />
                    <StatsCard
                        title="Pembayaran Tertunda"
                        value={stats.pendingPayments}
                        description="Menunggu pembayaran"
                        icon={CreditCard}
                        accentColor="violet"
                    />
                    <StatsCard
                        title="Mobil Sedang Dicuci"
                        value={stats.carsInProgress}
                        description="Sedang dalam proses"
                        icon={Clock}
                        accentColor="sky"
                    />
                    <StatsCard
                        title="Total Pelanggan"
                        value={stats.totalCustomers}
                        description="Pelanggan terdaftar"
                        icon={Users}
                        accentColor="cyan"
                    />
                    <StatsCard
                        title="Staf Aktif"
                        value={stats.activeStaff}
                        description="Pencuci tersedia"
                        icon={Wrench}
                        accentColor="emerald"
                    />
                </div>

                {/* Charts Row */}
                <div className="grid gap-4 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <RevenueAreaChart data={revenueChart} />
                    </div>
                    <div className="lg:col-span-1">
                        <ServicePieChart data={serviceChart} />
                    </div>
                </div>

                {/* Recent Transactions */}
                <Card className="border-0 shadow-md">
                    <CardHeader className="pb-0">
                        <div className="flex items-center justify-between px-1 py-1">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                                    <ListOrdered className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-base font-semibold text-slate-800">Transaksi Terbaru</p>
                                    <p className="text-xs text-muted-foreground">5 transaksi terakhir hari ini</p>
                                </div>
                            </div>
                            <Link
                                href="/transactions"
                                className="flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100"
                            >
                                Lihat semua
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-3">
                        {recentTransactions.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-none hover:bg-transparent">
                                        <TableHead className="rounded-tl-lg font-semibold uppercase tracking-wide">
                                            Faktur
                                        </TableHead>
                                        <TableHead className="font-semibold uppercase tracking-wide">
                                            Pelanggan
                                        </TableHead>
                                        <TableHead className="font-semibold uppercase tracking-wide">
                                            Jenis
                                        </TableHead>
                                        <TableHead className="text-right font-semibold uppercase tracking-wide">
                                            Harga
                                        </TableHead>
                                        <TableHead className="text-center font-semibold uppercase tracking-wide">
                                            Status Cuci
                                        </TableHead>
                                        <TableHead className="rounded-tr-lg text-center font-semibold uppercase tracking-wide">
                                            Pembayaran
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentTransactions.map((transaction, index) => (
                                        <TableRow
                                            key={transaction.id}
                                            className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-blue-50"
                                            style={{ backgroundColor: index % 2 === 0 ? 'white' : '#f8faff' }}
                                        >
                                            <TableCell className="font-medium text-blue-700">{transaction.invoice_number}</TableCell>
                                            <TableCell className="text-slate-700">{transaction.customer?.name || '-'}</TableCell>
                                            <TableCell className="text-slate-700">{transaction.carwash_type?.name}</TableCell>
                                            <TableCell className="text-right font-semibold text-slate-800">{formatRupiah(transaction.price)}</TableCell>
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
                            <div className="flex flex-col items-center justify-center rounded-xl bg-blue-50/50 py-14">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                                    <Car className="h-8 w-8 text-blue-400" />
                                </div>
                                <p className="text-sm font-semibold text-slate-700">Belum ada transaksi hari ini</p>
                                <p className="mt-1 text-xs text-slate-500">Mulai tambahkan transaksi untuk melihat data di sini.</p>
                                <Link
                                    href="/transactions/create"
                                    className="mt-4 flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700"
                                >
                                    <PlusCircle className="h-4 w-4" />
                                    Buat transaksi pertama
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
