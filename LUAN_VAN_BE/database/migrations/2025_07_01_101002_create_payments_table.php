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
        Schema::create('payments', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->id('payment_id');
            $table->string('booking_id',191)
                ->constrained('bookings', 'booking_id')
                ->onDelete('cascade');
            $table->string('transaction_id')->nullable()->unique();
            $table->string('payment_method');
            $table->string('gateway_transaction_status_coode')->nullable();
            $table->string('gateway_transaction_message')->nullable();
            $table->string('inernal_status');
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('VND');
            $table->json('gateway_response_data')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->dateTime('payment_initiated_at');
            $table->dateTime('payment_completed_at')->nullable();
            $table->timestamps();

            $table->index('booking_id');
            $table->index('inernal_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
