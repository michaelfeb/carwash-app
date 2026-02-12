<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $customers = [
            ['name' => 'Surya', 'phone' => '081356642345', 'address' => 'Banjarbaru'],
            ['name' => 'Dinda', 'phone' => '082158793444', 'address' => 'Banjarbaru'],
            ['name' => 'Ikhsan', 'phone' => '082358799923', 'address' => 'Banjarmasin'],
            ['name' => 'Udin', 'phone' => '088254326674', 'address' => 'Banjarbaru'],
        ];

        foreach ($customers as $customer) {
            Customer::create($customer);
        }
    }
}
