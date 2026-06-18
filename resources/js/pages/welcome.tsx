import { dashboard, login } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowRight, Car, Clock, Droplets, Eye, ParkingCircle, Shield, Sparkles } from 'lucide-react';

interface WelcomeStats {
    transactions_today: number;
    queue_active: number;
    bays_active: number;
}

export default function Welcome() {
    const { auth, stats } = usePage<SharedData & { stats: WelcomeStats }>().props;

    return (
        <>
            <Head title="CarWash Pro">
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
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 shadow-lg shadow-sky-500/20">
                                <Car className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white">CarWash Pro</span>
                        </div>
                        <nav className="flex items-center gap-2">
                            <button
                                onClick={() => router.get('/track')}
                                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-sm transition-all hover:border-white/[0.15] hover:bg-white/[0.06] hover:text-white"
                            >
                                <Eye className="h-4 w-4" />
                                <span className="hidden sm:inline">Lacak Antrian</span>
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
                <main className="relative flex flex-1 flex-col items-center justify-center px-6 pb-20 pt-16 text-center">
                    {/* Badge */}
                    <div className="mb-8 inline-flex animate-in fade-in slide-in-from-bottom-4 items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/[0.06] px-4 py-1.5 text-sm font-medium text-sky-400 backdrop-blur-sm">
                        <Sparkles className="h-3.5 w-3.5" />
                        Portal Manajemen Staf
                    </div>

                    {/* Heading */}
                    <h1 className="mb-6 max-w-4xl text-balance text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                        Kelola Bisnis{' '}
                        <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            Cuci Mobil
                        </span>{' '}
                        Anda
                    </h1>

                    <p className="mb-10 max-w-xl text-balance text-lg leading-relaxed text-slate-400">
                        Sistem manajemen operasional yang menyederhanakan transaksi, antrian, staf, dan
                        laporan — semua dalam satu tempat.
                    </p>

                    {/* ── Stats Strip ─────────────────────────────────── */}
                    <div className="mb-12 grid w-full max-w-2xl grid-cols-3 gap-4">
                        <div className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-sm transition-all hover:border-white/[0.12] hover:bg-white/[0.04]">
                            <div className="mb-2 flex items-center justify-center">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10">
                                    <Car className="h-4 w-4 text-sky-400" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold tabular-nums text-white">{stats?.transactions_today ?? 0}</p>
                            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-slate-500">Transaksi Hari Ini</p>
                        </div>
                        <div className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-sm transition-all hover:border-white/[0.12] hover:bg-white/[0.04]">
                            <div className="mb-2 flex items-center justify-center">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                                    <Clock className="h-4 w-4 text-amber-400" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold tabular-nums text-white">{stats?.queue_active ?? 0}</p>
                            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-slate-500">Dalam Antrian</p>
                        </div>
                        <div className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-sm transition-all hover:border-white/[0.12] hover:bg-white/[0.04]">
                            <div className="mb-2 flex items-center justify-center">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                                    <ParkingCircle className="h-4 w-4 text-emerald-400" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold tabular-nums text-white">
                                {stats?.bays_active ?? 0}<span className="text-lg text-slate-500">/2</span>
                            </p>
                            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-slate-500">Bay Terisi</p>
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

                    {/* ── Features ────────────────────────────────────── */}
                    <div className="mt-24 grid w-full max-w-5xl gap-6 sm:grid-cols-3">
                        <div className="group relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-sky-500/20 hover:bg-white/[0.04] hover:shadow-2xl hover:shadow-sky-500/5">
                            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-sky-500/5 blur-2xl transition-all group-hover:bg-sky-500/10" />
                            <div className="relative">
                                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20 transition-all group-hover:bg-sky-500/20 group-hover:ring-sky-500/30">
                                    <Car className="h-7 w-7" />
                                </div>
                                <h3 className="mb-3 text-lg font-bold text-white">Transaksi</h3>
                                <p className="text-sm leading-relaxed text-slate-400">
                                    Buat transaksi, atur antrian, dan lacak status pencucian secara real-time dari satu layar.
                                </p>
                            </div>
                        </div>

                        <div className="group relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-cyan-500/20 hover:bg-white/[0.04] hover:shadow-2xl hover:shadow-cyan-500/5">
                            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-cyan-500/5 blur-2xl transition-all group-hover:bg-cyan-500/10" />
                            <div className="relative">
                                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20 transition-all group-hover:bg-cyan-500/20 group-hover:ring-cyan-500/30">
                                    <Droplets className="h-7 w-7" />
                                </div>
                                <h3 className="mb-3 text-lg font-bold text-white">Manajemen Staf</h3>
                                <p className="text-sm leading-relaxed text-slate-400">
                                    Tugaskan staf ke pekerjaan, lacak kinerja, dan hitung pendapatan mingguan secara otomatis.
                                </p>
                            </div>
                        </div>

                        <div className="group relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-emerald-500/20 hover:bg-white/[0.04] hover:shadow-2xl hover:shadow-emerald-500/5">
                            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl transition-all group-hover:bg-emerald-500/10" />
                            <div className="relative">
                                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20 transition-all group-hover:bg-emerald-500/20 group-hover:ring-emerald-500/30">
                                    <Sparkles className="h-7 w-7" />
                                </div>
                                <h3 className="mb-3 text-lg font-bold text-white">Laporan</h3>
                                <p className="text-sm leading-relaxed text-slate-400">
                                    Generate laporan harian, bulanan, dan tren pendapatan dengan sekali klik. Export siap cetak.
                                </p>
                            </div>
                        </div>
                    </div>
                </main>

                {/* ── Footer ─────────────────────────────────────────── */}
                <footer className="relative border-t border-white/[0.06] py-8 text-center">
                    <p className="text-sm text-slate-500">
                        © {new Date().getFullYear()} CarWash Pro — Portal staf internal.
                    </p>
                </footer>
            </div>
        </>
    );
}
