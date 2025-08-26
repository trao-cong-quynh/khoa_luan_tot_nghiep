<?php

namespace Database\Seeders;

use App\Models\Cinemas;
use App\Models\District;
use App\Models\User;
use Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Xóa cache quyền và vai trò
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // 2. Tạo các Permissions (Quyền)
        $permissions = [
            // Quản lý người dùng
            'manage users',
            'view users',
            'create users',
            'edit users',
            'delete users',
            // Quản lý vai trò và gán vai trò
            'manage roles',
            'assign roles',
            // Quản lý rạp chiếu
            'manage cinemas',
            'view cinemas',          // Xem danh sách rạp
            'create cinemas',
            'edit cinemas',
            'delete cinemas',
            'restore cinemas',
            // Quản lý quận
            'manage districts',
            'view districts',
            'create districts',
            'edit districts',
            'delete districts',
            // Quyền đặc biệt: gán quận cho người quản lý
            'assign districts to managers',
            // Quyền khác có thể thêm sau
            'manage bookings',
            'view bookings', // Ví dụ: quản lý đặt vé
            'edit bookings', // Ví dụ: quản lý đặt vé
            // Quản lý phim
            'view movies',
            'create movies',
            'edit movies',
            'delete movies',
            'restore movies',
            // Quản lý suất chiếu
            'view showtimes',
            'create showtimes',
            'edit showtimes',
            'delete showtimes',

            //Quản lý phòng chiếu
            'view theater rooms',
            'create theater rooms',
            'edit theater rooms',
            'delete theater rooms',
            'restore theater rooms',

            //Quản lý  loại vé
            'view ticket types',
            'create ticket types',
            'edit ticket types',
            'delete ticket types',
            'view list restore ticket types',

            //Quản lý  đồ ăn/uống

            'view concessions',
            'create concessions',
            'edit concessions',
            'delete concessions',
            'restore concessions',

            //Đặt vé
            'create bookings',

            'approve counter booking',


            //Quản lý lịch chiếu
            'view movie schedule',
            'create movie schedule',
            'edit movie schedule',
            'delete movie schedule',
            'restore movie schedule',

            'create genres',
            'edit genres',
            'delete genres',
            'restore genres',
            'view list restore genres',

            'view promotion',
            'create promotion',
            'edit promotion',
            'delete promotion',

            'view revenue',

            'view district',
            'create district',
            'edit district',
            'delete district',
            'restore district',

        ];

        foreach ($permissions as $permissionName) {
            Permission::findOrCreate($permissionName, 'api'); // Sử dụng guard 'api' nếu bạn dùng API token
            // hoặc 'web' nếu bạn đang làm web app thông thường
            // hoặc bỏ qua guard_name nếu bạn dùng guard mặc định (web)
        }

        // 3. Tạo các Roles (Vai trò)
        $adminRole = Role::findOrCreate('admin', 'api');
        $districtManagerRole = Role::findOrCreate('district_manager', 'api');
        $userRole = Role::findOrCreate('user', 'api');
        $cinemaManagerRole = Role::findOrCreate('cinema_manager', 'api');
        $bookingManagerRole = Role::findOrCreate('booking_manager', 'api');
        $showtimeManagerRole = Role::findOrCreate('showtime_manager', 'api');
        // 4. Gán Permissions cho Roles

        // Admin sẽ có tất cả các quyền
        $adminRole->givePermissionTo(Permission::where('guard_name', 'api')->get()); // Lấy tất cả quyền với guard 'api'

        // District Manager có quyền xem và quản lý những thứ liên quan đến quận của họ
        $districtManagerRole->givePermissionTo([
            'view users',
            'edit users',
            'delete users',
            'create users',

            'view cinemas',
            'create cinemas',
            'edit cinemas',
            'delete cinemas',
            'restore cinemas',

            'view districts',

            'view theater rooms',
            'create theater rooms',
            'edit theater rooms',
            'delete theater rooms',
            'restore theater rooms',

            'view bookings',
            'approve counter booking',

            'view showtimes',
            'create showtimes',
            'edit showtimes',
            'delete showtimes',

            'view concessions',
            'create concessions',
            'edit concessions',
            'delete concessions',
            'restore concessions',


            'view movie schedule',
            'create movie schedule',
            'edit movie schedule',
            'delete movie schedule',
            'restore movie schedule',

            'edit bookings',

            'view movies',

            'view promotion',

            'view revenue',

        ]);

        // User có quyền xem một số thông tin công khai hoặc thông tin cá nhân của họ
        $userRole->givePermissionTo([
            'view cinemas', // Có thể xem rạp chiếu
            'view bookings', // Có thể xem đặt vé của chính họ
            'create bookings',
            'view promotion',
            'view movies',

            'view users',
            'edit users',
        ]);

        $bookingManagerRole->givePermissionTo([
            'view bookings',
            'create bookings',
            'approve counter booking',
            'edit users',
        ]);


        $showtimeManagerRole->givePermissionTo([
            'view showtimes',
            'create showtimes',
            'edit showtimes',
            'delete showtimes',

            'view cinemas',
            'view theater rooms',
            'edit users',
        ]);

        $cinemaManagerRole->givePermissionTo([
            'view users',
            'create users',
            'edit users',
            'delete users',

            'view theater rooms',
            'create theater rooms',
            'edit theater rooms',
            'delete theater rooms',
            'restore theater rooms',

            'view showtimes',
            'create showtimes',
            'edit showtimes',
            'delete showtimes',

            'view movie schedule',
            'create movie schedule',
            'edit movie schedule',
            'delete movie schedule',
            'restore movie schedule',

            'view bookings',
            'approve counter booking',
            'create bookings',

            'view cinemas',
        ]);

        // 5. Tạo Người dùng mẫu và gán Vai trò

        // Tạo một tài khoản Admin mẫu
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'full_name' => 'Admin User',
                'password' => Hash::make('password'),
                'phone' => '0123456789',
                'birth_date' => '1990-01-01',
                'gender' => 'Male',
                'avatar_url' => null,
                'create_at' => now(),
                'is_active' => true,
            ]
        );
        $adminUser->assignRole('admin');

        // Tạo một tài khoản District Manager mẫu
        $managerUser = User::firstOrCreate(
            ['email' => 'manager@example.com'],
            [
                'full_name' => 'District Manager',
                'password' => Hash::make('password'),
                'phone' => '0987654321',
                'birth_date' => '1992-05-15',
                'gender' => 'Female',
                'avatar_url' => null,
                'create_at' => now(),
                'is_active' => true,
            ]
        );
        $managerUser->assignRole('district_manager');

        // Tạo một tài khoản User mẫu
        $regularUser = User::firstOrCreate(
            ['email' => 'user@example.com'],
            [
                'full_name' => 'Regular User',
                'password' => Hash::make('password'),
                'phone' => '0777777777',
                'birth_date' => '1995-10-20',
                'gender' => 'Male',
                'avatar_url' => null,
                'create_at' => now(),
                'is_active' => true,
            ]
        );
        $regularUser->assignRole('user');

        // Tạo một tài khoản quản lý đơn hàng của một rạp mẫu
        $firstCinema = Cinemas::first();
        $cinemaId = $firstCinema?->cinema_id;
        $bookingManagerUser = User::firstOrCreate(
            ['email' => 'bookingmanager@example.com'],
            [
                'full_name' => 'Booking Manager User',
                'password' => Hash::make('password'),
                'phone' => '0123456789',
                'birth_date' => '1990-01-01',
                'gender' => 'Male',
                'avatar_url' => null,
                'create_at' => now(),
                'is_active' => true,
                'cinema_id' => $cinemaId
            ]
        );
        if (!$bookingManagerUser->wasRecentlyCreated && $cinemaId !== null) {
            $bookingManagerUser->update(['cinema_id' => $cinemaId]);
        }
        $bookingManagerUser->assignRole('booking_manager');

        //Tạo một tài khoản quản lý rạp
        $cinemaManagerUser = User::firstOrCreate(
            ['email' => 'cinema@example.com'],
            [
                'full_name' => 'Cinema Manager',
                'password' => Hash::make('password'),
                'phone' => '0987654321',
                'birth_date' => '1992-05-15',
                'gender' => 'Nam',
                'avatar_url' => null,
                'create_at' => now(),
                'is_active' => true,
                'cinema_id' => $cinemaId
            ]
        );
        if (!$cinemaManagerUser->wasRecentlyCreated && $cinemaId !== null) {
            $cinemaManagerUser->update(['cinema_id' => $cinemaId]);
        }


        $cinemaManagerUser->assignRole('cinema_manager');
        // Tạo một tài khoản quản lý suất chiếu của một rạp mẫu

        $showtimeManagerUser = User::firstOrCreate(
            ['email' => 'showtimemanager@example.com'],
            [
                'full_name' => 'Showtime Manager User',
                'password' => Hash::make('ShowtimeManger12345678@'),
                'phone' => '0123456789',
                'birth_date' => '1990-01-01',
                'gender' => 'Nam',
                'avatar_url' => null,
                'create_at' => now(),
                'is_active' => true,
                'cinema_id' => $cinemaId
            ]
        );
        if (!$showtimeManagerUser->wasRecentlyCreated && $cinemaId !== null) {
            $showtimeManagerUser->update(['cinema_id' => $cinemaId]);
        }
        $showtimeManagerUser->assignRole('showtime_manager');
        // 6. Gán quận cho District Manager mẫu
        // Lấy các quận đã được tạo từ DistrictSeeder
        $firstDistrict = District::where('district_code', 'Q1')->first(); // Ví dụ: Gán Quận 1
        $secondDistrict = District::where('district_code', 'QBT')->first(); // Ví dụ: Gán Quận Bình Thạnh

        if ($managerUser->hasRole('district_manager')) {
            $managedDistrictsData = [];
            if ($firstDistrict) {
                $managedDistrictsData[$firstDistrict->district_id] = [
                    'assigned_at' => now(),
                    'is_active_manager' => true
                ];
            }
            if ($secondDistrict) {
                $managedDistrictsData[$secondDistrict->district_id] = [
                    'assigned_at' => now(),
                    'is_active_manager' => true
                ];
            }

            if (!empty($managedDistrictsData)) {
                $managerUser->managedDistricts()->syncWithoutDetaching($managedDistrictsData);
            }
        }


    }
}
