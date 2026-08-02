<?php

namespace Tests\Feature;

use App\Models\CarwashType;
use App\Models\Transaction;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class TransactionBusinessDateTest extends TestCase
{
    use RefreshDatabase;

    public function test_invoice_uses_the_makassar_business_date_after_utc_midnight_boundary(): void
    {
        CarbonImmutable::setTestNow(CarbonImmutable::parse('2026-07-30 17:30:00', 'UTC'));

        try {
            $this->assertSame('INV-20260731-0001', Transaction::generateInvoiceNumber());
        } finally {
            CarbonImmutable::setTestNow();
        }
    }

    public function test_transaction_filter_uses_complete_makassar_business_day_boundaries(): void
    {
        $user = User::factory()->withoutTwoFactor()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);
        $carwashType = CarwashType::create([
            'name' => 'Cuci Reguler',
            'size_category' => 'medium',
            'min_price' => 50000,
            'max_price' => 100000,
            'is_active' => true,
        ]);

        $julyThirtyFirst = $this->createTransaction(
            $user,
            $carwashType,
            'INV-20260731-0001',
            '2026-07-30 17:30:00',
        );
        $this->createTransaction(
            $user,
            $carwashType,
            'INV-20260801-0001',
            '2026-07-31 17:30:00',
        );

        $this->actingAs($user)
            ->get(route('transactions.index', [
                'date_from' => '2026-07-31',
                'date_to' => '2026-07-31',
            ]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('transactions/index')
                ->has('transactions.data', 1)
                ->where('transactions.data.0.id', $julyThirtyFirst->id)
                ->where('transactions.data.0.invoice_number', 'INV-20260731-0001'));
    }

    public function test_daily_report_uses_the_same_makassar_business_day(): void
    {
        $user = User::factory()->withoutTwoFactor()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);
        $carwashType = CarwashType::create([
            'name' => 'Cuci Reguler',
            'size_category' => 'medium',
            'min_price' => 50000,
            'max_price' => 100000,
            'is_active' => true,
        ]);

        $included = $this->createTransaction(
            $user,
            $carwashType,
            'INV-20260731-0001',
            '2026-07-30 17:30:00',
        );
        $this->createTransaction(
            $user,
            $carwashType,
            'INV-20260801-0001',
            '2026-07-31 17:30:00',
        );

        Pdf::shouldReceive('loadView')
            ->once()
            ->withArgs(function (string $view, array $data) use ($included): bool {
                $this->assertSame('reports.daily', $view);
                $this->assertSame([$included->id], $data['transactions']->pluck('id')->all());

                return true;
            })
            ->andReturnSelf();
        Pdf::shouldReceive('download')
            ->once()
            ->with('daily-report-2026-07-31.pdf')
            ->andReturn(response('pdf'));

        $this->actingAs($user)
            ->get(route('reports.daily.export', ['date' => '2026-07-31']))
            ->assertOk();
    }

    public function test_receipt_displays_the_same_business_date_as_the_invoice(): void
    {
        $user = User::factory()->withoutTwoFactor()->create();
        $carwashType = CarwashType::create([
            'name' => 'Cuci Reguler',
            'size_category' => 'medium',
            'min_price' => 50000,
            'max_price' => 100000,
            'is_active' => true,
        ]);
        $transaction = $this->createTransaction(
            $user,
            $carwashType,
            'INV-20260731-0001',
            '2026-07-30 17:30:00',
        );

        $html = view('transactions.receipt', compact('transaction'))->render();

        $this->assertStringContainsString('INV-20260731-0001', $html);
        $this->assertStringContainsString('31/07/2026 01:30', $html);
    }

    private function createTransaction(
        User $user,
        CarwashType $carwashType,
        string $invoiceNumber,
        string $createdAtUtc,
    ): Transaction {
        $transaction = Transaction::create([
            'invoice_number' => $invoiceNumber,
            'customer_id' => null,
            'carwash_type_id' => $carwashType->id,
            'user_id' => $user->id,
            'payment_method_id' => null,
            'license_plate' => null,
            'price' => 50000,
            'owner_share' => 30000,
            'staff_pool' => 20000,
            'payment_status' => 'paid',
            'wash_status' => 'done',
            'paid_at' => $createdAtUtc,
            'loyalty_discount_applied' => false,
            'original_price' => null,
        ]);

        $transaction->timestamps = false;
        $transaction->created_at = $createdAtUtc;
        $transaction->updated_at = $createdAtUtc;
        $transaction->save();

        return $transaction->refresh();
    }
}
