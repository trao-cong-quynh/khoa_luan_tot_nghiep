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
        Schema::table('bookings', function (Blueprint $table) {
            $table->decimal('original_price', 10, 2)->after('showtime_id');
            $table->decimal('discount_amount', 10, 2)->after('original_price')->nullable()->default(0);
            $table->integer('promotion_id')->after('total_tickets')->nullable();

            $table->foreign('promotion_id')->references('promotion_id')->on('promotions')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropForeign(['promotion_id']);
            $table->dropColumn(['original_price', 'discount_amount', 'promotion_id']);
        });
    }
};
