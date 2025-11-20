// features/chat/components/CategorySidebar.tsx
// ✅ MAJOR UPDATE: Mega menu with comprehensive Vietnamese category data
import { useRef, useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { ChevronLeft, ChevronRight, Users, TrendingUp, Flame, ChevronRight as ChevronRightIcon } from "lucide-react";
import { printzCategories, type PrintZCategory } from "@/data/categories.data";

type CategorySidebarProps = {
  className?: string;
  layout?: "vertical" | "horizontal" | "mobile-grid";
};

export const CategorySidebar = ({
  className = "",
  layout = "vertical",
}: CategorySidebarProps) => {
  // ✅ Use comprehensive data from categories.data.ts
  const categories: PrintZCategory[] = printzCategories;

  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const isHorizontal = layout === "horizontal";
  const isMobileGrid = layout === "mobile-grid";

  // --- LOGIC SCROLL (Cho Desktop Horizontal Rail) ---
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
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

  // --- ✅ NEW: MEGA MENU POPUP ---
  const renderMegaMenu = (category: PrintZCategory) => {
    if (!category.subcategories && !category.useCases) return null;

    return (
      <div 
        className="absolute left-full top-0 ml-2 w-[520px] bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.15)] border border-gray-100 p-6 z-50 animate-in fade-in slide-in-from-left-2 duration-200"
        onMouseEnter={() => setHoveredCategory(category.id)}
        onMouseLeave={() => setHoveredCategory(null)}
      >
        {/* Header */}
        <div className="mb-5 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900 mb-1.5">{category.label}</h3>
              {category.description && (
                <p className="text-sm text-gray-600 leading-relaxed">{category.description}</p>
              )}
            </div>
            {(category.trending || category.seasonal || category.featured) && (
              <div className="flex gap-1.5 ml-3">
                {category.trending && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 rounded-full text-[10px] font-semibold">
                    <TrendingUp className="w-3 h-3" />
                    HOT
                  </span>
                )}
                {category.seasonal && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded-full text-[10px] font-semibold">
                    <Flame className="w-3 h-3" />
                    MÙA
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Pricing & Printer Count */}
          <div className="flex items-center gap-4 mt-3 text-sm">
            {category.printerCount && (
              <span className="flex items-center gap-1.5 text-gray-600">
                <Users className="w-4 h-4" />
                <span className="font-medium text-gray-900">{category.printerCount}</span> nhà in
              </span>
            )}
            {category.pricing.avgPrice && (
              <span className="text-green-600 font-semibold">
                {category.pricing.avgPrice}
              </span>
            )}
            {category.pricing.bulkDiscount && (
              <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                Giảm giá số lượng
              </span>
            )}
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-2 gap-6">
          {/* Left: Subcategories */}
          {category.subcategories && category.subcategories.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
                Loại sản phẩm
              </h4>
              <ul className="space-y-1.5">
                {category.subcategories.slice(0, 6).map((sub) => (
                  <li key={sub.value}>
                    <a
                      href={`/shop?category=${category.value}&sub=${sub.value}`}
                      className="flex items-center justify-between group hover:bg-blue-50 px-3 py-2 rounded-lg transition-all duration-200"
                    >
                      <span className="text-sm text-gray-700 group-hover:text-blue-600 font-medium flex-1">
                        {sub.label}
                      </span>
                      <div className="flex items-center gap-2">
                        {sub.popular && (
                          <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">
                            HOT
                          </span>
                        )}
                        {sub.productCount && (
                          <span className="text-xs text-gray-400 font-medium min-w-[32px] text-right">
                            {sub.productCount}
                          </span>
                        )}
                      </div>
                    </a>
                  </li>
                ))}
                {category.subcategories.length > 6 && (
                  <li>
                    <a
                      href={`/shop?category=${category.value}`}
                      className="text-sm text-blue-600 hover:text-blue-700 font-semibold px-3 py-2 block"
                    >
                      + {category.subcategories.length - 6} loại khác
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Right: Use Cases */}
          {category.useCases && category.useCases.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                <span className="w-1 h-4 bg-green-600 rounded-full"></span>
                Phù hợp cho
              </h4>
              <ul className="space-y-1.5">
                {category.useCases.slice(0, 5).map((useCase) => (
                  <li key={useCase.searchTerm}>
                    <a
                      href={`/shop?category=${category.value}&use-case=${useCase.searchTerm}`}
                      className="flex items-center gap-3 group hover:bg-green-50 px-3 py-2 rounded-lg transition-all duration-200"
                    >
                      <span className="text-xl flex-shrink-0">{useCase.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-gray-700 group-hover:text-green-600 font-medium block">
                          {useCase.label}
                        </span>
                        {useCase.description && (
                          <span className="text-xs text-gray-500 block truncate">
                            {useCase.description}
                          </span>
                        )}
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <a
            href={`/shop?category=${category.value}`}
            className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1.5 group"
          >
            Xem tất cả {category.label}
            <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>
    );
  };

  // --- MODE DESKTOP (HORIZONTAL RAIL) ---
  if (isHorizontal) {
    return (
      <div className={cn("w-full hidden lg:block relative group/rail", className)}>
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="font-semibold text-gray-700">Khám phá danh mục</h3>
        </div>

        {showLeftArrow && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-[60%] -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.1)] rounded-full h-8 w-8 border border-gray-100 hover:bg-white text-gray-600 -ml-3 transition-opacity duration-200"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}

        {showRightArrow && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-[60%] -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.1)] rounded-full h-8 w-8 border border-gray-100 hover:bg-white text-gray-600 -mr-3 transition-opacity duration-200"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}

        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="w-full overflow-x-auto hide-scrollbar py-4 -my-4 px-1 scroll-smooth"
        >
          <div className="flex gap-3">
            {categories.map((c) => (
              <Button
                key={c.value}
                asChild
                variant="ghost"
                className={cn(
                  "group relative flex flex-col h-auto",
                  "w-[140px] min-h-[150px] p-2",
                  "bg-white/60 backdrop-blur-sm border border-white/50",
                  "rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.03)]",
                  "transition-all duration-300 ease-out",
                  "hover:-translate-y-1.5 hover:shadow-[0_12px_24px_rgba(59,130,246,0.15)] hover:bg-white hover:border-blue-200"
                )}
              >
                <a
                  href={`/shop?category=${encodeURIComponent(c.value)}`}
                  className="flex flex-col items-center justify-start h-full w-full gap-2"
                >
                  <div className="w-24 h-24 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    {c.image && (
                      <img
                        src={c.image}
                        alt={c.label}
                        className="w-full h-full object-contain drop-shadow-sm"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <span className="text-center text-xs font-medium text-slate-600 leading-snug line-clamp-2 group-hover:text-blue-700 h-[32px] flex items-center justify-center w-full">
                    {c.label}
                  </span>
                  {(c.trending || c.seasonal) && (
                    <span className="absolute top-2 right-2">
                      {c.trending && <TrendingUp className="w-3.5 h-3.5 text-orange-500" />}
                      {c.seasonal && <Flame className="w-3.5 h-3.5 text-red-500" />}
                    </span>
                  )}
                </a>
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- MODE VERTICAL SIDEBAR (Desktop) ---
  if (!isMobileGrid) {
    return (
      <aside
        className={cn(
          "rounded-2xl border border-white/70 bg-white/90 backdrop-blur-sm shadow-[0_22px_55px_rgba(15,23,42,0.08)] p-4 space-y-3",
          "max-h-[calc(100vh-6rem)] overflow-auto custom-scrollbar",
          className
        )}
      >
        <div className="flex items-center justify-between text-sm font-semibold text-slate-800 sticky top-0 bg-white/95 backdrop-blur z-10 pb-2 border-b border-slate-100">
          Danh mục sản phẩm
          <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
            {categories.length}
          </span>
        </div>

        <div className="space-y-1">
          {categories.map((category) => (
            <div
              key={category.id}
              className="relative"
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <Button
                asChild
                variant="ghost"
                className={cn(
                  "w-full justify-start px-3 py-3 rounded-xl hover:bg-blue-50 hover:text-blue-700 gap-3 transition-all",
                  hoveredCategory === category.id && "bg-blue-50 text-blue-700"
                )}
              >
                <a href={`/shop?category=${category.value}`}>
                  <div className="flex items-center gap-3 w-full">
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {category.image && (
                        <img
                          src={category.image}
                          alt={category.label}
                          className="w-3/4 h-3/4 object-contain mix-blend-multiply"
                          loading="lazy"
                        />
                      )}
                    </div>

                    {/* Text */}
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{category.label}</span>
                        {category.seasonal && (
                          <Flame className="w-3 h-3 text-red-500 flex-shrink-0" />
                        )}
                        {category.trending && (
                          <TrendingUp className="w-3 h-3 text-orange-500 flex-shrink-0" />
                        )}
                      </div>
                      {category.printerCount && (
                        <span className="text-xs text-gray-500">
                          {category.printerCount} nhà in
                        </span>
                      )}
                    </div>

                    {/* Arrow */}
                    <ChevronRightIcon className={cn(
                      "w-4 h-4 text-gray-400 transition-transform flex-shrink-0",
                      hoveredCategory === category.id && "translate-x-1"
                    )} />
                  </div>
                </a>
              </Button>

              {/* ✅ MEGA MENU POPUP */}
              {hoveredCategory === category.id && renderMegaMenu(category)}
            </div>
          ))}
        </div>

        {/* ✅ CTA: Chat với AI */}
        <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Không tìm thấy danh mục phù hợp?
          </p>
          <a
            href="/chat"
            className="text-sm text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1"
          >
            💬 Chat với AI để được tư vấn
            <ChevronRightIcon className="w-3.5 h-3.5" />
          </a>
        </div>
      </aside>
    );
  }

  // --- MODE MOBILE GRID ---
  const displayCategories = categories.slice(0, 9);

  return (
    <aside className={cn("bg-transparent border-none p-0 space-y-3", className)}>
      <div className="grid grid-cols-3 gap-x-2 gap-y-4 pt-2">
        {displayCategories.map((c) => (
          <Button
            key={c.value}
            asChild
            variant="ghost"
            className="flex-col justify-start px-0 py-0 w-full whitespace-normal gap-2 bg-transparent hover:bg-transparent border-none shadow-none h-auto"
          >
            <a href={`/shop?category=${encodeURIComponent(c.value)}`}>
              <div className="flex flex-col items-center gap-2 w-full">
                {/* Icon/Image */}
                <div className="w-16 h-16 rounded-2xl bg-gray-50/50 flex items-center justify-center flex-shrink-0 relative">
                  {c.image && (
                    <img
                      src={c.image}
                      alt={c.label}
                      className="w-full h-full p-1 object-contain mix-blend-multiply"
                      loading="lazy"
                    />
                  )}
                  {(c.trending || c.seasonal) && (
                    <span className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                      {c.trending && <TrendingUp className="w-3 h-3 text-orange-500" />}
                      {c.seasonal && <Flame className="w-3 h-3 text-red-500" />}
                    </span>
                  )}
                </div>

                {/* Text */}
                <span className="text-center text-[11px] w-full line-clamp-2 min-h-[2.5em] flex items-start justify-center text-gray-700 tracking-tight px-1 font-medium">
                  {c.label}
                </span>
              </div>
            </a>
          </Button>
        ))}
      </div>
    </aside>
  );
};
