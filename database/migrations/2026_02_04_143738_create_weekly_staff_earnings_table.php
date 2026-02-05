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
        Schema::create('weekly_staff_earnings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_id')->constrained('staffs')->cascadeOnDelete();
            $table->date('week_start');           // Tanggal awal minggu (Senin)
            $table->date('week_end');             // Tanggal akhir minggu (Minggu)
            $table->integer('total_pool');        // Total pool 40% untuk minggu ini
            $table->integer('staff_count');       // Jumlah staff yang bekerja minggu ini
            $table->integer('earning');           // Hasil bagi merata untuk staff ini
            $table->integer('transaction_count'); // Jumlah transaksi yang dikerjakan staff ini
            $table->boolean('is_paid')->default(false); // Status pembayaran
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            // Unique constraint: satu staff hanya punya satu record per minggu
            $table->unique(['staff_id', 'week_start']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('weekly_staff_earnings');
    }
};
