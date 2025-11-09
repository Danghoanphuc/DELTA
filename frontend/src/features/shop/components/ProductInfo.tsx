// src/features/shop/components/ProductInfo.tsx
// ✅ ĐÃ NÂNG CẤP (Layout giống Tiki)

import React from "react";
import { Badge } from "@/shared/components/ui/badge";
import { Product } from "@/types/product";
import { Star } from "lucide-react";
import { cn } from "@/shared/lib/utils"; // ✅ Thêm cn

interface ProductInfoProps {
  product: Product;
  currentPricePerUnit: number;
  formatPrice: (price: number) => string;
}

export const ProductInfo = ({
  product,
  currentPricePerUnit,
  formatPrice,
}: ProductInfoProps) => {
  // --- Dữ liệu giả cho Social Proof & Tags (Giống ảnh) ---
  const rating = product.rating ?? 5.0;
  const totalReviews = product.totalReviews ?? 5;
  const totalSold = product.totalSold ?? 159;
  const originalPrice = currentPricePerUnit * 1.33; // Giả lập giá gốc cao hơn 33%
  const discountPercent = 33;
  // --- Kết thúc dữ liệu giả ---

  const hasDiscount = discountPercent > 0;

  return (
    <div className="space-y-3">
      {/* === NÂNG CẤP: TAGS (Giống ảnh) === */}
      <div className="flex items-center gap-2">
        <Badge className="bg-red-500 text-white hover:bg-red-500">
          TOP DEAL
        </Badge>
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
          CHÍNH HÃNG
        </Badge>
        {/* (Badge category cũ của Phúc) */}
        {/* <Badge variant="outline">{product.category}</Badge> */}
      </div>

      {/* Tên sản phẩm */}
      <h1 className="text-2xl md:text-3xl font-bold pt-1">{product.name}</h1>

      {/* === NÂNG CẤP: SOCIAL PROOF (Giống ảnh) === */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <span className="font-bold text-base text-orange-500">
            {rating.toFixed(1)}
          </span>
          <Star size={16} className="fill-orange-500 text-orange-500" />
          <span className="ml-1">({totalReviews})</span>
        </div>
        <div className="border-l h-4" />
        <div className="">
          <span className="ml-1">Đã bán {totalSold}</span>
        </div>
      </div>

      {/* === NÂNG CẤP: GIÁ (Giống ảnh) === */}
      <div className="!mt-4 flex items-end gap-2">
        <span className="text-3xl font-bold text-gray-900 mr-1">
          {formatPrice(currentPricePerUnit)}
        </span>
        {hasDiscount && (
          <>
            <span className="text-lg text-gray-400 line-through">
              {formatPrice(originalPrice)}
            </span>
            <Badge variant="destructive" className="text-base font-bold">
              -{discountPercent}%
            </Badge>
          </>
        )}
      </div>
      {product.pricing.length > 1 && (
        <p className="text-sm text-green-600 !mt-1">
          (Áp dụng cho số lượng từ {product.pricing[0].minQuantity}+)
        </p>
      )}

      {/* Description (Giữ nguyên) */}
      {product.description && (
        <p className="text-gray-600 pt-2">{product.description}</p>
      )}
    </div>
  );
};
