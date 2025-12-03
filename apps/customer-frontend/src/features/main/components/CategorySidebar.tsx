import { useRef, useState, useEffect } from "react";
import { cn } from "@/shared/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevronRightIcon,
  LayoutGrid,
  Hash,
  ArrowUpRight,
} from "lucide-react";
import { printzCategories, type PrintZCategory } from "@/data/categories.data";

type CategorySidebarProps = {
  className?: string;
  layout?: "vertical" | "horizontal" | "mobile-grid";
};

export const CategorySidebar = ({
  className = "",
  layout = "vertical",
}: CategorySidebarProps) => {
  const categories: PrintZCategory[] = printzCategories || [];
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const isHorizontal = layout === "horizontal";
  const isMobileGrid = layout === "mobile-grid";

  // --- Scroll Logic ---
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    if (isHorizontal) {
      checkScroll();
      window.addEventListener("resize", checkScroll);
      return () => window.removeEventListener("resize", checkScroll);
    }
  }, [isHorizontal]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 300);
    }
  };

  // --- 1. MEGA MENU: Editorial Style ---
  const renderMegaMenu = (category: PrintZCategory) => {
    if (!category.subcategories && !category.useCases) return null;

    return (
      <div
        className="absolute left-full top-0 z-50 min-h-[400px] w-[600px] rounded-r-2xl border border-stone-100 bg-white shadow-[10px_0_30px_rgba(0,0,0,0.05)] animate-in fade-in slide-in-from-left-2 duration-300"
        onMouseEnter={() => setHoveredCategory(category.id)}
        onMouseLeave={() => setHoveredCategory(null)}
      >
        {/* Header nhẹ nhàng */}
        <div className="flex items-center justify-between border-b border-stone-100 bg-stone-50/50 p-6 rounded-tr-2xl">
          <div>
            <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-stone-400">
              Bộ sưu tập
            </p>
            <h3 className="font-serif text-3xl font-bold text-foreground">
              {category.label}
            </h3>
          </div>
          {/* Chữ cái đầu mờ làm nền decoration */}
          <span className="font-serif text-6xl font-black text-stone-100 italic">
            {category.label.charAt(0)}
          </span>
        </div>

        {/* Content */}
        <div className="grid grid-cols-2 h-full">
          <div className="p-6 border-r border-stone-50">
            <h4 className="mb-4 font-sans text-xs font-bold uppercase tracking-wider text-primary">
              Phân loại
            </h4>
            <ul className="space-y-2">
              {category.subcategories?.map((sub) => (
                <li key={sub.value}>
                  <a
                    href={`/shop?category=${category.value}&sub=${sub.value}`}
                    className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm text-stone-600 transition-colors hover:bg-stone-50 hover:text-foreground"
                  >
                    <span>{sub.label}</span>
                    <ArrowUpRight
                      size={14}
                      className="text-stone-300 opacity-0 transition-all group-hover:opacity-100 group-hover:text-primary"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 bg-white">
            <h4 className="mb-4 font-sans text-xs font-bold uppercase tracking-wider text-stone-400">
              Ứng dụng phổ biến
            </h4>
            <div className="grid gap-3">
              {category.useCases?.slice(0, 4).map((useCase) => (
                <a
                  key={useCase.searchTerm}
                  href={`/shop?category=${category.value}&use-case=${useCase.searchTerm}`}
                  className="group flex items-center gap-3 rounded-xl border border-stone-100 p-3 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <span className="text-xl">{useCase.emoji}</span>
                  <div>
                    <span className="block text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                      {useCase.label}
                    </span>
                    <span className="text-[10px] text-stone-400 font-serif italic">
                      {useCase.description}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-stone-100 bg-stone-50/30 rounded-br-2xl text-center">
          <a
            href={`/shop?category=${category.value}`}
            className="text-xs font-bold text-primary hover:underline"
          >
            Xem tất cả sản phẩm thuộc {category.label} &rarr;
          </a>
        </div>
      </div>
    );
  };

  // --- 2. DESKTOP HORIZONTAL: Clean Pills ---
  if (isHorizontal) {
    return (
      <div
        className={cn(
          "relative w-full border-b border-stone-100 bg-white py-2",
          className
        )}
      >
        {/* Buttons Nav mờ ảo */}
        {showLeftArrow && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-0 z-20 flex w-12 items-center justify-center bg-gradient-to-r from-white via-white to-transparent text-stone-400 hover:text-primary"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        {showRightArrow && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-0 z-20 flex w-12 items-center justify-center bg-gradient-to-l from-white via-white to-transparent text-stone-400 hover:text-primary"
          >
            <ChevronRight size={20} />
          </button>
        )}

        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto px-4 hide-scrollbar scroll-smooth"
        >
          {categories.map((c) => (
            <a
              key={c.id}
              href={`/shop?category=${encodeURIComponent(c.value)}`}
              className="group flex min-w-[100px] flex-col items-center justify-center gap-2 rounded-2xl p-2 transition-all hover:bg-stone-50"
            >
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-50 transition-all group-hover:scale-105 group-hover:bg-white group-hover:shadow-md">
                {c.image ? (
                  <img
                    src={c.image}
                    alt={c.label}
                    className="h-10 w-10 object-contain mix-blend-multiply"
                    loading="lazy"
                  />
                ) : (
                  <LayoutGrid size={20} className="text-stone-300" />
                )}

                {c.trending && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white shadow-sm ring-2 ring-white">
                    H
                  </span>
                )}
              </div>
              <span className="text-center font-sans text-xs font-medium text-stone-600 group-hover:text-primary">
                {c.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    );
  }

  // --- 3. DESKTOP VERTICAL: Sidebar Elegant ---
  if (!isMobileGrid) {
    return (
      <aside
        className={cn(
          "w-full rounded-2xl border border-stone-100 bg-white shadow-sm overflow-visible",
          className
        )}
      >
        <div className="flex items-center justify-between border-b border-stone-100 bg-stone-50/50 px-5 py-4 rounded-t-2xl">
          <span className="font-serif text-sm font-bold text-foreground">
            Danh mục
          </span>
          <span className="rounded-full bg-stone-200 px-2 py-0.5 text-[10px] font-bold text-stone-600">
            {categories.length}
          </span>
        </div>

        <div className="flex flex-col py-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="group relative"
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <a
                href={`/shop?category=${category.value}`}
                className={cn(
                  "flex items-center justify-between px-5 py-3 transition-all",
                  hoveredCategory === category.id
                    ? "bg-stone-50 text-primary"
                    : "text-stone-600 hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  {/* Icon thay vì số */}
                  <div
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-colors",
                      hoveredCategory === category.id
                        ? "bg-primary"
                        : "bg-stone-300"
                    )}
                  />

                  <span className="font-sans text-sm font-medium">
                    {category.label}
                  </span>
                </div>

                <ChevronRightIcon
                  size={14}
                  className={cn(
                    "transition-all duration-300",
                    hoveredCategory === category.id
                      ? "translate-x-0 opacity-100"
                      : "-translate-x-2 opacity-0"
                  )}
                />
              </a>
              {/* Mega menu hiện ra bên cạnh */}
              {hoveredCategory === category.id && renderMegaMenu(category)}
            </div>
          ))}
        </div>
      </aside>
    );
  }

  // --- 4. MOBILE GRID: Soft App Icons ---
  const displayCategories = categories.slice(0, 9);

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="font-serif text-lg font-bold text-foreground">
          Khám phá
        </h3>
        <a
          href="/shop"
          className="flex items-center gap-1 text-xs font-medium text-stone-400 hover:text-primary transition-colors"
        >
          Xem tất cả <ChevronRight size={14} />
        </a>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {displayCategories.map((c) => (
          <a
            key={c.value}
            href={`/shop?category=${encodeURIComponent(c.value)}`}
            className="group flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl bg-white p-2 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all active:scale-95 active:shadow-none border border-transparent hover:border-primary/20"
          >
            <div className="flex h-10 w-10 items-center justify-center transition-transform duration-300 group-hover:scale-110">
              {c.image ? (
                <img
                  src={c.image}
                  alt={c.label}
                  className="h-full w-full object-contain mix-blend-multiply"
                  loading="lazy"
                />
              ) : (
                <LayoutGrid size={20} className="text-stone-300" />
              )}
            </div>

            <span className="px-1 text-center font-sans text-[11px] font-medium leading-tight text-stone-600 group-hover:text-primary">
              {c.label}
            </span>
          </a>
        ))}

        {categories.length > 9 && (
          <a
            href="/shop"
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl bg-stone-50 text-stone-400 transition-colors hover:bg-stone-100 hover:text-foreground"
          >
            <span className="font-serif text-xl font-bold italic">
              +{categories.length - 9}
            </span>
            <span className="text-[10px] font-medium">Xem thêm</span>
          </a>
        )}
      </div>
    </div>
  );
};
