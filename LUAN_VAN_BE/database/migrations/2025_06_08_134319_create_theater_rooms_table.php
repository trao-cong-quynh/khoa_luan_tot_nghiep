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
        Schema::create('theater_rooms', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->integer('room_id')->autoIncrement()->primary();
            $table->integer('cinema_id');
            $table->string('room_name');
            $table->string('room_type', 50);
            $table->integer('total_columns');
            $table->integer('total_rows');

            //Tạo khóa ngoại
            $table->foreign('cinema_id')->references('cinema_id')->on('cinemas')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('theater_rooms');
    }
};
