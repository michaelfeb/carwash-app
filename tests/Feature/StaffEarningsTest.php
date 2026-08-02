<?php

namespace Tests\Feature;

use App\Models\CarwashType;
use App\Models\Staff;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class StaffEarningsTest extends TestCase
{
    use RefreshDatabase;

    public function test_staff_index_estimates_earnings_from_paid_staff_pool_assignments(): void
    {
        $owner = User::factory()->withoutTwoFactor()->create([
            'role' => 'owner',
            'is_active' => true,
        ]);
        $cashier = User::factory()->withoutTwoFactor()->create([
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
        $ali = Staff::create(['name' => 'Ali', 'is_active' => true]);
        $budi = Staff::create(['name' => 'Budi', 'is_active' => true]);
        Staff::create(['name' => 'Cici', 'is_active' => true]);

        $firstPaidTransaction = $this->createTransaction($cashier, $carwashType, [
            'invoice_number' => 'INV-20260802-0001',
            'staff_pool' => 40000,
        ]);
        $firstPaidTransaction->staffs()->attach([$ali->id, $budi->id]);

        $secondPaidTransaction = $this->createTransaction($cashier, $carwashType, [
            'invoice_number' => 'INV-20260802-0002',
            'staff_pool' => 20000,
        ]);
        $secondPaidTransaction->staffs()->attach($ali->id);

        $unpaidTransaction = $this->createTransaction($cashier, $carwashType, [
            'invoice_number' => 'INV-20260802-0003',
            'staff_pool' => 40000,
            'payment_status' => 'unpaid',
            'paid_at' => null,
        ]);
        $unpaidTransaction->staffs()->attach($budi->id);

        $response = $this->actingAs($owner)
            ->get(route('staffs.index'));

        $response
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('staffs/index')
                ->has('staffs', 3)
                ->where('staffs.0.name', 'Ali')
                ->where('staffs.0.transactions_count', 2)
                ->where('staffs.0.transaction_earnings', 40000)
                ->missing('staffs.0.paid_transactions_count')
                ->where('staffs.1.name', 'Budi')
                ->where('staffs.1.transactions_count', 2)
                ->where('staffs.1.transaction_earnings', 20000)
                ->where('staffs.2.name', 'Cici')
                ->where('staffs.2.transactions_count', 0)
                ->where('staffs.2.transaction_earnings', 0));
    }

    private function createTransaction(User $cashier, CarwashType $carwashType, array $overrides): Transaction
    {
        $staffPool = $overrides['staff_pool'];

        return Transaction::create(array_merge([
            'customer_id' => null,
            'carwash_type_id' => $carwashType->id,
            'user_id' => $cashier->id,
            'payment_method_id' => null,
            'license_plate' => null,
            'price' => (int) ($staffPool / Transaction::STAFF_POOL_PERCENT),
            'owner_share' => (int) (($staffPool / Transaction::STAFF_POOL_PERCENT) * Transaction::OWNER_SHARE_PERCENT),
            'payment_status' => 'paid',
            'wash_status' => 'done',
            'paid_at' => now(),
            'loyalty_discount_applied' => false,
            'original_price' => null,
        ], $overrides));
    }
}
