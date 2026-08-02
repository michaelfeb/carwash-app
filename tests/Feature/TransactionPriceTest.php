<?php

namespace Tests\Feature;

use App\Models\CarwashType;
use App\Models\Customer;
use App\Models\Staff;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionPriceTest extends TestCase
{
    use RefreshDatabase;

    public function test_loyalty_discount_is_applied_once_to_the_submitted_integer_price(): void
    {
        $cashier = User::factory()->withoutTwoFactor()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);
        $customer = Customer::create([
            'name' => 'Pelanggan Loyalty',
            'loyalty_stamps' => Transaction::LOYALTY_STAMP_THRESHOLD,
        ]);
        $carwashType = CarwashType::create([
            'name' => 'Cuci Premium',
            'size_category' => 'special',
            'min_price' => 70000,
            'max_price' => 150000,
            'is_active' => true,
        ]);
        $staff = Staff::create([
            'name' => 'Staff Test',
            'is_active' => true,
        ]);

        $this->actingAs($cashier)
            ->post(route('transactions.store'), [
                'customer_id' => $customer->id,
                'carwash_type_id' => $carwashType->id,
                'payment_method_id' => null,
                'license_plate' => 'DA 1234 RK',
                'price' => 73327,
                'payment_status' => 'unpaid',
                'notes' => null,
                'staffs' => [$staff->id],
            ])
            ->assertRedirect(route('transactions.index'));

        $this->assertDatabaseHas('transactions', [
            'customer_id' => $customer->id,
            'original_price' => 73327,
            'price' => 54995,
            'owner_share' => 32997,
            'staff_pool' => 21998,
            'loyalty_discount_applied' => true,
        ]);
        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'loyalty_stamps' => 0,
        ]);
    }
}
