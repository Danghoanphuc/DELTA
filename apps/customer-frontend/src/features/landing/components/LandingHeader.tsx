// src/components/landing/LandingHeader.tsx (FIXED)

import myLogo from "@/assets/img/logo-printz.png"; 
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Hiệu ứng cuộn: Header sẽ có bóng đổ nhẹ khi cuộn
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { name: "Kho mẫu", path: "/inspiration" },
    { name: "Sản phẩm", path: "/shop" },
    { name: "Công nghệ", path: "/process" },
    { name: "Blog", path: "/trends" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 w-full ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-sm py-3"
          : "bg-white/50 backdrop-blur-lg border-b border-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* --- LOGO: HIỂN THỊ NGUYÊN BẢN --- */}
          <button
            onClick={() => handleNavClick("/")}
            className="flex items-center gap-2.5 group"
          >
            {/* Không bọc nền màu nữa, để logo hiển thị tự nhiên */}
            <div className="relative group-hover:scale-105 transition-transform duration-300">
               <img 
                 src={myLogo} 
                 alt="Printz" 
                 className="h-9 w-auto object-contain" 
                 // Bỏ hết các class filter (brightness/invert)
               />
            </div>
            
            {/* Tên thương hiệu */}
            <span className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
              Printz
              <span className="text-blue-600">.vn</span>
            </span>
          </button>

          {/* --- DESKTOP NAVIGATION (CLEAN STYLE) --- */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => handleNavClick(link.path)}
                className={`text-[15px] font-medium transition-all duration-200 relative group px-1 py-2 ${
                  isActive(link.path)
                    ? "text-blue-600 font-semibold"
                    : "text-slate-600 hover:text-blue-600"
                }`}
              >
                {link.name}
                {/* Gạch chân animation khi active/hover */}
                <span className={`absolute bottom-0 left-0 h-[2px] bg-blue-600 transition-all duration-300 rounded-full ${
                    isActive(link.path) ? "w-full" : "w-0 group-hover:w-full"
                }`}></span>
              </button>
            ))}
          </nav>

          {/* --- RIGHT ACTIONS --- */}
          <div className="hidden md:flex items-center gap-5">
            <button 
              onClick={() => handleNavClick("/contact")}
              className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              Hỗ trợ
            </button>

            {/* Nút CTA: Giữ nguyên style App (Gradient) */}
            <Button
              onClick={() => handleNavClick("/app")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-7 py-2.5 h-auto rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 transition-all duration-300"
            >
              Bắt đầu ngay
            </Button>
          </div>

          {/* --- MOBILE TOGGLE --- */}
          <button
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* --- MOBILE MENU --- */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 shadow-xl animate-in slide-in-from-top-2">
            <div className="p-4 space-y-2">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => handleNavClick(link.path)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                     isActive(link.path) 
                     ? "bg-blue-50 text-blue-600" 
                     : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {link.name}
                </button>
              ))}
              <div className="h-px bg-slate-100 my-2"></div>
              <Button
                onClick={() => handleNavClick("/app")}
                className="w-full mt-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg py-6"
              >
                Bắt đầu miễn phí
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}