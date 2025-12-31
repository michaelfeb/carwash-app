<?php

use App\Http\Controllers\CarwashTypeController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PaymentMethodController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Transactions (accessible by all authenticated users)
    Route::resource('transactions', TransactionController::class)->except(['edit', 'update']);
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
    });

    // Owner-only routes
    Route::middleware('role:owner')->group(function () {
        Route::resource('users', UserController::class)->except(['show']);
        Route::resource('staffs', StaffController::class);
        Route::resource('carwash-types', CarwashTypeController::class);
        Route::resource('payment-methods', PaymentMethodController::class);
    });
});

require __DIR__ . '/settings.php';
