// src/features/shop/components/ShopFilterModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Separator } from "@/shared/components/ui/separator";
import { LucideIcon, Palette, Check } from "lucide-react"; // ✅ Thêm Check
import { categoryIcons } from "../utils/categoryIcons";
import { cn } from "@/shared/lib/utils"; // ✅ Thêm cn

interface Category {
  value: string;
  label: string;
  icon?: React.ElementType;
}

interface ShopFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  categories: Category[];
}

// ✅ MỚI: Định nghĩa các nút Sắp xếp cho di động
const sortOptions = [
  { label: "Liên quan", value: "popular" },
  { label: "Mới nhất", value: "newest" },
  { label: "Bán chạy", value: "popular" }, // (Tạm thời trùng)
  { label: "Giá: Thấp đến Cao", value: "price_asc" },
  { label: "Giá: Cao đến Thấp", value: "price_desc" },
];

export const ShopFilterModal = ({
  isOpen,
  onClose,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  categories,
}: ShopFilterModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Lọc & Sắp xếp</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 px-6 max-h-[70vh] overflow-y-auto">
          {/* 1. Sắp xếp (✅ Giao diện mới) */}
          <div className="space-y-3">
            <Label>Sắp xếp theo</Label>
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((opt) => (
                <Button
                  key={opt.value}
                  variant={sortBy === opt.value ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "rounded-full",
                    sortBy === opt.value
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-white"
                  )}
                  onClick={() => onSortChange(opt.value)}
                >
                  {sortBy === opt.value && <Check className="w-4 h-4 mr-1.5" />}
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* 2. Danh mục (Giữ nguyên) */}
          <div className="space-y-3">
            <Label>Danh mục</Label>
            <Tabs
              value={selectedCategory}
              onValueChange={onCategoryChange}
              orientation="vertical"
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 gap-2 h-auto p-0 bg-transparent">
                {categories.map((cat) => {
                  const Icon = categoryIcons[cat.value] || Palette;
                  return (
                    <TabsTrigger
                      key={cat.value}
                      value={cat.value}
                      className="flex-col h-20 w-full data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none
                                 border bg-white text-gray-700"
                    >
                      <Icon size={20} />
                      <span className="text-xs mt-1 whitespace-normal text-center">
                        {cat.label}
                      </span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          </div>
        </div>

        <DialogFooter className="p-6 border-t">
          <Button type="button" className="w-full" onClick={onClose}>
            Xem kết quả
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
