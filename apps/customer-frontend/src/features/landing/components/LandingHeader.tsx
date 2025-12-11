import { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  ChevronDown,
  Gift,
  Package,
  Warehouse,
  Phone,
  Building2,
  Briefcase,
  ShieldCheck,
  Workflow,
  Printer,
  Home,
  FileText,
  CreditCard,
  Truck,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Logo } from "@/shared/components/ui/Logo";
import { useNavigate, Link, useLocation } from "react-router-dom";

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
      name: "Marketing & POSM",
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
        "Giftset công nghệ",
        "Bình giữ nhiệt & Ly sứ",
        "Sổ tay & Bút ký cao cấp",
        "Dệt may (Áo, Mũ, Ô dù)",
      ],
    },
    {
      name: "Bao bì thương hiệu",
      items: [
        "Hộp cứng nam châm",
        "Túi giấy cao cấp",
        "Hộp carton ship hàng",
        "Tem vỡ & Hologram",
      ],
    },
  ],
};

const SERVICES_MENU = {
  title: "Giải pháp & Dịch vụ",
  items: [
    {
      icon: Package,
      title: "Đóng gói & Kitting",
      desc: "Phối hợp quà tặng, đóng gói combo theo yêu cầu riêng.",
      href: "/services/kitting",
    },
    {
      icon: Gift,
      title: "Quà tặng trọn gói",
      desc: "Tư vấn - Thiết kế - Sản xuất quà tặng sự kiện, lễ Tết.",
      href: "/services/gifting",
    },
    {
      icon: Warehouse,
      title: "Lưu kho & Phân phối",
      desc: "Giải pháp kho vận và giao hàng đa điểm (Multi-point).",
      href: "/services/logistics",
    },
    {
      icon: Workflow,
      title: "Quy trình hợp tác",
      desc: "5 Bước tiêu chuẩn từ Ý tưởng đến Bàn giao.",
      href: "/process",
    },
  ],
};

const COMPANY_MENU = {
  title: "Về Printz",
  items: [
    {
      icon: Building2,
      title: "Câu chuyện Printz",
      desc: "Tầm nhìn & Giá trị cốt lõi.",
      href: "/about",
    },
    {
      icon: ShieldCheck,
      title: "Trung tâm pháp lý",
      desc: "Chính sách Bảo mật, Bảo hành & Chất lượng.", // Cập nhật theo hình ảnh chính sách
      href: "/policy",
    },
    {
      icon: Printer,
      title: "Kiến thức in ấn",
      desc: "Kinh nghiệm chọn giấy, màu sắc.",
      href: "/blog",
    },
    {
      icon: Briefcase,
      title: "Tuyển dụng",
      desc: "Gia nhập đội ngũ Printz.",
      href: "/careers",
    },
  ],
};

