<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WeeklyStaffEarning extends Model
{
    use HasFactory;

    protected $fillable = [
        'staff_id',
        'week_start',
        'week_end',
        'total_pool',
        'staff_count',
        'earning',
        'transaction_count',
        'is_paid',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'week_start' => 'date',
            'week_end' => 'date',
            'total_pool' => 'integer',
            'staff_count' => 'integer',
            'earning' => 'integer',
            'transaction_count' => 'integer',
            'is_paid' => 'boolean',
            'paid_at' => 'datetime',
        ];
    }

    /**
     * Get the staff for this earning record
     */
    public function staff(): BelongsTo
    {
        return $this->belongsTo(Staff::class);
    }

    /**
     * Get formatted earning
     */
    public function getFormattedEarningAttribute(): string
    {
        return 'Rp ' . number_format($this->earning, 0, ',', '.');
    }

    /**
     * Get week label (e.g., "1-7 Jan 2026")
     */
    public function getWeekLabelAttribute(): string
    {
        return $this->week_start->format('j') . '-' . $this->week_end->format('j M Y');
    }
}
