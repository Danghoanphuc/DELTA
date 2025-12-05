import {
  Facebook,
  Linkedin,
  Instagram,
  ArrowRight,
  ShieldCheck,
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
      <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-20">
          {/* CỘT 1: BRAND & CERTIFICATIONS (4 col) */}
          <div className="lg:col-span-4 space-y-8 lg:pr-12">
            <Logo variant="full" color="default" />
            <p className="text-stone-500 leading-relaxed font-light text-lg">
              Nền tảng hạ tầng in ấn và quản trị thương hiệu toàn diện dành cho
              doanh nghiệp hiện đại.
            </p>

            {/* Certifications Badge */}
            <div className="flex flex-wrap gap-4 pt-4 border-t border-stone-200">
              <div className="flex items-center gap-2 text-stone-400 grayscale hover:grayscale-0 transition-all">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-xs font-bold">ISO 9001:2015</span>
              </div>
              <div className="flex items-center gap-2 text-stone-400 grayscale hover:grayscale-0 transition-all">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-xs font-bold">FSC Certified</span>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              {[Facebook, Linkedin, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 flex items-center justify-center border border-stone-300 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all rounded-none"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* CỘT 2: SẢN PHẨM (2 col) */}
          <div className="lg:col-span-2">
            <h4 className="font-serif text-xl font-bold text-stone-900 mb-6">
              Sản phẩm
            </h4>
            <ul className="space-y-3">
              {[
                "Danh thiếp",
                "Ấn phẩm văn phòng",
                "Marketing Materials",
                "Bao bì & Nhãn",
                "Quà tặng doanh nghiệp",
              ].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => handleNavClick("/shop")}
                    className="text-stone-500 hover:text-emerald-800 hover:translate-x-1 transition-all text-sm font-medium"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* CỘT 3: GIẢI PHÁP & HỖ TRỢ (3 col) */}
          <div className="lg:col-span-3">
            <h4 className="font-serif text-xl font-bold text-stone-900 mb-6">
              Hỗ trợ khách hàng
            </h4>
            <div className="grid grid-cols-1 gap-6">
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => handleNavClick("/business")}
                    className="text-stone-500 hover:text-emerald-800 hover:translate-x-1 transition-all text-sm font-medium"
                  >
                    Giải pháp Brand Management
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavClick("/contact")}
                    className="text-stone-500 hover:text-emerald-800 hover:translate-x-1 transition-all text-sm font-medium"
                  >
                    Liên hệ báo giá
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavClick("/faq")}
                    className="text-stone-500 hover:text-emerald-800 hover:translate-x-1 transition-all text-sm font-medium"
                  >
                    Trung tâm trợ giúp (Help Center)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavClick("/policy")}
                    className="text-stone-500 hover:text-emerald-800 hover:translate-x-1 transition-all text-sm font-medium"
                  >
                    Chính sách bảo mật & Đổi trả
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* CỘT 4: NEWSLETTER (3 col) */}
          <div className="lg:col-span-3 bg-white p-8 border border-stone-200 shadow-sm">
            <h4 className="font-serif text-xl font-bold text-stone-900 mb-4 italic">
              Enterprise Insights.
            </h4>
            <p className="text-stone-500 text-sm mb-6 leading-relaxed">
              Nhận bản tin hàng tháng về xu hướng quản trị thương hiệu và tối ưu
              chi phí vận hành.
            </p>
            <div className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Email công việc của bạn"
                className="w-full bg-stone-50 border border-stone-200 px-4 py-3 outline-none focus:border-emerald-800 transition-colors rounded-none placeholder:text-stone-400 text-sm"
              />
              <button className="bg-stone-900 text-white px-6 py-3 hover:bg-emerald-900 transition-colors rounded-none w-full font-bold uppercase tracking-widest text-xs flex justify-center items-center gap-2">
                Đăng ký <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="pt-8 border-t border-stone-300 flex flex-col md:flex-row justify-between items-center text-xs font-mono text-stone-400 uppercase tracking-widest gap-4">
          <p>© 2025 PRINTZ VIETNAM INC. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-stone-900">
              Privacy
            </a>
            <a href="#" className="hover:text-stone-900">
              Terms
            </a>
            <a href="#" className="hover:text-stone-900">
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
