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
        $weekStart = now()->startOfWeek();
        $weekEnd = now()->endOfWeek();

        // ── Today's stats ──
        $todayTransactions = Transaction::whereDate('created_at', $today)->count();
        $todayRevenue = Transaction::whereDate('created_at', $today)
            ->where('payment_status', 'paid')
            ->sum('price');
        $pendingPayments = Transaction::where('payment_status', 'unpaid')->count();
        $carsInProgress = Transaction::where('wash_status', 'washing')->count();

        // ── Today's profit breakdown ──
        $todayOwnerShare = Transaction::whereDate('created_at', $today)
            ->where('payment_status', 'paid')
            ->sum('owner_share');
        $todayStaffPool = Transaction::whereDate('created_at', $today)
            ->where('payment_status', 'paid')
            ->sum('staff_pool');
        $todayLoyaltyDiscount = Transaction::whereDate('created_at', $today)
            ->where('loyalty_discount_applied', true)
            ->where('payment_status', 'paid')
            ->selectRaw('COALESCE(SUM(original_price - price), 0) as total')
            ->value('total') ?? 0;

        // ── Recent transactions ──
        $recentTransactions = Transaction::with(['customer', 'carwashType', 'user'])
            ->latest()
            ->take(5)
            ->get();

        // ── Overall stats ──
        $totalCustomers = Customer::count();
        $activeStaff = Staff::where('is_active', true)->count();

        // ── Chart: Daily revenue for the last 30 days ──
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

        // ── Chart: Transaction count per carwash type (all time) ──
        $serviceChart = Transaction::join('carwash_types', 'transactions.carwash_type_id', '=', 'carwash_types.id')
            ->selectRaw('carwash_types.name, COUNT(*) as total')
            ->groupBy('carwash_types.id', 'carwash_types.name')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => [
                'name'  => $row->name,
                'total' => (int) $row->total,
            ]);

        // ── Top Customers (by total spending, all time) ──
        $topCustomers = Customer::whereHas('transactions', function ($q) {
                $q->where('payment_status', 'paid');
            })
            ->withCount('transactions')
            ->withSum(['transactions as total_spending' => function ($q) {
                $q->where('payment_status', 'paid');
            }], 'price')
            ->orderByDesc('total_spending')
            ->take(5)
            ->get()
            ->map(fn ($c) => [
                'id'               => $c->id,
                'name'             => $c->name,
                'phone'            => $c->phone,
                'transactions_count' => $c->transactions_count,
                'total_spending'   => (int) $c->total_spending,
                'loyalty_stamps'   => $c->loyalty_stamps,
            ]);

        // ── Staff Performance (this week) ──
        $staffPerformance = Staff::where('is_active', true)
            ->withCount(['transactions as weekly_transactions' => function ($q) use ($weekStart, $weekEnd) {
                $q->whereBetween('transactions.created_at', [$weekStart, $weekEnd]);
            }])
            ->withSum(['transactions as weekly_revenue' => function ($q) use ($weekStart, $weekEnd) {
                $q->whereBetween('transactions.created_at', [$weekStart, $weekEnd])
                  ->where('payment_status', 'paid');
            }], 'price')
            ->orderByDesc('weekly_transactions')
            ->get()
            ->map(fn ($s) => [
                'id'                  => $s->id,
                'name'                => $s->name,
                'weekly_transactions' => $s->weekly_transactions ?? 0,
                'weekly_revenue'      => (int) ($s->weekly_revenue ?? 0),
            ]);

        return Inertia::render('dashboard', [
            'stats' => [
                'todayTransactions'    => $todayTransactions,
                'todayRevenue'         => $todayRevenue,
                'todayOwnerShare'       => $todayOwnerShare,
                'todayStaffPool'       => $todayStaffPool,
                'todayLoyaltyDiscount' => $todayLoyaltyDiscount,
                'pendingPayments'      => $pendingPayments,
                'carsInProgress'       => $carsInProgress,
                'totalCustomers'       => $totalCustomers,
                'activeStaff'          => $activeStaff,
            ],
            'recentTransactions' => $recentTransactions,
            'revenueChart'       => $revenueChart,
            'serviceChart'       => $serviceChart,
            'topCustomers'       => $topCustomers,
            'staffPerformance'   => $staffPerformance,
        ]);
    }
}
