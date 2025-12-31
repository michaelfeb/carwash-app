<?php

namespace Database\Seeders;

use App\Models\CarwashType;
use Illuminate\Database\Seeder;

class CarwashTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            [
                'name' => 'Small Car',
                'size_category' => 'small',
                'min_price' => 35000,
                'max_price' => 40000,
                'description' => 'For small cars like sedan, hatchback, city car',
                'is_active' => true,
            ],
            [
                'name' => 'Medium Car',
                'size_category' => 'medium',
                'min_price' => 45000,
                'max_price' => 50000,
                'description' => 'For medium cars like SUV, MPV',
                'is_active' => true,
            ],
            [
                'name' => 'Big Car',
                'size_category' => 'big',
                'min_price' => 50000,
                'max_price' => 70000,
                'description' => 'For big cars like large SUV, pick-up truck',
                'is_active' => true,
            ],
            [
                'name' => 'Special Car',
                'size_category' => 'special',
                'min_price' => 70000,
                'max_price' => 150000,
                'description' => 'For special vehicles requiring extra care',
                'is_active' => true,
            ],
        ];

        foreach ($types as $type) {
            CarwashType::create($type);
        }
    }
}
