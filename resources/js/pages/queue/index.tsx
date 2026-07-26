import { FlashMessage } from '@/components/app/flash-message';
import { formatRupiah } from '@/components/app/stats-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { type Transaction } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    ArrowRightLeft,
    Calendar,
    Car,
    CheckCircle,
    CircleDashed,
    Clock,
    Hash,
    ListOrdered,
    ParkingCircle,
    PlusCircle,
    ScrollText,
    User,
    Users,
    Waves,
    Wrench,
} from 'lucide-react';
import * as React from 'react';

interface BaySlot {
    key: string;
    label: string;
}

interface QueueIndexProps {
    bays: BaySlot[];
    activeSlots: Record<string, Transaction | null>;
    waitingList: Transaction[];
    date: string;
}

const bayConfig: Record<string, { gradient: string; bg: string; iconBg: string; iconColor: string; dot: string; pulse: string; border: string; headerBg: string }> = {
    bay_1: {
        gradient: 'from-sky-500 to-blue-600',
        bg: 'bg-sky-50',
        iconBg: 'bg-sky-100',
        iconColor: 'text-sky-600',
        dot: 'bg-sky-500',
        pulse: 'bg-sky-400',
        border: 'border-sky-200/60',
        headerBg: 'from-sky-500 to-blue-600',
    },
    bay_2: {
        gradient: 'from-emerald-500 to-teal-600',
        bg: 'bg-emerald-50',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
        dot: 'bg-emerald-500',
        pulse: 'bg-emerald-400',
        border: 'border-emerald-200/60',
        headerBg: 'from-emerald-500 to-teal-600',
    },
};

const defaultBayConfig = {
    gradient: 'from-gray-500 to-gray-600',
    bg: 'bg-gray-50',
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-500',
    dot: 'bg-gray-500',
    pulse: 'bg-gray-400',
    border: 'border-gray-200/60',
    headerBg: 'from-gray-500 to-gray-600',
};

