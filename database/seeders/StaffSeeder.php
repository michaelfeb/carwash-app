<?php

namespace Database\Seeders;

use App\Models\Staff;
use Illuminate\Database\Seeder;

class StaffSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $staffs = [
            ['name' => 'Staff 1', 'phone' => '081234567891', 'is_active' => true],
            ['name' => 'Staff 2', 'phone' => '081234567892', 'is_active' => true],
            ['name' => 'Staff 3', 'phone' => '081234567893', 'is_active' => true],
            ['name' => 'Staff 4', 'phone' => '081234567894', 'is_active' => true],
            ['name' => 'Staff 5', 'phone' => '081234567895', 'is_active' => true],
            ['name' => 'Staff 6', 'phone' => '081234567896', 'is_active' => true],
        ];

        foreach ($staffs as $staff) {
            Staff::create($staff);
        }
    }
}
