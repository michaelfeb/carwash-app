import { Card, CardContent } from '@/components/ui/card';
import { Head, router } from '@inertiajs/react';
import { Car, CheckCircle, Clock, Hash, ParkingCircle, Search, Waves, Wrench } from 'lucide-react';
import * as React from 'react';

interface ActiveCar {
    id: number;
    queue_number: number | null;
    license_plate: string | null;
    carwash_type: string | null;
    wash_status: string;
}

interface BayInfo {
    key: string;
    label: string;
    occupied: boolean;
    active: ActiveCar | null;
}

interface QueueItem {
    id: number;
    queue_number: number | null;
    license_plate: string | null;
    carwash_type: string | null;
    wash_status: string;
}

interface TrackIndexProps {
    bays: BayInfo[];
    notWashed: QueueItem[];
    alreadyWashed: QueueItem[];
    highlightedId: number | null;
    search: string;
}

export default function TrackIndex({ bays, notWashed, alreadyWashed, highlightedId, search }: TrackIndexProps) {
    const [searchValue, setSearchValue] = React.useState(search);
    const highlightRef = React.useRef<HTMLDivElement>(null);

    // Sync input when navigating
    React.useEffect(() => {
        setSearchValue(search);
    }, [search]);

    // Auto-refresh every 15 seconds
    React.useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['bays', 'notWashed', 'alreadyWashed'] });
        }, 15000);
        return () => clearInterval(interval);
    }, []);

    // Scroll to highlighted item
    React.useEffect(() => {
        if (highlightedId && highlightRef.current) {
            highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [highlightedId, notWashed, alreadyWashed]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = searchValue.trim();
        if (trimmed) {
            router.get('/track', { search: trimmed }, { preserveState: true, preserveScroll: true });
        }
    };

    const isHighlighted = (id: number) => highlightedId === id;

    const formatPlate = (plate: string | null) => {
        if (!plate) return '-';
        return plate.toUpperCase();
    };

    return (
        <>
            <Head title="Lacak Antrian" />

            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
                {/* ── Header ─────────────────────────────────────── */}
                <header className="sticky top-0 z-10 border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
                    <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600">
                                <Car className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-lg font-bold text-slate-800">CarWash Pro</span>
                        </div>
                        <a href="/" className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-700">
                            Beranda
                        </a>
                    </div>
                </header>

                <main className="mx-auto max-w-4xl px-6 py-8">
                    {/* ── Hero ─────────────────────────────────────── */}
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Lacak Status Cuci</h1>
                        <p className="mt-2 text-slate-500">Pantau antrian dan progres pencucian kendaraan Anda secara real-time.</p>
                    </div>

                    {/* ── Search Form ──────────────────────────────── */}
                    <form onSubmit={handleSubmit} className="mb-8">
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                    <Search className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    placeholder="Masukkan nomor DA mobil"
                                    className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-lg font-medium text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                                />
                            </div>
                            <button
                                type="submit"
                                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:shadow-sky-500/25"
                            >
                                <Search className="h-5 w-5" />
                                Cari
                            </button>
                        </div>
                    </form>

                    {/* ── Bay Status Cards ─────────────────────────── */}
                    <div className="mb-8 grid grid-cols-2 gap-4">
                        {bays.map((bay) => (
                            <Card
                                key={bay.key}
                                className={`overflow-hidden rounded-2xl border shadow-sm transition-all ${
                                    bay.occupied
                                        ? 'border-red-200/60 bg-red-50/40'
                                        : 'border-emerald-200/60 bg-emerald-50/40'
                                }`}
                            >
                                <CardContent className="p-5">
                                    {/* Bay header */}
                                    <div className="mb-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div
                                                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                                                    bay.occupied ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                                                }`}
                                            >
                                                <ParkingCircle className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-800">{bay.label}</h3>
                                                <div className="flex items-center gap-1.5">
                                                    <span
                                                        className={`inline-flex h-2 w-2 rounded-full ${
                                                            bay.occupied ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'
                                                        }`}
                                                    />
                                                    <span className={`text-xs font-medium ${bay.occupied ? 'text-red-600' : 'text-emerald-600'}`}>
                                                        {bay.occupied ? 'Sedang Dicuci' : 'Tersedia'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {bay.active && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200/60">
                                                {formatPlate(bay.active.license_plate)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Active car detail */}
                                    {bay.active ? (
                                        <div className="flex items-center gap-3 rounded-xl bg-white/80 px-4 py-3 ring-1 ring-slate-200/40">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                                                <Waves className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-slate-800">
                                                    {bay.active.carwash_type || '-'}
                                                </p>
                                                <p className="text-xs text-slate-500">Sedang dalam proses</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 rounded-xl bg-white/60 px-4 py-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                                                <Car className="h-5 w-5 text-slate-300" />
                                            </div>
                                            <p className="text-sm text-slate-400">Menunggu kendaraan</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* ── 2-Column: Not Washed / Already Washed ──────── */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2" ref={highlightRef}>
                        {/* Left: Belum Dicuci */}
                        <Card className="overflow-hidden rounded-2xl border border-slate-200/60 shadow-sm">
                            <div className="flex items-center gap-3 border-b border-amber-100 bg-amber-50/70 px-5 py-4">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100">
                                    <Clock className="h-[18px] w-[18px] text-amber-600" />
                                </div>
                                <div>
                                    <h2 className="text-[15px] font-bold text-slate-800">Belum Dicuci</h2>
                                    <p className="text-xs text-slate-500">{notWashed.length} kendaraan</p>
                                </div>
                            </div>
                            <CardContent className="p-0">
                                {notWashed.length === 0 ? (
                                    <div className="flex flex-col items-center py-10 text-center">
                                        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                                            <Car className="h-5 w-5 text-slate-300" />
                                        </div>
                                        <p className="text-sm text-slate-400">Belum ada antrian</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-50">
                                        {notWashed.map((item) => (
                                            <div
                                                key={item.id}
                                                className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${
                                                    isHighlighted(item.id)
                                                        ? 'bg-sky-100 ring-2 ring-inset ring-sky-400/30'
                                                        : 'hover:bg-slate-50'
                                                }`}
                                            >
                                                <span
                                                    className={`inline-flex h-9 min-w-[36px] items-center justify-center rounded-lg px-2 text-xs font-bold uppercase tracking-wider ${
                                                        isHighlighted(item.id)
                                                            ? 'bg-sky-500 text-white'
                                                            : 'bg-slate-200 text-slate-700'
                                                    }`}
                                                >
                                                    {formatPlate(item.license_plate)}
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold text-slate-800">
                                                        {item.carwash_type || '-'}
                                                    </p>
                                                    <p className="text-xs text-slate-500">Menunggu giliran</p>
                                                </div>
                                                {isHighlighted(item.id) && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-sky-500 px-2 py-0.5 text-[10px] font-bold text-white">
                                                        Anda
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Right: Sudah Dicuci */}
                        <Card className="overflow-hidden rounded-2xl border border-slate-200/60 shadow-sm">
                            <div className="flex items-center gap-3 border-b border-emerald-100 bg-emerald-50/70 px-5 py-4">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100">
                                    <CheckCircle className="h-[18px] w-[18px] text-emerald-600" />
                                </div>
                                <div>
                                    <h2 className="text-[15px] font-bold text-slate-800">Sudah Dicuci</h2>
                                    <p className="text-xs text-slate-500">{alreadyWashed.length} kendaraan</p>
                                </div>
                            </div>
                            <CardContent className="p-0">
                                {alreadyWashed.length === 0 ? (
                                    <div className="flex flex-col items-center py-10 text-center">
                                        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                                            <CheckCircle className="h-5 w-5 text-slate-300" />
                                        </div>
                                        <p className="text-sm text-slate-400">Belum ada yang selesai</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-50">
                                        {alreadyWashed.map((item) => (
                                            <div
                                                key={item.id}
                                                className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${
                                                    isHighlighted(item.id)
                                                        ? 'bg-sky-100 ring-2 ring-inset ring-sky-400/30'
                                                        : 'hover:bg-slate-50'
                                                }`}
                                            >
                                                <span
                                                    className={`inline-flex h-9 min-w-[36px] items-center justify-center rounded-lg px-2 text-xs font-bold uppercase tracking-wider ${
                                                        isHighlighted(item.id)
                                                            ? 'bg-sky-500 text-white'
                                                            : 'bg-emerald-100 text-emerald-700'
                                                    }`}
                                                >
                                                    {formatPlate(item.license_plate)}
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold text-slate-800">
                                                        {item.carwash_type || '-'}
                                                    </p>
                                                    <p className="text-xs text-emerald-600">Selesai</p>
                                                </div>
                                                <CheckCircle className="h-4 w-4 flex-shrink-0 text-emerald-400" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* ── Footer Note ──────────────────────────────── */}
                    <p className="mt-8 text-center text-xs text-slate-400">
                        Laman ini diperbarui otomatis setiap 15 detik.
                    </p>
                </main>
            </div>
        </>
    );
}
