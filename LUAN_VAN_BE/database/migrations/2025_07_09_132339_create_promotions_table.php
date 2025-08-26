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
        Schema::create('promotions', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->integer('promotion_id')->primary()->autoIncrement();
            $table->string('name');
            $table->string('code', 50)->unique()->nullable();
            $table->text('description')->nullable();
            $table->dateTime('start_date');
            $table->dateTime('end_date');
            $table->enum('type', ['FIXED_DISCOUNT', 'PERCENT_DISCOUNT']);
            $table->decimal('discount_value', 10, 2);
            $table->decimal('max_discount_amount')->nullable();
            $table->decimal('min_order_amount', 10, 2)->default(0.00);
            $table->integer('usage_limit_per_user')->default(0);
            $table->integer('total_usage_limit')->default(0);
            $table->enum('apply_to_product_type', ['TICKET', 'COMBO', 'ALL'])->default('ALL');
            $table->string('status', 100)->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promotions');
    }
};
