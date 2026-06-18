import { RevenueAreaChart } from '@/components/app/revenue-area-chart';
import { ServicePieChart } from '@/components/app/service-pie-chart';
import { FlashMessage } from '@/components/app/flash-message';
import { formatRupiah } from '@/components/app/stats-card';
import { PaymentStatusBadge, WashStatusBadge } from '@/components/app/status-badge';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type DashboardStats, type RevenueChartData, type ServiceChartData, type StaffPerformance, type TopCustomer, type Transaction } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Award,
    Car,
    Clock,
    CreditCard,
    Crown,
    DollarSign,
    Gift,
    ListOrdered,
    Medal,
    PlusCircle,
    Sparkles,
    TrendingUp,
    Trophy,
    Users,
    Wallet,
    Wrench,
} from 'lucide-react';

interface DashboardProps {
    stats: DashboardStats;
    recentTransactions: Transaction[];
    revenueChart: RevenueChartData[];
    serviceChart: ServiceChartData[];
    topCustomers: TopCustomer[];
    staffPerformance: StaffPerformance[];
}

/* ── Rank badge helper ─────────────────────────────────────────── */
function RankBadge({ index, size = 'md' }: { index: number; size?: 'sm' | 'md' }) {
    const sz = size === 'sm' ? 'h-7 w-7' : 'h-9 w-9';
    const iconSz = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
    const numSz = size === 'sm' ? 'text-[10px]' : 'text-xs';

    const styles: Record<number, string> = {
        0: 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-amber-200 shadow-md',
        1: 'bg-gradient-to-br from-slate-300 to-slate-500 text-white shadow-slate-200 shadow-md',
        2: 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-orange-200 shadow-md',
    };

    return (
        <div className={`flex ${sz} shrink-0 items-center justify-center rounded-full font-bold ${styles[index] ?? 'bg-slate-100 text-slate-500'}`}>
            {index === 0 ? <Crown className={iconSz} /> : index <= 2 ? <Medal className={iconSz} /> : <span className={numSz}>{index + 1}</span>}
        </div>
    );
}

/* ── Metric card ────────────────────────────────────────────────── */
function MetricCard({
    label,
    value,
    icon: Icon,
    gradient,
    iconBg,
    iconColor,
}: {
    label: string;
    value: string | number;
    icon: React.ElementType;
    gradient: string;
    iconBg: string;
    iconColor: string;
}) {
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
            <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full ${gradient} opacity-10 transition-opacity duration-300 group-hover:opacity-20`} />
            <div className="relative flex items-start justify-between">
                <div className="space-y-1.5">
                    <p className="text-[13px] font-medium text-slate-500">{label}</p>
                    <p className="text-2xl font-bold tracking-tight text-slate-900">{value}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
            </div>
        </div>
    );
}

/* ── Section header ──────────────────────────────────────────────── */
function SectionHeader({ icon: Icon, iconBg, iconColor, title, subtitle, action }: {
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    title: string;
    subtitle: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg}`}>
                    <Icon className={`h-[18px] w-[18px] ${iconColor}`} />
                </div>
                <div>
                    <h2 className="text-[15px] font-semibold text-slate-800">{title}</h2>
                    <p className="text-xs text-slate-500">{subtitle}</p>
                </div>
            </div>
            {action}
        </div>
    );
}

/* ── Empty state ─────────────────────────────────────────────────── */
function EmptyState({ icon: Icon, iconBg, iconColor, title, subtitle }: {
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    title: string;
    subtitle: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className={`mb-3 flex h-14 w-14 items-center justify-center rounded-2xl ${iconBg}`}>
                <Icon className={`h-7 w-7 ${iconColor}`} />
            </div>
            <p className="text-sm font-semibold text-slate-600">{title}</p>
            <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
        </div>
    );
}

