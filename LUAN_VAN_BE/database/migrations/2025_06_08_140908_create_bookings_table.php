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
        Schema::create('bookings', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->string('booking_id')->primary();
            $table->integer('user_id');
            $table->integer('showtime_id');
            $table->decimal('total_price');
            $table->integer('total_tickets');
            $table->string('status', 100);
            $table->dateTime('booking_date');

            //tạo khóa ngoại
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('restrict');
            $table->foreign('showtime_id')->references('showtime_id')->on('show_times')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
