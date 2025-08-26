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
        Schema::create('movies', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->integer('movie_id')->autoIncrement()->primary();
            $table->string('movie_name');
            $table->text('description');
            $table->integer('duration');
            $table->date('release_date');
            $table->string('poster_url');
            $table->string('screening_type', 50);
            $table->string('derector', 100);
            $table->text('actor');
            $table->string('status', 100);
            $table->integer('age_rating');
            $table->string('country', 100);
            $table->dateTime('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('movies');
    }
};
