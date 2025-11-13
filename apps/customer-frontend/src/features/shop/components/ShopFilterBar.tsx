// src/features/shop/components/ShopFilterBar.tsx (CẬP NHẬT)

import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { SortBar } from "./SortBar";
import { TaxonomyNode } from "../hooks/useShop"; // ✅ MỚI: Import TaxonomyNode
import { VisualCategoryFilter } from "./VisualCategoryFilter"; // ✅ MỚI: Import Filter mới

interface ShopFilterBarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  // ✅ SỬA: Dùng 'taxonomy' thay vì 'categories'
  taxonomy: TaxonomyNode[];
  onFilterOpen: () => void;
}

export const ShopFilterBar = ({
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  taxonomy, // ✅ SỬA
  onFilterOpen,
}: ShopFilterBarProps) => {
  return (
    <div className="flex flex-col gap-4">
      {/* === HÀNG 1: SẮP XẾP (Giữ nguyên) === */}
      <div className="flex items-center justify-between">
        <SortBar sortBy={sortBy} onSortChange={onSortChange} />
        <Button
          variant="outline"
          className="h-10 bg-gray-100 border-none"
          onClick={onFilterOpen}
        >
          <SlidersHorizontal size={16} className="mr-2" />
          Tất cả bộ lọc
        </Button>
      </div>

      {/* === HÀNG 2: DANH MỤC (Thay thế) === */}
      {/* ❌ GỠ BỎ: Thanh cuộn icon cũ */}
      {/* ✅ THÊM: Filter trực quan mới */}
      <VisualCategoryFilter
        taxonomy={taxonomy}
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
      />
    </div>
  );
};
