import React, { forwardRef } from "react";
import logo from "../../assets/logo/logo.png";
const Footer = forwardRef(function Footer(props, ref) {
  return (
    <footer
      ref={ref}
      id="footer"
      className="bg-[#1f1235] text-white py-6 border border-blue-400"
      {...props}
    >
      <div className="w-[80%] mx-auto grid grid-cols-2 md:grid-cols-3 gap-8 pb-4">
        {/* Cột 1: Giới thiệu */}
        <div>
          <h3 className="font-bold mb-3 text-lg">GIỚI THIỆU</h3>
          <ul className="space-y-1 text-base text-gray-200">
            <li>Về chúng tôi</li>
            <li>Thỏa thuận sử dụng</li>
            <li>Quy chế hoạt động</li>
            <li>Chính sách bảo mật</li>
          </ul>
        </div>
        {/* Cột 2: Góc điện ảnh */}
        <div>
          <h3 className="font-bold mb-3 text-lg">GÓC ĐIỆN ẢNH</h3>
          <ul className="space-y-1 text-base text-gray-200">
            <li>Thể loại phim</li>
            <li>Bình luận phim</li>
            <li>Blog điện ảnh</li>
            <li>Phim hay tháng</li>
            <li>Phim IMAX</li>
          </ul>
        </div>
        {/* Cột 3: Hỗ trợ */}
        <div>
          <h3 className="font-bold mb-3 text-lg">HỖ TRỢ</h3>
          <ul className="space-y-1 text-base text-gray-200">
            <li>Góp ý</li>
            <li>Sale & Services</li>
            <li>Rạp/ Giá vé</li>
            <li>Tuyển dụng</li>
            <li>FAQ</li>
          </ul>
        </div>
      </div>
      {/* Đường kẻ phân cách */}
      <div className="w-[80%] mx-auto border-t border-gray-500 my-4"></div>

      {/* Thông tin công ty */}
      <div className="w-[80%] mx-auto flex items-center">
        <img src={logo} alt="Galaxy Cinema" className="h-14 mr-3" />
        <div>
          <p className="font-bold text-white text-lg">
            CÔNG TY CỔ PHẦN HAI THÀNH VIÊN
          </p>
          <p className="text-xs">
            3/9 Võ Văn Tần, Phường Võ Thị Sáu, Quận 3, Tp. Hồ Chí Minh, Việt Nam
          </p>
          <p className="text-xs">
            📞 028.39.333.303 - ☎ 19002224 (9:00 - 22:00) - ✉
            hotro@galaxystudio.vn
          </p>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
