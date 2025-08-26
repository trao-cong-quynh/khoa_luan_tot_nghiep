<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $this->call(DistrictSeeder::class);

        // Chạy RolesAndPermissionsSeeder sau Districts để có thể gán quận cho manager
        $this->call(RolesAndPermissionsSeeder::class);

        // Chạy CinemaSeeder sau Districts để có thể gán rạp chiếu vào quận
        $this->call(CinemaSeeder::class);
    }
}
