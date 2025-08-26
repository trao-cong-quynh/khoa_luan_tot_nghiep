<?php

namespace Database\Seeders;

use App\Models\Cinemas;
use App\Models\District;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CinemaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        // Lấy một số district_id đã có để gán cho rạp chiếu
        $district1 = District::where('district_code', 'Q1')->first();
        $districtBinhThanh = District::where('district_code', 'QBT')->first();
        $districtGoVap = District::where('district_code', 'QGV')->first();


        $cinemas = [
            [
                'cinema_name' => 'CGV Vincom Đồng Khởi',
                'address' => '72 Lê Thánh Tôn, Bến Nghé, Q.1',
                'district_id' => $district1 ? $district1->district_id : null,
            ],
            [
                'cinema_name' => 'Lotte Cinema Gò Vấp',
                'address' => '242 Nguyễn Văn Lượng, P.10, Gò Vấp',

                'district_id' => $districtGoVap ? $districtGoVap->district_id : null,
            ],
            [
                'cinema_name' => 'BHD Star Vincom Thảo Điền',
                'address' => 'Tầng 5, Vincom Mega Mall Thảo Điền, Q.2 (nay là TP Thủ Đức)',

                'district_id' => District::where('district_code', 'QTĐ')->first()?->district_id, // Lấy ID trực tiếp
            ],
            [
                'cinema_name' => 'Galaxy Cinema Nguyễn Du',
                'address' => '116 Nguyễn Du, Bến Thành, Q.1',

                'district_id' => $district1 ? $district1->district_id : null,
            ],
            [
                'cinema_name' => 'Cinestar Quốc Thanh',
                'address' => '271 Nguyễn Trãi, P.Nguyễn Cư Trinh, Q.1',

                'district_id' => $district1 ? $district1->district_id : null,
            ],
            [
                'cinema_name' => 'CGV Pearl Plaza',
                'address' => '561 Điện Biên Phủ, P.25, Bình Thạnh',

                'district_id' => $districtBinhThanh ? $districtBinhThanh->district_id : null,
            ],
        ];

        foreach ($cinemas as $cinema) {
            Cinemas::firstOrCreate(
                ['cinema_name' => $cinema['cinema_name']],
                $cinema
            );
        }
    }
}
