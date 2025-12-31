<?php

namespace App\Http\Controllers;

use App\Models\CarwashType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CarwashTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $carwashTypes = CarwashType::withCount('transactions')
            ->orderBy('size_category')
            ->get();

        return Inertia::render('carwash-types/index', [
            'carwashTypes' => $carwashTypes,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('carwash-types/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'size_category' => ['required', 'string', 'max:50'],
            'min_price' => ['required', 'integer', 'min:0'],
            'max_price' => ['required', 'integer', 'min:0', 'gte:min_price'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;

        CarwashType::create($validated);

        return redirect()->route('carwash-types.index')->with('success', 'Carwash type created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(CarwashType $carwashType): Response
    {
        return Inertia::render('carwash-types/edit', [
            'carwashType' => $carwashType,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CarwashType $carwashType): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'size_category' => ['required', 'string', 'max:50'],
            'min_price' => ['required', 'integer', 'min:0'],
            'max_price' => ['required', 'integer', 'min:0', 'gte:min_price'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        $carwashType->update($validated);

        return redirect()->route('carwash-types.index')->with('success', 'Carwash type updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CarwashType $carwashType): RedirectResponse
    {
        $carwashType->delete();

        return redirect()->route('carwash-types.index')->with('success', 'Carwash type deleted successfully.');
    }
}
