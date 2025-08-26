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
        Schema::create('booking_concessions', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->id();
            $table->string('booking_id');
            $table->integer('concession_id');
            $table->integer('quantity');
            $table->decimal('total_price', 8, 2);


            //Tạo khóa ngoại tổ hợp
            $table->unique(['booking_id', 'concession_id']);

            //Tạo khóa ngoại
            $table->foreign('booking_id')->references('booking_id')->on('bookings')->onDelete('restrict');
            $table->foreign('concession_id')->references('concession_id')->on('concessions')->onDelete('restrict');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_concessions');
    }
};
