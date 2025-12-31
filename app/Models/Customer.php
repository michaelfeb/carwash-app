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
    ];

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
}
