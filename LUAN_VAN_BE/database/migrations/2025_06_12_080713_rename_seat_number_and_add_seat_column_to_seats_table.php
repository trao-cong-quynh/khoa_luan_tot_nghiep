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
        Schema::table('seats', function (Blueprint $table) {
            $table->renameColumn('seat_number', 'seat_row'); // Đổi tên cột
            $table->string('seat_column')->after('seat_row'); // Thêm cột mới sau cột seat_row
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('seats', function (Blueprint $table) {
            $table->renameColumn('seat_row', 'seat_number'); // Đổi lại tên cột
            $table->dropColumn('seat_column');
        });
    }
};
