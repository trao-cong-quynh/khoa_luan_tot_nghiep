<?php

namespace Database\Seeders;

use App\Models\District;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DistrictSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $districts = [
            ['district_name' => 'Quận 1', 'district_code' => 'Q1'],
            ['district_name' => 'Quận Bình Thạnh', 'district_code' => 'QBT'],
            ['district_name' => 'Quận Gò Vấp', 'district_code' => 'QGV'],
            ['district_name' => 'Quận Thủ Đức', 'district_code' => 'QTĐ'],
            ['district_name' => 'Quận 7', 'district_code' => 'Q7'],
        ];

        foreach ($districts as $district) {
            District::firstOrCreate(
                ['district_name' => $district['district_name']], // Điều kiện tìm kiếm
                $district // Dữ liệu để tạo nếu chưa tồn tại
            );
        }
    }
}
