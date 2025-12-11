// apps/admin-frontend/src/components/products/ProductFilters.tsx
// ✅ SOLID: Single Responsibility - Filter UI only

import { Search, Grid, List } from "lucide-react";
import { Category } from "@/services/catalog.service";

interface ProductFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  categories: Category[];
}

export function ProductFilters({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  statusFilter,
  onStatusChange,
  viewMode,
  onViewModeChange,
  categories,
}: ProductFiltersProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-64 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, SKU..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="all">Tất cả danh mục</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {"—".repeat(cat.level)} {cat.name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="draft">Nháp</option>
          <option value="active">Đang bán</option>
          <option value="inactive">Tạm ngưng</option>
          <option value="discontinued">Ngừng bán</option>
        </select>

        <div className="flex border rounded-lg overflow-hidden">
          <button
            onClick={() => onViewModeChange("grid")}
            className={`p-2 ${
              viewMode === "grid"
                ? "bg-orange-50 text-orange-600"
                : "hover:bg-gray-50"
            }`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={`p-2 ${
              viewMode === "list"
                ? "bg-orange-50 text-orange-600"
                : "hover:bg-gray-50"
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
