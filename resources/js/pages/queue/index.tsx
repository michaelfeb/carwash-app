import { FlashMessage } from '@/components/app/flash-message';
import { PageHeader } from '@/components/app/page-header';
import { formatRupiah } from '@/components/app/stats-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { type Transaction } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    ArrowRightLeft,
    Car,
    CheckCircle,
    ChevronRight,
    CircleDashed,
    Clock,
    Hash,
    MoveRight,
    ParkingCircle,
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
}

const bayGradients: Record<string, string> = {
    bay_1: 'from-sky-500 to-blue-600',
    bay_2: 'from-emerald-500 to-teal-600',
};

const bayBorderColors: Record<string, string> = {
    bay_1: 'border-sky-200',
    bay_2: 'border-emerald-200',
};

const bayAccentColors: Record<string, string> = {
    bay_1: 'bg-sky-50 border-sky-200 text-sky-700',
    bay_2: 'bg-emerald-50 border-emerald-200 text-emerald-700',
};

const bayDotColors: Record<string, string> = {
    bay_1: 'bg-sky-500',
    bay_2: 'bg-emerald-500',
};

const bayPulseColors: Record<string, string> = {
    bay_1: 'bg-sky-400',
    bay_2: 'bg-emerald-400',
};

export default function QueueIndex({ bays, activeSlots, waitingList }: QueueIndexProps) {
    const [releasingId, setReleasingId] = React.useState<number | null>(null);

    const handleAssign = (transactionId: number, slot: string) => {
        router.put(
            `/queue/${transactionId}/assign`,
            { slot },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleRelease = (transactionId: number) => {
        setReleasingId(transactionId);
        router.put(
            `/queue/${transactionId}/release`,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setReleasingId(null),
            }
        );
    };

    const waitingCount = waitingList.length;
    const occupiedBays = bays.filter((b) => activeSlots[b.key]).length;

    const getStatusBadge = (status: string) => {
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

    return (
        <AppLayout breadcrumbs={[{ title: 'Antrian', href: '/queue' }]}>
            <Head title="Antrian" />

            <div className="space-y-6 p-4 md:p-6">
                <FlashMessage />

                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <PageHeader
                            title="Antrian Cuci"
                            description="Atur antrian kendaraan dan alokasikan ke bay pencucian yang tersedia."
                        />
                    </div>

                    {/* Quick Stats */}
                    <div className="flex gap-3">
                        <div className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 shadow-sm">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                                <Clock className="h-4 w-4 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Menunggu</p>
                                <p className="text-lg font-bold tabular-nums">{waitingCount}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 shadow-sm">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                <ParkingCircle className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Bay Aktif</p>
                                <p className="text-lg font-bold tabular-nums">
                                    {occupiedBays}/{bays.length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bay Cards */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {bays.map((bay) => {
                        const active = activeSlots[bay.key];
                        const isOccupied = active !== null && active !== undefined;
                        const gradient = bayGradients[bay.key] || 'from-gray-500 to-gray-600';
                        const borderColor = bayBorderColors[bay.key] || 'border-gray-200';
                        const accentColor = bayAccentColors[bay.key] || 'bg-gray-50 border-gray-200 text-gray-700';
                        const dotColor = bayDotColors[bay.key] || 'bg-gray-500';
                        const pulseColor = bayPulseColors[bay.key] || 'bg-gray-400';
                        const statusInfo = isOccupied ? getStatusBadge(active!.wash_status) : null;
                        const StatusIcon = statusInfo?.icon || CircleDashed;

                        return (
                            <Card
                                key={bay.key}
                                className={`group relative overflow-hidden border-2 transition-all duration-300 ${
                                    isOccupied
                                        ? `${borderColor} shadow-md`
                                        : 'border-dashed border-gray-300 bg-gray-50/30'
                                }`}
                            >
                                {/* Top accent bar */}
                                <div
                                    className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradient} ${
                                        isOccupied ? 'opacity-100' : 'opacity-30'
                                    }`}
                                />

                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-5">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div
                                                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                                                    isOccupied
                                                        ? `bg-gradient-to-br ${gradient} text-white shadow-md`
                                                        : 'bg-gray-200 text-gray-400'
                                                }`}
                                            >
                                                <ParkingCircle className="h-5 w-5" />
                                            </div>
                                            {isOccupied && (
                                                <span className="absolute -right-1 -top-1 flex h-4 w-4">
                                                    <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${pulseColor} opacity-75`} />
                                                    <span className={`relative inline-flex h-4 w-4 rounded-full ${dotColor} ring-2 ring-white`} />
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold tracking-tight">{bay.label}</h3>
                                            <p className="text-xs text-muted-foreground">
                                                {isOccupied ? 'Sedang beroperasi' : 'Tersedia'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {isOccupied && statusInfo && (
                                            <Badge
                                                variant="outline"
                                                className={`${statusInfo.color} border`}
                                            >
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
                                                            className="h-8 gap-1.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-sm hover:from-emerald-600 hover:to-green-700 disabled:opacity-50"
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
                                </CardHeader>

                                <CardContent className="pb-5">
                                    {isOccupied ? (
                                        <div className="space-y-4">
                                            {/* Invoice & Queue */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <ScrollText className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-mono text-sm font-semibold tracking-tight">
                                                        {active!.invoice_number}
                                                    </span>
                                                </div>
                                                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-gray-600 shadow-sm ring-1 ring-gray-200">
                                                    <Hash className="h-3 w-3" />
                                                    {active!.queue_number}
                                                </span>
                                            </div>

                                            <Separator className="opacity-50" />

                                            {/* Detail Grid */}
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                                                <div className="flex items-start gap-2">
                                                    <Wrench className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Layanan</p>
                                                        <span className="inline-flex items-center rounded-md bg-blue-100/80 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/10">
                                                            {active!.carwash_type?.name || '-'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-2">
                                                    <Car className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Kendaraan</p>
                                                        <p className="font-mono text-sm font-medium">
                                                            {active!.license_plate || '-'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {active!.customer && (
                                                    <div className="flex items-start gap-2">
                                                        <User className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Pelanggan</p>
                                                            <p className="text-sm font-medium">{active!.customer.name}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-start gap-2">
                                                    <Users className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Staff</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {active!.staffs && active!.staffs.length > 0 ? (
                                                                active!.staffs.map((staff) => (
                                                                    <span
                                                                        key={staff.id}
                                                                        className="inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-700"
                                                                    >
                                                                        {staff.name}
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span className="text-xs text-muted-foreground">-</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Price */}
                                            <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2 ring-1 ring-gray-200/60">
                                                <span className="text-xs text-muted-foreground">Total Harga</span>
                                                <span className="text-sm font-bold tabular-nums">
                                                    {formatRupiah(active!.price)}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-10 text-center">
                                            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 ring-1 ring-gray-200">
                                                <Car className="h-7 w-7 text-gray-300" />
                                            </div>
                                            <p className="text-sm font-semibold text-gray-500">
                                                Bay Kosong
                                            </p>
                                            <p className="mt-1 max-w-[200px] text-xs text-gray-400">
                                                Pilih kendaraan dari daftar antrian untuk memulai pencucian
                                            </p>
                                            <ChevronRight className="mt-2 h-4 w-4 animate-bounce text-gray-300" />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Waiting List */}
                <Card className="overflow-hidden shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b bg-gray-50/50 px-6 py-4">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                                <Clock className="h-4 w-4 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold tracking-tight">Daftar Antrian</h3>
                                <p className="text-xs text-muted-foreground">
                                    Kendaraan yang menunggu untuk dicuci
                                </p>
                            </div>
                        </div>
                        {waitingCount > 0 && (
                            <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-700 hover:bg-amber-100">
                                <Clock className="h-3 w-3" />
                                {waitingCount} menunggu
                            </Badge>
                        )}
                    </CardHeader>

                    <CardContent className="p-0">
                        {waitingList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                                    <ScrollText className="h-7 w-7 text-gray-300" />
                                </div>
                                <h4 className="font-semibold text-gray-500">Antrian Kosong</h4>
                                <p className="mt-1 max-w-xs text-sm text-gray-400">
                                    Belum ada kendaraan dalam antrian. Buat transaksi baru untuk memulai antrian.
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-4 gap-1.5"
                                    onClick={() => router.get('/transactions/create')}
                                >
                                    <MoveRight className="h-3.5 w-3.5" />
                                    Buat Transaksi
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-100">
                                    <thead>
                                        <tr className="bg-gray-50/80">
                                            <th className="w-16 py-3 pl-6 text-center text-[11px] font-semibold uppercase tracking-widest text-gray-500">
                                                No
                                            </th>
                                            <th className="py-3 pl-4 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-500">
                                                Faktur
                                            </th>
                                            <th className="py-3 pl-4 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-500">
                                                Pelanggan
                                            </th>
                                            <th className="py-3 pl-4 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-500">
                                                Layanan
                                            </th>
                                            <th className="py-3 pl-4 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-500">
                                                Kendaraan
                                            </th>
                                            <th className="py-3 pr-2 text-right text-[11px] font-semibold uppercase tracking-widest text-gray-500">
                                                Harga
                                            </th>
                                            <th className="w-40 py-3 pr-6 text-center text-[11px] font-semibold uppercase tracking-widest text-gray-500">
                                                Alokasikan ke
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {waitingList.map((t, index) => (
                                            <tr
                                                key={t.id}
                                                className="transition-colors hover:bg-gray-50/80"
                                            >
                                                <td className="py-3.5 pl-6 text-center">
                                                    <div className="flex items-center justify-center">
                                                        <span
                                                            className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ring-1 ${
                                                                index === 0
                                                                    ? 'bg-amber-100 text-amber-700 ring-amber-300'
                                                                    : 'bg-gray-100 text-gray-600 ring-gray-200'
                                                            }`}
                                                        >
                                                            {t.queue_number}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 pl-4">
                                                    <span className="font-mono text-xs font-semibold tracking-tight">
                                                        {t.invoice_number}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 pl-4">
                                                    <span className="text-sm">
                                                        {t.customer?.name || 'Pelanggan Langsung'}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 pl-4">
                                                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 ring-1 ring-inset ring-blue-600/10">
                                                        {t.carwash_type?.name || '-'}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 pl-4">
                                                    {t.license_plate ? (
                                                        <span className="font-mono text-xs font-medium tracking-wide">
                                                            {t.license_plate}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">—</span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 pr-2 text-right">
                                                    <span className="text-sm font-semibold tabular-nums">
                                                        {formatRupiah(t.price)}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 pr-6">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {bays.map((bay) => {
                                                            const isBayFree = !activeSlots[bay.key];
                                                            return (
                                                                <TooltipProvider key={bay.key}>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button
                                                                                size="sm"
                                                                                variant={isBayFree ? 'default' : 'outline'}
                                                                                disabled={!isBayFree}
                                                                                className={`h-8 gap-1.5 text-xs transition-all ${
                                                                                    isBayFree
                                                                                        ? `bg-gradient-to-r ${bayGradients[bay.key]} text-white shadow-sm hover:opacity-90`
                                                                                        : 'border-gray-200 text-gray-400 line-through'
                                                                                }`}
                                                                                onClick={() => isBayFree && handleAssign(t.id, bay.key)}
                                                                            >
                                                                                <ArrowRightLeft className="h-3 w-3" />
                                                                                {bay.label}
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            {isBayFree
                                                                                ? `Kirim ke ${bay.label}`
                                                                                : `${bay.label} sedang terisi`}
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
