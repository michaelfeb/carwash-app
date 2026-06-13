<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'phone',
        'address',
        'notes',
        'loyalty_stamps',
    ];

    protected function casts(): array
    {
        return [
            'loyalty_stamps' => 'integer',
        ];
    }

    /**
     * Get the transactions for this customer
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Get total transactions count
     */
    public function getTransactionCountAttribute(): int
    {
        return $this->transactions()->count();
    }

    /**
     * Get total spending
     */
    public function getTotalSpendingAttribute(): int
    {
        return $this->transactions()->where('payment_status', 'paid')->sum('price');
    }

    /**
     * Check if customer is eligible for loyalty discount
     */
    public function isEligibleForDiscount(): bool
    {
        return $this->loyalty_stamps >= Transaction::LOYALTY_STAMP_THRESHOLD;
    }

    /**
     * Get loyalty progress info
     */
    public function getLoyaltyProgress(): array
    {
        return [
            'current' => $this->loyalty_stamps,
            'target' => Transaction::LOYALTY_STAMP_THRESHOLD,
            'next_visit_discount' => $this->isEligibleForDiscount(),
            'discount_percent' => (int) (Transaction::LOYALTY_DISCOUNT_PERCENT * 100),
        ];
    }
}
