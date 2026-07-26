<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            CarwashTypeSeeder::class,
            PaymentMethodSeeder::class,
            StaffSeeder::class,
            CustomerSeeder::class,
            TransactionSeeder::class,
        ]);
    }
}
