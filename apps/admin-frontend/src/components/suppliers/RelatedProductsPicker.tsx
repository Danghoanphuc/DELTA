// apps/admin-frontend/src/components/suppliers/RelatedProductsPicker.tsx
// Component để chọn sản phẩm liên quan cho bài viết

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  X,
  Package,
  GripVertical,
  Plus,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { productApi, Product } from "@/services/catalog.service";

interface RelatedProductsPickerProps {
  selectedProducts: Product[];
  onProductsChange: (products: Product[]) => void;
  keywords?: string[]; // Keywords từ bài viết để ưu tiên sản phẩm liên quan
  maxProducts?: number;
}

export function RelatedProductsPicker({
  selectedProducts,
  onProductsChange,
  keywords = [],
  maxProducts = 6,
}: RelatedProductsPickerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all published products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const result = await productApi.getAll({
          status: "active",
          limit: 100,
        });
        setAllProducts(result.products || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Sort products: prioritize by keywords match, then by name
  const sortedProducts = useMemo(() => {
    if (!allProducts.length) return [];

    // Filter out already selected products
    const selectedIds = new Set(selectedProducts.map((p) => p._id));
    const available = allProducts.filter((p) => !selectedIds.has(p._id));

    // If no keywords, return all products sorted by name
    if (!keywords.length) {
      return available.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Score products by keyword match
    const lowerKeywords = keywords.map((k) => k.toLowerCase());

    const scored = available.map((product) => {
      let score = 0;
      const searchText = `${product.name} ${product.description || ""} ${
        product.tags?.join(" ") || ""
      }`.toLowerCase();

      for (const keyword of lowerKeywords) {
        if (searchText.includes(keyword)) {
          score += 10;
          // Bonus for name match
          if (product.name.toLowerCase().includes(keyword)) {
            score += 5;
          }
          // Bonus for tag match
          if (product.tags?.some((t) => t.toLowerCase().includes(keyword))) {
            score += 3;
          }
        }
      }

      return { product, score };
    });

    // Sort by score (desc), then by name
    return scored
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.product.name.localeCompare(b.product.name);
      })
      .map((s) => s.product);
  }, [allProducts, selectedProducts, keywords]);

  // Filter by search term
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return sortedProducts;

    const term = searchTerm.toLowerCase();
    return sortedProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.sku?.toLowerCase().includes(term) ||
        p.tags?.some((t) => t.toLowerCase().includes(term))
    );
  }, [sortedProducts, searchTerm]);

  const handleAddProduct = (product: Product) => {
    if (selectedProducts.length >= maxProducts) return;
    onProductsChange([...selectedProducts, product]);
  };

  const handleRemoveProduct = (productId: string) => {
    onProductsChange(selectedProducts.filter((p) => p._id !== productId));
  };

  const handleMoveProduct = (index: number, direction: "up" | "down") => {
    const newProducts = [...selectedProducts];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newProducts.length) return;

    [newProducts[index], newProducts[newIndex]] = [
      newProducts[newIndex],
      newProducts[index],
    ];
    onProductsChange(newProducts);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-orange-600" />
          <span className="text-sm font-semibold text-gray-900">
            Sản phẩm liên quan
          </span>
          <span className="text-xs text-gray-500">
            ({selectedProducts.length}/{maxProducts})
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* Selected Products */}
      {selectedProducts.length > 0 && (
        <div className="space-y-2">
          {selectedProducts.map((product, index) => (
            <div
              key={product._id}
              className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded-lg"
            >
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => handleMoveProduct(index, "up")}
                  disabled={index === 0}
                  className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveProduct(index, "down")}
                  disabled={index === selectedProducts.length - 1}
                  className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>

              {product.thumbnailUrl || product.images?.[0]?.url ? (
                <img
                  src={product.thumbnailUrl || product.images[0].url}
                  alt={product.name}
                  className="w-10 h-10 object-cover rounded"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                  <Package className="w-5 h-5 text-gray-400" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {product.name}
                </p>
                <p className="text-xs text-gray-500">{product.sku}</p>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveProduct(product._id)}
                className="p-1 text-red-500 hover:bg-red-50 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Expanded: Product Picker */}
      {isExpanded && (
        <div className="border border-gray-200 rounded-lg overflow-hidden animate-in slide-in-from-top-2 duration-200">
          {/* Search */}
          <div className="p-2 border-b border-gray-200 bg-gray-50">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm sản phẩm..."
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
            {keywords.length > 0 && (
              <p className="text-xs text-purple-600 mt-1.5 flex items-center gap-1">
                <span>✨ Ưu tiên theo keywords:</span>
                <span className="font-medium">
                  {keywords.slice(0, 3).join(", ")}
                </span>
                {keywords.length > 3 && <span>...</span>}
              </p>
            )}
          </div>

          {/* Product List */}
          <div className="max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-500">
                {searchTerm ? "Không tìm thấy sản phẩm" : "Không có sản phẩm"}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredProducts.slice(0, 20).map((product) => (
                  <button
                    key={product._id}
                    type="button"
                    onClick={() => handleAddProduct(product)}
                    disabled={selectedProducts.length >= maxProducts}
                    className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {product.thumbnailUrl || product.images?.[0]?.url ? (
                      <img
                        src={product.thumbnailUrl || product.images[0].url}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-400" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {product.sku} •{" "}
                        {product.basePrice?.toLocaleString("vi-VN")}đ
                      </p>
                    </div>

                    <Plus className="w-4 h-4 text-orange-600" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredProducts.length > 20 && (
            <div className="p-2 border-t border-gray-200 bg-gray-50 text-center">
              <p className="text-xs text-gray-500">
                Hiển thị 20/{filteredProducts.length} sản phẩm. Dùng tìm kiếm để
                lọc thêm.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
