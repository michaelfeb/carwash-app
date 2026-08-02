<?php

namespace App\Http\Controllers;

use App\Models\Staff;
use App\Models\Transaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StaffController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $staffs = Staff::withCount('transactions')
            ->withCount([
                'transactions as paid_transactions_count' => fn ($query) => $query
                    ->where('transactions.payment_status', 'paid'),
            ])
            ->orderBy('staffs.name')
            ->get();

        $totalStaffPool = Transaction::where('payment_status', 'paid')->sum('staff_pool');
        $totalPaidAssignments = $staffs->sum('paid_transactions_count');

        $staffs->each(function (Staff $staff) use ($totalStaffPool, $totalPaidAssignments): void {
            $estimatedEarnings = $totalPaidAssignments > 0
                ? (int) floor(($staff->paid_transactions_count / $totalPaidAssignments) * $totalStaffPool)
                : 0;

            $staff->setAttribute('transaction_earnings', $estimatedEarnings);
            $staff->makeHidden('paid_transactions_count');
        });

        return Inertia::render('staffs/index', [
            'staffs' => $staffs,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('staffs/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'is_active' => ['boolean'],
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;

        Staff::create($validated);

        return redirect()->route('staffs.index')->with('success', 'Staff created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Staff $staff): Response
    {
        return Inertia::render('staffs/edit', [
            'staff' => $staff,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Staff $staff): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'is_active' => ['boolean'],
        ]);

        $staff->update($validated);

        return redirect()->route('staffs.index')->with('success', 'Staff updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Staff $staff): RedirectResponse
    {
        $staff->delete();

        return redirect()->route('staffs.index')->with('success', 'Staff deleted successfully.');
    }
}
