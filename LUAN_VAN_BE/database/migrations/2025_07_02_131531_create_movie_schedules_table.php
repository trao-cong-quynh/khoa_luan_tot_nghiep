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
        Schema::create('movie_schedules', function (Blueprint $table) {
            $table->engine('InnoDB');
            $table->integer('movie_schedule_id')->autoIncrement()->primary();
            $table->integer('movie_id');
            $table->integer('cinema_id');
            $table->date('start_date');
            $table->date('end_date');
            $table->timestamps();

            $table->foreign('movie_id')->references('movie_id')->on('movies')->onDelete('cascade');
            $table->foreign('cinema_id')->references('cinema_id')->on('cinemas')->onDelete('cascade');
            $table->unique(['movie_id', 'cinema_id', 'start_date', 'end_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('movie_schedules');
    }
};
