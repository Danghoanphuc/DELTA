import { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  ChevronDown,
  Phone,
  LogIn,
  Scroll,
  Map,
  MessageSquare,
  BookOpen,
  Users,
  Gem,
  PenTool,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Logo } from "@/shared/components/ui/Logo";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { cn } from "@/shared/lib/utils";

// --- MENU DATA: TỪ ĐIỂN GIÁM TUYỂN ---

// 1. KHO TÀNG TÁC PHẨM (Collections)
const COLLECTIONS_MENU = {
  title: "Kho Tàng Tác Phẩm",
  groups: [
    {
      name: "Tĩnh Tại (Zen)",
      items: [
        { label: "Ấm Hồng Sa / Hỏa Biến", status: "hot" },
        { label: "Trà Shan Tuyết Cổ Thụ", status: "available" },
        { label: "Trầm Hương & Lư Đốt", status: "soon" },
        { label: "Pháp Phục Thiền", status: "soon" },
      ],
    },
    {
      name: "Dòng Chảy (Flow)",
      items: [
        { label: "Sơn Mài Hạ Thái", status: "hot" },
        { label: "Quạt Giấy Dó", status: "available" },
        { label: "Khăn Lụa Thêu Tay", status: "soon" },
        { label: "Tranh Khắc Gỗ", status: "soon" },
      ],
    },
    {
      name: "Thổ Nhưỡng (Earth)",
      items: [
        { label: "Gốm Hỏa Biến Độc Bản", status: "hot" },
        { label: "Bình Hút Lộc", status: "available" },
        { label: "Gốm Chu Đậu Vẽ Vàng", status: "available" },
        { label: "Linh Vật Dát Vàng", status: "soon" },
      ],
    },
  ],
};

// 2. NĂNG LỰC GIÁM TUYỂN (Services)
const SERVICES_MENU = {
  title: "Năng Lực Giám Tuyển",
  items: [
    {
      icon: MessageSquare,
      title: "Tư vấn Quà Ngoại giao",
      desc: "Thiết kế set quà theo cấp bậc & văn hóa đối tác.",
      href: "/solutions/corporate-gifting",
    },
    {
      icon: PenTool,
      title: "Chế tác Độc bản (Bespoke)",
      desc: "Cá nhân hóa dấu ấn doanh nghiệp trên tác phẩm.",
      href: "/bespoke",
    },
  ],
};

// 3. TẠP CHÍ & DI SẢN (Magazine & Heritage)
const ABOUT_MENU = {
  title: "Tạp Chí & Di Sản",
  items: [
    {
      icon: BookOpen,
      title: "Tạp Chí Printz",
      desc: "Nơi lưu giữ kiến thức, thẩm mỹ & văn hóa.",
      href: "/tap-chi",
    },
    {
      icon: Scroll,
      title: "Câu chuyện Di sản",
      desc: "Hành trình tìm kiếm những 'kẻ sống sót' từ ngọn lửa.",
      href: "/about",
    },
    {
      icon: Map,
      title: "Mạng lưới Nghệ nhân",
      desc: "Mạng lưới nghệ nhân & xưởng chế tác.",
      href: "/artisans",
    },
    {
      icon: Users,
      title: "Gia nhập Đội ngũ",
      desc: "Trở thành Nhà giám tuyển văn hóa.",
      href: "/careers",
    },
  ],
};

interface HeaderProps {
  transparent?: boolean;
}

