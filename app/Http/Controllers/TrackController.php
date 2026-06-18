<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TrackController extends Controller
{
    private const BAYS = [
        ['key' => 'bay_1', 'label' => 'Bay 1'],
        ['key' => 'bay_2', 'label' => 'Bay 2'],
    ];

    /**
     * Public tracking page — no authentication required.
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $highlightedId = null;

        // ── Bay details with active transaction ─────────────────────
        $bays = [];
        foreach (self::BAYS as $bay) {
            $active = Transaction::with('carwashType')
                ->whereDate('created_at', today())
                ->where('slot', $bay['key'])
                ->where('wash_status', '!=', 'done')
                ->first();

            $bays[] = [
                'key'       => $bay['key'],
                'label'     => $bay['label'],
                'occupied'  => $active !== null,
                'active'    => $active ? [
                    'id'            => $active->id,
                    'queue_number'  => $active->queue_number,
                    'license_plate' => $active->license_plate,
                    'carwash_type'  => $active->carwashType?->name,
                    'wash_status'   => $active->wash_status,
                ] : null,
            ];
        }

        // ── Not washed yet (waiting list) ───────────────────────────
        $notWashed = Transaction::with('carwashType')
            ->whereDate('created_at', today())
            ->whereNotNull('queue_number')
            ->whereNull('slot')
            ->where('wash_status', '!=', 'done')
            ->orderBy('queue_number')
            ->get()
            ->map(fn ($t) => [
                'id'            => $t->id,
                'queue_number'  => $t->queue_number,
                'license_plate' => $t->license_plate,
                'carwash_type'  => $t->carwashType?->name,
                'wash_status'   => $t->wash_status,
            ]);

        // ── Already washed (done today, with or without queue_number) ─
        $alreadyWashed = Transaction::with('carwashType')
            ->whereDate('created_at', today())
            ->where('wash_status', 'done')
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn ($t) => [
                'id'            => $t->id,
                'queue_number'  => $t->queue_number,
                'license_plate' => $t->license_plate,
                'carwash_type'  => $t->carwashType?->name,
                'wash_status'   => $t->wash_status,
            ]);

        // ── Search highlight ────────────────────────────────────────
        if ($search !== null && $search !== '') {
            // Search by license_plate (case-insensitive) or queue_number
            $found = Transaction::whereDate('created_at', today())
                ->where(function ($q) use ($search) {
                    $q->where('license_plate', 'like', "%{$search}%")
                      ->orWhere('queue_number', is_numeric($search) ? (int) $search : null);
                })
                ->first();

            if ($found) {
                $highlightedId = $found->id;
            }
        }

        return Inertia::render('track/index', [
            'bays'              => $bays,
            'notWashed'         => $notWashed,
            'alreadyWashed'     => $alreadyWashed,
            'highlightedId'     => $highlightedId,
            'search'            => $search ?? '',
        ]);
    }
}
