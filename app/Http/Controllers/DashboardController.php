<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Staff;
use App\Models\Transaction;
use Illuminate\Http\Request;
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

        return Inertia::render('dashboard', [
            'stats' => [
                'todayTransactions' => $todayTransactions,
                'todayRevenue' => $todayRevenue,
                'pendingPayments' => $pendingPayments,
                'carsInProgress' => $carsInProgress,
                'totalCustomers' => $totalCustomers,
                'activeStaff' => $activeStaff,
            ],
            'recentTransactions' => $recentTransactions,
        ]);
    }
}
