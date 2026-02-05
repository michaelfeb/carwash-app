<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->integer('owner_share')->default(0)->after('price');   // 60% dari price
            $table->integer('staff_pool')->default(0)->after('owner_share'); // 40% dari price
        });

        // Update existing transactions to calculate shares
        \DB::table('transactions')->get()->each(function ($transaction) {
            \DB::table('transactions')
                ->where('id', $transaction->id)
                ->update([
                    'owner_share' => (int) floor($transaction->price * 0.6),
                    'staff_pool' => (int) floor($transaction->price * 0.4),
                ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['owner_share', 'staff_pool']);
        });
    }
};
