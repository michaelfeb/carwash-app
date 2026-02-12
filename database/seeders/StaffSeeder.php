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
            ['name' => 'Adwa', 'phone' => '081234567801', 'is_active' => true],
            ['name' => 'Ipit', 'phone' => '082345678902', 'is_active' => true],
            ['name' => 'Ali', 'phone' => '083456789103', 'is_active' => true],
            ['name' => 'Anto', 'phone' => '084567891204', 'is_active' => true],
            ['name' => 'Teguh', 'phone' => '085678912305', 'is_active' => true],
        ];

        foreach ($staffs as $staff) {
            Staff::create($staff);
        }
    }
}
