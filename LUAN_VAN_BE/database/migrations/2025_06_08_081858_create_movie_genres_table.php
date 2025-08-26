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
        Schema::create('movie_genres', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->id();
            $table->integer('movie_id');
            $table->integer('genre_id');

            //Tạo khóa chỉnh tổ hợp
            $table->unique(['movie_id', 'genre_id']);

            //Tạo khóa ngoại
            $table->foreign('movie_id')->references('movie_id')->on('movies')->onDelete('restrict');
            $table->foreign('genre_id')->references('genre_id')->on('genres')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('movie_genres');
    }
};
