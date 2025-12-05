// apps/admin-frontend/src/pages/ProductCatalogPage.tsx
// ✅ Admin Product Catalog Management

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Search,
  Plus,
  Grid,
  List,
  MoreVertical,
  Edit2,
  Copy,
  Trash2,
  Star,
  RefreshCw,
} from "lucide-react";
import {
  productApi,
  categoryApi,
  Product,
  Category,
} from "@/services/catalog.service";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export default function ProductCatalogPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Dropdown menu
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const [productData, categoryData] = await Promise.all([
        productApi.getAll({
          categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          search: search || undefined,
          page,
          limit: 20,
        }),
        categoryApi.getAll(true),
      ]);

      setProducts(productData.products);
      setTotalPages(productData.pagination.totalPages);
      setCategories(categoryData);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  }, [categoryFilter, statusFilter, search, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDuplicate = async (id: string) => {
    try {
      await productApi.duplicate(id);
      fetchProducts();
    } catch (error) {
      console.error("Error duplicating product:", error);
    }
    setOpenMenu(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    try {
      await productApi.delete(id);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
    setOpenMenu(null);
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Catalog</h1>
          <p className="text-gray-600">Quản lý sản phẩm và SKU</p>
        </div>
        <button
          onClick={() => navigate("/catalog/products/new")}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          <Plus className="w-4 h-4" />
          Thêm sản phẩm
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
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
            onChange={(e) => setStatusFilter(e.target.value)}
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
              onClick={() => setViewMode("grid")}
              className={`p-2 ${
                viewMode === "grid"
                  ? "bg-orange-50 text-orange-600"
                  : "hover:bg-gray-50"
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
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
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
            >
              {/* Image */}
              <div className="aspect-square bg-gray-100 relative">
                {product.images?.[0]?.url ? (
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                {product.isFeatured && (
                  <div className="absolute top-2 left-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  {getStatusBadge(product.status)}
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="text-xs text-gray-500 font-mono mb-1">
                  {product.sku}
                </p>
                <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  {typeof product.categoryId === "object"
                    ? product.categoryId.name
                    : ""}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-orange-600">
                    {formatCurrency(product.basePrice)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {product.hasVariants
                      ? `${product.variants?.length || 0} variants`
                      : ""}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="px-4 pb-4 flex gap-2">
                <button
                  onClick={() => navigate(`/catalog/products/${product._id}`)}
                  className="flex-1 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
                >
                  <Edit2 className="w-4 h-4 inline mr-1" />
                  Sửa
                </button>
                <div className="relative">
                  <button
                    onClick={() =>
                      setOpenMenu(openMenu === product._id ? null : product._id)
                    }
                    className="p-2 border rounded-lg hover:bg-gray-50"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {openMenu === product._id && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setOpenMenu(null)}
                      />
                      <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border z-50">
                        <button
                          onClick={() => handleDuplicate(product._id)}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50"
                        >
                          <Copy className="w-4 h-4" />
                          Nhân bản
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Xóa
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Sản phẩm
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  SKU
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Danh mục
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                  Variants
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                  Giá
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                  Trạng thái
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {product.images?.[0]?.url ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{product.name}</p>
                        {product.isFeatured && (
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 inline" />
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-gray-600">
                    {product.sku}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {typeof product.categoryId === "object"
                      ? product.categoryId.name
                      : ""}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {product.hasVariants ? product.variants?.length || 0 : "-"}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatCurrency(product.basePrice)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {getStatusBadge(product.status)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        navigate(`/catalog/products/${product._id}`)
                      }
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4 text-gray-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Trước
          </button>
          <span className="px-4 py-2">
            Trang {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