export function Header() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

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

  // Helper để check active link
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Overlay khi mở menu */}
      {activeMenu && (
        <div
          className="fixed inset-0 bg-stone-900/20 z-40 backdrop-blur-sm transition-opacity duration-300"
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
              {/* 0. TRANG CHỦ (MỚI) */}
              <Link
                to="/"
                onMouseEnter={() => setActiveMenu(null)} // Đóng mega menu nếu đang mở
                className={`flex items-center gap-2 py-2 px-5 rounded-full text-sm font-bold uppercase tracking-wide transition-all duration-200 ${
                  isActive("/")
                    ? "bg-stone-100 text-emerald-900"
                    : "text-stone-600 hover:bg-stone-50 hover:text-emerald-800"
                }`}
              >
                <Home className="w-4 h-4 mb-0.5" strokeWidth={2} />
                Trang chủ
              </Link>

              {/* 1. SẢN PHẨM */}
              <button
                onMouseEnter={() => setActiveMenu("products")}
                className={`flex items-center gap-1.5 py-2 px-5 rounded-full text-sm font-bold uppercase tracking-wide transition-all duration-200 ${
                  activeMenu === "products"
                    ? "bg-stone-100 text-emerald-900"
                    : "text-stone-600 hover:bg-stone-50 hover:text-emerald-800"
                }`}
              >
                Sản phẩm
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-300 ${
                    activeMenu === "products" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* 2. GIẢI PHÁP */}
              <button
                onMouseEnter={() => setActiveMenu("services")}
                className={`flex items-center gap-1.5 py-2 px-5 rounded-full text-sm font-bold uppercase tracking-wide transition-all duration-200 ${
                  activeMenu === "services"
                    ? "bg-stone-100 text-emerald-900"
                    : "text-stone-600 hover:bg-stone-50 hover:text-emerald-800"
                }`}
              >
                Giải pháp
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-300 ${
                    activeMenu === "services" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* 3. VỀ PRINTZ */}
              <button
                onMouseEnter={() => setActiveMenu("company")}
                className={`flex items-center gap-1.5 py-2 px-5 rounded-full text-sm font-bold uppercase tracking-wide transition-all duration-200 ${
                  activeMenu === "company"
                    ? "bg-stone-100 text-emerald-900"
                    : "text-stone-600 hover:bg-stone-50 hover:text-emerald-800"
                }`}
              >
                Về Printz
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-300 ${
                    activeMenu === "company" ? "rotate-180" : ""
                  }`}
                />
              </button>
            </nav>

            {/* RIGHT ACTIONS */}
            <div className="hidden md:flex items-center gap-6">
              {/* Hotline */}
              <div className="hidden xl:flex flex-col items-end mr-2 group cursor-pointer">
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider group-hover:text-emerald-600 transition-colors">
                  Luôn sẵn sàng
                </span>
                <a
                  href="tel:0865726848"
                  className="text-sm font-bold text-emerald-800 group-hover:text-emerald-600 transition-colors flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" /> 0865 726 848
                </a>
              </div>

              <div className="h-8 w-px bg-stone-200 hidden xl:block"></div>

              <button
                onClick={() => handleNavClick("/signin")}
                className="text-sm font-bold text-stone-600 hover:text-emerald-800 uppercase tracking-wider transition-colors"
              >
                Đăng nhập
              </button>

              <Button
                onClick={() => handleNavClick("/contact")}
                className="bg-stone-900 hover:bg-emerald-900 text-white rounded-none px-8 py-6 font-bold uppercase text-xs shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
              >
                Nhận Báo Giá
              </Button>
            </div>

            {/* MOBILE TOGGLE */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-stone-600 hover:text-stone-900"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* --- PANELS (MEGA MENUS) --- */}

        {/* PANEL: PRODUCTS */}
        <div
          className={`absolute top-full left-0 w-full bg-white border-t border-stone-100 shadow-xl overflow-hidden transition-all duration-300 origin-top ${
            activeMenu === "products"
              ? "max-h-[600px] opacity-100 translate-y-0 visible"
              : "max-h-0 opacity-0 -translate-y-2 invisible"
          }`}
        >
          <div className="max-w-[1440px] mx-auto px-8 py-12 grid grid-cols-4 gap-x-12 gap-y-8">
            {PRODUCTS_MENU.groups.map((group, idx) => (
              <div key={idx} className="group/col">
                <h4 className="font-serif text-lg font-bold text-stone-900 mb-5 border-b-2 border-transparent group-hover/col:border-emerald-500/30 pb-2 transition-all inline-block cursor-default">
                  {group.name}
                </h4>
                <ul className="space-y-3">
                  {group.items.map((item, i) => (
                    <li key={i}>
                      <Link
                        to="/shop"
                        className="text-sm text-stone-500 hover:text-emerald-700 hover:font-medium hover:translate-x-1 transition-all block py-1"
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

        {/* PANEL: SERVICES */}
        <div
          className={`absolute top-full left-0 w-full bg-white border-t border-stone-100 shadow-xl overflow-hidden transition-all duration-300 origin-top ${
            activeMenu === "services"
              ? "max-h-[400px] opacity-100 translate-y-0 visible"
              : "max-h-0 opacity-0 -translate-y-2 invisible"
          }`}
        >
          <div className="max-w-[1440px] mx-auto px-8 py-10 grid grid-cols-2 lg:grid-cols-4 gap-8">
            {SERVICES_MENU.items.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  to={item.href}
                  className="flex flex-col gap-4 group p-5 rounded-2xl hover:bg-stone-50 border border-transparent hover:border-stone-100 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600 group-hover:bg-emerald-900 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-md">
                    <Icon className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-base mb-2 group-hover:text-emerald-900 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-stone-500 text-sm leading-relaxed line-clamp-2">
                      {item.desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* PANEL: COMPANY */}
        <div
          className={`absolute top-full left-0 w-full bg-white border-t border-stone-100 shadow-xl overflow-hidden transition-all duration-300 origin-top ${
            activeMenu === "company"
              ? "max-h-[300px] opacity-100 translate-y-0 visible"
              : "max-h-0 opacity-0 -translate-y-2 invisible"
          }`}
        >
          <div className="max-w-[1440px] mx-auto px-8 py-10">
            <div className="grid grid-cols-4 gap-8">
              {/* Intro Box - Nâng cấp visual */}
              <div className="col-span-1 bg-stone-900 text-white p-6 rounded-xl -mt-2 shadow-2xl relative overflow-hidden group">
                {/* Decoration Circle */}
                <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-500/20 rounded-full blur-xl group-hover:bg-emerald-500/30 transition-all"></div>

                <h4 className="font-serif font-bold text-lg mb-2 text-emerald-400 relative z-10">
                  Printz Solutions
                </h4>
                <p className="text-stone-300 text-xs leading-relaxed mb-4 relative z-10">
                  Đối tác in ấn & quà tặng B2B. <br /> Cam kết Chất lượng - Đúng
                  hẹn - Bảo mật.
                </p>
                <Link
                  to="/contact"
                  className="text-xs font-bold uppercase tracking-wider underline hover:text-emerald-400 relative z-10 flex items-center gap-1"
                >
                  Liên hệ ngay <Truck className="w-3 h-3" />
                </Link>
              </div>

              {/* Links */}
              <div className="col-span-3 grid grid-cols-2 gap-x-12 gap-y-6">
                {COMPANY_MENU.items.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={idx}
                      to={item.href}
                      className="flex items-center gap-4 group p-2 rounded-lg hover:bg-stone-50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-900 group-hover:text-white transition-colors shrink-0">
                        <Icon className="w-5 h-5" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-900 text-sm group-hover:text-emerald-900 transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-stone-400 text-xs mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
