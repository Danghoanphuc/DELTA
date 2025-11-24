// src/features/landing/components/LandingFooter.tsx (RE-DESIGNED)

import {
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Send,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button"; // Đảm bảo import Button đúng

export function Footer() {
  const navigate = useNavigate();

  const handleNavClick = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-slate-950 text-slate-300 relative overflow-hidden border-t border-slate-900">
      
      {/* 1. BACKGROUND DECOR: GRID KỸ THUẬT MỜ */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      
      {/* 2. GLOW EFFECT: Ánh sáng xanh nhẹ dưới đáy */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-900/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          
          {/* CỘT 1: THƯƠNG HIỆU & GIỚI THIỆU (Chiếm 4 phần) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
                 {/* Logo chữ P cách điệu hoặc icon */}
                 <span className="text-2xl font-black text-white">P</span>
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                Printz<span className="text-blue-500">.vn</span>
              </span>
            </div>
            
            <p className="text-slate-400 leading-relaxed">
              Nền tảng Web2Print tiên phong tại Việt Nam. Chúng tôi kết nối công nghệ và in ấn để biến ý tưởng của bạn thành hiện thực với tốc độ và chất lượng vượt trội.
            </p>

            <div className="flex gap-4 pt-2">
              {[Facebook, Instagram, Youtube, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all duration-300"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* CỘT 2: SẢN PHẨM (Chiếm 2 phần) */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h4 className="text-white font-bold mb-6">Sản phẩm</h4>
            <ul className="space-y-4">
              {[
                { label: "Card Visit", path: "/templates" },
                { label: "Bao bì & Hộp", path: "/templates" },
                { label: "Túi vải Canvas", path: "/templates" },
                { label: "Standee & POSM", path: "/templates" },
                { label: "Sản phẩm", path: "/shop" },
              ].map((item, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => handleNavClick(item.path)}
                    className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-blue-500 transition-colors"></span>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* CỘT 3: CÔNG TY (Chiếm 2 phần) */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-bold mb-6">Về Printz</h4>
            <ul className="space-y-4">
              {[
                { label: "Giải pháp Doanh nghiệp", path: "/business" },
                { label: "Công nghệ", path: "/process" },
                { label: "Blog & Xu hướng", path: "/trends" },
                { label: "Kho mẫu", path: "/templates" },
                { label: "Liên hệ", path: "/contact" },
              ].map((item, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => handleNavClick(item.path)}
                    className="text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* CỘT 4: LIÊN HỆ (Chiếm 3 phần) */}
          <div className="lg:col-span-3">
            <h4 className="text-white font-bold mb-6">Liên hệ</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-400">
                  Tòa nhà TechHub, 123 Nguyễn Huệ, Quận 1, TP.HCM
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <a href="tel:1900xxxx" className="text-slate-400 hover:text-white">
                  1900 xxxx (8:00 - 18:00)
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <a href="mailto:support@printz.vn" className="text-slate-400 hover:text-white">
                  support@printz.vn
                </a>
              </li>
            </ul>

            {/* Newsletter Mini */}
            <div className="mt-8 pt-6 border-t border-slate-900">
              <p className="text-xs text-slate-500 mb-3 uppercase font-bold tracking-wider">Đăng ký nhận tin</p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Email của bạn..." 
                  className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white w-full focus:outline-none focus:border-blue-600 transition-colors"
                />
                <Button size="icon" className="bg-blue-600 hover:bg-blue-700 rounded-lg w-10 h-10 flex-shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            © 2025 Printz.vn - Một sản phẩm của Technology JSC.
          </p>
          <div className="flex gap-8 text-sm">
            <button onClick={() => handleNavClick("/policy")} className="text-slate-500 hover:text-white transition-colors">
              Bảo mật
            </button>
            <button onClick={() => handleNavClick("/policy")} className="text-slate-500 hover:text-white transition-colors">
              Điều khoản
            </button>
            <button onClick={() => handleNavClick("/templates")} className="text-slate-500 hover:text-white transition-colors">
              Kho mẫu
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;