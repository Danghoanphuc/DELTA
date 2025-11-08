// features/shop/components/ProductInfo.tsx
import React from "react";
import { Badge } from "@/shared/components/ui/badge";
import { Product, PrinterProduct } from "@/types/product";
import { Star } from "lucide-react";

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
  // --- Dữ liệu giả cho Social Proof (Anh sẽ thay bằng dữ liệu thật) ---
  const rating = product.rating ?? 4.9;
  const totalReviews = 610;
  const totalSold = product.totalSold ?? 6000;
  // --- Kết thúc dữ liệu giả ---

  return (
    <div className="space-y-3">
      <Badge variant="outline" className="mb-1">
        {product.category}
      </Badge>
      <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>

      {/* === NÂNG CẤP: SOCIAL PROOF (Giống Shopee) === */}
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <span className="font-bold text-base text-orange-500">{rating}</span>
          <Star size={16} className="fill-orange-500 text-orange-500" />
        </div>
        <div className="border-l pl-4">
          <span className="font-bold text-base text-gray-800">
            {totalReviews}
          </span>
          <span className="ml-1">Đánh giá</span>
        </div>
        <div className="border-l pl-4">
          <span className="font-bold text-base text-gray-800">
            {totalSold > 1000
              ? `${(totalSold / 1000).toFixed(1)}k+`
              : `${totalSold}+`}
          </span>
          <span className="ml-1">Đã bán</span>
        </div>
      </div>
      {/* === KẾT THÚC NÂNG CẤP === */}

      {/* Price */}
      <div className="!mt-4">
        <span className="text-3xl font-bold text-blue-600 mr-2">
          {formatPrice(currentPricePerUnit)}
        </span>
        <span className="text-gray-500">/ sản phẩm</span>
        {product.pricing.length > 1 && (
          <p className="text-sm text-green-600">
            (Áp dụng cho số lượng từ {product.pricing[0].minQuantity}+)
          </p>
        )}
      </div>

      {/* Description */}
      {product.description && (
        <p className="text-gray-600 pt-2">{product.description}</p>
      )}
    </div>
  );
};
