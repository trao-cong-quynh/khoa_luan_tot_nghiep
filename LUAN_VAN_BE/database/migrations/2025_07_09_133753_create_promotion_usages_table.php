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
        Schema::create('promotion_usages', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->integer('usage_id')->primary()->autoIncrement();
            $table->integer('promotion_id');
            $table->integer('user_id')->nullable();
            $table->string('booking_id');
            $table->decimal('applied_amount', 10, 2);
            $table->dateTime('usage_date');
            $table->timestamps();

            $table->foreign('promotion_id')->references('promotion_id')->on('promotions')->onDelete('cascade');
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('set null');
            $table->foreign('booking_id')->references('booking_id')->on('bookings')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promotion_usages');
    }
};
