<?php

namespace Database\Seeders;

use App\Models\Transaction;
use App\Models\TransactionStaff;
use App\Models\Customer;
use App\Models\CarwashType;
use App\Models\PaymentMethod;
use App\Models\Staff;
use App\Models\User;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class TransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all necessary IDs
        $customers = Customer::all();
        $carwashTypes = CarwashType::all();
        $paymentMethods = PaymentMethod::all();
        $staffs = Staff::all();
        $cashier = User::where('role', 'cashier')->first();

        // Start date: January 15, 2026
        // End date: February 14, 2026 (1 month, 31 days total)
        $startDate = Carbon::create(2026, 1, 15);
        $endDate = Carbon::create(2026, 2, 14);

        $invoiceCounter = 1;

        // Generate 10 transactions per day
        for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {
            for ($i = 1; $i <= 10; $i++) {
                // Random time during business hours (8 AM - 6 PM)
                $hour = rand(8, 18);
                $minute = rand(0, 59);
                $transactionTime = $date->copy()->setTime($hour, $minute);

                // Random carwash type
                $carwashType = $carwashTypes->random();

                // Random price within the range
                $price = rand($carwashType->min_price, $carwashType->max_price);

                // Random customer (or null for walk-in)
                $customer = rand(0, 2) > 0 ? $customers->random() : null;

                // Random payment method
                $paymentMethod = $paymentMethods->random();

                // Random statuses
                $paymentStatus = rand(0, 10) > 1 ? 'paid' : 'unpaid'; // 90% paid
                $washStatus = ['waiting', 'washing', 'done'][rand(0, 2)];

                // Calculate 60/40 share
                $ownerShare = (int) floor($price * 0.6);
                $staffPool = (int) floor($price * 0.4);

                // Create transaction
                $transaction = Transaction::create([
                    'invoice_number' => 'INV-' . $date->format('Ymd') . '-' . str_pad($invoiceCounter++, 4, '0', STR_PAD_LEFT),
                    'customer_id' => $customer?->id,
                    'carwash_type_id' => $carwashType->id,
                    'user_id' => $cashier->id,
                    'payment_method_id' => $paymentMethod->id,
                    'license_plate' => $this->generateRandomLicensePlate(),
                    'price' => $price,
                    'owner_share' => $ownerShare,
                    'staff_pool' => $staffPool,
                    'payment_status' => $paymentStatus,
                    'wash_status' => $washStatus,
                    'paid_at' => $paymentStatus === 'paid' ? $transactionTime : null,
                    'created_at' => $transactionTime,
                    'updated_at' => $transactionTime,
                ]);

                // Assign 2-3 random staff members to each transaction
                $numberOfStaff = rand(2, 3);
                $assignedStaffs = $staffs->random($numberOfStaff);

                foreach ($assignedStaffs as $staff) {
                    // Calculate fee per staff (simple equal distribution)
                    $feePerStaff = (int) ($price * 0.6 / $numberOfStaff); // 60% of price divided by number of staff

                    TransactionStaff::create([
                        'transaction_id' => $transaction->id,
                        'staff_id' => $staff->id,
                        'fee' => $feePerStaff,
                    ]);
                }
            }
        }
    }

    /**
     * Generate random Indonesian license plate
     */
    private function generateRandomLicensePlate(): string
    {
        $regions = ['DA', 'KH', 'KB']; // Banjarmasin, Banjarbaru region codes
        $region = $regions[array_rand($regions)];
        $numbers = rand(1000, 9999);
        $letters = chr(65 + rand(0, 25)) . chr(65 + rand(0, 25)); // Random 2 letters

        return $region . ' ' . $numbers . ' ' . $letters;
    }
}
