// features/shop/components/ShopFilterBar.tsx
import {
  Search,
  CreditCard,
  Shirt,
  Package,
  Megaphone,
  Palette,
  Gem,
  LucideIcon, // Import LucideIcon
} from "lucide-react";
import { Product } from "@/types/product"; // Import Product type for categories
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Button } from "@/shared/components/ui/button";

// Define ShopFilterBarProps interface
interface ShopFilterBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  categories: { label: string; value: Product["category"] }[]; // Use Product["category"] for type safety
}

const categoryIcons: { [key: string]: LucideIcon } = {
  "business-card": CreditCard,
  "t-shirt": Shirt,
  packaging: Package,
  banner: Megaphone,
  default: Palette,
};

export const ShopFilterBar = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  categories,
}: ShopFilterBarProps) => (
  // THAY ĐỔI CẤU TRÚC
  <div className="flex flex-col gap-4">
    {/* 1. Hàng trên: Search và Sort (Giữ nguyên) */}
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <Input
          placeholder="Tìm cảm hứng, dự án, chất liệu..."
          className="pl-10"
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
        />
      </div>
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Sắp xếp" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Mới nhất</SelectItem>
          <SelectItem value="price-asc">Giá: Thấp → Cao</SelectItem>
          <SelectItem value="price-desc">Giá: Cao → Thấp</SelectItem>
          <SelectItem value="popular">Phổ biến nhất</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {/* 2. Hàng hai: Filter Danh mục (Thay đổi lớn) */}
    <div>
      <Tabs value={selectedCategory} onValueChange={onCategoryChange}>
        {/* Cho phép cuộn ngang trên mobile */}
        <TabsList className="h-auto p-2 bg-gray-100 rounded-lg overflow-x-auto whitespace-nowrap justify-start hide-scrollbar">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.value] || categoryIcons.default;
            return (
              <TabsTrigger
                key={cat.value}
                value={cat.value}
                className="flex-col h-16 w-24 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600"
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

    {/* 3. ĐỘT PHÁ: Thêm bộ lọc chất liệu (Gợi ý) */}
    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
      <Button
        variant="outline"
        size="sm"
        className="rounded-full bg-white whitespace-nowrap"
      >
        <Gem size={14} className="mr-1.5" />
        Chất liệu: Giấy Kraft
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="rounded-full bg-white whitespace-nowrap"
      >
        <Gem size={14} className="mr-1.5" />
        Hoàn thiện: Cán mờ
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="rounded-full bg-white whitespace-nowrap"
      >
        <Gem size={14} className="mr-1.5" />
        Hoàn thiện: Dập nổi
      </Button>
    </div>
  </div>
);
