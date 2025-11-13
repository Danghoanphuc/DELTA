// File: src/components/landing/LandingHeader.tsx (ĐÃ SỬA)
import myLogo from "/src/assets/img/logo-printz.png";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useNavigate } from "react-router-dom"; // <-- 1. IMPORT

export function Header() {
  // <-- 2. XÓA PROPS
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate(); // <-- 3. KHỞI TẠO NAVIGATE

  // 4. SỬA HÀM NÀY
  const handleNavClick = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => handleNavClick("/")} // <-- SỬA
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center transform group-hover:scale-110 transition-transform">
              <img src={myLogo} alt="printz-logo" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Printz
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => handleNavClick("/inspiration")} // <-- SỬA (hoặc /inspiration)
              className="text-slate-700 hover:text-blue-600"
            >
              Kho mẫu
            </button>
            <button
              onClick={() => handleNavClick("/app")} // <-- SỬA
              className="text-slate-700 hover:text-blue-600"
            >
              Xu hướng
            </button>
            <button
              onClick={() => handleNavClick("/shop")} // <-- SỬA (Chưa có trang)
              className="text-slate-700 hover:text-blue-600"
            >
              Kinh doanh
            </button>
            <button
              onClick={() => handleNavClick("/process")} // <-- SỬA (Chưa có trang)
              className="text-slate-700 hover:text-blue-600"
            >
              Về chúng tôi
            </button>
            <button
              onClick={() => handleNavClick("/contact")} // <-- SỬA
              className="text-slate-700 hover:text-blue-600"
            >
              Liên hệ
            </button>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button
              onClick={() => handleNavClick("/app")} // <-- 5. SỬA (ĐÚNG YÊU CẦU CỦA BẠN)
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 rounded-full"
            >
              Bắt đầu miễn phí
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu (SỬA TƯƠNG TỰ) */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200">
            <nav className="flex flex-col gap-4">
              <button
                onClick={() => handleNavClick("/inspiration")}
                className="text-slate-700 hover:text-blue-600 transition-colors text-left"
              >
                Kho mẫu
              </button>
              <button
                onClick={() => handleNavClick("/app")}
                className="text-slate-700 hover:text-blue-600 transition-colors text-left"
              >
                Xu hướng
              </button>
              <button
                onClick={() => handleNavClick("/shop")}
                className="text-slate-700 hover:text-blue-600 transition-colors text-left"
              >
                Kinh doanh
              </button>
              <button
                onClick={() => handleNavClick("/process")}
                className="text-slate-700 hover:text-blue-600 transition-colors text-left"
              >
                Về chúng tôi
              </button>
              <button
                onClick={() => handleNavClick("/contact")}
                className="text-slate-700 hover:text-blue-600 transition-colors text-left"
              >
                Liên hệ
              </button>
              <Button
                onClick={() => handleNavClick("/app")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full"
              >
                Bắt đầu miễn phí
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
