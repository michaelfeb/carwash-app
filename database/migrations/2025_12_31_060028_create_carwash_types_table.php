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
        Schema::create('carwash_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');                              // "Small Car", "Medium Car", etc.
            $table->string('size_category');                     // small, medium, big, special
            $table->integer('min_price');                        // 35000
            $table->integer('max_price');                        // 40000
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('carwash_types');
    }
};
