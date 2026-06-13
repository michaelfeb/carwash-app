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
        Schema::table('customers', function (Blueprint $table) {
            $table->unsignedInteger('loyalty_stamps')->default(0)->after('notes');
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->boolean('loyalty_discount_applied')->default(false)->after('slot');
            $table->unsignedInteger('original_price')->nullable()->after('loyalty_discount_applied');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['loyalty_discount_applied', 'original_price']);
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn('loyalty_stamps');
        });
    }
};