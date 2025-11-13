// src/features/shop/components/VisualCategoryFilter.tsx (CẬP NHẬT)
import { Card, CardContent } from "@/shared/components/ui/card";
import { TaxonomyNode } from "../hooks/useShop";
import { cn } from "@/shared/lib/utils";
import { categoryIcons } from "../utils/categoryIcons";
import { Palette, Sparkles } from "lucide-react"; // Thêm Sparkles
import { Button } from "@/shared/components/ui/button"; // ✅ Dùng Button

interface VisualCategoryFilterProps {
  taxonomy: TaxonomyNode[];
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
}

export const VisualCategoryFilter = ({
  taxonomy,
  selectedCategory,
  onCategoryChange,
}: VisualCategoryFilterProps) => {
  // ✅ SỬA: Bổ sung "Tất cả" (Giống "Đoán bạn thích nó")
  const categoriesWithAll = [
    { value: "all", label: "Tất cả", icon: "default", children: [] },
    ...taxonomy,
  ];

  return (
    // ✅ SỬA: Dùng div cuộn ngang, bỏ Carousel
    <div className="w-full overflow-x-auto hide-scrollbar">
      <div className="flex gap-2 pb-1">
        {" "}
        {/* Thêm pb-1 để thanh cuộn không quá sát */}
        {categoriesWithAll.map((category) => {
          const isActive = selectedCategory === category.value;
          const Icon =
            (categoryIcons as any)[category.value] ||
            (categoryIcons as any)[category.icon] ||
            Sparkles; // Dùng Sparkles/Palette làm fallback

          return (
            // ✅ SỬA: Dùng Button thay vì Card
            <Button
              key={category.value}
              variant={isActive ? "secondary" : "ghost"}
              onClick={() => onCategoryChange(category.value)}
              className={cn(
                "flex items-center gap-2 h-10 px-4 rounded-full flex-shrink-0", // Dùng rounded-full
                isActive
                  ? "bg-blue-50 text-blue-700 font-semibold border border-blue-200"
                  : "bg-gray-100 text-gray-700"
              )}
            >
              <Icon
                size={16}
                className={cn(isActive ? "text-blue-600" : "text-gray-500")}
              />
              <span className="text-sm">{category.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
