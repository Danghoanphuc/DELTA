// src/features/landing/components/LandingFooter.tsx (ĐÃ SỬA)
import {
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  Mail,
  Phone,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom"; // <-- 1. IMPORT

interface FooterProps {
  // onNavigate: (page: string) => void; // <-- 2. XÓA BỎ
}

export function Footer({}: FooterProps) {
  // <-- 3. XÓA PROPS
  const navigate = useNavigate(); // <-- 4. KHỞI TẠO

  // 5. SỬA HÀM NÀY
  const handleNavClick = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Về Printz & MXH */}
          {/* ... (phần logo giữ nguyên) ... */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black">Printz.vn</span>
            </div>
            <p className="text-slate-400 mb-4">
              Nền tảng in ấn trực tuyến thông minh & tiện lợi, kết nối bạn với
              những nhà in uy tín nhất Việt Nam.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-800 hover:bg-pink-600 flex items-center justify-center transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-800 hover:bg-red-600 flex items-center justify-center transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-800 hover:bg-sky-600 flex items-center justify-center transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Sản phẩm */}
          <div>
            <h3 className="mb-4">Sản phẩm</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleNavClick("/templates")} // <-- SỬA
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Card Visit
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick("/templates")} // <-- SỬA
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Áo thun
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick("/templates")} // <-- SỬA
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Túi vải
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick("/templates")} // <-- SỬA
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Standee
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick("/shop")} // <-- SỬA
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Xem tất cả sản phẩm
                </button>
              </li>
            </ul>
          </div>

          {/* Công ty */}
          <div>
            <h3 className="mb-4">Công ty</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleNavClick("/")} // <-- SỬA (chưa có trang)
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Về chúng tôi
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick("/process")} // <-- SỬA
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Quy trình làm việc
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick("/")} // <-- SỬA (chưa có trang)
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Đối tác Kinh doanh
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick("/trends")} // <-- SỬA
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Blog & Xu hướng
                </button>
              </li>
            </ul>
          </div>

          {/* Hỗ trợ */}
          <div>
            <h3 className="mb-4">Hỗ trợ</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleNavClick("/contact")} // <-- SỬA
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Liên hệ
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick("/policy")} // <-- SỬA
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Chính sách
                </button>
              </li>
              {/* ... (phần còn lại giữ nguyên) ... */}
              <li>
                <a
                  href="tel:1900xxxx"
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  1900 xxxx
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@printz.vn"
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  support@printz.vn
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-center md:text-left">
              © 2025 Printz.vn. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex gap-6">
              <button
                onClick={() => handleNavClick("/policy")} // <-- SỬA
                className="text-slate-400 hover:text-white transition-colors"
              >
                Chính sách bảo mật
              </button>
              <button
                onClick={() => handleNavClick("/policy")} // <-- SỬA
                className="text-slate-400 hover:text-white transition-colors"
              >
                Điều khoản dịch vụ
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
