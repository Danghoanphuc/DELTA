// apps/admin-frontend/src/components/products/ProductCard.tsx
// ✅ SOLID: Single Responsibility - Product card UI only

import { Package, Star, Edit2, MoreVertical, Copy, Trash2 } from "lucide-react";
import { Product } from "@/services/catalog.service";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  formatCurrency: (amount: number) => string;
  getStatusBadge: (status: string) => React.ReactElement;
}

export function ProductCard({
  product,
  onEdit,
  onDuplicate,
  onDelete,
  formatCurrency,
  getStatusBadge,
}: ProductCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow group">
      {/* Image */}
      <div className="aspect-square bg-gray-100 relative overflow-hidden rounded-t-xl">
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
        <p className="text-xs text-gray-500 font-mono mb-1">{product.sku}</p>
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
          onClick={() => onEdit(product._id)}
          className="flex-1 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
        >
          <Edit2 className="w-4 h-4 inline mr-1" />
          Sửa
        </button>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 border rounded-lg hover:bg-gray-50"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border z-50">
                <button
                  onClick={() => {
                    onDuplicate(product._id);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50"
                >
                  <Copy className="w-4 h-4" />
                  Nhân bản
                </button>
                <button
                  onClick={() => {
                    onDelete(product._id);
                    setShowMenu(false);
                  }}
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
  );
}
