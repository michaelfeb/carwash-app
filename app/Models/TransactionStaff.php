<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransactionStaff extends Model
{
    use HasFactory;

    protected $table = 'transaction_staffs';

    protected $fillable = [
        'transaction_id',
        'staff_id',
        'fee',
    ];

    protected function casts(): array
    {
        return [
            'fee' => 'integer',
        ];
    }

    /**
     * Get the transaction
     */
    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    /**
     * Get the staff
     */
    public function staff(): BelongsTo
    {
        return $this->belongsTo(Staff::class);
    }
}
