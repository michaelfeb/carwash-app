<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Staff;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $today = now()->startOfDay();

        // Today's stats
        $todayTransactions = Transaction::whereDate('created_at', $today)->count();
        $todayRevenue = Transaction::whereDate('created_at', $today)
            ->where('payment_status', 'paid')
            ->sum('price');
        $pendingPayments = Transaction::where('payment_status', 'unpaid')->count();
        $carsInProgress = Transaction::where('wash_status', 'washing')->count();

        // Recent transactions
        $recentTransactions = Transaction::with(['customer', 'carwashType', 'user'])
            ->latest()
            ->take(5)
            ->get();

        // Overall stats
        $totalCustomers = Customer::count();
        $activeStaff = Staff::where('is_active', true)->count();

        // Chart: Daily revenue for the last 30 days
        $revenueChart = Transaction::selectRaw('DATE(created_at) as date, SUM(price) as revenue, COUNT(*) as count')
            ->where('payment_status', 'paid')
            ->where('created_at', '>=', now()->subDays(29)->startOfDay())
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn ($row) => [
                'date'    => $row->date,
                'revenue' => (int) $row->revenue,
                'count'   => (int) $row->count,
            ]);

        // Chart: Transaction count per carwash type (all time)
        $serviceChart = Transaction::join('carwash_types', 'transactions.carwash_type_id', '=', 'carwash_types.id')
            ->selectRaw('carwash_types.name, COUNT(*) as total')
            ->groupBy('carwash_types.id', 'carwash_types.name')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => [
                'name'  => $row->name,
                'total' => (int) $row->total,
            ]);

        return Inertia::render('dashboard', [
            'stats' => [
                'todayTransactions' => $todayTransactions,
                'todayRevenue'      => $todayRevenue,
                'pendingPayments'   => $pendingPayments,
                'carsInProgress'    => $carsInProgress,
                'totalCustomers'    => $totalCustomers,
                'activeStaff'       => $activeStaff,
            ],
            'recentTransactions' => $recentTransactions,
            'revenueChart'       => $revenueChart,
            'serviceChart'       => $serviceChart,
        ]);
    }
}
