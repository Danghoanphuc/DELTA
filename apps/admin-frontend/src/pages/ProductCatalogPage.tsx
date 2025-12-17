// apps/admin-frontend/src/pages/ProductCatalogPage.tsx
// ✅ SOLID Compliant: Single Responsibility - UI rendering only

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Plus,
  RefreshCw,
  FolderTree,
  Boxes,
  FileText,
} from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductFilters } from "@/components/products/ProductFilters";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export default function ProductCatalogPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const {
    products,
    categories,
    isLoading,
    pagination,
    duplicateProduct,
    deleteProduct,
  } = useProducts({
    categoryFilter,
    statusFilter,
    search,
    page,
  });

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateProduct(id);
    } catch (error) {
      console.error("Error duplicating product:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    try {
      await deleteProduct(id);
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: "bg-gray-100 text-gray-700",
      active: "bg-green-100 text-green-700",
      inactive: "bg-yellow-100 text-yellow-700",
      discontinued: "bg-red-100 text-red-700",
    };
    const labels: Record<string, string> = {
      draft: "Nháp",
      active: "Đang bán",
      inactive: "Tạm ngưng",
      discontinued: "Ngừng bán",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}
      >
        {labels[status] || status}
      </span>
    );
  };

  if (isLoading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header with Navigation */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý SP/DV</h1>
            <p className="text-gray-600">Quản lý sản phẩm, dịch vụ và SKU</p>
          </div>
          <button
            onClick={() => navigate("/catalog/products/new")}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            <Plus className="w-4 h-4" />
            Thêm sản phẩm
          </button>
        </div>
        {/* Sub Navigation */}
        <div className="flex gap-3 pt-3 border-t">
          <button
            onClick={() => navigate("/catalog/categories")}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <FolderTree className="w-4 h-4" />
            Danh mục
          </button>
          <button
            onClick={() => navigate("/inventory")}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <Boxes className="w-4 h-4" />
            Tồn kho
          </button>
          <button
            onClick={() => navigate("/documents/invoices")}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <FileText className="w-4 h-4" />
            Chứng từ
          </button>
        </div>
      </div>

      {/* Filters */}
      <ProductFilters
        search={search}
        onSearchChange={setSearch}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        categories={categories}
      />

      {/* Products Grid/List */}
      {products.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có sản phẩm
          </h3>
          <p className="text-gray-500 mb-4">
            Bắt đầu thêm sản phẩm vào catalog
          </p>
          <button
            onClick={() => navigate("/catalog/products/new")}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Thêm sản phẩm đầu tiên
          </button>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "flex flex-col gap-4"
          }
        >
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onEdit={(id) => navigate(`/catalog/products/${id}/edit`)}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              formatCurrency={formatCurrency}
              getStatusBadge={getStatusBadge}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Trước
          </button>
          <span className="px-4 py-2">
            Trang {page} / {pagination.totalPages}
          </span>
          <button
            onClick={() =>
              setPage((p) => Math.min(pagination.totalPages, p + 1))
            }
            disabled={page === pagination.totalPages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