/* ── Main Dashboard ──────────────────────────────────────────────── */
export default function Dashboard({ stats, recentTransactions, revenueChart, serviceChart, topCustomers, staffPerformance }: DashboardProps) {
    const maxRevenue = staffPerformance.length > 0
        ? Math.max(...staffPerformance.map((s) => s.weekly_revenue), 1)
        : 1;

    return (
        <AppLayout breadcrumbs={[{ title: 'Dasbor', href: '/dashboard' }]}>
            <Head title="Dasbor" />

            <div className="space-y-6 p-4 md:p-6 lg:p-8">
                <FlashMessage />

                {/* ── Hero Header ─────────────────────────────────────── */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-6 py-6 text-white shadow-lg md:px-8 md:py-8">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
                    <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" />
                    <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Dasbor</h1>
                            <p className="mt-1 text-sm text-blue-100">Selamat datang! Berikut ringkasan bisnis cuci mobil Anda.</p>
                        </div>
                        <Link
                            href="/transactions/create"
                            className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/25"
                        >
                            <PlusCircle className="h-4 w-4" />
                            Transaksi Baru
                        </Link>
                    </div>
                </div>

                {/* ── Key Metrics ─────────────────────────────────────── */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    <MetricCard label="Transaksi Hari Ini" value={stats.todayTransactions} icon={Car} gradient="bg-blue-500" iconBg="bg-blue-50" iconColor="text-blue-600" />
                    <MetricCard label="Pendapatan Hari Ini" value={formatRupiah(stats.todayRevenue)} icon={DollarSign} gradient="bg-indigo-500" iconBg="bg-indigo-50" iconColor="text-indigo-600" />
                    <MetricCard label="Pembayaran Tertunda" value={stats.pendingPayments} icon={CreditCard} gradient="bg-violet-500" iconBg="bg-violet-50" iconColor="text-violet-600" />
                    <MetricCard label="Sedang Dicuci" value={stats.carsInProgress} icon={Clock} gradient="bg-sky-500" iconBg="bg-sky-50" iconColor="text-sky-600" />
                    <MetricCard label="Total Pelanggan" value={stats.totalCustomers} icon={Users} gradient="bg-cyan-500" iconBg="bg-cyan-50" iconColor="text-cyan-600" />
                    <MetricCard label="Staf Aktif" value={stats.activeStaff} icon={Wrench} gradient="bg-emerald-500" iconBg="bg-emerald-50" iconColor="text-emerald-600" />
                </div>

                {/* ── Profit Breakdown ─────────────────────────────────── */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="relative overflow-hidden rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
                        <div className="absolute -right-3 -bottom-3 h-16 w-16 rounded-full bg-emerald-400/10" />
                        <div className="relative flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
                                <Wallet className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-emerald-700/70">Laba Owner (60%)</p>
                                <p className="text-xl font-bold text-emerald-700">{formatRupiah(stats.todayOwnerShare)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="relative overflow-hidden rounded-2xl border border-purple-200/60 bg-gradient-to-br from-purple-50 to-white p-5 shadow-sm">
                        <div className="absolute -right-3 -bottom-3 h-16 w-16 rounded-full bg-purple-400/10" />
                        <div className="relative flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100">
                                <Wrench className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-purple-700/70">Pool Staf (40%)</p>
                                <p className="text-xl font-bold text-purple-700">{formatRupiah(stats.todayStaffPool)}</p>
                            </div>
                        </div>
                    </div>
                    {stats.todayLoyaltyDiscount > 0 && (
                        <div className="relative overflow-hidden rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm">
                            <div className="absolute -right-3 -bottom-3 h-16 w-16 rounded-full bg-amber-400/10" />
                            <div className="relative flex items-center gap-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100">
                                    <Gift className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-amber-700/70">Diskon Loyalty</p>
                                    <p className="text-xl font-bold text-amber-700">{formatRupiah(stats.todayLoyaltyDiscount)}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Charts ──────────────────────────────────────────── */}
                <div className="grid gap-4 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <RevenueAreaChart data={revenueChart} />
                    </div>
                    <div className="lg:col-span-1">
                        <ServicePieChart data={serviceChart} />
                    </div>
                </div>

                {/* ── Recent Transactions ───────────────────────────────── */}
                <Card className="overflow-hidden rounded-2xl border border-slate-200/60 shadow-sm">
                    <div className="border-b border-slate-100 bg-white px-5 py-4">
                        <SectionHeader
                            icon={ListOrdered}
                            iconBg="bg-blue-50"
                            iconColor="text-blue-600"
                            title="Transaksi Terbaru"
                            subtitle="5 transaksi terakhir"
                            action={
                                <Link
                                    href="/transactions"
                                    className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100"
                                >
                                    Lihat semua
                                    <ArrowRight className="h-3 w-3" />
                                </Link>
                            }
                        />
                    </div>
                    <CardContent className="p-0">
                        {recentTransactions.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/50">
                                            <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Faktur</th>
                                            <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Pelanggan</th>
                                            <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Jenis</th>
                                            <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">Harga</th>
                                            <th className="px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500">Cuci</th>
                                            <th className="px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500">Bayar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentTransactions.map((t) => (
                                            <tr key={t.id} className="border-b border-slate-50 transition-colors hover:bg-blue-50/40">
                                                <td className="px-5 py-3 text-sm font-semibold text-blue-700">{t.invoice_number}</td>
                                                <td className="px-5 py-3 text-sm text-slate-700">{t.customer?.name ?? '-'}</td>
                                                <td className="px-5 py-3 text-sm text-slate-600">{t.carwash_type?.name}</td>
                                                <td className="px-5 py-3 text-right text-sm font-semibold text-slate-800">{formatRupiah(t.price)}</td>
                                                <td className="px-5 py-3 text-center"><WashStatusBadge status={t.wash_status} /></td>
                                                <td className="px-5 py-3 text-center"><PaymentStatusBadge status={t.payment_status} /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="px-5">
                                <EmptyState
                                    icon={Car}
                                    iconBg="bg-blue-100"
                                    iconColor="text-blue-400"
                                    title="Belum ada transaksi hari ini"
                                    subtitle="Mulai tambahkan transaksi untuk melihat data di sini."
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ── Top Customers & Staff Performance ─────────────────── */}
                <div className="grid gap-4 lg:grid-cols-2">
                    {/* Top Customers */}
                    <Card className="overflow-hidden rounded-2xl border border-slate-200/60 shadow-sm">
                        <div className="border-b border-slate-100 bg-white px-5 py-4">
                            <SectionHeader
                                icon={Trophy}
                                iconBg="bg-amber-50"
                                iconColor="text-amber-600"
                                title="Pelanggan Teratas"
                                subtitle="Berdasarkan total pengeluaran"
                                action={
                                    <Link
                                        href="/customers"
                                        className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-600 transition-colors hover:bg-amber-100"
                                    >
                                        Lihat semua
                                        <ArrowRight className="h-3 w-3" />
                                    </Link>
                                }
                            />
                        </div>
                        <CardContent className="p-4">
                            {topCustomers.length > 0 ? (
                                <div className="space-y-2">
                                    {topCustomers.map((customer, index) => (
                                        <div
                                            key={customer.id}
                                            className="flex items-center gap-3 rounded-xl bg-slate-50/50 px-4 py-3 transition-all duration-200 hover:bg-amber-50/50"
                                        >
                                            <RankBadge index={index} />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-slate-800">{customer.name}</p>
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <span>{customer.transactions_count} kunjungan</span>
                                                    {customer.loyalty_stamps > 0 && (
                                                        <Badge variant="secondary" className="gap-0.5 bg-amber-50 text-[10px] text-amber-700 hover:bg-amber-100">
                                                            <Sparkles className="h-2.5 w-2.5" />
                                                            {customer.loyalty_stamps} stempel
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm font-bold text-emerald-600">{formatRupiah(customer.total_spending)}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={Users}
                                    iconBg="bg-amber-100"
                                    iconColor="text-amber-400"
                                    title="Belum ada data pelanggan"
                                    subtitle="Data akan muncul setelah ada transaksi"
                                />
                            )}
                        </CardContent>
                    </Card>

                    {/* Staff Performance */}
                    <Card className="overflow-hidden rounded-2xl border border-slate-200/60 shadow-sm">
                        <div className="border-b border-slate-100 bg-white px-5 py-4">
                            <SectionHeader
                                icon={Award}
                                iconBg="bg-purple-50"
                                iconColor="text-purple-600"
                                title="Performa Staf"
                                subtitle="Minggu ini"
                                action={
                                    <Badge variant="outline" className="gap-1 border-purple-200 bg-purple-50 text-purple-600">
                                        <TrendingUp className="h-3 w-3" />
                                        Minggu ini
                                    </Badge>
                                }
                            />
                        </div>
                        <CardContent className="p-4">
                            {staffPerformance.length > 0 ? (
                                <div className="space-y-2">
                                    {staffPerformance.map((staff, index) => (
                                        <div
                                            key={staff.id}
                                            className="flex items-center gap-3 rounded-xl bg-slate-50/50 px-4 py-3 transition-all duration-200 hover:bg-purple-50/50"
                                        >
                                            <RankBadge index={index} size="sm" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-slate-800">{staff.name}</p>
                                                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                                                        style={{ width: `${Math.max((staff.weekly_revenue / maxRevenue) * 100, 4)}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-emerald-600">{formatRupiah(staff.weekly_revenue)}</p>
                                                <p className="text-[11px] text-slate-500">{staff.weekly_transactions} transaksi</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={Wrench}
                                    iconBg="bg-purple-100"
                                    iconColor="text-purple-400"
                                    title="Belum ada data staf"
                                    subtitle="Data akan muncul setelah ada transaksi minggu ini"
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
