<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_number',
        'customer_id',
        'carwash_type_id',
        'user_id',
        'payment_method_id',
        'license_plate',
        'price',
        'payment_status',
        'wash_status',
        'paid_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'paid_at' => 'datetime',
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
            ->withPivot('fee')
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
     * Get total staff fees
     */
    public function getTotalStaffFeesAttribute(): int
    {
        return $this->staffs->sum('pivot.fee');
    }
}
