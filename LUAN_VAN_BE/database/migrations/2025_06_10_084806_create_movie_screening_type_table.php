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
        Schema::create('movie_screening_type', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->id();
            $table->integer('screening_type_id');
            $table->integer('movie_id');

            // Tạo ràng buộc duy nhât cho 2 cột
            $table->unique(['screening_type_id', 'movie_id']);

            //Tạo khóa ngoại
            $table->foreign('screening_type_id')->references('screening_type_id')->on('screening_type')->onDelete('restrict');
            $table->foreign('movie_id')->references('movie_id')->on('movies')->onDelete('restrict');


        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('movie_screening_type');
    }
};
