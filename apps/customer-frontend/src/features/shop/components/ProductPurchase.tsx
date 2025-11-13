// features/shop/components/ProductPurchase.tsx (ĐÃ VÁ)
import React from "react";
import { Button } from "@/shared/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { QuantitySelector } from "./details/QuantitySelector";

// ✅ SỬA LỖI TS2322: Thêm props pricePerUnit và formatPrice
interface ProductPurchaseProps {
  minQuantity: number;
  selectedQuantity: number;
  onQuantityChange: (qty: number) => void;
  onAddToCart: () => void;
  isAddingToCart: boolean;
  inCart: boolean;
  pricePerUnit: number;
  formatPrice: (price: number) => string;
  // ✅ THÊM: Prop onBuyNow
  onBuyNow: () => void;
}

export const ProductPurchase = ({
  minQuantity,
  selectedQuantity,
  onQuantityChange,
  onAddToCart,
  isAddingToCart,
  inCart,
  pricePerUnit, // ✅ Prop đã được nhận
  formatPrice, // ✅ Prop đã được nhận
  onBuyNow, // ✅ Prop đã được nhận
}: ProductPurchaseProps) => {
  const isQuantityInvalid = selectedQuantity < minQuantity;

  return (
    // ✅ SỬA: Đổi sang `div` thay vì fragment
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      {/* Giá */}
      <div className="mb-5">
        <label className="text-sm font-medium text-gray-600">
          Giá mỗi sản phẩm
        </label>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl font-bold text-gray-900">
            {formatPrice(pricePerUnit)}
          </span>
          {/* (Có thể thêm logic giá cũ nếu cần) */}
        </div>
      </div>

      {/* Số lượng */}
      <div className="mb-5">
        <QuantitySelector
          minQuantity={minQuantity}
          selectedQuantity={selectedQuantity}
          onQuantityChange={onQuantityChange}
        />
        {isQuantityInvalid && (
          <p className="text-sm text-red-600 mt-1">
            Số lượng tối thiểu là {minQuantity}
          </p>
        )}
      </div>

      {/* Nút Thêm vào giỏ */}
      <Button
        size="lg"
        variant="outline" // ✅ Đổi sang outline (giống giỏ hàng)
        className={cn(
          "w-full mb-3 text-base" // ✅ Bỏ mb-6
          // "hidden lg:flex" // ✅ Gỡ bỏ, để hiện trên cả mobile
        )}
        onClick={onAddToCart}
        disabled={isAddingToCart || inCart || isQuantityInvalid}
      >
        <ShoppingCart size={20} className="mr-2" />
        {isAddingToCart
          ? "Đang thêm..."
          : inCart
          ? "Đã có trong giỏ"
          : "Thêm vào giỏ hàng"}
      </Button>

      {/* ✅ THÊM: Nút Mua ngay (cho SP không cần tùy biến) */}
      <Button
        size="lg"
        className="w-full text-base"
        onClick={onBuyNow}
        disabled={isAddingToCart || isQuantityInvalid}
      >
        Mua ngay
      </Button>
    </div>
  );
};
