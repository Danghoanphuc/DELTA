// features/chat/components/CategorySidebar.tsx
import { useRef, useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Category {
  label: string;
  value: string;
  image?: string;
}

type CategorySidebarProps = {
  className?: string;
  layout?: "vertical" | "horizontal" | "mobile-grid";
};

export const CategorySidebar = ({
  className = "",
  layout = "vertical",
}: CategorySidebarProps) => {
  const defaultCategories: Category[] = [
    {
      label: "Bao thư, bao lì xì",
      value: "holiday-cards",
      image:
        "https://res.cloudinary.com/da3xfws3n/image/upload/v1763385804/bao_th%C6%B0_bao_li%CC%80_xi%CC%80_biesjs.svg",
    },
    {
      label: "Lịch & Quà tặng",
      value: "calendar-gifts",
      image:
        "https://res.cloudinary.com/da3xfws3n/image/upload/v1763381378/Calendar_and_Gifts_Icon_in_Mint_and_Blush_rs5zks.svg",
    },
    {
      label: "Danh thiếp & Thẻ",
      value: "business-cards",
      image:
        "https://res.cloudinary.com/da3xfws3n/image/upload/v1763386452/Thi%E1%BA%BFt_k%E1%BA%BF_ch%C6%B0a_c%C3%B3_t%C3%AAn_4_zw10gs.svg",
    },
    {
      label: "Quảng cáo in ấn",
      value: "postcards-marketing",
      image:
        "https://res.cloudinary.com/da3xfws3n/image/upload/v1763386942/Thi%E1%BA%BFt_k%E1%BA%BF_ch%C6%B0a_c%C3%B3_t%C3%AAn_5_lgldk1.svg",
    },
    {
      label: "Bảng hiệu, biểu ngữ",
      value: "signage-banners-posters",
      image:
        "https://res.cloudinary.com/da3xfws3n/image/upload/v1763386922/Thi%E1%BA%BFt_k%E1%BA%BF_ch%C6%B0a_c%C3%B3_t%C3%AAn_6_imoupw.svg",
    },
    {
      label: "Nhãn dán & tem",
      value: "labels-stickers",
      image:
        "https://res.cloudinary.com/da3xfws3n/image/upload/v1763387243/nha%CC%83n_da%CC%81n_pezqf5.svg",
    },
    {
      label: "Túi Tote",
      value: "tote-bags",
      image:
        "https://res.cloudinary.com/da3xfws3n/image/upload/v1763387284/Thi%E1%BA%BFt_k%E1%BA%BF_ch%C6%B0a_c%C3%B3_t%C3%AAn_2_q1c7pf.svg",
    },
    {
      label: "Quà khuyến mại",
      value: "promotional-products",
      image:
        "https://res.cloudinary.com/da3xfws3n/image/upload/v1763385803/sa%CC%89n_ph%C3%A2%CC%89m_khuy%C3%AA%CC%81n_ma%CC%83i_rupn6q.svg",
    },
    {
      label: "Bao bì & Hộp",
      value: "packaging",
      image:
        "https://res.cloudinary.com/da3xfws3n/image/upload/v1763385799/%C4%90o%CC%81ng_go%CC%81i_zbdloi.svg",
    },
  ];

  const isHorizontal = layout === "horizontal";
  const isMobileGrid = layout === "mobile-grid";

  // --- LOGIC SCROLL (Cho Desktop) ---
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
            {defaultCategories.map((c) => (
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
                </a>
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- MODE VERTICAL & MOBILE GRID ---
  const displayCategories = defaultCategories.slice(
    0,
    isMobileGrid ? 9 : defaultCategories.length
  );

  return (
    <aside
      className={cn(
        isMobileGrid
          ? "bg-transparent border-none p-0 space-y-3"
          : "rounded-2xl border border-white/70 bg-white/90 backdrop-blur-sm shadow-[0_22px_55px_rgba(15,23,42,0.08)] p-4 space-y-3",
        !isMobileGrid && "max-h-[calc(100vh-6rem)] overflow-auto custom-scrollbar",
        className
      )}
    >
      {!isMobileGrid && (
        <div className="flex items-center justify-between text-sm font-semibold text-slate-800 sticky top-0 bg-white/95 backdrop-blur z-10 pb-2 border-b border-slate-100">
          Danh mục sản phẩm
          <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
            {defaultCategories.length}
          </span>
        </div>
      )}

      <div
        className={cn(
          isMobileGrid
            ? "grid grid-cols-3 gap-x-2 gap-y-4 pt-2" // ✅ Tăng khoảng cách dọc (gap-y) để text không bị dính
            : "flex flex-col space-y-1"
        )}
      >
        {displayCategories.map((c) => (
          <Button
            key={c.value}
            asChild
            variant="ghost"
            className={cn(
              "text-gray-700 h-auto transition-all duration-200",
              isMobileGrid
                // ✅ MOBILE FIXES:
                // 1. h-auto: Để chiều cao tự động giãn theo nội dung
                // 2. px-0: Tận dụng tối đa chiều ngang
                // 3. border-none/shadow-none: Bỏ viền như yêu cầu
                // 4. items-start: Căn text lên trên thay vì center (tránh bị đẩy lung tung)
                ? "flex-col justify-start px-0 py-0 w-full whitespace-normal gap-2 bg-transparent hover:bg-transparent border-none shadow-none"
                : "w-full justify-start px-3 py-3 rounded-xl hover:bg-blue-50 hover:text-blue-700 gap-3"
            )}
          >
            <a href={`/shop?category=${encodeURIComponent(c.value)}`}>
              <div
                className={cn(
                  isMobileGrid
                    ? "flex flex-col items-center gap-2 w-full"
                    : "flex items-center gap-3 w-full"
                )}
              >
                {/* Icon/Image Wrapper */}
                <div
                  className={cn(
                    "flex items-center justify-center flex-shrink-0",
                    isMobileGrid 
                      // ✅ MOBILE IMAGE FIX:
                      // Tăng size lên w-16 h-16 (64px) hoặc w-20 (80px)
                      // Bỏ bg-gray-50 để ảnh trông tự nhiên trên nền trắng
                      ? "w-16 h-16 rounded-2xl bg-gray-50/50" 
                      : "w-10 h-10 rounded-lg bg-gray-50 overflow-hidden"
                  )}
                >
                  {c.image && (
                    <img
                      src={c.image}
                      alt={c.label}
                      className={cn(
                        "object-contain mix-blend-multiply",
                        isMobileGrid ? "w-full h-full p-1" : "w-3/4 h-3/4" // Ảnh mobile full container (có padding nhỏ)
                      )}
                      loading="lazy"
                    />
                  )}
                </div>

                {/* Text */}
                <span
                  className={cn(
                    "text-sm font-medium leading-tight",
                    isMobileGrid
                      // ✅ MOBILE TEXT FIX:
                      // 1. min-h-[2.5em]: Đủ chỗ cho 2 dòng
                      // 2. line-clamp-2: Ngắt dòng thông minh
                      // 3. text-[11px]: Font chữ vừa vặn hơn
                      // 4. tracking-tight: Giúp các từ dài (như 'Quảng cáo') ít bị rớt dòng vô duyên
                      ? "text-center text-[11px] w-full line-clamp-2 min-h-[2.5em] flex items-start justify-center text-gray-700 tracking-tight px-1"
                      : "text-left flex-1 truncate"
                  )}
                >
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