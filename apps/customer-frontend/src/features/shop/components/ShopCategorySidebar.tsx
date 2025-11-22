import { useEffect, useRef, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { 
  LayoutGrid, TrendingUp, Flame, ChevronRight, 
  Users, Package, Printer 
} from "lucide-react";
import { printzCategories } from "@/data/categories.data";

// --- HELPER: Get coordinates for fixed positioning ---
const useBoundingRect = (ref: React.RefObject<HTMLElement>) => {
  const [rect, setRect] = useState<DOMRect | null>(null);

  const update = () => {
    if (ref.current) {
      setRect(ref.current.getBoundingClientRect());
    }
  };

  useEffect(() => {
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, []);

  return rect;
};

// --- COMPONENT: MEGA MENU CONTENT (SINGLE INSTANCE) ---
// (Giữ nguyên phần này như bản trước, không thay đổi logic Portal)
interface MegaMenuPanelProps {
  category: any;
  triggerRect: DOMRect | null;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onSelectSubCategory: (val: string) => void;
}

const MegaMenuPanel = ({ 
  category, 
  triggerRect, 
  isHovered,
  onMouseEnter, 
  onMouseLeave,
  onSelectSubCategory 
}: MegaMenuPanelProps) => {
  if (!category || !triggerRect || !isHovered) return null;

  const top = triggerRect.top;
  const left = triggerRect.right + 8;

  return createPortal(
    <div
      className="fixed z-[9999] animate-in fade-in zoom-in-95 duration-200 ease-out" // Chỉnh duration mượt hơn
      style={{ top: top - 20, left: left }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="w-[600px] bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] border border-gray-100 overflow-hidden flex min-h-[300px]">
        {/* Cột trái */}
        <div className="w-1/3 bg-gray-50 p-6 border-r border-gray-100 flex flex-col">
          <div className="mb-4">
            {/* Logo trong MegaMenu cũng bỏ viền cho đồng bộ */}
            {category.image && (
              <div className="w-16 h-16 mb-4 flex items-center justify-center">
                <img src={category.image} alt="" className="w-full h-full object-contain drop-shadow-sm" />
              </div>
            )}
            <h4 className="font-bold text-xl text-gray-900 mb-2">{category.label}</h4>
            <p className="text-xs text-gray-500 leading-relaxed line-clamp-4">
              {category.description || `Khám phá các mẫu ${category.label.toLowerCase()} chất lượng cao.`}
            </p>
          </div>
          {/* (Stats giữ nguyên) */}
        </div>

        {/* Cột phải (Giữ nguyên) */}
        <div className="w-2/3 p-6">
          <div className="grid grid-cols-2 gap-8 h-full content-start">
            {category.subcategories && (
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                  <Package size={12} /> Phân loại
                </div>
                <ul className="space-y-2">
                  {category.subcategories.map((sub: any) => (
                    <li key={sub.value}>
                      <a 
                        href="#" 
                        onClick={(e) => { e.preventDefault(); onSelectSubCategory(category.value); }}
                        className="text-sm text-gray-700 hover:text-blue-600 hover:translate-x-1 transition-all block py-0.5"
                      >
                        {sub.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {category.useCases && (
               <div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                  <Users size={12} /> Ứng dụng
                </div>
                <ul className="space-y-2">
                  {category.useCases.map((uc: any) => (
                    <li key={uc.searchTerm}>
                      <a 
                        href="#" 
                        onClick={(e) => { e.preventDefault(); onSelectSubCategory(category.value); }} 
                        className="text-sm text-gray-700 hover:text-green-600 hover:translate-x-1 transition-all block py-0.5 flex items-center gap-2"
                      >
                        <span>{uc.emoji}</span> {uc.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

// --- MAIN COMPONENT ---

interface ShopCategorySidebarProps {
  selectedCategory: string;
  onSelectCategory: (value: string) => void;
  className?: string;
}

export const ShopCategorySidebar = ({
  selectedCategory,
  onSelectCategory,
  className,
}: ShopCategorySidebarProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const categories = printzCategories;
  
  const [hoveredCatId, setHoveredCatId] = useState<string | null>(null);
  const [activeRect, setActiveRect] = useState<DOMRect | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeCategoryData = useMemo(() => 
    categories.find(c => c.id === hoveredCatId), 
  [hoveredCatId, categories]);

  const handleMouseEnterItem = (catId: string, e: React.MouseEvent) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    const rect = e.currentTarget.getBoundingClientRect();
    setActiveRect(rect);
    setHoveredCatId(catId);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredCatId(null);
      setActiveRect(null);
    }, 150);
  };

  const handleMenuMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  };

  useEffect(() => {
    if (scrollRef.current) {
      const activeItem = scrollRef.current.querySelector('[data-state="active"]');
      if (activeItem) {
        activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedCategory]);

  // --- RENDER DESKTOP ---
  const DesktopView = () => (
    <div className="hidden lg:flex flex-col w-full" ref={sidebarRef}>
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">
        Danh mục sản phẩm
      </h3>
      
      <div className="space-y-1">
        {/* Nút Tất cả */}
        <Button
          variant="ghost"
          onClick={() => onSelectCategory("all")}
          onMouseEnter={() => {
             if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
             setHoveredCatId(null);
          }}
          className={cn(
            "w-full justify-start px-3 py-4 h-auto rounded-xl transition-all relative group mb-2",
            selectedCategory === "all"
              ? "bg-blue-50 text-blue-700 font-bold"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <div className="flex items-center gap-3">
            {/* Icon 'Tất cả' cũng làm to ra một chút và bỏ nền đậm */}
            <div className={cn(
              "w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-300",
              selectedCategory === "all" 
                ? "text-blue-600 scale-110" 
                : "text-gray-400 group-hover:text-gray-600 group-hover:scale-110"
            )}>
              <LayoutGrid size={24} />
            </div>
            <span className="text-sm font-medium">Tất cả danh mục</span>
          </div>
          {selectedCategory === "all" && (
            <div className="absolute right-3 w-1.5 h-1.5 bg-blue-600 rounded-full" />
          )}
        </Button>

        {/* Danh sách Categories */}
        {categories.map((cat) => {
          const hasMegaMenu = (cat.subcategories && cat.subcategories.length > 0) || (cat.useCases && cat.useCases.length > 0);
          const isSelected = selectedCategory === cat.value;
          const isHovering = hoveredCatId === cat.id;
          
          return (
            <div key={cat.id} className="relative">
              <Button
                variant="ghost"
                onClick={() => onSelectCategory(cat.value)}
                onMouseEnter={(e) => hasMegaMenu ? handleMouseEnterItem(cat.id, e) : handleMouseEnterItem('', e)} 
                onMouseLeave={handleMouseLeave}
                className={cn(
                  "w-full justify-start px-3 py-3 h-auto rounded-xl transition-all group/item relative",
                  isSelected
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  isHovering ? "bg-gray-50 text-blue-600" : "" 
                )}
              >
                <div className="flex items-center gap-4 w-full overflow-hidden">
                  
                  {/* --- ICON SECTION (ĐÃ SỬA) --- */}
                  <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center relative">
                    {cat.image ? (
                      <img 
                        src={cat.image} 
                        alt="" 
                        className={cn(
                          "w-full h-full object-contain drop-shadow-sm transition-all duration-300 ease-out will-change-transform",
                          // Hiệu ứng: Phóng to + Xoay nhẹ + Đổ bóng sâu hơn khi hover hoặc active
                          (isSelected || isHovering) 
                             ? "scale-125 rotate-3 drop-shadow-md" 
                             : "group-hover/item:scale-125 group-hover/item:rotate-3 group-hover/item:drop-shadow-md"
                        )} 
                      />
                    ) : (
                      <LayoutGrid 
                        size={24} 
                        className={cn(
                           "text-gray-300 transition-all duration-300",
                           (isSelected || isHovering) ? "text-blue-500 scale-110" : "group-hover/item:text-gray-500 group-hover/item:scale-110"
                        )} 
                      />
                    )}
                  </div>
                  {/* ----------------------------- */}

                  <div className="flex flex-col items-start min-w-0 flex-1">
                    <div className="flex items-center w-full gap-2">
                       <span className="truncate text-base">{cat.label}</span> {/* Tăng size chữ lên 1 chút (text-base) */}
                       {cat.trending && <TrendingUp size={14} className="text-orange-500 flex-shrink-0 animate-pulse" />}
                       {cat.seasonal && <Flame size={14} className="text-red-500 flex-shrink-0" />}
                    </div>
                  </div>

                  {hasMegaMenu && (
                    <ChevronRight 
                      size={16} 
                      className={cn(
                        "text-gray-300 transition-all duration-300",
                        // Khi hover thì chevron dịch sang phải và đậm lên
                        isHovering 
                          ? "opacity-100 text-blue-400 translate-x-0" 
                          : "opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0"
                      )} 
                    />
                  )}
                </div>
              </Button>
            </div>
          );
        })}
      </div>

      {activeCategoryData && (
        <MegaMenuPanel 
          category={activeCategoryData}
          triggerRect={activeRect}
          isHovered={!!hoveredCatId}
          onMouseEnter={handleMenuMouseEnter}
          onMouseLeave={handleMouseLeave}
          onSelectSubCategory={(val) => {
             onSelectCategory(val);
             setHoveredCatId(null);
          }}
        />
      )}
    </div>
  );

  // (MobileView giữ nguyên)
  const MobileView = () => (
    <div className="lg:hidden w-full overflow-hidden">
      <div 
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide px-1 -mx-1"
      >
        <button
          onClick={() => onSelectCategory("all")}
          data-state={selectedCategory === "all" ? "active" : "inactive"}
          className={cn(
            "flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-semibold transition-all whitespace-nowrap",
            selectedCategory === "all"
              ? "bg-gray-900 text-white border-gray-900 shadow-md"
              : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
          )}
        >
          <LayoutGrid size={14} />
          Tất cả
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.value)}
            data-state={selectedCategory === cat.value ? "active" : "inactive"}
            className={cn(
              "flex-shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-full border text-xs font-medium transition-all whitespace-nowrap",
              selectedCategory === cat.value
                ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm"
                : "bg-white text-gray-700 border-gray-200"
            )}
          >
            {cat.image && <img src={cat.image} alt="" className="w-4 h-4 object-contain" />}
            {cat.label}
            {(cat.trending || cat.seasonal) && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 -mt-2 -mr-1" />
            )}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <nav className={cn("", className)}>
      <DesktopView />
      <MobileView />
    </nav>
  );
};