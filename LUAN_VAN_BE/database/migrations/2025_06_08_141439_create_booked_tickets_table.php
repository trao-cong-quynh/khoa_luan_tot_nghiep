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
        Schema::create('booked_tickets', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->id();
            $table->string('booking_id');
            $table->integer('ticket_type_id');
            $table->integer('seat_id');
            $table->integer('quantity');
            $table->decimal('unit_price', 8, 2);

            $table->unique(['booking_id', 'seat_id']);
            //Tạo khóa ngoại
            $table->foreign('booking_id')->references('booking_id')->on('bookings')->onDelete('restrict');
            $table->foreign('ticket_type_id')->references('ticket_type_id')->on('ticket_types')->onDelete('restrict');
            $table->foreign('seat_id')->references('seat_id')->on('seats')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booked_tickets');
    }
};
