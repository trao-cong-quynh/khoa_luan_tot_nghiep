<?php

use Illuminate\Support\Env;

return [
    'showtime_booking_cutoff_minutes' => 15,
    'showtime_update_batch_threshold' => env('SHOWTIME_UPDATE_BATCH_THRESHOLD'),
    'pending_booking_cancellation_minutes' => env('PENDING_BOOKING_CANCELLATION_MINUTES'),
    'chunk_size' => env('CHUNK_SIZE'),
];
