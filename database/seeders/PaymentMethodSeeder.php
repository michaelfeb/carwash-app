<?php

namespace Database\Seeders;

use App\Models\PaymentMethod;
use Illuminate\Database\Seeder;

class PaymentMethodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $methods = [
            ['name' => 'Cash', 'is_active' => true],
            ['name' => 'Bank Transfer', 'is_active' => true],
            ['name' => 'E-Wallet (QRIS)', 'is_active' => true],
        ];

        foreach ($methods as $method) {
            PaymentMethod::create($method);
        }
    }
}
