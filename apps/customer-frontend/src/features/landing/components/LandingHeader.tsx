import { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  ChevronDown,
  Gift,
  Package,
  Paintbrush,
  Warehouse,
  Phone,
  Building2,
  Briefcase,
  Newspaper,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Logo } from "@/shared/components/ui/Logo";
import { useNavigate, Link } from "react-router-dom";

// --- MENU DATA ---

const PRODUCTS_MENU = {
  title: "Danh mục sản phẩm",
  groups: [
    {
      name: "Ấn phẩm văn phòng",
      items: [
        "Danh thiếp (Namecards)",
        "Phong bì & Tiêu đề thư",
        "Kẹp file (Folder)",
        "Hóa đơn & Biểu mẫu",
      ],
    },
    {
      name: "Marketing & Sự kiện",
      items: [
        "Tờ rơi & Brochure",
        "Catalogue & Profile",
        "Standee & Backdrop",
        "Sticker & Tem nhãn",
      ],
    },
    {
      name: "Quà tặng doanh nghiệp",
      items: [
        "Bình giữ nhiệt & Ly",
        "Sổ tay & Bút ký",
        "Áo đồng phục & Mũ",
        "Ô dù & Áo mưa",
      ],
    },
    {
      name: "Bao bì đóng gói",
      items: [
        "Hộp cứng cao cấp",
        "Túi giấy thương hiệu",
        "Hộp carton ship hàng",
        "Băng keo logo",
      ],
    },
  ],
};

const SOLUTIONS_MENU = {
  title: "Giải pháp trọn gói",
  items: [
    {
      icon: Package,
      title: "Đóng gói trải nghiệm",
      desc: "Combo quà tặng khách hàng/ nhân viên mới (Sổ, bút, bình, áo...).",
      href: "/solutions/kitting",
    },
    {
      icon: Gift,
      title: "Quà tặng Doanh nghiệp",
      desc: "Giải pháp quà tặng trọn gói cho mọi dịp: Tết, sinh nhật, tri ân.",
      href: "/solutions/corporate-gifting",
    },
    {
      icon: Warehouse,
      title: "Lưu kho & Phân phối",
      desc: "In số lượng lớn giá rẻ -> Gửi Printz giữ hộ -> Cần là giao.",
      href: "/solutions/warehousing",
    },
    {
      icon: Paintbrush,
      title: "Thiết kế & Dựng mẫu",
      desc: "Team thiết kế chuyên nghiệp hỗ trợ làm file in chuẩn.",
      href: "/contact",
    },
  ],
};

const COMPANY_MENU = {
  title: "Về Printz",
  items: [
    {
      icon: Building2,
      title: "Về chúng tôi",
      desc: "Câu chuyện, Sứ mệnh & Đội ngũ.",
      href: "/about",
    },
    {
      icon: Briefcase,
      title: "Tuyển dụng",
      desc: "Gia nhập đội ngũ kiến tạo đổi mới.",
      href: "/careers",
    },
    {
      icon: Newspaper,
      title: "Blog & Xu hướng",
      desc: "Cập nhật kiến thức & Xu hướng in ấn.",
      href: "/trends",
    },
    {
      icon: ShieldCheck,
      title: "Chính sách",
      desc: "Điều khoản dịch vụ & Bảo mật.",
      href: "/policy",
    },
  ],
};

