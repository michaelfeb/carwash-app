<?php

namespace App\Http\Controllers;

use App\Models\PaymentMethod;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentMethodController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $paymentMethods = PaymentMethod::withCount('transactions')
            ->orderBy('name')
            ->get();

        return Inertia::render('payment-methods/index', [
            'paymentMethods' => $paymentMethods,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('payment-methods/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'is_active' => ['boolean'],
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;

        PaymentMethod::create($validated);

        return redirect()->route('payment-methods.index')->with('success', 'Payment method created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PaymentMethod $paymentMethod): Response
    {
        return Inertia::render('payment-methods/edit', [
            'paymentMethod' => $paymentMethod,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PaymentMethod $paymentMethod): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'is_active' => ['boolean'],
        ]);

        $paymentMethod->update($validated);

        return redirect()->route('payment-methods.index')->with('success', 'Payment method updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PaymentMethod $paymentMethod): RedirectResponse
    {
        $paymentMethod->delete();

        return redirect()->route('payment-methods.index')->with('success', 'Payment method deleted successfully.');
    }
}
