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
        Schema::create('district_managers', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->integer('user_id');
            $table->unsignedBigInteger('district_id');
            $table->timestamp('assigned_at')->useCurrent();
            $table->boolean('is_active_manager')->default(true);

            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
            $table->foreign('district_id')->references('district_id')->on('districts')->onDelete('cascade');

            $table->primary(['user_id', 'district_id']);

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('district_managers');
    }
};