export function Header({ transparent = false }: HeaderProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (path: string) => {
    navigate(path);
    setActiveMenu(null);
    setMobileMenuOpen(false);
  };

  const handleMenuEnter = (menuName: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setActiveMenu(menuName);
  };

  const handleMenuLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 200);
  };

  const handleHeaderEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const isActive = (path: string) => location.pathname === path;

  // --- LOGIC TẮC KÈ HOA (Chameleon Mode) ---
  const isTransparentMode =
    transparent && !scrolled && !activeMenu && !mobileMenuOpen;

  // Style Class Logic
  const HARD_SHADOW = "shadow-[3px_3px_0px_0px_rgba(28,25,23,1)]";

  const navItemClass = (isActiveItem: boolean) =>
    cn(
      "flex items-center gap-1.5 py-2 px-5 rounded-full text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300 ease-out border border-transparent",
      isActiveItem
        ? "bg-amber-800 text-white shadow-lg"
        : cn(
            isTransparentMode
              ? "text-white/90 hover:text-white hover:bg-white/10"
              : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
          )
    );

  const renderBadge = (status: string) => {
    if (status === "soon")
      return (
        <span className="ml-2 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-stone-400 border border-stone-200 rounded-sm bg-stone-50">
          Sắp ra mắt
        </span>
      );
    if (status === "hot")
      return (
        <span className="ml-2 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-700 border border-amber-200 rounded-sm bg-amber-50">
          Ưu chuộng
        </span>
      );
    return null;
  };

  return (
    <>
      {/* Overlay backdrop */}
      {activeMenu && (
        <div className="fixed inset-0 bg-stone-900/40 z-40 backdrop-blur-sm transition-all duration-500" />
      )}

      <header
        ref={headerRef}
        onMouseEnter={handleHeaderEnter}
        onMouseLeave={handleMenuLeave}
        className={cn(
          "fixed top-0 z-50 w-full transition-all duration-700 ease-in-out",
          isTransparentMode
            ? "bg-gradient-to-b from-black/60 to-transparent border-b border-transparent py-6"
            : "bg-[#F9F8F6]/95 backdrop-blur-md border-b border-stone-200 py-3 shadow-sm"
        )}
      >
        <div className="max-w-[1440px] mx-auto px-6 md:px-8 relative">
          <div className="flex items-center justify-between">
            {/* LOGO */}
            <Logo
              variant="full"
              color={isTransparentMode ? "white" : "default"}
            />

            {/* DESKTOP NAV */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                to="/"
                onMouseEnter={() => handleMenuEnter("")}
                className={navItemClass(isActive("/"))}
              >
                Trang chủ
              </Link>

              <button
                onMouseEnter={() => handleMenuEnter("collections")}
                className={navItemClass(activeMenu === "collections")}
              >
                Tác Phẩm
                <ChevronDown className="w-3 h-3 ml-1" />
              </button>

              <button
                onMouseEnter={() => handleMenuEnter("services")}
                className={navItemClass(activeMenu === "services")}
              >
                Giám Tuyển
                <ChevronDown className="w-3 h-3 ml-1" />
              </button>

              <button
                onMouseEnter={() => handleMenuEnter("about")}
                className={navItemClass(activeMenu === "about")}
              >
                Tạp Chí
                <ChevronDown className="w-3 h-3 ml-1" />
              </button>
            </nav>

            {/* RIGHT ACTIONS */}
            <div className="hidden md:flex items-center gap-6">
              <div className="hidden xl:flex flex-col items-end group cursor-pointer">
                <span
                  className={cn(
                    "text-[9px] font-bold uppercase tracking-widest transition-colors mb-0.5",
                    isTransparentMode
                      ? "text-white/60 group-hover:text-white"
                      : "text-stone-400 group-hover:text-amber-800"
                  )}
                >
                  Hotline 24/7
                </span>
                <a
                  href="tel:0865726848"
                  className={cn(
                    "text-sm font-bold flex items-center gap-1.5 transition-colors",
                    isTransparentMode
                      ? "text-white hover:text-amber-200"
                      : "text-stone-900 group-hover:text-amber-800"
                  )}
                >
                  0865 726 848
                </a>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleNavClick("/signin")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300",
                    isTransparentMode
                      ? "text-white hover:bg-white/10"
                      : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                  )}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Đăng nhập
                </button>

                <Button
                  onClick={() => handleNavClick("/contact")}
                  className={cn(
                    "rounded-sm px-6 py-5 font-bold uppercase text-[10px] tracking-[0.2em] transition-all duration-300 border shadow-none hover:shadow-xl",
                    isTransparentMode
                      ? "bg-white text-stone-900 border-white hover:bg-stone-100 hover:scale-105"
                      : `bg-stone-900 text-[#F9F8F6] border-stone-900 hover:bg-amber-900 hover:border-amber-900 hover:-translate-y-0.5`
                  )}
                >
                  Đặt Hẹn
                </Button>
              </div>
            </div>

            {/* MOBILE TOGGLE */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={cn(
                "lg:hidden p-2 transition-transform active:scale-90",
                isTransparentMode ? "text-white" : "text-stone-900"
              )}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* --- MEGA MENUS --- */}

        {/* 1. PANEL: TÁC PHẨM (COLLECTIONS) - Style: Standard Grid */}
        <div
          onMouseEnter={handleHeaderEnter}
          className={cn(
            "absolute top-full left-0 w-full bg-[#F9F8F6] border-b border-stone-200 shadow-2xl overflow-hidden transition-all duration-500 origin-top z-50",
            activeMenu === "collections"
              ? "max-h-[600px] opacity-100 translate-y-0 visible"
              : "max-h-0 opacity-0 -translate-y-4 invisible"
          )}
        >
          <div className="max-w-5xl mx-auto px-8 py-12 grid grid-cols-3 gap-x-20 gap-y-8">
            {COLLECTIONS_MENU.groups.map((group, idx) => (
              <div key={idx} className="group/col">
                <h4 className="font-sans text-base font-bold text-stone-900 mb-5 border-b border-stone-300 pb-2 inline-block">
                  {group.name}
                </h4>
                <ul className="space-y-3">
                  {group.items.map((item, i) => (
                    <li key={i}>
                      {item.status === "soon" ? (
                        <span className="flex items-center text-sm text-stone-400 cursor-not-allowed py-1 font-light">
                          {item.label}
                          {renderBadge(item.status)}
                        </span>
                      ) : (
                        <Link
                          to="/shop"
                          className="flex items-center text-sm text-stone-600 hover:text-amber-800 hover:font-bold hover:translate-x-1 transition-all duration-200 block py-1 font-normal"
                        >
                          {item.label}
                          {renderBadge(item.status)}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* 2. PANEL: GIÁM TUYỂN (SERVICES) - Style: The Atelier */}
        <div
          onMouseEnter={handleHeaderEnter}
          className={cn(
            "absolute top-full left-0 w-full bg-[#F9F8F6] border-b border-stone-200 shadow-2xl overflow-hidden transition-all duration-500 origin-top z-50",
            activeMenu === "services"
              ? "max-h-[500px] opacity-100 translate-y-0 visible"
              : "max-h-0 opacity-0 -translate-y-4 invisible"
          )}
        >
          <div className="max-w-[1440px] mx-auto px-0 py-0 grid grid-cols-12 h-full min-h-[400px]">
            {/* CỘT TRÁI: VISUAL */}
            <div className="col-span-4 bg-stone-200 relative overflow-hidden group">
              <img
                src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop"
                alt="Artisan working"
                className="absolute inset-0 w-full h-full object-cover grayscale opacity-80 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-stone-900/40" />
              <div className="absolute bottom-0 left-0 p-10 text-white z-10">
                <p className="font-sans text-2xl font-medium mb-4 leading-tight">
                  "Chúng tôi không bán hàng.
                  <br />
                  Chúng tôi kiến tạo di sản."
                </p>
                <div className="w-12 h-[1px] bg-white/60 mb-4"></div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/80">
                  The Bespoke Process
                </span>
              </div>
            </div>

            {/* CỘT PHẢI: LIST */}
            <div className="col-span-8 p-12 bg-white">
              <h4 className="font-mono text-xs font-bold text-stone-400 uppercase tracking-widest mb-10 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-amber-800 rounded-full"></span>
                Giải pháp cho Doanh nghiệp
              </h4>

              <div className="grid grid-cols-2 gap-x-16 gap-y-10">
                {SERVICES_MENU.items.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={idx}
                      to={item.href}
                      className="group flex gap-5 items-start hover:-translate-y-1 transition-transform duration-300"
                    >
                      <div className="w-12 h-12 rounded-sm bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-500 group-hover:bg-amber-900 group-hover:text-white group-hover:border-amber-900 transition-colors duration-300 shrink-0">
                        <Icon className="w-5 h-5" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h4 className="font-sans text-lg text-stone-900 group-hover:text-amber-800 transition-colors mb-2 font-semibold">
                          {item.title}
                        </h4>
                        <p className="text-sm text-stone-500 font-light leading-relaxed max-w-xs group-hover:text-stone-700">
                          {item.desc}
                        </p>
                        <span className="inline-block mt-3 text-[10px] font-bold uppercase tracking-widest text-amber-800 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                          Khám phá &rarr;
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 3. PANEL: TẠP CHÍ (MAGAZINE) - Style: The Latest Issue */}
        <div
          onMouseEnter={handleHeaderEnter}
          className={cn(
            "absolute top-full left-0 w-full bg-[#F9F8F6] border-b border-stone-200 shadow-2xl overflow-hidden transition-all duration-500 origin-top z-50",
            activeMenu === "about"
              ? "max-h-[500px] opacity-100 translate-y-0 visible"
              : "max-h-0 opacity-0 -translate-y-4 invisible"
          )}
        >
          <div className="max-w-[1440px] mx-auto px-8 py-10 grid grid-cols-12 gap-12">
            {/* CỘT 1: NAVIGATION LIST */}
            <div className="col-span-4 border-r border-stone-200 pr-8">
              <h4 className="font-mono text-xs font-bold text-stone-400 uppercase tracking-widest mb-6">
                Mục lục
              </h4>
              <div className="space-y-2">
                {ABOUT_MENU.items.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={idx}
                      to={item.href}
                      className="group flex items-center gap-4 p-4 rounded-sm hover:bg-white transition-all duration-200"
                    >
                      <div className="text-stone-400 group-hover:text-amber-800 transition-colors">
                        <Icon className="w-5 h-5" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h4 className="font-sans font-bold text-stone-900 text-sm transition-colors group-hover:text-amber-900">
                          {item.title}
                        </h4>
                        <p className="text-stone-500 text-xs mt-0.5 font-light">
                          {item.desc}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* CỘT 2: FEATURED STORY */}
            <div className="col-span-8">
              <h4 className="font-mono text-xs font-bold text-stone-400 uppercase tracking-widest mb-6 flex justify-between items-center">
                <span>Tiêu điểm tuần này</span>
                <Link
                  to="/tap-chi"
                  className="text-amber-800 hover:text-stone-900 transition-colors text-[10px] font-bold"
                >
                  Xem tất cả bài viết &rarr;
                </Link>
              </h4>

              <Link
                to="/tap-chi/cau-chuyen-di-san"
                className="group relative block rounded-sm overflow-hidden h-[320px] shadow-sm hover:shadow-xl transition-all duration-500"
              >
                <img
                  src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=1600&auto=format&fit=crop"
                  alt="Featured Article"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/20 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />

                <div className="absolute bottom-0 left-0 p-10 max-w-2xl">
                  <span className="bg-amber-800 text-white px-2 py-1 text-[10px] font-bold uppercase tracking-widest mb-4 inline-block shadow-sm">
                    Kiến thức Di sản
                  </span>
                  <h3 className="font-sans text-2xl md:text-3xl text-white mb-4 leading-tight group-hover:text-amber-100 transition-colors font-bold">
                    Tiếng vọng từ Lửa: Tại sao Gốm Men Rạn cổ lại "Đanh như
                    Chuông"?
                  </h3>
                  <p className="text-stone-300 text-sm line-clamp-2 font-light leading-relaxed group-hover:text-white transition-colors">
                    Khám phá bí mật kỹ thuật nung 1260 độ C và cách các nhà sưu
                    tầm thẩm định âm thanh của gốm cổ chỉ bằng một cú gõ nhẹ.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
