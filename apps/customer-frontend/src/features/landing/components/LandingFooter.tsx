import {
  Facebook,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/shared/components/ui/Logo";

export function Footer() {
  const navigate = useNavigate();

  const handleNavClick = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-stone-100 text-stone-900 font-sans border-t border-stone-200">
      <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 mb-12">
          {/* CỘT 1: VỀ PRINTZ */}
          <div className="lg:col-span-4 space-y-6">
            <div>
              <Logo variant="full" color="default" />
              <p className="text-stone-600 text-sm mt-4 leading-relaxed font-light italic">
                Giải pháp in ấn & Quà tặng doanh nghiệp toàn diện
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-stone-700 leading-relaxed">
                  Đường DK6A, Phường Thới Hòa, TP Hồ Chí Minh
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-emerald-600" />
                <a
                  href="tel:0865726848"
                  className="text-stone-700 hover:text-emerald-800 transition-colors font-medium"
                >
                  0865 726 848
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-emerald-600" />
                <a
                  href="mailto:hello@printz.vn"
                  className="text-stone-700 hover:text-emerald-800 transition-colors font-medium"
                >
                  hello@printz.vn
                </a>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <a
                href="https://facebook.com/printz"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center border border-stone-300 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com/company/printz"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center border border-stone-300 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://zalo.me/printz"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center border border-stone-300 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* CỘT 2: HỖ TRỢ KHÁCH HÀNG */}
          <div className="lg:col-span-3">
            <h4 className="font-serif text-lg font-bold text-stone-900 mb-6">
              Hỗ trợ khách hàng
            </h4>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => handleNavClick("/process")}
                  className="text-stone-700 hover:text-emerald-800 hover:translate-x-1 transition-all text-sm"
                >
                  Hướng dẫn đặt hàng
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick("/my-orders")}
                  className="text-stone-700 hover:text-emerald-800 hover:translate-x-1 transition-all text-sm"
                >
                  Tra cứu đơn hàng (Tracking)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick("/design-guidelines")}
                  className="text-stone-700 hover:text-emerald-800 hover:translate-x-1 transition-all text-sm"
                >
                  Quy chuẩn file thiết kế
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick("/faq")}
                  className="text-stone-700 hover:text-emerald-800 hover:translate-x-1 transition-all text-sm"
                >
                  Câu hỏi thường gặp (F.A.Q)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick("/contact")}
                  className="text-stone-700 hover:text-emerald-800 hover:translate-x-1 transition-all text-sm"
                >
                  Liên hệ hỗ trợ
                </button>
              </li>
            </ul>
          </div>

          {/* CỘT 3: CAM KẾT CỦA CHÚNG TÔI */}
          <div className="lg:col-span-3">
            <h4 className="font-serif text-lg font-bold text-stone-900 mb-6">
              Cam kết của chúng tôi
            </h4>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => handleNavClick("/quality-standards")}
                  className="text-stone-700 hover:text-emerald-800 hover:translate-x-1 transition-all text-sm"
                >
                  Tiêu chuẩn chất lượng
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick("/warranty")}
                  className="text-stone-700 hover:text-emerald-800 hover:translate-x-1 transition-all text-sm"
                >
                  Cam kết & Đổi trả
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick("/policy?tab=privacy")}
                  className="text-stone-700 hover:text-emerald-800 hover:translate-x-1 transition-all text-sm"
                >
                  Bảo mật thông tin
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick("/shipping-policy")}
                  className="text-stone-700 hover:text-emerald-800 hover:translate-x-1 transition-all text-sm"
                >
                  Chính sách giao vận
                </button>
              </li>
            </ul>
          </div>

          {/* CỘT 4: TÀI NGUYÊN */}
          <div className="lg:col-span-2">
            <h4 className="font-serif text-lg font-bold text-stone-900 mb-6">
              Tài nguyên
            </h4>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => handleNavClick("/blog?category=knowledge")}
                  className="text-stone-700 hover:text-emerald-800 hover:translate-x-1 transition-all text-sm"
                >
                  Blog Kiến thức in ấn
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick("/trends")}
                  className="text-stone-700 hover:text-emerald-800 hover:translate-x-1 transition-all text-sm"
                >
                  Ý tưởng quà tặng
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick("/templates")}
                  className="text-stone-700 hover:text-emerald-800 hover:translate-x-1 transition-all text-sm"
                >
                  Tải Template thiết kế
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick("/about")}
                  className="text-stone-700 hover:text-emerald-800 hover:translate-x-1 transition-all text-sm"
                >
                  Về chúng tôi
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick("/careers")}
                  className="text-stone-700 hover:text-emerald-800 hover:translate-x-1 transition-all text-sm"
                >
                  Tuyển dụng
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* SUB-FOOTER */}
        <div className="pt-8 border-t border-stone-300 flex flex-col md:flex-row justify-between items-center text-xs font-mono text-stone-400 uppercase tracking-widest gap-4">
          <p>© 2025 Printz Brand Solutions. All rights reserved.</p>
          <div className="flex flex-wrap gap-8 justify-center">
            <button
              onClick={() => handleNavClick("/policy")}
              className="hover:text-stone-900 transition-colors"
            >
              Điều khoản sử dụng
            </button>
            <button
              onClick={() => handleNavClick("/policy")}
              className="hover:text-stone-900 transition-colors"
            >
              Chính sách Cookie
            </button>
            <button
              onClick={() => handleNavClick("/sitemap")}
              className="hover:text-stone-900 transition-colors"
            >
              Sitemap
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
