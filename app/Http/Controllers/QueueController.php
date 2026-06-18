<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class QueueController extends Controller
{
    /**
     * Available wash bays.
     */
    private const BAYS = [
        ['key' => 'bay_1', 'label' => 'Bay 1'],
        ['key' => 'bay_2', 'label' => 'Bay 2'],
    ];

    /**
     * Display the queue management screen.
     */
    public function index(Request $request): Response
    {
        $date = $request->filled('date') ? $request->date : now()->toDateString();

        // Fetch active slots (cars currently assigned to each bay and not yet done)
        $activeSlots = [];
        foreach (self::BAYS as $bay) {
            $activeSlots[$bay['key']] = Transaction::with(['customer', 'carwashType', 'staffs'])
                ->whereDate('created_at', $date)
                ->where('slot', $bay['key'])
                ->where('wash_status', '!=', 'done')
                ->first();
        }

        // Fetch waiting list (queued, not assigned to any slot, not done)
        $waitingList = Transaction::with(['customer', 'carwashType', 'staffs'])
            ->whereDate('created_at', $date)
            ->whereNotNull('queue_number')
            ->whereNull('slot')
            ->where('wash_status', '!=', 'done')
            ->orderBy('queue_number')
            ->get();

        return Inertia::render('queue/index', [
            'bays' => self::BAYS,
            'activeSlots' => $activeSlots,
            'waitingList' => $waitingList,
            'date' => $date,
        ]);
    }

    /**
     * Assign a waiting transaction to a specific bay.
     */
    public function assign(Request $request, Transaction $transaction): RedirectResponse
    {
        $validated = $request->validate([
            'slot' => ['required', 'string', 'in:bay_1,bay_2'],
        ]);

        $targetSlot = $validated['slot'];

        // Guard: transaction must be in waiting state
        if ($transaction->queue_number === null || $transaction->slot !== null || $transaction->wash_status !== 'waiting') {
            return redirect()->route('queue.index', ['date' => $request->date])
                ->with('error', 'Transaksi ini tidak dalam status menunggu antrian.');
        }

        // Guard: transaction must not already be done
        if ($transaction->wash_status === 'done') {
            return redirect()->route('queue.index', ['date' => $request->date])
                ->with('error', 'Transaksi ini sudah selesai.');
        }

        // Guard: target bay must be free
        $occupied = Transaction::where('slot', $targetSlot)
            ->where('wash_status', '!=', 'done')
            ->exists();

        if ($occupied) {
            return redirect()->route('queue.index', ['date' => $request->date])
                ->with('error', "{$targetSlot} sudah terisi. Selesaikan dulu transaksi yang sedang berjalan.");
        }

        DB::transaction(function () use ($transaction, $targetSlot) {
            $transaction->update([
                'slot' => $targetSlot,
                'wash_status' => 'washing',
            ]);
        });

        return redirect()->route('queue.index', ['date' => $request->date])
            ->with('success', "Transaksi #{$transaction->queue_number} berhasil ditugaskan ke {$targetSlot}.");
    }

    /**
     * Release a transaction from its bay (mark wash as done, clear queue data).
     */
    public function release(Request $request, Transaction $transaction): RedirectResponse
    {
        // Guard: transaction must be assigned to a bay
        if ($transaction->slot === null) {
            return redirect()->route('queue.index', ['date' => $request->date])
                ->with('error', 'Transaksi ini tidak sedang berada di bay manapun.');
        }

        DB::transaction(function () use ($transaction) {
            $transaction->update([
                'wash_status' => 'done',
                'queue_number' => null,
                'slot' => null,
            ]);
        });

        return redirect()->route('queue.index', ['date' => $request->date])
            ->with('success', 'Transaksi selesai dan dikeluarkan dari antrian.');
    }
}
