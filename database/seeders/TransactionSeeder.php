<?php

namespace Database\Seeders;

use App\Models\CarwashType;
use App\Models\Customer;
use App\Models\PaymentMethod;
use App\Models\Staff;
use App\Models\Transaction;
use App\Models\TransactionStaff;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class TransactionSeeder extends Seeder
{
    /**
     * @var array<int, string>
     */
    private array $customerPlates = [];

    /**
     * @var array<int, string>
     */
    private array $customerPreferredCategories = [];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $customers = Customer::query()->orderBy('id')->get();
        $carwashTypes = CarwashType::query()->where('is_active', true)->get();
        $paymentMethods = PaymentMethod::query()->where('is_active', true)->get();
        $staffs = Staff::query()->where('is_active', true)->orderBy('id')->get();
        $cashier = User::query()->where('role', 'cashier')->where('is_active', true)->first();

        if ($customers->isEmpty() || $carwashTypes->isEmpty() || $paymentMethods->isEmpty() || $staffs->isEmpty() || ! $cashier) {
            throw new RuntimeException(
                'TransactionSeeder requires customers, active carwash types, payment methods, staff, and an active cashier.'
            );
        }

        $this->prepareCustomerProfiles($customers);

        // This dataset mirrors the reporting period used by the demo application.
        $startDate = Carbon::create(2026, 1, 1)->startOfDay();
        $endDate = Carbon::create(2026, 7, 23)->startOfDay();

        DB::transaction(function () use (
            $customers,
            $carwashTypes,
            $paymentMethods,
            $staffs,
            $cashier,
            $startDate,
            $endDate
        ): void {
            for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {
                $isSnapshotDay = $date->isSameDay($endDate);
                $dailyTransactionCount = $this->dailyTransactionCount($date, $isSnapshotDay);
                $transactionTimes = $this->transactionTimes($date, $dailyTransactionCount, $isSnapshotDay);

                foreach ($transactionTimes as $dailyIndex => $transactionTime) {
                    $customer = $this->pickCustomer($customers);
                    $sizeCategory = $this->pickSizeCategory($customer);
                    $carwashType = $carwashTypes->firstWhere('size_category', $sizeCategory)
                        ?? $carwashTypes->random();

                    $originalServicePrice = $this->realisticPrice(
                        (int) $carwashType->min_price,
                        (int) $carwashType->max_price
                    );

                    [$price, $originalPrice, $loyaltyDiscountApplied] = $this->applyLoyaltyDiscount(
                        $customer,
                        $originalServicePrice
                    );

                    $paymentMethod = $this->pickPaymentMethod($paymentMethods);
                    $paidAt = $transactionTime->copy()->addMinutes(random_int(2, 12));
                    $updatedAt = $transactionTime->copy()->addMinutes(random_int(30, 90));

                    $shares = Transaction::calculateShares($price);
                    $transaction = Transaction::forceCreate([
                        'invoice_number' => sprintf(
                            'INV-%s-%04d',
                            $date->format('Ymd'),
                            $dailyIndex + 1
                        ),
                        'customer_id' => $customer?->id,
                        'carwash_type_id' => $carwashType->id,
                        'user_id' => $cashier->id,
                        'payment_method_id' => $paymentMethod?->id,
                        'license_plate' => $this->licensePlateFor($customer),
                        'price' => $price,
                        'original_price' => $originalPrice,
                        'owner_share' => $shares['owner_share'],
                        'staff_pool' => $shares['staff_pool'],
                        'payment_status' => 'paid',
                        'wash_status' => 'done',
                        'paid_at' => $paidAt,
                        'notes' => $this->transactionNotes($sizeCategory),
                        'queue_number' => null,
                        'slot' => null,
                        'loyalty_discount_applied' => $loyaltyDiscountApplied,
                        'created_at' => $transactionTime,
                        'updated_at' => $updatedAt,
                    ]);

                    $availableStaffs = $this->availableStaffsForDate($staffs, $date);
                    $teamSize = $this->teamSize($sizeCategory, $availableStaffs->count());
                    $assignedStaffs = $this->selectStaffTeam(
                        $availableStaffs,
                        $teamSize,
                        $date,
                        $dailyIndex
                    );

                    foreach ($assignedStaffs as $staff) {
                        TransactionStaff::forceCreate([
                            'transaction_id' => $transaction->id,
                            'staff_id' => $staff->id,
                            // Individual fees are calculated by the weekly pool process.
                            'fee' => 0,
                            'created_at' => $transactionTime,
                            'updated_at' => $transactionTime,
                        ]);
                    }
                }
            }
        });
    }

    /**
     * Give repeat customers a stable vehicle profile across visits.
     *
     * @param  Collection<int, Customer>  $customers
     */
    private function prepareCustomerProfiles(Collection $customers): void
    {
        foreach ($customers as $customer) {
            $this->customerPlates[$customer->id] = $this->generateCustomerPlate($customer->id);

            $categoryRoll = ($customer->id * 37) % 100;
            $this->customerPreferredCategories[$customer->id] = match (true) {
                $categoryRoll < 35 => 'small',
                $categoryRoll < 75 => 'medium',
                $categoryRoll < 94 => 'big',
                default => 'special',
            };
        }
    }

    private function dailyTransactionCount(Carbon $date, bool $isSnapshotDay): int
    {
        if ($isSnapshotDay) {
            return random_int(8, 11);
        }

        if ($date->dayOfWeek === Carbon::FRIDAY) {
            return random_int(7, 12);
        }

        if ($date->isWeekend()) {
            return random_int(13, 21);
        }

        $count = random_int(9, 16);

        // Occasional busy days keep the daily totals from looking uniform.
        if ($date->dayOfYear % 17 === 0 || $date->dayOfMonth === 1) {
            $count += random_int(2, 4);
        }

        return $count;
    }

    /**
     * @return array<int, Carbon>
     */
    private function transactionTimes(Carbon $date, int $count, bool $isSnapshotDay): array
    {
        $times = [];

        for ($index = 0; $index < $count; $index++) {
            $roll = random_int(1, 100);

            if ($isSnapshotDay) {
                $hour = match (true) {
                    $roll <= 20 => random_int(8, 9),
                    $roll <= 65 => random_int(10, 11),
                    default => random_int(12, 13),
                };
            } else {
                $hour = match (true) {
                    $roll <= 15 => random_int(8, 9),
                    $roll <= 52 => random_int(10, 12),
                    $roll <= 76 => random_int(13, 15),
                    default => random_int(16, 18),
                };
            }

            $times[] = $date->copy()->setTime(
                $hour,
                random_int(0, 59),
                random_int(0, 59)
            );
        }

        usort(
            $times,
            static fn (Carbon $first, Carbon $second): int => $first->getTimestamp() <=> $second->getTimestamp()
        );

        return $times;
    }

    /**
     * @param  Collection<int, Customer>  $customers
     */
    private function pickCustomer(Collection $customers): ?Customer
    {
        // Around 30% of business comes from walk-in customers.
        if (random_int(1, 100) > 70) {
            return null;
        }

        // A core group visits more frequently than occasional customers.
        if (random_int(1, 100) <= 55) {
            return $customers->take(min(12, $customers->count()))->random();
        }

        return $customers->random();
    }

    private function pickSizeCategory(?Customer $customer): string
    {
        if ($customer && random_int(1, 100) <= 85) {
            return $this->customerPreferredCategories[$customer->id];
        }

        $roll = random_int(1, 100);

        return match (true) {
            $roll <= 36 => 'small',
            $roll <= 76 => 'medium',
            $roll <= 95 => 'big',
            default => 'special',
        };
    }

    private function realisticPrice(int $minimum, int $maximum): int
    {
        $priceStep = 5000;
        $stepCount = max(0, intdiv($maximum - $minimum, $priceStep));

        return $minimum + (random_int(0, $stepCount) * $priceStep);
    }

    /**
     * @return array{0: int, 1: int|null, 2: bool}
     */
    private function applyLoyaltyDiscount(?Customer $customer, int $servicePrice): array
    {
        if (! $customer) {
            return [$servicePrice, null, false];
        }

        if ($customer->isEligibleForDiscount()) {
            $customer->loyalty_stamps = 0;
            $customer->save();

            return [
                (int) floor($servicePrice * (1 - Transaction::LOYALTY_DISCOUNT_PERCENT)),
                $servicePrice,
                true,
            ];
        }

        $customer->loyalty_stamps++;
        $customer->save();

        return [$servicePrice, null, false];
    }

    /**
     * @param  Collection<int, PaymentMethod>  $paymentMethods
     */
    private function pickPaymentMethod(Collection $paymentMethods): PaymentMethod
    {
        $roll = random_int(1, 100);
        $search = match (true) {
            $roll <= 50 => 'cash',
            $roll <= 86 => 'qris',
            default => 'transfer',
        };

        return $paymentMethods->first(
            static fn (PaymentMethod $method): bool => str_contains(strtolower($method->name), $search)
        ) ?? $paymentMethods->random();
    }

    private function licensePlateFor(?Customer $customer): string
    {
        if ($customer && random_int(1, 100) <= 88) {
            return $this->customerPlates[$customer->id];
        }

        return $this->generateRandomLicensePlate();
    }

    private function generateCustomerPlate(int $customerId): string
    {
        $regions = ['DA', 'DA', 'DA', 'KH', 'KB'];
        $region = $regions[$customerId % count($regions)];
        $number = 1000 + (($customerId * 7919) % 9000);
        $firstLetter = chr(65 + (($customerId * 7) % 26));
        $secondLetter = chr(65 + (($customerId * 11) % 26));

        return sprintf('%s %d %s%s', $region, $number, $firstLetter, $secondLetter);
    }

    private function generateRandomLicensePlate(): string
    {
        $regions = ['DA', 'DA', 'DA', 'DA', 'KH', 'KB', 'B'];
        $region = $regions[array_rand($regions)];
        $number = random_int(1000, 9999);
        $letterCount = random_int(1, 3);
        $letters = '';

        for ($index = 0; $index < $letterCount; $index++) {
            $letters .= chr(65 + random_int(0, 25));
        }

        return sprintf('%s %d %s', $region, $number, $letters);
    }

    private function transactionNotes(string $sizeCategory): ?string
    {
        if (random_int(1, 100) > ($sizeCategory === 'special' ? 35 : 18)) {
            return null;
        }

        $notes = [
            'Bagian kolong perlu dibersihkan lebih teliti',
            'Tambahkan semir ban',
            'Tidak menggunakan pewangi kabin',
            'Banyak lumpur setelah perjalanan luar kota',
            'Bersihkan area bagasi',
            'Ada barang pelanggan di dalam kendaraan',
            'Fokus pada noda di bagian jok belakang',
            'Kendaraan operasional, mohon diprioritaskan',
        ];

        return $notes[array_rand($notes)];
    }

    /**
     * Give every staff member a rotating weekly day off.
     *
     * @param  Collection<int, Staff>  $staffs
     * @return Collection<int, Staff>
     */
    private function availableStaffsForDate(Collection $staffs, Carbon $date): Collection
    {
        $availableStaffs = $staffs->values()->filter(
            static fn (Staff $staff, int $index): bool => ($date->dayOfYear + ($index * 2)) % 7 !== 0
        )->values();

        return $availableStaffs->isEmpty() ? $staffs->values() : $availableStaffs;
    }

    private function teamSize(string $sizeCategory, int $availableStaffCount): int
    {
        $options = match ($sizeCategory) {
            'small' => [1, 2, 2, 2, 3],
            'medium' => [2, 2, 3, 3],
            'big' => [3, 3, 4],
            'special' => [3, 4, 4, 5],
            default => [2],
        };

        return min($options[array_rand($options)], $availableStaffCount);
    }

    /**
     * Rotate the starting staff member per transaction to vary teams and workloads.
     *
     * @param  Collection<int, Staff>  $availableStaffs
     * @return Collection<int, Staff>
     */
    private function selectStaffTeam(
        Collection $availableStaffs,
        int $teamSize,
        Carbon $date,
        int $dailyIndex
    ): Collection {
        $staffs = $availableStaffs->values();
        $offset = ($date->dayOfYear + $dailyIndex) % $staffs->count();
        $rotated = $staffs->slice($offset)
            ->concat($staffs->slice(0, $offset))
            ->values();

        // Occasionally swap the order so adjacent transactions do not repeat a pattern.
        if (random_int(1, 100) <= 35) {
            $rotated = $rotated->shuffle()->values();
        }

        return $rotated->take($teamSize);
    }
}
