<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CarwashType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'size_category',
        'min_price',
        'max_price',
        'description',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'min_price' => 'integer',
            'max_price' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the transactions for this carwash type
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Get the price range formatted
     */
    public function getPriceRangeAttribute(): string
    {
        return 'Rp ' . number_format($this->min_price, 0, ',', '.') . ' - Rp ' . number_format($this->max_price, 0, ',', '.');
    }
}
