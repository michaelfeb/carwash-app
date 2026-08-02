<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Transaction extends Model
{
    use HasFactory;

    // Share percentages
    public const OWNER_SHARE_PERCENT = 0.60;  // 60% untuk owner

    public const STAFF_POOL_PERCENT = 0.40;   // 40% untuk pool staff

    // Loyalty program constants
    public const LOYALTY_STAMP_THRESHOLD = 4;    // 4 stamps needed to unlock discount

    public const LOYALTY_DISCOUNT_PERCENT = 0.25; // 25% discount on 5th visit

    protected $fillable = [
        'invoice_number',
        'customer_id',
        'carwash_type_id',
        'user_id',
        'payment_method_id',
        'license_plate',
        'price',
        'owner_share',
        'staff_pool',
        'payment_status',
        'wash_status',
        'paid_at',
        'notes',
        'queue_number',
        'slot',
        'loyalty_discount_applied',
        'original_price',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'owner_share' => 'integer',
            'loyalty_discount_applied' => 'boolean',
            'original_price' => 'integer',
            'staff_pool' => 'integer',
            'queue_number' => 'integer',
            'paid_at' => 'datetime',
        ];
    }

    /**
     * Calculate shares from price
     */
    public static function calculateShares(int $price): array
    {
        return [
            'owner_share' => (int) floor($price * self::OWNER_SHARE_PERCENT),
            'staff_pool' => (int) floor($price * self::STAFF_POOL_PERCENT),
        ];
    }

    /**
     * Get the customer for this transaction
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the carwash type for this transaction
     */
    public function carwashType(): BelongsTo
    {
        return $this->belongsTo(CarwashType::class);
    }

    /**
     * Get the user (cashier) who created this transaction
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the payment method for this transaction
     */
    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    /**
     * Get the staffs assigned to this transaction
     */
    public function staffs(): BelongsToMany
    {
        return $this->belongsToMany(Staff::class, 'transaction_staffs')
            ->withTimestamps();
    }

    /**
     * Generate invoice number
     */
    public static function generateInvoiceNumber(): string
    {
        $businessDate = static::currentBusinessDate();
        $date = $businessDate->format('Ymd');
        $lastTransaction = static::createdOnBusinessDate($businessDate->toDateString())
            ->orderBy('id', 'desc')
            ->first();

        if ($lastTransaction) {
            $lastNumber = (int) substr($lastTransaction->invoice_number, -4);
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return "INV-{$date}-{$newNumber}";
    }

    /**
     * Get formatted price
     */
    public function getFormattedPriceAttribute(): string
    {
        return 'Rp '.number_format($this->price, 0, ',', '.');
    }

    /**
     * Get formatted owner share
     */
    public function getFormattedOwnerShareAttribute(): string
    {
        return 'Rp '.number_format($this->owner_share, 0, ',', '.');
    }

    /**
     * Get formatted staff pool
     */
    public function getFormattedStaffPoolAttribute(): string
    {
        return 'Rp '.number_format($this->staff_pool, 0, ',', '.');
    }

    /**
     * Check if transaction is paid
     */
    public function isPaid(): bool
    {
        return $this->payment_status === 'paid';
    }

    /**
     * Check if wash is done
     */
    public function isDone(): bool
    {
        return $this->wash_status === 'done';
    }

    /**
     * Get the discount amount applied (original_price - price)
     */
    public function getDiscountAmountAttribute(): int
    {
        if ($this->loyalty_discount_applied && $this->original_price) {
            return $this->original_price - $this->price;
        }

        return 0;
    }

    /**
     * Get formatted discount amount
     */
    public function getFormattedDiscountAmountAttribute(): string
    {
        return 'Rp '.number_format($this->discount_amount, 0, ',', '.');
    }

    /**
     * Get formatted original price
     */
    public function getFormattedOriginalPriceAttribute(): string
    {
        if ($this->original_price) {
            return 'Rp '.number_format($this->original_price, 0, ',', '.');
        }

        return $this->formatted_price;
    }

    /**
     * Generate daily auto-increment queue number.
     */
    public static function generateQueueNumber(): int
    {
        $last = static::createdOnBusinessDate(static::currentBusinessDate()->toDateString())
            ->whereNotNull('queue_number')
            ->max('queue_number');

        return ($last ?? 0) + 1;
    }

    /**
     * Check if the transaction is currently in the queue.
     */
    public function isQueued(): bool
    {
        return $this->queue_number !== null;
    }

    /**
     * Check if the transaction is assigned to a wash bay.
     */
    public function isAssignedToSlot(): bool
    {
        return $this->slot !== null;
    }

    /**
     * Scope a query to only include queued (not done) transactions.
     */
    public function scopeQueued(\Illuminate\Database\Eloquent\Builder $query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->whereNotNull('queue_number')
            ->where('wash_status', '!=', 'done');
    }

    public static function businessTimezone(): string
    {
        return config('app.business_timezone', 'Asia/Makassar');
    }

    public static function currentBusinessDate(): CarbonImmutable
    {
        return CarbonImmutable::now(static::businessTimezone());
    }

    /**
     * @return array{0: CarbonImmutable, 1: CarbonImmutable}
     */
    public static function businessDateBounds(string $dateFrom, string $dateTo): array
    {
        $timezone = static::businessTimezone();

        return [
            CarbonImmutable::createFromFormat('Y-m-d', $dateFrom, $timezone)->startOfDay()->utc(),
            CarbonImmutable::createFromFormat('Y-m-d', $dateTo, $timezone)->endOfDay()->utc(),
        ];
    }

    public function scopeCreatedBetweenBusinessDates(Builder $query, string $dateFrom, string $dateTo): Builder
    {
        [$startUtc, $endUtc] = static::businessDateBounds($dateFrom, $dateTo);

        return $query->whereBetween($query->getModel()->qualifyColumn('created_at'), [$startUtc, $endUtc]);
    }

    public function scopeCreatedOnBusinessDate(Builder $query, string $date): Builder
    {
        return $query->createdBetweenBusinessDates($date, $date);
    }

    public function createdAtInBusinessTimezone(): CarbonInterface
    {
        return CarbonImmutable::parse($this->created_at)->setTimezone(static::businessTimezone());
    }
}
