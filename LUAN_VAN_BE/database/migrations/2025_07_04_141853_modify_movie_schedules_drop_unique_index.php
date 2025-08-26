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
        Schema::table('movie_schedules', function (Blueprint $table) {
            $table->dropForeign('movie_schedules_movie_id_foreign');
            $table->dropForeign('movie_schedules_cinema_id_foreign');

            $table->dropUnique('movie_schedules_movie_id_cinema_id_start_date_end_date_unique');

            $table->foreign('movie_id')->references('movie_id')->on('movies')->onDelete('cascade');
            $table->foreign('cinema_id')->references('cinema_id')->on('cinemas')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('movie_schedules', function (Blueprint $table) {
            $table->dropForeign(['movie_schedules_movie_id_foreign']);
            $table->dropForeign(['movie_schedules_cinema_id_foreign']);

            $table->unique(['movie_id', 'cinema_id', 'start_date', 'end_date']);


            $table->foreign('movie_id')->references('movie_id')->on('movies')->onDelete('cascade');
            $table->foreign('cinema_id')->references('cinema_id')->on('cinemas')->onDelete('cascade');
        });
    }
};
