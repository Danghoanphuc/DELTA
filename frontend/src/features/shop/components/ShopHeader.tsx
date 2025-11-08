// features/shop/components/ShopHeader.tsx (Đổi tên từ WorkshopHeader)
// Component này là header chính, chứa AI Command Bar
import { useState } from "react";
import {
  Search,
  CreditCard,
  Shirt,
  Package,
  Megaphone,
  Palette,
  ShoppingCart,
  SlidersHorizontal,
  LucideIcon, // Import LucideIcon
} from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Button } from "@/shared/components/ui/button";
import zinAvatar from "@/assets/img/zin-avatar.png";

interface Category {
  value: string;
  label: string;
  icon?: React.ElementType;
}

interface ShopHeaderProps {
  cartItemCount: number;
  onCartOpen: () => void;
  // Prop mới: Nhận lệnh submit
  onSearchSubmit: (prompt: string) => void;
  // Các filter khác giữ nguyên
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  categories: Category[];
}

const categoryIcons: { [key: string]: LucideIcon } = {
  "business-card": CreditCard,
  "t-shirt": Shirt,
  packaging: Package,
  banner: Megaphone,
  default: Palette,
};

export const ShopHeader = ({
  cartItemCount,
  onCartOpen,
  onSearchSubmit,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  categories,
}: ShopHeaderProps) => {
  // Thêm state nội bộ để kiểm soát input
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(prompt); // Gọi hàm submit của cha
  };

  return (
    <div className="flex flex-col gap-4">
      {/* HÀNG 1: AI COMMAND BAR & CART (Bọc trong <form>) */}
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <div className="relative flex-1">
          <img
            src={zinAvatar}
            alt="Zin AI Avatar"
            className="w-7 h-7 absolute left-3 top-1/2 -translate-y-1/2 rounded-full"
          />
          <Input
            placeholder="Hỏi Zin: 'Card visit cho quán cafe, vintage'..."
            className="pl-12 pr-14 h-12 text-base bg-white shadow-sm border-gray-200 focus-visible:ring-blue-500 focus-visible:border-blue-500"
            value={prompt}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrompt(e.target.value)}
          />
          {/* Nút Search (Submit form) */}
          <Button
            type="submit"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9"
            title="Tìm kiếm"
          >
            <Search size={18} />
          </Button>
        </div>

        {/* Nút Giỏ hàng */}
        <Button
          type="button" // Đảm bảo không submit form
          variant="outline"
          size="icon"
          className="relative w-12 h-12 flex-shrink-0 bg-white shadow-sm"
          onClick={onCartOpen}
        >
          <ShoppingCart size={20} />
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {cartItemCount}
            </span>
          )}
        </Button>
      </form>

      {/* HÀNG 2: TABS VÀ BỘ LỌC (Giữ nguyên) */}
      <div className="flex items-center gap-2">
        <Tabs
          value={selectedCategory}
          onValueChange={onCategoryChange}
          className="flex-1 overflow-hidden"
        >
          <TabsList className="h-14 p-1.5 bg-gray-100 rounded-lg overflow-x-auto whitespace-nowrap justify-start hide-scrollbar">
            {categories.map((cat) => {
              const Icon = categoryIcons[cat.value] || categoryIcons.default;
              return (
                <TabsTrigger
                  key={cat.value}
                  value={cat.value}
                  className="flex-col h-full w-20 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600"
                >
                  <Icon size={18} />
                  <span className="text-xs mt-1 whitespace-normal text-center">
                    {cat.label}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        <Button
          variant="outline"
          size="icon"
          className="w-14 h-14 flex-shrink-0 bg-white shadow-sm md:hidden"
        >
          <SlidersHorizontal size={20} />
        </Button>

        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-48 h-14 bg-white shadow-sm hidden md:flex">
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
    </div>
  );
};
