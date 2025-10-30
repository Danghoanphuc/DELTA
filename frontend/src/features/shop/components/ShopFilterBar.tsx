// features/shop/components/ShopFilterBar.tsx
import { Search } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

interface Category {
  value: string;
  label: string;
}

interface ShopFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  categories: Category[];
}

export const ShopFilterBar = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  categories,
}: ShopFilterBarProps) => (
  <div className="flex flex-col sm:flex-row gap-3">
    {/* Search */}
    <div className="relative flex-1">
      <Search
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <Input
        placeholder="Tìm kiếm sản phẩm..."
        className="pl-10"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>

    {/* Category Filter */}
    <Select value={selectedCategory} onValueChange={onCategoryChange}>
      <SelectTrigger className="w-full sm:w-48">
        <SelectValue placeholder="Danh mục" />
      </SelectTrigger>
      <SelectContent>
        {categories.map((cat) => (
          <SelectItem key={cat.value} value={cat.value}>
            {cat.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    {/* Sort */}
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
);
