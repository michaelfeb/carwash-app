import { dashboard, login } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Car, Droplets, Shield, Sparkles } from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="CarWash Pro">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=inter:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>

            <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
                {/* Header */}
                <header className="container mx-auto flex items-center justify-between px-6 py-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400">
                            <Car className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">CarWash Pro</span>
                    </div>
                    <nav>
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25"
                            >
                                Go to Dashboard
                            </Link>
                        ) : (
                            <Link
                                href={login()}
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25"
                            >
                                Staff Login
                            </Link>
                        )}
                    </nav>
                </header>

                {/* Hero Section */}
                <main className="container mx-auto flex flex-1 flex-col items-center justify-center px-6 text-center">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-400">
                        <Sparkles className="h-4 w-4" />
                        Staff Management Portal
                    </div>

                    <h1 className="mb-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
                        Manage Your
                        <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> Carwash </span>
                        Business
                    </h1>

                    <p className="mb-10 max-w-xl text-lg text-slate-400">
                        Streamline your operations with our comprehensive management system.
                        Track transactions, manage staff, and generate reports effortlessly.
                    </p>

                    {!auth.user && (
                        <Link
                            href={login()}
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:shadow-xl hover:shadow-blue-500/20"
                        >
                            <Shield className="h-5 w-5" />
                            Access Staff Portal
                        </Link>
                    )}

                    {/* Features */}
                    <div className="mt-20 grid w-full max-w-4xl gap-6 sm:grid-cols-3">
                        <div className="group rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 transition-all hover:border-blue-500/50 hover:bg-slate-800">
                            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 transition-colors group-hover:bg-blue-500/20">
                                <Car className="h-6 w-6" />
                            </div>
                            <h3 className="mb-2 text-lg font-semibold text-white">Transactions</h3>
                            <p className="text-sm text-slate-400">
                                Create and track car wash transactions with real-time status updates.
                            </p>
                        </div>

                        <div className="group rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 transition-all hover:border-cyan-500/50 hover:bg-slate-800">
                            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 transition-colors group-hover:bg-cyan-500/20">
                                <Droplets className="h-6 w-6" />
                            </div>
                            <h3 className="mb-2 text-lg font-semibold text-white">Staff Management</h3>
                            <p className="text-sm text-slate-400">
                                Assign washmen to jobs and track their performance metrics.
                            </p>
                        </div>

                        <div className="group rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 transition-all hover:border-emerald-500/50 hover:bg-slate-800">
                            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 transition-colors group-hover:bg-emerald-500/20">
                                <Sparkles className="h-6 w-6" />
                            </div>
                            <h3 className="mb-2 text-lg font-semibold text-white">Reports</h3>
                            <p className="text-sm text-slate-400">
                                Generate daily, monthly, and performance reports with one click.
                            </p>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="container mx-auto px-6 py-8 text-center">
                    <p className="text-sm text-slate-500">
                        © {new Date().getFullYear()} CarWash Pro. Internal staff portal.
                    </p>
                </footer>
            </div>
        </>
    );
}
