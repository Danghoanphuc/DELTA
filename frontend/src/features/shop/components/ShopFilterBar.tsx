// features/shop/components/ShopFilterBar.tsx
// ✅ ĐỘT PHÁ: Tái thiết kế toàn bộ theo phong cách Pinterest/Canva

import {
  SlidersHorizontal,
  ChevronDown,
  Palette,
  Gem,
  Check,
} from "lucide-react";
import { Product } from "@/types/product";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { categoryIcons } from "../utils/categoryIcons"; // Import icons

interface ShopFilterBarProps {
  // ✅ Props đã được cập nhật
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  categories: { label: string; value: string }[];
  onFilterOpen: () => void; // ✅ Thêm
}

// Các nút sắp xếp (tách biệt với logic giá)
const sortTabs = [
  { label: "Liên quan", value: "popular" },
  { label: "Mới nhất", value: "newest" },
];

export const ShopFilterBar = ({
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  categories,
  onFilterOpen,
}: ShopFilterBarProps) => {
  const isPriceSort = sortBy === "price-asc" || sortBy === "price-desc";

  return (
    <div className="flex flex-col gap-4">
      {/* === HÀNG 1: SẮP XẾP (Giống Canva) === */}
      <div className="flex items-center gap-2">
        {/* Tabs Sắp xếp */}
        <Tabs
          value={isPriceSort ? "price" : sortBy}
          onValueChange={(value) => {
            if (value !== "price") {
              onSortChange(value);
            }
          }}
        >
          <TabsList className="h-10 p-1 bg-gray-100 rounded-lg">
            {sortTabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="px-4 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Nút Giá (Dropdown) */}
        <Select
          value={isPriceSort ? sortBy : "default"}
          onValueChange={(value) => {
            if (value !== "default") onSortChange(value);
          }}
        >
          <SelectTrigger
            className={cn(
              "w-40 h-10 bg-gray-100 border-none",
              isPriceSort &&
                "bg-white shadow-md text-blue-600 ring-1 ring-inset ring-gray-200"
            )}
          >
            <SelectValue placeholder="Giá" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="price-asc">Giá: Thấp → Cao</SelectItem>
            <SelectItem value="price-desc">Giá: Cao → Thấp</SelectItem>
          </SelectContent>
        </Select>

        {/* Nút Bộ lọc (Mở Modal) */}
        <Button
          variant="outline"
          className="h-10 bg-gray-100 border-none"
          onClick={onFilterOpen}
        >
          <SlidersHorizontal size={16} className="mr-2" />
          Tất cả bộ lọc
        </Button>
      </div>

      {/* === HÀNG 2: DANH MỤC (Cuộn ngang - Giống Canva) === */}
      <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
        {categories.map((cat) => {
          const Icon = categoryIcons[cat.value] || Palette;
          const isActive = selectedCategory === cat.value;
          return (
            <Button
              key={cat.value}
              variant="ghost"
              className={cn(
                "flex flex-col h-20 w-24 p-2 rounded-lg bg-gray-100 hover:bg-gray-200",
                isActive &&
                  "bg-blue-50 border-2 border-blue-500 text-blue-600 hover:bg-blue-50"
              )}
              onClick={() => onCategoryChange(cat.value)}
            >
              <Icon
                size={24}
                className={cn("text-gray-600", isActive && "text-blue-600")}
              />
              <span
                className={cn(
                  "text-xs mt-1.5 whitespace-normal text-center font-normal text-gray-700",
                  isActive && "font-semibold text-blue-600"
                )}
              >
                {cat.label}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
