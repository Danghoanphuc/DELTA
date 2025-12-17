// apps/admin-frontend/src/components/suppliers/SupplierProductsList.tsx
// ✅ SOLID: Single Responsibility - Display products by supplier

import { useState, useEffect } from "react";
import { Package, ExternalLink, Eye, Tag, RefreshCw } from "lucide-react";
import { productApi, Product } from "@/services/catalog.service";
import { toast } from "sonner";

interface SupplierProductsListProps {
  supplierId: string;
  supplierName: string;
}

export function SupplierProductsList({
  supplierId,
  supplierName,
}: SupplierProductsListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, [supplierId, pagination.page]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const result = await productApi.getAll({
        supplierId,
        page: pagination.page,
        limit: pagination.limit,
      });
      setProducts(result.products);
      setPagination((prev) => ({
        ...prev,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages,
      }));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tải sản phẩm");
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-green-100 text-green-700",
      draft: "bg-gray-100 text-gray-600",
      inactive: "bg-yellow-100 text-yellow-700",
      discontinued: "bg-red-100 text-red-700",
    };
    const labels: Record<string, string> = {
      active: "Đang bán",
      draft: "Nháp",
      inactive: "Tạm ngừng",
      discontinued: "Ngừng kinh doanh",
    };
    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          styles[status] || styles.draft
        }`}
      >
        {labels[status] || status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-orange-500" />
          <span className="ml-2 text-gray-600">Đang tải sản phẩm...</span>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Chưa có tác phẩm nào
        </h3>
        <p className="text-gray-500 mb-4">
          {supplierName} chưa có sản phẩm nào được gán.
        </p>
        <a
          href="/catalog/products"
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          <Package className="w-4 h-4" />
          Quản lý sản phẩm
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Tác phẩm ({pagination.total})
          </h3>
          <p className="text-sm text-gray-500">
            Sản phẩm được gán cho {supplierName}
          </p>
        </div>
        <a
          href={`/catalog/products?supplierId=${supplierId}`}
          className="flex items-center gap-2 px-3 py-2 text-orange-600 hover:bg-orange-50 rounded-lg text-sm"
        >
          <ExternalLink className="w-4 h-4" />
          Xem tất cả
        </a>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product) => (
          <div
            key={product._id}
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
          >
            {/* Image */}
            <div className="aspect-square bg-gray-100 relative overflow-hidden">
              {product.thumbnailUrl || product.images?.[0]?.url ? (
                <img
                  src={product.thumbnailUrl || product.images[0].url}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-12 h-12 text-gray-300" />
                </div>
              )}
              {/* Status Badge */}
              <div className="absolute top-2 right-2">
                {getStatusBadge(product.status)}
              </div>
              {/* Featured Badge */}
              {product.isFeatured && (
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-0.5 bg-orange-500 text-white rounded-full text-xs font-medium">
                    Nổi bật
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4">
              <h4 className="font-medium text-gray-900 line-clamp-2 mb-1 min-h-[2.5rem]">
                {product.name}
              </h4>
              <p className="text-xs text-gray-500 mb-2">{product.sku}</p>

              {/* Price */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold text-orange-600">
                  {formatPrice(product.basePrice)}
                </span>
                {product.baseCost > 0 && (
                  <span className="text-xs text-gray-400">
                    Giá vốn: {formatPrice(product.baseCost)}
                  </span>
                )}
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex items-center gap-1 mb-3">
                  <Tag className="w-3 h-3 text-gray-400" />
                  <div className="flex gap-1 overflow-hidden">
                    {product.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs truncate"
                      >
                        {tag}
                      </span>
                    ))}
                    {product.tags.length > 2 && (
                      <span className="text-xs text-gray-400">
                        +{product.tags.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t">
                <span>Đã bán: {product.totalSold || 0}</span>
                <span>Tồn: {product.stockQuantity || 0}</span>
              </div>

              {/* Action */}
              <a
                href={`/catalog/products/${product._id}`}
                className="mt-3 flex items-center justify-center gap-2 w-full px-3 py-2 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 text-sm"
              >
                <Eye className="w-4 h-4" />
                Xem chi tiết
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
            disabled={pagination.page === 1}
            className="px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Trước
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            Trang {pagination.page} / {pagination.totalPages}
          </span>
          <button
            onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
            disabled={pagination.page === pagination.totalPages}
            className="px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
