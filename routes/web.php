<?php

use App\Http\Controllers\CarwashTypeController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PaymentMethodController;
use App\Http\Controllers\QueueController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\TrackController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use App\Models\Transaction;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    $today = Transaction::currentBusinessDate()->toDateString();
    $todayStats = [
        'transactions_today' => Transaction::createdOnBusinessDate($today)->count(),
        'queue_active' => Transaction::createdOnBusinessDate($today)
            ->whereNotNull('queue_number')
            ->where('wash_status', '!=', 'done')
            ->count(),
        'bays_active' => Transaction::createdOnBusinessDate($today)
            ->whereNotNull('slot')
            ->where('wash_status', '!=', 'done')
            ->count(),
    ];

    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
        'stats' => $todayStats,
    ]);
})->name('home');

// Public tracking — no auth required
Route::get('/track', [TrackController::class, 'index'])->name('track.index');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Queue (accessible by all authenticated users)
    Route::get('/queue', [QueueController::class, 'index'])->name('queue.index');
    Route::put('/queue/{transaction}/assign', [QueueController::class, 'assign'])->name('queue.assign');
    Route::put('/queue/{transaction}/release', [QueueController::class, 'release'])->name('queue.release');

    // Transactions (accessible by all authenticated users)
    Route::resource('transactions', TransactionController::class)->except(['edit', 'update']);
    Route::get('transactions/{transaction}/receipt', [TransactionController::class, 'receipt'])->name('transactions.receipt');
    Route::put('transactions/{transaction}/status', [TransactionController::class, 'updateStatus'])->name('transactions.update-status');

    // Customers (accessible by all authenticated users)
    Route::resource('customers', CustomerController::class);

    // Reports (accessible by all authenticated users)
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/', [ReportController::class, 'index'])->name('index');
        Route::get('/daily/export', [ReportController::class, 'dailyExport'])->name('daily.export');
        Route::get('/monthly/export', [ReportController::class, 'monthlyExport'])->name('monthly.export');
        Route::get('/car-type/export', [ReportController::class, 'carTypeExport'])->name('car-type.export');
        Route::get('/staff/export', [ReportController::class, 'staffExport'])->name('staff.export');
        Route::get('/income-trend/export', [ReportController::class, 'incomeTrendExport'])->name('income-trend.export');
        Route::get('/payment-method/export', [ReportController::class, 'paymentMethodExport'])->name('payment-method.export');
        Route::get('/top-customer/export', [ReportController::class, 'topCustomerExport'])->name('top-customer.export');
        Route::get('/transaction-distribution/export', [ReportController::class, 'transactionDistributionExport'])->name('transaction-distribution.export');
    });

    // Owner-only routes
    Route::middleware('role:owner')->group(function () {
        Route::resource('users', UserController::class)->except(['show']);
        Route::resource('staffs', StaffController::class);
        Route::resource('carwash-types', CarwashTypeController::class);
        Route::resource('payment-methods', PaymentMethodController::class);
    });
});

require __DIR__.'/settings.php';
