<x-mail::message>
# Xin chào {{$user->name}},

Bạn nhận được email này vi chúng tôi đã nhận một yêu cầu đặt lại mật khẩu cho tài khoản của bạn.

Vui lòng nhấp vào nút dưới đây để đặt lại mật khẩu của bạn:

<x-mail::button :url="''">
Đặt lại mật khẩu
</x-mail::button>

Liên kết đặt lại mật khẩu của bạn hết hạn trong {{config('auth.passwords.users.expire')}} phút.

Nếu bạn không yêu cầu đặt lại mật khẩu , bạn có thể bỏ qua email này.

Trân trọng,

{{ config('app.name') }}
</x-mail::message>
