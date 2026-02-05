<?php

namespace App\Models;

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
    ];

    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'owner_share' => 'integer',
            'staff_pool' => 'integer',
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
        $date = now()->format('Ymd');
        $lastTransaction = static::whereDate('created_at', today())
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
        return 'Rp ' . number_format($this->price, 0, ',', '.');
    }

    /**
     * Get formatted owner share
     */
    public function getFormattedOwnerShareAttribute(): string
    {
        return 'Rp ' . number_format($this->owner_share, 0, ',', '.');
    }

    /**
     * Get formatted staff pool
     */
    public function getFormattedStaffPoolAttribute(): string
    {
        return 'Rp ' . number_format($this->staff_pool, 0, ',', '.');
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
}
