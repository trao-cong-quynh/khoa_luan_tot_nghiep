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
        Schema::create('show_times', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->integer('showtime_id')->autoIncrement()->primary();
            $table->integer('movie_id');
            $table->integer('room_id');
            $table->dateTime('start_time');
            $table->dateTime('end_time');
            $table->timestamps();

            $table->foreign('movie_id')->references('movie_id')->on('movies')->onDelete('restrict');
            $table->foreign('room_id')->references('room_id')->on('theater_rooms')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('show_times');
    }
};