export function Header() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (path: string) => {
    navigate(path);
    setActiveMenu(null);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {activeMenu && (
        <div
          className="fixed inset-0 bg-stone-900/10 z-40"
          onMouseEnter={() => setActiveMenu(null)}
        />
      )}

      <header
        ref={headerRef}
        onMouseLeave={() => setActiveMenu(null)}
        className={`fixed top-0 z-50 w-full transition-all duration-300 border-b ${
          scrolled || activeMenu || mobileMenuOpen
            ? "bg-white border-stone-200 py-3 shadow-sm"
            : "bg-white/95 backdrop-blur-sm border-transparent py-4"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 md:px-8 relative">
          <div className="flex items-center justify-between">
            <Logo variant="full" color="default" />

            {/* DESKTOP NAV */}
            <nav className="hidden lg:flex items-center gap-1">
              {/* 1. SẢN PHẨM */}
              <button
                onMouseEnter={() => setActiveMenu("products")}
                className={`flex items-center gap-2 py-2 px-4 rounded-full text-sm font-bold uppercase tracking-wide transition-all ${
                  activeMenu === "products"
                    ? "bg-stone-100 text-stone-900"
                    : "text-stone-600 hover:bg-stone-50"
                }`}
              >
                Sản phẩm
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${
                    activeMenu === "products" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* 2. GIẢI PHÁP */}
              <button
                onMouseEnter={() => setActiveMenu("solutions")}
                className={`flex items-center gap-2 py-2 px-4 rounded-full text-sm font-bold uppercase tracking-wide transition-all ${
                  activeMenu === "solutions"
                    ? "bg-stone-100 text-stone-900"
                    : "text-stone-600 hover:bg-stone-50"
                }`}
              >
                Dịch vụ & Giải pháp
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${
                    activeMenu === "solutions" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* 3. CÔNG TY (MỚI) */}
              <button
                onMouseEnter={() => setActiveMenu("company")}
                className={`flex items-center gap-2 py-2 px-4 rounded-full text-sm font-bold uppercase tracking-wide transition-all ${
                  activeMenu === "company"
                    ? "bg-stone-100 text-stone-900"
                    : "text-stone-600 hover:bg-stone-50"
                }`}
              >
                Công ty
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${
                    activeMenu === "company" ? "rotate-180" : ""
                  }`}
                />
              </button>
            </nav>

            {/* RIGHT ACTIONS */}
            <div className="hidden md:flex items-center gap-6">
              {/* Hotline */}
              <div className="hidden xl:flex flex-col items-end mr-2">
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                  Hotline Tư vấn
                </span>
                <a
                  href="tel:0865 726 848"
                  className="text-sm font-bold text-emerald-800 hover:underline flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" /> 0865 726 848
                </a>
              </div>

              <div className="h-6 w-px bg-stone-200 hidden xl:block"></div>

              <button
                onClick={() => handleNavClick("/login")}
                className="text-sm font-bold text-stone-900 hover:text-emerald-800 uppercase tracking-wider"
              >
                Đăng nhập
              </button>

              <Button
                onClick={() => handleNavClick("/contact")}
                className="bg-stone-900 hover:bg-emerald-900 text-white rounded-none px-6 py-5 font-bold uppercase text-xs shadow-lg"
              >
                Liên hệ Báo giá
              </Button>
            </div>

            {/* MOBILE TOGGLE */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* --- PANELS --- */}

        {/* PANEL: PRODUCTS */}
        <div
          className={`absolute top-full left-0 w-full bg-white border-t border-stone-100 shadow-xl overflow-hidden transition-all duration-300 ${
            activeMenu === "products"
              ? "max-h-[600px] opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="max-w-[1440px] mx-auto px-8 py-10 grid grid-cols-4 gap-8">
            {PRODUCTS_MENU.groups.map((group, idx) => (
              <div key={idx}>
                <h4 className="font-serif text-lg font-bold text-stone-900 mb-4 border-b border-stone-100 pb-2">
                  {group.name}
                </h4>
                <ul className="space-y-3">
                  {group.items.map((item, i) => (
                    <li key={i}>
                      <Link
                        to="/shop"
                        className="text-sm text-stone-500 hover:text-emerald-800 hover:translate-x-1 transition-all block"
                      >
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* PANEL: SOLUTIONS */}
        <div
          className={`absolute top-full left-0 w-full bg-white border-t border-stone-100 shadow-xl overflow-hidden transition-all duration-300 ${
            activeMenu === "solutions"
              ? "max-h-[400px] opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="max-w-[1440px] mx-auto px-8 py-10 grid grid-cols-2 gap-12">
            {SOLUTIONS_MENU.items.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  to={item.href}
                  className="flex gap-4 group p-4 rounded-xl hover:bg-stone-50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-emerald-900 group-hover:text-white transition-colors shrink-0">
                    <Icon className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-lg mb-1">
                      {item.title}
                    </h4>
                    <p className="text-stone-500 text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* PANEL: COMPANY (MỚI) */}
        <div
          className={`absolute top-full left-0 w-full bg-white border-t border-stone-100 shadow-xl overflow-hidden transition-all duration-300 ${
            activeMenu === "company"
              ? "max-h-[300px] opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="max-w-[1440px] mx-auto px-8 py-10">
            <div className="grid grid-cols-4 gap-8">
              {COMPANY_MENU.items.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={idx}
                    to={item.href}
                    className="flex flex-col gap-3 group p-4 rounded-xl hover:bg-stone-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-emerald-900 group-hover:text-white transition-colors shrink-0">
                        <Icon className="w-5 h-5" strokeWidth={1.5} />
                      </div>
                      <h4 className="font-bold text-stone-900 text-base group-hover:text-emerald-900 transition-colors">
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-stone-500 text-sm leading-relaxed pl-[52px]">
                      {item.desc}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
