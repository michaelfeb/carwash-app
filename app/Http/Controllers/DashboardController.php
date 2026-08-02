<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Staff;
use App\Models\Transaction;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $businessToday = Transaction::currentBusinessDate();
        $today = $businessToday->toDateString();
        $weekStart = $businessToday->startOfWeek()->toDateString();
        $weekEnd = $businessToday->endOfWeek()->toDateString();

        // ── Today's stats ──
        $todayTransactions = Transaction::createdOnBusinessDate($today)->count();
        $todayRevenue = Transaction::createdOnBusinessDate($today)
            ->where('payment_status', 'paid')
            ->sum('price');
        $pendingPayments = Transaction::where('payment_status', 'unpaid')->count();
        $carsInProgress = Transaction::where('wash_status', 'washing')->count();

        // ── Today's profit breakdown ──
        $todayOwnerShare = Transaction::createdOnBusinessDate($today)
            ->where('payment_status', 'paid')
            ->sum('owner_share');
        $todayStaffPool = Transaction::createdOnBusinessDate($today)
            ->where('payment_status', 'paid')
            ->sum('staff_pool');
        $todayLoyaltyDiscount = Transaction::createdOnBusinessDate($today)
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
        $revenueChart = Transaction::query()
            ->where('payment_status', 'paid')
            ->createdBetweenBusinessDates($businessToday->subDays(29)->toDateString(), $today)
            ->get()
            ->groupBy(fn (Transaction $transaction) => $transaction->createdAtInBusinessTimezone()->toDateString())
            ->map(fn ($transactions, $date) => [
                'date' => $date,
                'revenue' => (int) $transactions->sum('price'),
                'count' => $transactions->count(),
            ])
            ->sortKeys()
            ->values();

        // ── Chart: Transaction count per carwash type (all time) ──
        $serviceChart = Transaction::join('carwash_types', 'transactions.carwash_type_id', '=', 'carwash_types.id')
            ->selectRaw('carwash_types.name, COUNT(*) as total')
            ->groupBy('carwash_types.id', 'carwash_types.name')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => [
                'name' => $row->name,
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
                'id' => $c->id,
                'name' => $c->name,
                'phone' => $c->phone,
                'transactions_count' => $c->transactions_count,
                'total_spending' => (int) $c->total_spending,
                'loyalty_stamps' => $c->loyalty_stamps,
            ]);

        // ── Staff Performance (this week) ──
        $staffPerformance = Staff::where('is_active', true)
            ->withCount(['transactions as weekly_transactions' => function ($q) use ($weekStart, $weekEnd) {
                $q->createdBetweenBusinessDates($weekStart, $weekEnd);
            }])
            ->withSum(['transactions as weekly_revenue' => function ($q) use ($weekStart, $weekEnd) {
                $q->createdBetweenBusinessDates($weekStart, $weekEnd)
                    ->where('payment_status', 'paid');
            }], 'price')
            ->orderByDesc('weekly_transactions')
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'weekly_transactions' => $s->weekly_transactions ?? 0,
                'weekly_revenue' => (int) ($s->weekly_revenue ?? 0),
            ]);

        return Inertia::render('dashboard', [
            'stats' => [
                'todayTransactions' => $todayTransactions,
                'todayRevenue' => $todayRevenue,
                'todayOwnerShare' => $todayOwnerShare,
                'todayStaffPool' => $todayStaffPool,
                'todayLoyaltyDiscount' => $todayLoyaltyDiscount,
                'pendingPayments' => $pendingPayments,
                'carsInProgress' => $carsInProgress,
                'totalCustomers' => $totalCustomers,
                'activeStaff' => $activeStaff,
            ],
            'recentTransactions' => $recentTransactions,
            'revenueChart' => $revenueChart,
            'serviceChart' => $serviceChart,
            'topCustomers' => $topCustomers,
            'staffPerformance' => $staffPerformance,
        ]);
    }
}
