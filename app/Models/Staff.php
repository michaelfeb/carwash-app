<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Staff extends Model
{
    use HasFactory;

    protected $table = 'staffs';

    protected $fillable = [
        'name',
        'phone',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the transactions this staff worked on
     */
    public function transactions(): BelongsToMany
    {
        return $this->belongsToMany(Transaction::class, 'transaction_staffs')
            ->withTimestamps();
    }

    /**
     * Get weekly earnings records for this staff
     */
    public function weeklyEarnings(): HasMany
    {
        return $this->hasMany(WeeklyStaffEarning::class);
    }

    /**
     * Get total earnings from weekly payments
     */
    public function getTotalEarningsAttribute(): int
    {
        return $this->weeklyEarnings()->sum('earning');
    }

    /**
     * Get total transactions count
     */
    public function getTransactionCountAttribute(): int
    {
        return $this->transactions()->count();
    }

    /**
     * Get current week transactions count
     */
    public function getCurrentWeekTransactionsAttribute(): int
    {
        return $this->transactions()
            ->whereBetween('transactions.created_at', [
                now()->startOfWeek(),
                now()->endOfWeek(),
            ])
            ->count();
    }
}
