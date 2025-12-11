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
  Truck,
  LogIn,
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
        "Danh thiếp",
        "Phong bì & Tiêu đề thư",
        "Kẹp tài liệu",
        "Hóa đơn & Biểu mẫu",
      ],
    },
    {
      name: "Tiếp thị & Trưng bày",
      items: [
        "Tờ rơi & Tờ gấp",
        "Cẩm nang & HSNL",
        "Phông nền & Giá cuốn",
        "Tem nhãn & Hình dán",
      ],
    },
    {
      name: "Quà tặng doanh nghiệp",
      items: [
        "Bộ quà công nghệ",
        "Bình giữ nhiệt & Ly sứ",
        "Sổ tay & Bút ký cao cấp",
        "May mặc (Áo, Mũ, Ô)",
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
      desc: "Phối hợp quà tặng, đóng gói combo.",
      href: "/services/kitting",
    },
    {
      icon: Gift,
      title: "Quà tặng trọn gói",
      desc: "Tư vấn - Thiết kế - Sản xuất quà Tết.",
      href: "/services/gifting",
    },
    {
      icon: Warehouse,
      title: "Lưu kho & Phân phối",
      desc: "Giải pháp kho vận đa điểm.",
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
      desc: "Chính sách Bảo mật, Bảo hành.",
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

  const isActive = (path: string) => location.pathname === path;

  // CONSTANTS
  const HARD_SHADOW = "shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]";
  const HARD_SHADOW_HOVER = "hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]";

  const navItemClass = (isActiveItem: boolean) => `
    flex items-center gap-1.5 py-2 px-5 rounded-full text-sm font-bold uppercase tracking-wide 
    transition-all duration-200 ease-out border
    ${
      isActiveItem
        ? `bg-stone-100 text-emerald-900 border-stone-900 ${HARD_SHADOW} -translate-y-0.5 -translate-x-0.5`
        : `text-stone-600 border-transparent hover:bg-white hover:text-emerald-900 hover:border-stone-900 ${HARD_SHADOW_HOVER} hover:-translate-y-0.5 hover:-translate-x-0.5`
    }
  `;

  return (
    <>
      {activeMenu && (
        <div
          className="fixed inset-0 bg-stone-900/20 z-40 backdrop-blur-sm transition-all duration-300"
          onMouseEnter={() => setActiveMenu(null)}
        />
      )}

      <header
        ref={headerRef}
        onMouseLeave={() => setActiveMenu(null)}
        className={`fixed top-0 z-50 w-full transition-all duration-300 border-b ${
          scrolled || activeMenu || mobileMenuOpen
            ? "bg-white/95 backdrop-blur-md border-stone-900 py-3 shadow-sm"
            : "bg-white/80 backdrop-blur-md border-transparent py-5"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 md:px-8 relative">
          <div className="flex items-center justify-between">
            <Logo variant="full" color="default" />

            {/* DESKTOP NAV */}
            <nav className="hidden lg:flex items-center gap-2">
              <Link
                to="/"
                onMouseEnter={() => setActiveMenu(null)}
                className={navItemClass(isActive("/"))}
              >
                <Home className="w-4 h-4 mb-0.5" strokeWidth={2} />
                Trang chủ
              </Link>

              <button
                onMouseEnter={() => setActiveMenu("products")}
                className={navItemClass(activeMenu === "products")}
              >
                Sản phẩm
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-300 ${
                    activeMenu === "products" ? "rotate-180" : ""
                  }`}
                />
              </button>

              <button
                onMouseEnter={() => setActiveMenu("services")}
                className={navItemClass(activeMenu === "services")}
              >
                Giải pháp
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-300 ${
                    activeMenu === "services" ? "rotate-180" : ""
                  }`}
                />
              </button>

              <button
                onMouseEnter={() => setActiveMenu("company")}
                className={navItemClass(activeMenu === "company")}
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
            <div className="hidden md:flex items-center gap-4">
              <div className="hidden xl:flex flex-col items-end mr-2 group cursor-pointer">
                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider group-hover:text-emerald-700 transition-colors">
                  Hotline B2B
                </span>
                <a
                  href="tel:0865726848"
                  className="text-sm font-bold text-stone-900 group-hover:text-emerald-700 transition-colors flex items-center gap-1.5"
                >
                  <Phone className="w-4 h-4" /> 0865 726 848
                </a>
              </div>

              <button
                onClick={() => handleNavClick("/signin")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-stone-900 border border-transparent hover:border-stone-900 hover:bg-white transition-all duration-200 hover:-translate-y-0.5 hover:-translate-x-0.5 ${HARD_SHADOW_HOVER}`}
              >
                <LogIn className="w-4 h-4" />
                Đăng nhập
              </button>

              <Button
                onClick={() => handleNavClick("/contact")}
                className={`bg-stone-900 text-white rounded-full px-8 py-6 font-bold uppercase text-xs border border-stone-900
                transition-all duration-150 ease-out
                ${HARD_SHADOW}
                hover:shadow-none hover:translate-y-[3px] hover:translate-x-[3px]
                hover:bg-emerald-900 hover:border-emerald-900`}
              >
                Nhận Báo Giá
              </Button>
            </div>

            {/* MOBILE TOGGLE */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-stone-900 transition-transform active:scale-90"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* --- PANELS (MEGA MENUS) --- */}

        {/* PANEL: PRODUCTS - ĐÃ SỬA: GOM GỌN LẠI */}
        <div
          className={`absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-y border-stone-900 overflow-hidden transition-all duration-300 origin-top ${
            activeMenu === "products"
              ? "max-h-[600px] opacity-100 translate-y-0 visible"
              : "max-h-0 opacity-0 -translate-y-4 invisible"
          }`}
        >
          {/* SỬA: Thay max-w-[1440px] bằng max-w-5xl, và tăng gap-x-12 lên gap-x-20 */}
          <div className="max-w-5xl mx-auto px-8 py-12 grid grid-cols-3 gap-x-20 gap-y-8">
            {PRODUCTS_MENU.groups.map((group, idx) => (
              <div key={idx} className="group/col">
                <h4 className="font-serif text-lg font-bold text-stone-900 mb-5 border-b border-stone-100 pb-2 inline-block">
                  {group.name}
                </h4>
                <ul className="space-y-3">
                  {group.items.map((item, i) => (
                    <li key={i}>
                      <Link
                        to="/shop"
                        className="text-sm text-stone-500 hover:text-stone-900 hover:font-bold hover:translate-x-1 transition-all duration-200 block py-1"
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
          className={`absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-y border-stone-900 overflow-hidden transition-all duration-300 origin-top ${
            activeMenu === "services"
              ? "max-h-[400px] opacity-100 translate-y-0 visible"
              : "max-h-0 opacity-0 -translate-y-4 invisible"
          }`}
        >
          <div className="max-w-[1440px] mx-auto px-8 py-10 grid grid-cols-2 lg:grid-cols-4 gap-8">
            {SERVICES_MENU.items.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  to={item.href}
                  className={`flex flex-col gap-4 group p-5 rounded-2xl border border-transparent hover:border-stone-900 hover:bg-white transition-all duration-200 hover:-translate-y-0.5 hover:-translate-x-0.5 ${HARD_SHADOW_HOVER}`}
                >
                  <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-stone-900 group-hover:bg-stone-900 group-hover:text-white transition-all duration-300">
                    <Icon className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-base mb-2">
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
          className={`absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-y border-stone-900 overflow-hidden transition-all duration-300 origin-top ${
            activeMenu === "company"
              ? "max-h-[300px] opacity-100 translate-y-0 visible"
              : "max-h-0 opacity-0 -translate-y-4 invisible"
          }`}
        >
          <div className="max-w-[1440px] mx-auto px-8 py-10">
            <div className="grid grid-cols-4 gap-8">
              <div
                className={`col-span-1 bg-stone-900 text-white p-6 rounded-2xl -mt-2 border border-stone-900 group hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all duration-200 ${HARD_SHADOW_HOVER}`}
              >
                <h4 className="font-serif font-bold text-lg mb-2 text-emerald-400 relative z-10">
                  Printz Solutions
                </h4>
                <p className="text-stone-300 text-xs leading-relaxed mb-4 relative z-10">
                  Đối tác in ấn & quà tặng B2B. <br /> Cam kết Chất lượng - Đúng
                  hẹn - Bảo mật.
                </p>
                <Link
                  to="/contact"
                  className="text-xs font-bold uppercase tracking-wider underline hover:text-emerald-400 relative z-10 flex items-center gap-1 transition-colors"
                >
                  Liên hệ ngay <Truck className="w-3 h-3" />
                </Link>
              </div>

              <div className="col-span-3 grid grid-cols-2 gap-x-12 gap-y-6">
                {COMPANY_MENU.items.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={idx}
                      to={item.href}
                      className="flex items-center gap-4 group p-3 rounded-xl hover:bg-stone-50 transition-all duration-200 hover:translate-x-1"
                    >
                      <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-900 group-hover:bg-stone-900 group-hover:text-white transition-all duration-300 shrink-0 border border-transparent group-hover:border-stone-900">
                        <Icon className="w-5 h-5" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-900 text-sm transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-stone-500 text-xs mt-0.5">
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
