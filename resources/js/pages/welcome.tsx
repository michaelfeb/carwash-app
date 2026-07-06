import { dashboard, login } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Car,
    Clock,
    Droplets,
    Eye,
    MapPin,
    ParkingCircle,
    Shield,
    Sparkles,
} from 'lucide-react';

interface WelcomeStats {
    transactions_today: number;
    queue_active: number;
    bays_active: number;
}

export default function Welcome() {
    const { auth, stats } = usePage<SharedData & { stats: WelcomeStats }>()
        .props;

    return (
        <>
            <Head title="RK Carwash">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800"
                    rel="stylesheet"
                />
            </Head>

            <div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-950">
                {/* ── Animated Background ──────────────────────────── */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(56,189,248,0.12),transparent)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_80%_80%,rgba(45,212,191,0.08),transparent)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_30%_at_20%_60%,rgba(99,102,241,0.06),transparent)]" />
                    {/* Grid pattern */}
                    <div
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage:
                                'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                            backgroundSize: '64px 64px',
                        }}
                    />
                </div>

                {/* ── Header ────────────────────────────────────────── */}
                <header className="relative border-b border-white/[0.06]">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
                        <div className="flex items-center gap-3">
                            <div className="h-11 w-11 overflow-hidden rounded-xl border border-amber-300/30 bg-black shadow-lg shadow-amber-500/10">
                                <img
                                    src="/assets/logo.jpeg"
                                    alt="Logo RK Carwash"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="hidden text-left leading-tight min-[420px]:block">
                                <span className="block text-lg font-bold tracking-tight text-white">
                                    RK Carwash
                                </span>
                                <span className="text-[10px] font-semibold tracking-[0.18em] text-amber-300/80 uppercase">
                                    Bersih · Cepat · Sehat
                                </span>
                            </div>
                        </div>
                        <nav className="flex items-center gap-2">
                            <button
                                onClick={() => router.get('/track')}
                                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-sm transition-all hover:border-white/[0.15] hover:bg-white/[0.06] hover:text-white"
                            >
                                <Eye className="h-4 w-4" />
                                <span className="hidden sm:inline">
                                    Lacak Antrian
                                </span>
                            </button>
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-sky-500/20 transition-all hover:from-sky-400 hover:to-blue-500 hover:shadow-sky-500/30"
                                >
                                    Ke Dasbor
                                </Link>
                            ) : (
                                <Link
                                    href={login()}
                                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-sky-500/20 transition-all hover:from-sky-400 hover:to-blue-500 hover:shadow-sky-500/30"
                                >
                                    <Shield className="h-4 w-4" />
                                    Masuk Staf
                                </Link>
                            )}
                        </nav>
                    </div>
                </header>

                {/* ── Hero ──────────────────────────────────────────── */}
                <main className="relative flex flex-1 flex-col items-center justify-center px-6 pt-16 pb-20 text-center">
                    {/* Badge */}
                    <div className="mb-8 inline-flex animate-in items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/[0.06] px-4 py-1.5 text-sm font-medium text-sky-400 backdrop-blur-sm fade-in slide-in-from-bottom-4">
                        <Sparkles className="h-3.5 w-3.5" />
                        Portal Manajemen Staf
                    </div>

                    {/* Heading */}
                    <h1 className="mb-6 max-w-4xl text-4xl leading-tight font-extrabold tracking-tight text-balance text-white sm:text-5xl md:text-6xl lg:text-7xl">
                        Kelola Bisnis{' '}
                        <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            Cuci Mobil
                        </span>{' '}
                        Anda
                    </h1>

                    <p className="mb-10 max-w-xl text-lg leading-relaxed text-balance text-slate-400">
                        Sistem manajemen operasional yang menyederhanakan
                        transaksi, antrian, staf, dan laporan — semua dalam satu
                        tempat.
                    </p>

                    {/* ── Stats Strip ─────────────────────────────────── */}
                    <div className="mb-12 grid w-full max-w-2xl grid-cols-3 gap-4">
                        <div className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-sm transition-all hover:border-white/[0.12] hover:bg-white/[0.04]">
                            <div className="mb-2 flex items-center justify-center">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10">
                                    <Car className="h-4 w-4 text-sky-400" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-white tabular-nums">
                                {stats?.transactions_today ?? 0}
                            </p>
                            <p className="mt-0.5 text-[11px] font-medium tracking-wider text-slate-500 uppercase">
                                Transaksi Hari Ini
                            </p>
                        </div>
                        <div className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-sm transition-all hover:border-white/[0.12] hover:bg-white/[0.04]">
                            <div className="mb-2 flex items-center justify-center">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                                    <Clock className="h-4 w-4 text-amber-400" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-white tabular-nums">
                                {stats?.queue_active ?? 0}
                            </p>
                            <p className="mt-0.5 text-[11px] font-medium tracking-wider text-slate-500 uppercase">
                                Dalam Antrian
                            </p>
                        </div>
                        <div className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-sm transition-all hover:border-white/[0.12] hover:bg-white/[0.04]">
                            <div className="mb-2 flex items-center justify-center">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                                    <ParkingCircle className="h-4 w-4 text-emerald-400" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-white tabular-nums">
                                {stats?.bays_active ?? 0}
                                <span className="text-lg text-slate-500">
                                    /2
                                </span>
                            </p>
                            <p className="mt-0.5 text-[11px] font-medium tracking-wider text-slate-500 uppercase">
                                Bay Terisi
                            </p>
                        </div>
                    </div>

                    {/* ── CTA Buttons ─────────────────────────────────── */}
                    <div className="flex flex-col items-center gap-4 sm:flex-row">
                        <button
                            onClick={() => router.get('/track')}
                            className="group inline-flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-white/[0.2] hover:bg-white/[0.08] hover:shadow-xl hover:shadow-white/5"
                        >
                            <Eye className="h-5 w-5 text-sky-400 transition-transform group-hover:scale-110" />
                            Lihat Status Antrian
                            <ArrowRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-0.5" />
                        </button>
                        {!auth.user && (
                            <Link
                                href={login()}
                                className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-sky-500/20 transition-all hover:from-sky-400 hover:to-blue-500 hover:shadow-2xl hover:shadow-sky-500/30"
                            >
                                <Shield className="h-5 w-5 transition-transform group-hover:scale-110" />
                                Akses Portal Staf
                                <ArrowRight className="h-4 w-4 text-sky-200 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                        )}
                    </div>

                    {/* ── Location Gallery ───────────────────────────── */}
                    <section
                        className="mt-20 w-full max-w-5xl text-left"
                        aria-labelledby="gallery-title"
                    >
                        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-sky-400 uppercase">
                                    Tentang RK Carwash
                                </p>
                                <h2
                                    id="gallery-title"
                                    className="text-2xl font-bold tracking-tight text-white sm:text-3xl"
                                >
                                    Tempat nyaman, hasil maksimal
                                </h2>
                            </div>
                            <div className="inline-flex items-center gap-2 text-sm text-slate-400">
                                <MapPin className="h-4 w-4 text-amber-300" />
                                Jl. H. Mr. Cokro Kusumo
                            </div>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-[1.45fr_1fr]">
                            <figure className="group relative min-h-72 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.03] shadow-2xl shadow-black/20 lg:min-h-[30rem]">
                                <img
                                    src="/assets/foto-1.jpeg"
                                    alt="Tim RK Carwash sedang mencuci mobil"
                                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />
                                <figcaption className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                                    <span className="mb-2 inline-flex rounded-full border border-white/15 bg-slate-950/50 px-3 py-1 text-xs font-semibold text-sky-200 backdrop-blur-md">
                                        Proses Pencucian
                                    </span>
                                    <p className="max-w-md text-lg font-semibold text-white">
                                        Perawatan kendaraan yang dikerjakan
                                        langsung oleh tim kami.
                                    </p>
                                </figcaption>
                            </figure>

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                                <figure className="group relative min-h-64 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.03] shadow-xl shadow-black/20 lg:min-h-0">
                                    <img
                                        src="/assets/foto-2.jpeg"
                                        alt="Ruang tunggu pelanggan RK Carwash"
                                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/10 to-transparent" />
                                    <figcaption className="absolute inset-x-0 bottom-0 p-5">
                                        <p className="font-semibold text-white">
                                            Ruang Tunggu Nyaman
                                        </p>
                                        <p className="mt-1 text-sm text-slate-300">
                                            Dilengkapi Wi-Fi untuk menemani
                                            waktu tunggu.
                                        </p>
                                    </figcaption>
                                </figure>

                                <figure className="group relative min-h-64 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.03] shadow-xl shadow-black/20 lg:min-h-0">
                                    <img
                                        src="/assets/foto-3.jpeg"
                                        alt="Area depan dan papan nama RK Carwash"
                                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/10 to-transparent" />
                                    <figcaption className="absolute inset-x-0 bottom-0 p-5">
                                        <p className="font-semibold text-white">
                                            Mudah Ditemukan
                                        </p>
                                        <p className="mt-1 text-sm text-slate-300">
                                            Melayani pencucian mobil dan motor.
                                        </p>
                                    </figcaption>
                                </figure>
                            </div>
                        </div>
                    </section>

                    {/* ── Features ────────────────────────────────────── */}
                    <div className="mt-20 grid w-full max-w-5xl gap-6 sm:grid-cols-3">
                        <div className="group relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-sky-500/20 hover:bg-white/[0.04] hover:shadow-2xl hover:shadow-sky-500/5">
                            <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-sky-500/5 blur-2xl transition-all group-hover:bg-sky-500/10" />
                            <div className="relative">
                                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20 transition-all group-hover:bg-sky-500/20 group-hover:ring-sky-500/30">
                                    <Car className="h-7 w-7" />
                                </div>
                                <h3 className="mb-3 text-lg font-bold text-white">
                                    Transaksi
                                </h3>
                                <p className="text-sm leading-relaxed text-slate-400">
                                    Buat transaksi, atur antrian, dan lacak
                                    status pencucian secara real-time dari satu
                                    layar.
                                </p>
                            </div>
                        </div>

                        <div className="group relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-cyan-500/20 hover:bg-white/[0.04] hover:shadow-2xl hover:shadow-cyan-500/5">
                            <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-cyan-500/5 blur-2xl transition-all group-hover:bg-cyan-500/10" />
                            <div className="relative">
                                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20 transition-all group-hover:bg-cyan-500/20 group-hover:ring-cyan-500/30">
                                    <Droplets className="h-7 w-7" />
                                </div>
                                <h3 className="mb-3 text-lg font-bold text-white">
                                    Manajemen Staf
                                </h3>
                                <p className="text-sm leading-relaxed text-slate-400">
                                    Tugaskan staf ke pekerjaan, lacak kinerja,
                                    dan hitung pendapatan mingguan secara
                                    otomatis.
                                </p>
                            </div>
                        </div>

                        <div className="group relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-emerald-500/20 hover:bg-white/[0.04] hover:shadow-2xl hover:shadow-emerald-500/5">
                            <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl transition-all group-hover:bg-emerald-500/10" />
                            <div className="relative">
                                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20 transition-all group-hover:bg-emerald-500/20 group-hover:ring-emerald-500/30">
                                    <Sparkles className="h-7 w-7" />
                                </div>
                                <h3 className="mb-3 text-lg font-bold text-white">
                                    Laporan
                                </h3>
                                <p className="text-sm leading-relaxed text-slate-400">
                                    Generate laporan harian, bulanan, dan tren
                                    pendapatan dengan sekali klik. Export siap
                                    cetak.
                                </p>
                            </div>
                        </div>
                    </div>
                </main>

                {/* ── Footer ─────────────────────────────────────────── */}
                <footer className="relative border-t border-white/[0.06] py-8 text-center">
                    <p className="text-sm text-slate-500">
                        © {new Date().getFullYear()} RK Carwash — Portal staf
                        internal.
                    </p>
                </footer>
            </div>
        </>
    );
}
