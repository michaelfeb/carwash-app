<?php

namespace App\Http\Controllers;

use App\Models\CarwashType;
use App\Models\Customer;
use App\Models\PaymentMethod;
use App\Models\Staff;
use App\Models\Transaction;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class ReportController extends Controller
{
    /**
     * Display report page with filters.
     */
    public function index(): Response
    {
        $today = Transaction::currentBusinessDate();

        return Inertia::render('reports/index', [
            'carwashTypes' => CarwashType::orderBy('name')->get(),
            'staffs' => Staff::orderBy('name')->get(),
            'today' => $today->toDateString(),
            'thirtyDaysAgo' => $today->subDays(30)->toDateString(),
        ]);
    }

    /**
     * Export daily transaction report.
     */
    public function dailyExport(Request $request): HttpResponse
    {
        $date = $request->input('date', Transaction::currentBusinessDate()->toDateString());
        $parsedDate = Carbon::parse($date, Transaction::businessTimezone());

        $transactions = Transaction::with(['customer', 'carwashType', 'paymentMethod', 'user', 'staffs'])
            ->createdOnBusinessDate($date)
            ->orderBy('created_at')
            ->get();

        $totalRevenue = $transactions->where('payment_status', 'paid')->sum('price');
        $totalTransactions = $transactions->count();

        $pdf = Pdf::loadView('reports.daily', [
            'transactions' => $transactions,
            'date' => $parsedDate,
            'totalRevenue' => $totalRevenue,
            'totalTransactions' => $totalTransactions,
        ]);

        return $pdf->download("daily-report-{$date}.pdf");
    }

    /**
     * Export monthly revenue report.
     */
    public function monthlyExport(Request $request): HttpResponse
    {
        $month = $request->input('month', Transaction::currentBusinessDate()->format('Y-m'));
        $parsedDate = Carbon::parse($month.'-01', Transaction::businessTimezone());
        $dateFrom = $parsedDate->copy()->startOfMonth()->toDateString();
        $dateTo = $parsedDate->copy()->endOfMonth()->toDateString();

        $transactions = Transaction::with(['carwashType'])
            ->createdBetweenBusinessDates($dateFrom, $dateTo)
            ->where('payment_status', 'paid')
            ->get();

        // Group by date
        $dailyData = $transactions->groupBy(function ($item) {
            return $item->createdAtInBusinessTimezone()->format('Y-m-d');
        })->map(function ($items, $date) {
            return [
                'date' => $date,
                'count' => $items->count(),
                'revenue' => $items->sum('price'),
            ];
        })->values();

        $totalRevenue = $transactions->sum('price');
        $totalTransactions = $transactions->count();

        $pdf = Pdf::loadView('reports.monthly', [
            'dailyData' => $dailyData,
            'month' => $parsedDate,
            'totalRevenue' => $totalRevenue,
            'totalTransactions' => $totalTransactions,
        ]);

        return $pdf->download("monthly-report-{$month}.pdf");
    }

    /**
     * Export report by car type.
     */
    public function carTypeExport(Request $request): HttpResponse
    {
        $today = Transaction::currentBusinessDate();
        $dateFrom = $request->input('date_from', $today->startOfMonth()->toDateString());
        $dateTo = $request->input('date_to', $today->toDateString());

        $carTypes = CarwashType::withCount([
            'transactions' => function ($query) use ($dateFrom, $dateTo) {
                $query->createdBetweenBusinessDates($dateFrom, $dateTo)
                    ->where('payment_status', 'paid');
            },
        ])->get()->map(function ($type) use ($dateFrom, $dateTo) {
            $type->revenue = $type->transactions()
                ->createdBetweenBusinessDates($dateFrom, $dateTo)
                ->where('payment_status', 'paid')
                ->sum('price');

            return $type;
        });

        $totalRevenue = $carTypes->sum('revenue');
        $totalTransactions = $carTypes->sum('transactions_count');

        $pdf = Pdf::loadView('reports.car-type', [
            'carTypes' => $carTypes,
            'dateFrom' => Carbon::parse($dateFrom),
            'dateTo' => Carbon::parse($dateTo),
            'totalRevenue' => $totalRevenue,
            'totalTransactions' => $totalTransactions,
        ]);

        return $pdf->download("car-type-report-{$dateFrom}-to-{$dateTo}.pdf");
    }

    /**
     * Export staff performance report.
     * Uses 60/40 share mechanism with proportional distribution based on transaction count.
     */
    public function staffExport(Request $request): HttpResponse
    {
        $today = Transaction::currentBusinessDate();
        $dateFrom = $request->input('date_from', $today->startOfMonth()->toDateString());
        $dateTo = $request->input('date_to', $today->toDateString());

        // Get all paid transactions in the selected Makassar business-date period.
        $transactions = Transaction::with('staffs')
            ->createdBetweenBusinessDates($dateFrom, $dateTo)
            ->where('payment_status', 'paid')
            ->get();

        // Calculate total staff pool (40% of all paid transactions)
        $totalStaffPool = $transactions->sum('staff_pool');
        $totalTransactions = $transactions->count();

        // Get unique staff IDs who worked on transactions in the period
        $workingStaffIds = $transactions->flatMap(function ($transaction) {
            return $transaction->staffs->pluck('id');
        })->unique()->values();

        $workingStaffCount = $workingStaffIds->count();

        // Get staff data with their transaction counts
        $staffs = Staff::whereIn('id', $workingStaffIds)
            ->get()
            ->map(function ($staff) use ($transactions) {
                // Count transactions this staff worked on
                $staffTransactions = $transactions->filter(function ($transaction) use ($staff) {
                    return $transaction->staffs->contains('id', $staff->id);
                });

                $staff->transaction_count = $staffTransactions->count();

                return $staff;
            });

        // One transaction handled by three staff produces three staff assignments.
        $totalStaffAssignments = $staffs->sum('transaction_count');

        // Calculate proportional share for each staff
        $staffs = $staffs->map(function ($staff) use ($totalStaffPool, $totalStaffAssignments) {
            if ($totalStaffAssignments > 0) {
                // Share = (staff's handled transactions / total staff assignments) * total pool
                $staff->share_amount = (int) floor(
                    ($staff->transaction_count / $totalStaffAssignments) * $totalStaffPool
                );
                $staff->share_percentage = round(
                    ($staff->transaction_count / $totalStaffAssignments) * 100,
                    2
                );
            } else {
                $staff->share_amount = 0;
                $staff->share_percentage = 0;
            }

            return $staff;
        });

        $totalShareAmount = $staffs->sum('share_amount');

        $pdf = Pdf::loadView('reports.staff', [
            'staffs' => $staffs,
            'dateFrom' => Carbon::parse($dateFrom),
            'dateTo' => Carbon::parse($dateTo),
            'totalStaffPool' => $totalStaffPool,
            'totalShareAmount' => $totalShareAmount,
            'totalTransactions' => $totalTransactions,
            'workingStaffCount' => $workingStaffCount,
            'totalStaffAssignments' => $totalStaffAssignments,
        ]);

        return $pdf->download("staff-performance-{$dateFrom}-to-{$dateTo}.pdf");
    }

    /**
     * Export income trend report.
     */
    public function incomeTrendExport(Request $request): HttpResponse
    {
        $today = Transaction::currentBusinessDate();
        $dateFrom = $request->input('date_from', $today->subDays(30)->toDateString());
        $dateTo = $request->input('date_to', $today->toDateString());

        $transactions = Transaction::where('payment_status', 'paid')
            ->createdBetweenBusinessDates($dateFrom, $dateTo)
            ->get();

        // Group by date
        $dailyData = $transactions->groupBy(function ($item) {
            return $item->createdAtInBusinessTimezone()->format('Y-m-d');
        })->map(function ($items, $date) {
            return [
                'date' => $date,
                'count' => $items->count(),
                'revenue' => $items->sum('price'),
            ];
        })->sortKeys()->values();

        $totalRevenue = $transactions->sum('price');
        $averageDaily = $dailyData->count() > 0 ? $totalRevenue / $dailyData->count() : 0;

        $pdf = Pdf::loadView('reports.income-trend', [
            'dailyData' => $dailyData,
            'dateFrom' => Carbon::parse($dateFrom),
            'dateTo' => Carbon::parse($dateTo),
            'totalRevenue' => $totalRevenue,
            'averageDaily' => $averageDaily,
        ]);

        return $pdf->download("income-trend-{$dateFrom}-to-{$dateTo}.pdf");
    }

    /**
     * Export payment method report.
     */
    public function paymentMethodExport(Request $request): HttpResponse
    {
        $today = Transaction::currentBusinessDate();
        $dateFrom = $request->input('date_from', $today->startOfMonth()->toDateString());
        $dateTo = $request->input('date_to', $today->toDateString());

        $paymentMethods = PaymentMethod::withCount([
            'transactions' => function ($query) use ($dateFrom, $dateTo) {
                $query->createdBetweenBusinessDates($dateFrom, $dateTo)
                    ->where('payment_status', 'paid');
            },
        ])->get()->map(function ($method) use ($dateFrom, $dateTo) {
            $method->revenue = $method->transactions()
                ->createdBetweenBusinessDates($dateFrom, $dateTo)
                ->where('payment_status', 'paid')
                ->sum('price');

            return $method;
        });

        $totalTransactions = $paymentMethods->sum('transactions_count');
        $totalRevenue = $paymentMethods->sum('revenue');

        // Calculate percentage
        $paymentMethods = $paymentMethods->map(function ($method) use ($totalTransactions) {
            $method->percentage = $totalTransactions > 0
                ? round(($method->transactions_count / $totalTransactions) * 100, 1)
                : 0;

            return $method;
        });

        $pdf = Pdf::loadView('reports.payment-method', [
            'paymentMethods' => $paymentMethods,
            'dateFrom' => Carbon::parse($dateFrom),
            'dateTo' => Carbon::parse($dateTo),
            'totalTransactions' => $totalTransactions,
            'totalRevenue' => $totalRevenue,
        ]);

        return $pdf->download("payment-method-report-{$dateFrom}-to-{$dateTo}.pdf");
    }

    /**
     * Export top customer report.
     */
    public function topCustomerExport(Request $request): HttpResponse
    {
        $today = Transaction::currentBusinessDate();
        $dateFrom = $request->input('date_from', $today->startOfMonth()->toDateString());
        $dateTo = $request->input('date_to', $today->toDateString());

        $customers = Customer::withCount([
            'transactions' => function ($query) use ($dateFrom, $dateTo) {
                $query->createdBetweenBusinessDates($dateFrom, $dateTo)
                    ->where('payment_status', 'paid');
            },
        ])->get()->map(function ($customer) use ($dateFrom, $dateTo) {
            $customer->total_spending = $customer->transactions()
                ->createdBetweenBusinessDates($dateFrom, $dateTo)
                ->where('payment_status', 'paid')
                ->sum('price');

            $lastTransaction = $customer->transactions()
                ->createdBetweenBusinessDates($dateFrom, $dateTo)
                ->where('payment_status', 'paid')
                ->latest('created_at')
                ->first();

            $customer->last_transaction_date = $lastTransaction?->createdAtInBusinessTimezone()->toDateString();

            return $customer;
        })->filter(function ($customer) {
            return $customer->transactions_count > 0;
        })->sortByDesc('total_spending')->values();

        $totalCustomers = $customers->count();
        $totalRevenue = $customers->sum('total_spending');

        $pdf = Pdf::loadView('reports.top-customer', [
            'customers' => $customers,
            'dateFrom' => Carbon::parse($dateFrom),
            'dateTo' => Carbon::parse($dateTo),
            'totalCustomers' => $totalCustomers,
            'totalRevenue' => $totalRevenue,
        ]);

        return $pdf->download("top-customer-report-{$dateFrom}-to-{$dateTo}.pdf");
    }

    /**
     * Export transaction distribution report.
     */
    public function transactionDistributionExport(Request $request): HttpResponse
    {
        $today = Transaction::currentBusinessDate();
        $dateFrom = $request->input('date_from', $today->subDays(30)->toDateString());
        $dateTo = $request->input('date_to', $today->toDateString());

        $transactions = Transaction::where('payment_status', 'paid')
            ->createdBetweenBusinessDates($dateFrom, $dateTo)
            ->get();

        // Group by date
        $dailyData = $transactions->groupBy(function ($item) {
            return $item->createdAtInBusinessTimezone()->format('Y-m-d');
        })->map(function ($items, $date) {
            return [
                'date' => $date,
                'count' => $items->count(),
                'revenue' => $items->sum('price'),
            ];
        })->sortKeys()->values();

        $totalTransactions = $transactions->count();
        $totalRevenue = $transactions->sum('price');
        $averageDaily = $dailyData->count() > 0 ? $totalRevenue / $dailyData->count() : 0;

        $pdf = Pdf::loadView('reports.transaction-distribution', [
            'dailyData' => $dailyData,
            'dateFrom' => Carbon::parse($dateFrom),
            'dateTo' => Carbon::parse($dateTo),
            'totalTransactions' => $totalTransactions,
            'totalRevenue' => $totalRevenue,
            'averageDaily' => $averageDaily,
        ]);

        return $pdf->download("transaction-distribution-{$dateFrom}-to-{$dateTo}.pdf");
    }
}
