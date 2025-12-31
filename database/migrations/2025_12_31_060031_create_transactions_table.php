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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('carwash_type_id')->constrained();
            $table->foreignId('user_id')->constrained();                        // Cashier who created
            $table->foreignId('payment_method_id')->nullable()->constrained()->nullOnDelete();
            $table->string('license_plate')->nullable();                        // Plat nomor
            $table->integer('price');                                           // Final price
            $table->enum('payment_status', ['unpaid', 'paid'])->default('unpaid');
            $table->enum('wash_status', ['waiting', 'washing', 'done'])->default('waiting');
            $table->timestamp('paid_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
