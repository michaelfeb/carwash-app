<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

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
            ->withPivot('fee')
            ->withTimestamps();
    }

    /**
     * Get total earnings for this staff
     */
    public function getTotalEarningsAttribute(): int
    {
        return $this->transactions()->sum('transaction_staffs.fee');
    }

    /**
     * Get total transactions count
     */
    public function getTransactionCountAttribute(): int
    {
        return $this->transactions()->count();
    }
}
