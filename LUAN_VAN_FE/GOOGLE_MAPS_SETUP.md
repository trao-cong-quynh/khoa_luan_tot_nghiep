# Hướng dẫn cấu hình Google Maps API

## Vấn đề hiện tại

Lỗi "This page can't load Google Maps correctly" xảy ra do:

1. API key không hợp lệ hoặc hết hạn
2. API key chưa được kích hoạt đúng services
3. API key bị hạn chế domain

## Cách khắc phục

### 1. Tạo file .env

Tạo file `.env` trong thư mục `movie-ticket/` với nội dung:

```env
# Google Maps API Configuration
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here

# API Configuration
VITE_API_URL=http://localhost:8000/api
VITE_API_TIMEOUT=20000
```

### 2. Lấy API key mới từ Google Cloud Console

1. Truy cập: https://console.cloud.google.com/
2. Tạo project mới hoặc chọn project có sẵn
3. Vào "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "API Key"
5. Copy API key mới

### 3. Kích hoạt các APIs cần thiết

Trong Google Cloud Console, vào "APIs & Services" > "Library" và kích hoạt:

- **Maps JavaScript API**
- **Geocoding API** (cho chức năng tìm địa chỉ)

### 4. Cấu hình hạn chế API key (Tùy chọn nhưng khuyến nghị)

1. Vào "APIs & Services" > "Credentials"
2. Click vào API key vừa tạo
3. Trong "Application restrictions":
   - Chọn "HTTP referrers (web sites)"
   - Thêm domain: `localhost:5173/*` (cho development)
   - Thêm domain production khi deploy
4. Trong "API restrictions":
   - Chọn "Restrict key"
   - Chọn "Maps JavaScript API" và "Geocoding API"

### 5. Restart development server

```bash
npm run dev
```

## Kiểm tra

Sau khi cấu hình, Google Maps sẽ hiển thị bình thường. Nếu vẫn có lỗi, kiểm tra:

- Console browser để xem lỗi chi tiết
- API key có đúng format không
- APIs đã được kích hoạt chưa
- Domain có trong whitelist không

## Lưu ý bảo mật

- Không commit file `.env` vào git
- Sử dụng environment variables khác nhau cho development và production
- Giới hạn API key theo domain và API cụ thể
