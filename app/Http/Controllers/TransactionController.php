<?php

namespace App\Http\Controllers;

use App\Models\CarwashType;
use App\Models\Customer;
use App\Models\PaymentMethod;
use App\Models\Staff;
use App\Models\Transaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = Transaction::with(['customer', 'carwashType', 'paymentMethod', 'user', 'staffs'])
            ->latest();

        // Filter by wash status
        if ($request->filled('wash_status')) {
            $query->where('wash_status', $request->wash_status);
        }

        // Filter by payment status
        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        // Filter by date range — default to today if not provided
        $dateFrom = $request->filled('date_from') ? $request->date_from : now()->toDateString();
        $dateTo   = $request->filled('date_to')   ? $request->date_to   : now()->toDateString();
        $query->whereDate('created_at', '>=', $dateFrom)
            ->whereDate('created_at', '<=', $dateTo);

        // Search by invoice number or license plate
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                    ->orWhere('license_plate', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });
        }

        $transactions = $query->paginate(15)->withQueryString();

        return Inertia::render('transactions/index', [
            'transactions' => $transactions,
            'filters' => [
                'wash_status'    => $request->wash_status,
                'payment_status' => $request->payment_status,
                'date_from'      => $dateFrom,
                'date_to'        => $dateTo,
                'search'         => $request->search,
            ],
            'paymentMethods' => PaymentMethod::where('is_active', true)->orderBy('name')->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $customers = Customer::orderBy('name')->get()->map(function ($customer) {
            return [
                'id' => $customer->id,
                'name' => $customer->name,
                'phone' => $customer->phone,
                'address' => $customer->address,
                'notes' => $customer->notes,
                'loyalty_stamps' => $customer->loyalty_stamps,
                'loyalty_progress' => $customer->getLoyaltyProgress(),
            ];
        });

        return Inertia::render('transactions/create', [
            'customers' => $customers,
            'carwashTypes' => CarwashType::where('is_active', true)->orderBy('name')->get(),
            'paymentMethods' => PaymentMethod::where('is_active', true)->orderBy('name')->get(),
            'staffs' => Staff::where('is_active', true)->orderBy('name')->get(),
            'loyaltyConfig' => [
                'stamp_threshold' => Transaction::LOYALTY_STAMP_THRESHOLD,
                'discount_percent' => (int) (Transaction::LOYALTY_DISCOUNT_PERCENT * 100),
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'customer_id' => ['nullable', 'exists:customers,id'],
            'carwash_type_id' => ['required', 'exists:carwash_types,id'],
            'payment_method_id' => ['nullable', 'exists:payment_methods,id'],
            'license_plate' => ['nullable', 'string', 'max:20'],
            'price' => ['required', 'integer', 'min:0'],
            'payment_status' => ['required', 'in:unpaid,paid'],
            'notes' => ['nullable', 'string'],
            'staffs' => ['required', 'array', 'min:1'],
            'staffs.*' => ['required', 'exists:staffs,id'],
        ]);

        DB::transaction(function () use ($validated, $request) {
            $price = $validated['price'];
            $originalPrice = null;
            $loyaltyDiscountApplied = false;
            $customer = null;

            // Handle loyalty discount for registered customers
            if ($validated['customer_id']) {
                $customer = Customer::find($validated['customer_id']);

                if ($customer && $customer->isEligibleForDiscount()) {
                    // Apply 25% loyalty discount
                    $originalPrice = $price;
                    $price = (int) floor($price * (1 - Transaction::LOYALTY_DISCOUNT_PERCENT));
                    $loyaltyDiscountApplied = true;
                    // Reset stamps
                    $customer->update(['loyalty_stamps' => 0]);
                } elseif ($customer) {
                    // Increment stamp
                    $customer->increment('loyalty_stamps');
                }
            }

            // Calculate 60/40 shares from the FINAL price (after discount)
            $shares = Transaction::calculateShares($price);

            // Create transaction
            $transaction = Transaction::create([
                'invoice_number' => Transaction::generateInvoiceNumber(),
                'customer_id' => $validated['customer_id'],
                'carwash_type_id' => $validated['carwash_type_id'],
                'user_id' => auth()->id(),
                'payment_method_id' => $validated['payment_method_id'],
                'license_plate' => $validated['license_plate'],
                'price' => $price,
                'original_price' => $originalPrice,
                'owner_share' => $shares['owner_share'],
                'staff_pool' => $shares['staff_pool'],
                'payment_status' => $validated['payment_status'],
                'wash_status' => 'waiting',
                'paid_at' => $validated['payment_status'] === 'paid' ? now() : null,
                'notes' => $validated['notes'],
                'queue_number' => Transaction::generateQueueNumber(),
                'loyalty_discount_applied' => $loyaltyDiscountApplied,
            ]);

            // Attach staffs (without individual fees - will be calculated weekly)
            $transaction->staffs()->attach($validated['staffs']);
        });

        return redirect()->route('transactions.index')->with('success', 'Transaction created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Transaction $transaction): Response
    {
        $transaction->load(['customer', 'carwashType', 'paymentMethod', 'user', 'staffs']);

        return Inertia::render('transactions/show', [
            'transaction' => $transaction,
            'paymentMethods' => PaymentMethod::where('is_active', true)->orderBy('name')->get(),
        ]);
    }

    /**
     * Update transaction status (wash or payment).
     */
    public function updateStatus(Request $request, Transaction $transaction): RedirectResponse
    {
        $validated = $request->validate([
            'wash_status' => ['nullable', 'in:waiting,washing,done'],
            'payment_status' => ['nullable', 'in:unpaid,paid'],
            'payment_method_id' => ['nullable', 'exists:payment_methods,id'],
        ]);

        if (isset($validated['wash_status'])) {
            $transaction->wash_status = $validated['wash_status'];

            // Clear queue data when wash is marked done
            if ($validated['wash_status'] === 'done') {
                $transaction->queue_number = null;
                $transaction->slot = null;
            }
        }

        if (isset($validated['payment_status'])) {
            $transaction->payment_status = $validated['payment_status'];
            if ($validated['payment_status'] === 'paid') {
                $transaction->paid_at = now();
                if (isset($validated['payment_method_id'])) {
                    $transaction->payment_method_id = $validated['payment_method_id'];
                }
            }
        }

        $transaction->save();

        return back()->with('success', 'Transaction status updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Transaction $transaction): RedirectResponse
    {
        $transaction->delete();

        return redirect()->route('transactions.index')->with('success', 'Transaction deleted successfully.');
    }
}
