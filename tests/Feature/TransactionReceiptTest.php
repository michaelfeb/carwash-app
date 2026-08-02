<?php

namespace Tests\Feature;

use App\Models\CarwashType;
use App\Models\PaymentMethod;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionReceiptTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_to_login(): void
    {
        $transaction = $this->createTransaction();

        $this->get(route('transactions.receipt', $transaction))
            ->assertRedirect(route('login'));
    }

    public function test_completed_and_paid_transaction_downloads_a_pdf_receipt(): void
    {
        $transaction = $this->createTransaction();

        $response = $this->actingAs($transaction->user)
            ->get(route('transactions.receipt', $transaction));

        $response->assertOk();
        $response->assertHeader('content-type', 'application/pdf');

        $this->assertStringContainsString(
            'attachment; filename=struk-INV-20260801-0001.pdf',
            $response->headers->get('content-disposition') ?? ''
        );
        $this->assertStringStartsWith('%PDF', $response->getContent());
    }

    public function test_receipt_is_rejected_when_transaction_is_not_completed_and_paid(): void
    {
        $user = User::factory()->create();

        $unfinished = $this->createTransaction([
            'user_id' => $user->id,
            'wash_status' => 'washing',
        ]);
        $unpaid = $this->createTransaction([
            'user_id' => $user->id,
            'invoice_number' => 'INV-20260801-0002',
            'payment_status' => 'unpaid',
            'paid_at' => null,
        ]);

        $this->actingAs($user)
            ->get(route('transactions.receipt', $unfinished))
            ->assertStatus(409);

        $this->actingAs($user)
            ->get(route('transactions.receipt', $unpaid))
            ->assertStatus(409);
    }

    public function test_receipt_view_handles_nullable_fields_and_loyalty_discount(): void
    {
        $transaction = $this->createTransaction([
            'customer_id' => null,
            'payment_method_id' => null,
            'license_plate' => null,
            'price' => 75000,
            'original_price' => 100000,
            'loyalty_discount_applied' => true,
        ])->load(['customer', 'carwashType', 'paymentMethod', 'user']);

        $html = view('transactions.receipt', compact('transaction'))->render();

        $this->assertStringContainsString('Pelanggan Umum', $html);
        $this->assertStringContainsString('Harga Awal', $html);
        $this->assertStringContainsString('Rp 100.000', $html);
        $this->assertStringContainsString('-Rp 25.000', $html);
        $this->assertStringContainsString('Rp 75.000', $html);
    }

    private function createTransaction(array $overrides = []): Transaction
    {
        $userId = $overrides['user_id'] ?? User::factory()->create()->id;
        $carwashTypeId = $overrides['carwash_type_id'] ?? CarwashType::create([
            'name' => 'Cuci Premium',
            'size_category' => 'medium',
            'min_price' => 75000,
            'max_price' => 100000,
            'is_active' => true,
        ])->id;
        $paymentMethodId = array_key_exists('payment_method_id', $overrides)
            ? $overrides['payment_method_id']
            : PaymentMethod::create([
                'name' => 'Tunai',
                'is_active' => true,
            ])->id;

        return Transaction::create(array_merge([
            'invoice_number' => 'INV-20260801-0001',
            'customer_id' => null,
            'carwash_type_id' => $carwashTypeId,
            'user_id' => $userId,
            'payment_method_id' => $paymentMethodId,
            'license_plate' => 'DA 1234 RK',
            'price' => 75000,
            'owner_share' => 45000,
            'staff_pool' => 30000,
            'payment_status' => 'paid',
            'wash_status' => 'done',
            'paid_at' => now(),
            'loyalty_discount_applied' => false,
            'original_price' => null,
        ], $overrides));
    }
}
