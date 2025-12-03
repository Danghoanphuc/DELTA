import { useState, useEffect } from "react";
import { Menu, X, Globe, Check } from "lucide-react"; // Thêm Globe
import { Button } from "@/shared/components/ui/button";
import { Logo } from "@/shared/components/ui/Logo";
import { useNavigate, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentLang, setCurrentLang] = useState("VN"); // Mặc định Tiếng Việt
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navLinks = [
    { name: "Shop", path: "/shop" },
    { name: "Business Solutions", path: "/business" },
    { name: "Inspiration", path: "/templates" },
  ];

  // Danh sách 10 ngôn ngữ lớn
  const languages = [
    { code: "VN", label: "Tiếng Việt", flag: "🇻🇳" },
    { code: "EN", label: "English (Global)", flag: "🇺🇸" },
    { code: "JP", label: "日本語 (Japan)", flag: "🇯🇵" },
    { code: "KR", label: "한국어 (Korea)", flag: "🇰🇷" },
    { code: "CN", label: "中文 (China)", flag: "🇨🇳" },
    { code: "FR", label: "Français (France)", flag: "🇫🇷" },
    { code: "DE", label: "Deutsch (Germany)", flag: "🇩🇪" },
    { code: "ES", label: "Español (Spain)", flag: "🇪🇸" },
    { code: "IT", label: "Italiano (Italy)", flag: "🇮🇹" },
    { code: "RU", label: "Русский (Russia)", flag: "🇷🇺" },
  ];

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 border-b ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-stone-200 py-3"
          : "bg-transparent border-transparent py-6"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-8">
        <div className="flex items-center justify-between">
          {/* LEFT: LOGO */}
          <Logo variant="full" color="default" />

          {/* MIDDLE: NAV LINKS */}
          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => handleNavClick(link.path)}
                className={`text-sm font-sans font-medium tracking-wide transition-all uppercase ${
                  location.pathname === link.path
                    ? "text-stone-900 border-b-2 border-emerald-600"
                    : "text-stone-500 hover:text-stone-900 hover:border-b-2 hover:border-stone-200"
                }`}
              >
                {link.name}
              </button>
            ))}
          </nav>

          {/* RIGHT: ACTIONS & LANGUAGE */}
          <div className="hidden md:flex items-center gap-6">
            {/* --- LANGUAGE SWITCHER --- */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors outline-none group">
                  <Globe
                    className="w-5 h-5 group-hover:text-emerald-600"
                    strokeWidth={1.5}
                  />
                  <span className="text-xs font-bold font-mono pt-0.5">
                    {currentLang}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 p-2 bg-white/95 backdrop-blur border border-stone-100 shadow-xl rounded-none animate-in fade-in zoom-in-95 duration-200"
              >
                <div className="px-2 py-1.5 text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100 mb-1">
                  Select Region
                </div>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => setCurrentLang(lang.code)}
                      className={`flex items-center justify-between cursor-pointer rounded-none py-2.5 px-3 ${
                        currentLang === lang.code
                          ? "bg-emerald-50 text-emerald-900"
                          : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg leading-none">
                          {lang.flag}
                        </span>
                        <span className="font-sans text-sm font-medium">
                          {lang.label}
                        </span>
                      </div>
                      {currentLang === lang.code && (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* SEPARATOR */}
            <div className="h-4 w-px bg-stone-300"></div>

            <button
              onClick={() => handleNavClick("/login")}
              className="text-sm font-sans font-bold text-stone-900 hover:text-emerald-700 uppercase tracking-wider"
            >
              Sign In
            </button>

            <Button
              onClick={() => handleNavClick("/app")}
              className="bg-stone-900 hover:bg-emerald-900 text-white px-6 py-5 h-auto rounded-none font-sans font-bold uppercase tracking-wider text-xs transition-all duration-300 shadow-none hover:shadow-lg"
            >
              Start Project
            </Button>
          </div>

          {/* MOBILE TOGGLE */}
          <button
            className="lg:hidden p-2 text-stone-900"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* MOBILE MENU (Updated with Language) */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-stone-50 border-t border-stone-200 h-screen p-6 overflow-y-auto">
          <div className="space-y-4">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => handleNavClick(link.path)}
                className="block w-full text-left text-2xl font-serif font-bold text-stone-900 py-3 border-b border-stone-200"
              >
                {link.name}
              </button>
            ))}

            {/* Mobile Language Selector */}
            <div className="py-6 border-b border-stone-200">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">
                Region & Language
              </p>
              <div className="grid grid-cols-2 gap-3">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setCurrentLang(lang.code)}
                    className={`flex items-center gap-2 p-2 text-sm font-medium border ${
                      currentLang === lang.code
                        ? "border-emerald-600 bg-white text-emerald-900"
                        : "border-stone-200 text-stone-600"
                    }`}
                  >
                    <span>{lang.flag}</span> {lang.code}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-8">
              <Button className="w-full bg-stone-900 text-white rounded-none py-6 uppercase font-bold">
                Start Project
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
