<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create owner
        User::create([
            'name' => 'Owner',
            'email' => 'owner@carwash.com',
            'password' => Hash::make('asdfghjkl'),
            'role' => 'owner',
            'is_active' => true,
        ]);

        // Create cashier
        User::create([
            'name' => 'Cashier',
            'email' => 'cashier@carwash.com',
            'password' => Hash::make('asdfghjkl'),
            'role' => 'cashier',
            'is_active' => true,
        ]);
    }
}