const getStatusStyle = (status: string) => {
    switch (status) {
        case 'waiting':
            return { color: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Menunggu', icon: Clock };
        case 'washing':
            return { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Sedang Dicuci', icon: Waves };
        case 'done':
            return { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Selesai', icon: CheckCircle };
        default:
            return { color: 'bg-gray-100 text-gray-600 border-gray-200', label: status, icon: CircleDashed };
    }
};

export default function QueueIndex({ bays, activeSlots, waitingList, date }: QueueIndexProps) {
    const [releasingId, setReleasingId] = React.useState<number | null>(null);

    const handleAssign = (transactionId: number, slot: string) => {
        router.put(`/queue/${transactionId}/assign`, { slot, date }, { preserveState: true, preserveScroll: true });
    };

    const handleRelease = (transactionId: number) => {
        setReleasingId(transactionId);
        router.put(`/queue/${transactionId}/release`, { date }, { preserveState: true, preserveScroll: true, onFinish: () => setReleasingId(null) });
    };

    const handleDateChange = (newDate: string) => {
        router.get('/queue', { date: newDate }, { preserveState: true, preserveScroll: true });
    };

    const waitingCount = waitingList.length;
    const occupiedBays = bays.filter((b) => activeSlots[b.key]).length;

    return (
        <AppLayout breadcrumbs={[{ title: 'Antrian', href: '/queue' }]}>
            <Head title="Antrian" />

            <div className="space-y-6 p-4 md:p-6 lg:p-8">
                <FlashMessage />

                {/* ── Hero Header ─────────────────────────────────────── */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 via-sky-600 to-blue-700 px-6 py-6 text-white shadow-lg md:px-8 md:py-8">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
                    <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" />
                    <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Antrian Cuci</h1>
                            <p className="mt-1 text-sm text-sky-100">Atur antrian kendaraan dan alokasikan ke bay pencucian.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 backdrop-blur-sm">
                                <Clock className="h-4 w-4" />
                                <div className="leading-none">
                                    <p className="text-[10px] uppercase tracking-wider text-sky-200">Menunggu</p>
                                    <p className="text-lg font-bold">{waitingCount}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 backdrop-blur-sm">
                                <ParkingCircle className="h-4 w-4" />
                                <div className="leading-none">
                                    <p className="text-[10px] uppercase tracking-wider text-sky-200">Bay Aktif</p>
                                    <p className="text-lg font-bold">{occupiedBays}/{bays.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Date Filter ─────────────────────────────────────── */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 ring-1 ring-slate-200/60 shadow-sm">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => handleDateChange(e.target.value)}
                            className="border-none bg-transparent text-sm font-medium text-slate-700 outline-none focus:ring-0"
                        />
                    </div>
                </div>

                {/* ── Bay Cards ────────────────────────────────────────── */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {bays.map((bay) => {
                        const active = activeSlots[bay.key];
                        const isOccupied = active !== null && active !== undefined;
                        const cfg = bayConfig[bay.key] ?? defaultBayConfig;
                        const statusInfo = isOccupied ? getStatusStyle(active!.wash_status) : null;
                        const StatusIcon = statusInfo?.icon || CircleDashed;

                        return (
                            <div
                                key={bay.key}
                                className={`relative overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 ${
                                    isOccupied ? cfg.border : 'border-dashed border-slate-300'
                                }`}
                            >
                                {/* Gradient header strip */}
                                <div className={`bg-gradient-to-r ${cfg.headerBg} px-5 py-3.5`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                                    <ParkingCircle className="h-5 w-5 text-white" />
                                                </div>
                                                {isOccupied && (
                                                    <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5">
                                                        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${cfg.pulse} opacity-75`} />
                                                        <span className={`relative inline-flex h-3.5 w-3.5 rounded-full ${cfg.dot} ring-2 ring-white`} />
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-white">{bay.label}</h3>
                                                <p className="text-xs text-white/70">{isOccupied ? 'Sedang beroperasi' : 'Tersedia'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isOccupied && statusInfo && (
                                                <Badge variant="outline" className={`${statusInfo.color} border bg-white/90 text-xs`}>
                                                    <StatusIcon className="mr-1 h-3 w-3" />
                                                    {statusInfo.label}
                                                </Badge>
                                            )}
                                            {isOccupied && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="sm"
                                                                disabled={releasingId === active!.id}
                                                                className="h-8 gap-1.5 rounded-lg bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 disabled:opacity-50"
                                                                onClick={() => handleRelease(active!.id)}
                                                            >
                                                                <CheckCircle className="h-3.5 w-3.5" />
                                                                <span className="hidden sm:inline">Selesai</span>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Tandai pencucian selesai</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Card body */}
                                <div className="bg-white p-5">
                                    {isOccupied ? (
                                        <div className="space-y-4">
                                            {/* Invoice & Queue number */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <ScrollText className="h-4 w-4 text-slate-400" />
                                                    <span className="font-mono text-sm font-semibold text-slate-800">{active!.invoice_number}</span>
                                                </div>
                                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200/60">
                                                    <Hash className="h-3 w-3" />
                                                    {active!.queue_number}
                                                </span>
                                            </div>

                                            {/* Detail grid */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="rounded-xl bg-slate-50/80 px-3 py-2.5">
                                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                                        <Wrench className="h-3 w-3" />
                                                        Layanan
                                                    </div>
                                                    <span className="mt-0.5 inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/10">
                                                        {active!.carwash_type?.name || '-'}
                                                    </span>
                                                </div>
                                                <div className="rounded-xl bg-slate-50/80 px-3 py-2.5">
                                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                                        <Car className="h-3 w-3" />
                                                        Kendaraan
                                                    </div>
                                                    <p className="mt-0.5 font-mono text-sm font-medium text-slate-800">
                                                        {active!.license_plate || '-'}
                                                    </p>
                                                </div>
                                                {active!.customer && (
                                                    <div className="rounded-xl bg-slate-50/80 px-3 py-2.5">
                                                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                                            <User className="h-3 w-3" />
                                                            Pelanggan
                                                        </div>
                                                        <p className="mt-0.5 text-sm font-medium text-slate-800">{active!.customer.name}</p>
                                                    </div>
                                                )}
                                                <div className="rounded-xl bg-slate-50/80 px-3 py-2.5">
                                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                                        <Users className="h-3 w-3" />
                                                        Staf
                                                    </div>
                                                    <div className="mt-0.5 flex flex-wrap gap-1">
                                                        {active!.staffs && active!.staffs.length > 0 ? (
                                                            active!.staffs.map((staff) => (
                                                                <span key={staff.id} className="inline-flex items-center rounded bg-slate-200/80 px-1.5 py-0.5 text-xs text-slate-700">
                                                                    {staff.name}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs text-slate-400">-</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Price */}
                                            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5 ring-1 ring-slate-200/60">
                                                <span className="text-xs text-slate-500">Total Harga</span>
                                                <span className="text-sm font-bold tabular-nums text-slate-800">{formatRupiah(active!.price)}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-10 text-center">
                                            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                                                <Car className="h-7 w-7 text-slate-300" />
                                            </div>
                                            <p className="text-sm font-semibold text-slate-500">Bay Kosong</p>
                                            <p className="mt-1 max-w-[200px] text-xs text-slate-400">
                                                Pilih kendaraan dari daftar antrian untuk memulai pencucian
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ── Waiting List ─────────────────────────────────────── */}
                <Card className="overflow-hidden rounded-2xl border border-border shadow-sm">
                    <div className="border-b border-border bg-card px-5 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50">
                                    <ListOrdered className="h-[18px] w-[18px] text-amber-600" />
                                </div>
                                <div>
                                    <h2 className="text-[15px] font-semibold text-foreground">Daftar Antrian</h2>
                                    <p className="text-xs text-muted-foreground">Kendaraan yang menunggu untuk dicuci</p>
                                </div>
                            </div>
                            {waitingCount > 0 && (
                                <Badge variant="secondary" className="gap-1 bg-amber-50 text-amber-700 hover:bg-amber-100">
                                    <Clock className="h-3 w-3" />
                                    {waitingCount} menunggu
                                </Badge>
                            )}
                        </div>
                    </div>
                    <CardContent className="p-0">
                        {waitingList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center px-5 py-12">
                                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                                    <ScrollText className="h-7 w-7 text-muted-foreground/50" />
                                </div>
                                <p className="text-sm font-semibold text-foreground">Antrian Kosong</p>
                                <p className="mt-1 text-xs text-muted-foreground">Belum ada kendaraan dalam antrian. Buat transaksi baru untuk memulai.</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-4 gap-1.5"
                                    onClick={() => router.get('/transactions/create')}
                                >
                                    <PlusCircle className="h-3.5 w-3.5" />
                                    Buat Transaksi
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/50">
                                            <th className="w-16 px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">No</th>
                                            <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Faktur</th>
                                            <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Pelanggan</th>
                                            <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Layanan</th>
                                            <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Kendaraan</th>
                                            <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Harga</th>
                                            <th className="px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Alokasikan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {waitingList.map((t, index) => (
                                            <tr key={t.id} className="border-b border-border/60 transition-colors even:bg-muted/30 hover:bg-accent/50">
                                                <td className="px-5 py-3 text-center">
                                                    <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                                                        index === 0
                                                            ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-sm'
                                                            : 'bg-muted text-muted-foreground'
                                                    }`}>
                                                        {t.queue_number}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span className="font-mono text-sm font-semibold text-foreground">{t.invoice_number}</span>
                                                </td>
                                                <td className="px-5 py-3 text-sm text-foreground">{t.customer?.name || 'Pelanggan Langsung'}</td>
                                                <td className="px-5 py-3">
                                                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 ring-1 ring-inset ring-blue-600/10 dark:bg-blue-950/50 dark:text-blue-300 dark:ring-blue-400/20">
                                                        {t.carwash_type?.name || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3">
                                                    {t.license_plate ? (
                                                        <span className="font-mono text-xs font-medium tracking-wide text-foreground">{t.license_plate}</span>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">—</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3 text-right text-sm font-semibold text-foreground">{formatRupiah(t.price)}</td>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {bays.map((bay) => {
                                                            const isBayFree = !activeSlots[bay.key];
                                                            const cfg = bayConfig[bay.key] ?? defaultBayConfig;
                                                            return (
                                                                <TooltipProvider key={bay.key}>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button
                                                                                size="sm"
                                                                                variant={isBayFree ? 'default' : 'outline'}
                                                                                disabled={!isBayFree}
                                                                                className={`h-8 gap-1.5 rounded-lg text-xs transition-all ${
                                                                                    isBayFree
                                                                                        ? `bg-gradient-to-r ${cfg.gradient} text-white shadow-sm hover:opacity-90`
                                                                                        : 'border-border text-muted-foreground line-through'
                                                                                }`}
                                                                                onClick={() => isBayFree && handleAssign(t.id, bay.key)}
                                                                            >
                                                                                <ArrowRightLeft className="h-3 w-3" />
                                                                                {bay.label}
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            {isBayFree ? `Kirim ke ${bay.label}` : `${bay.label} sedang terisi`}
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            );
                                                        })}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
