import { useRef, useState, useEffect } from "react";
import { cn } from "@/shared/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevronRightIcon,
  Wind, // Zen
  Waves, // Flow
  Mountain, // Earth
  Leaf, // Wood
  Gem, // Gold/Luxury
  LayoutGrid,
} from "lucide-react";

// Dữ liệu danh mục tĩnh (Demo cho concept An Nam)
// Trong thực tế bạn có thể map từ API về
const HERITAGE_CATEGORIES = [
  { id: "zen", label: "Tĩnh Tại", icon: Wind, desc: "Trầm & Trà" },
  { id: "flow", label: "Dòng Chảy", icon: Waves, desc: "Sơn Mài & Lụa" },
  { id: "earth", label: "Thổ Nhưỡng", icon: Mountain, desc: "Gốm Sứ" },
  { id: "wood", label: "Mộc Bản", icon: Leaf, desc: "Gỗ & Tre" },
  { id: "gold", label: "Kim Hoàn", icon: Gem, desc: "Đồng & Vàng" },
];

type CategorySidebarProps = {
  className?: string;
  layout?: "vertical" | "horizontal" | "mobile-grid";
};

export const CategorySidebar = ({
  className = "",
  layout = "vertical",
}: CategorySidebarProps) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const isHorizontal = layout === "horizontal";
  const isMobileGrid = layout === "mobile-grid";

  // --- Scroll Logic (Giữ nguyên) ---
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

  // --- 1. DESKTOP HORIZONTAL: Cards sang trọng ---
  if (isHorizontal) {
    return (
      <div className={cn("relative w-full py-4", className)}>
        {/* Navigation Buttons - Tối giản */}
        {showLeftArrow && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex items-center justify-center bg-white border border-stone-200 shadow-md rounded-full text-stone-600 hover:text-amber-800 transition-all"
          >
            <ChevronLeft size={16} />
          </button>
        )}
        {showRightArrow && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex items-center justify-center bg-white border border-stone-200 shadow-md rounded-full text-stone-600 hover:text-amber-800 transition-all"
          >
            <ChevronRight size={16} />
          </button>
        )}

        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto px-1 hide-scrollbar scroll-smooth pb-2"
        >
          {HERITAGE_CATEGORIES.map((c) => (
            <a
              key={c.id}
              href={`/shop?category=${c.id}`}
              className="group flex min-w-[140px] flex-col items-center justify-center gap-3 rounded-sm border border-stone-200 bg-white p-4 transition-all hover:border-amber-400 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-50 text-stone-400 transition-colors group-hover:bg-amber-50 group-hover:text-amber-800">
                <c.icon size={24} strokeWidth={1.5} />
              </div>
              <div className="text-center">
                <span className="block font-serif text-sm font-bold text-stone-900 group-hover:text-amber-900">
                  {c.label}
                </span>
                <span className="block text-[10px] uppercase tracking-wider text-stone-400 font-light mt-1">
                  {c.desc}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    );
  }

  // --- 2. MOBILE GRID: Clean & Minimal ---
  return (
    <div className={cn("w-full", className)}>
      <div className="mb-4 flex items-center justify-between px-1 border-b border-stone-200 pb-2">
        <h3 className="font-serif text-lg font-bold text-stone-900 italic">
          Mục lục Di sản
        </h3>
        <a
          href="/shop"
          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-amber-800 hover:text-stone-900 transition-colors"
        >
          Xem tất cả <ChevronRight size={12} />
        </a>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {HERITAGE_CATEGORIES.map((c) => (
          <a
            key={c.id}
            href={`/shop?category=${c.id}`}
            className="group flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-sm bg-white border border-stone-100 shadow-sm transition-all active:scale-95 hover:border-amber-200"
          >
            <c.icon
              size={20}
              strokeWidth={1.5}
              className="text-stone-400 group-hover:text-amber-800 transition-colors"
            />
            <span className="text-center font-sans text-[11px] font-medium text-stone-600 group-hover:text-stone-900">
              {c.label}
            </span>
          </a>
        ))}

        {/* Nút xem thêm cách điệu */}
        <a
          href="/shop"
          className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-sm bg-stone-50 border border-dashed border-stone-300 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
        >
          <LayoutGrid size={20} strokeWidth={1.5} />
          <span className="text-[10px] font-medium">Khám phá</span>
        </a>
      </div>
    </div>
  );
};
