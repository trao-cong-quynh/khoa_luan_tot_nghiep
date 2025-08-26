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
        Schema::create('seats', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->integer('seat_id')->autoIncrement()->primary();
            $table->integer('room_id');
            $table->integer('seat_number');
            $table->string('seat_status', 100);
          

            //Tạo khóa ngoại
            $table->foreign('room_id')->references('room_id')->on('theater_rooms')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seats');
    }
};
