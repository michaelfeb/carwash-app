<?php

namespace App\Http\Controllers;

use App\Models\CarwashType;
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
        return Inertia::render('reports/index', [
            'carwashTypes' => CarwashType::orderBy('name')->get(),
            'staffs' => Staff::orderBy('name')->get(),
        ]);
    }

    /**
     * Export daily transaction report.
     */
    public function dailyExport(Request $request): HttpResponse
    {
        $date = $request->input('date', today()->format('Y-m-d'));
        $parsedDate = Carbon::parse($date);

        $transactions = Transaction::with(['customer', 'carwashType', 'paymentMethod', 'user', 'staffs'])
            ->whereDate('created_at', $parsedDate)
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
        $month = $request->input('month', now()->format('Y-m'));
        $parsedDate = Carbon::parse($month . '-01');

        $transactions = Transaction::with(['carwashType'])
            ->whereYear('created_at', $parsedDate->year)
            ->whereMonth('created_at', $parsedDate->month)
            ->where('payment_status', 'paid')
            ->get();

        // Group by date
        $dailyData = $transactions->groupBy(function ($item) {
            return $item->created_at->format('Y-m-d');
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
        $dateFrom = $request->input('date_from', now()->startOfMonth()->format('Y-m-d'));
        $dateTo = $request->input('date_to', now()->format('Y-m-d'));

        $carTypes = CarwashType::withCount([
            'transactions' => function ($query) use ($dateFrom, $dateTo) {
                $query->whereBetween('created_at', [$dateFrom, $dateTo])
                    ->where('payment_status', 'paid');
            }
        ])->get()->map(function ($type) use ($dateFrom, $dateTo) {
            $type->revenue = $type->transactions()
                ->whereBetween('created_at', [$dateFrom, $dateTo])
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
     * Uses 60/40 share mechanism with equal distribution among working staff.
     */
    public function staffExport(Request $request): HttpResponse
    {
        $dateFrom = $request->input('date_from', now()->startOfMonth()->format('Y-m-d'));
        $dateTo = $request->input('date_to', now()->format('Y-m-d'));

        // Get all paid transactions in the period (using whereDate for proper date comparison)
        $transactions = Transaction::with('staffs')
            ->whereDate('created_at', '>=', $dateFrom)
            ->whereDate('created_at', '<=', $dateTo)
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

        // Calculate equal share per staff
        $equalShare = $workingStaffCount > 0 ? (int) floor($totalStaffPool / $workingStaffCount) : 0;

        // Get staff data with their transaction counts
        $staffs = Staff::whereIn('id', $workingStaffIds)
            ->get()
            ->map(function ($staff) use ($transactions, $equalShare) {
                // Count transactions this staff worked on
                $staffTransactions = $transactions->filter(function ($transaction) use ($staff) {
                    return $transaction->staffs->contains('id', $staff->id);
                });

                $staff->transaction_count = $staffTransactions->count();
                $staff->share_amount = $equalShare; // Equal share for all working staff
                return $staff;
            });

        $totalShareAmount = $workingStaffCount * $equalShare;

        $pdf = Pdf::loadView('reports.staff', [
            'staffs' => $staffs,
            'dateFrom' => Carbon::parse($dateFrom),
            'dateTo' => Carbon::parse($dateTo),
            'totalStaffPool' => $totalStaffPool,
            'totalShareAmount' => $totalShareAmount,
            'totalTransactions' => $totalTransactions,
            'workingStaffCount' => $workingStaffCount,
            'equalShare' => $equalShare,
        ]);

        return $pdf->download("staff-performance-{$dateFrom}-to-{$dateTo}.pdf");
    }

    /**
     * Export income trend report.
     */
    public function incomeTrendExport(Request $request): HttpResponse
    {
        $dateFrom = $request->input('date_from', now()->subDays(30)->format('Y-m-d'));
        $dateTo = $request->input('date_to', now()->format('Y-m-d'));

        $transactions = Transaction::where('payment_status', 'paid')
            ->whereBetween('created_at', [$dateFrom, $dateTo])
            ->get();

        // Group by date
        $dailyData = $transactions->groupBy(function ($item) {
            return $item->created_at->format('Y-m-d');
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
}
