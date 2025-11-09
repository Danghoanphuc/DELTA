// features/shop/components/ProductPurchase.tsx
import React from "react";
import { Button } from "@/shared/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { QuantitySelector } from "./details/QuantitySelector"; // ✅ Dùng component mới

interface ProductPurchaseProps {
  minQuantity: number;
  selectedQuantity: number;
  onQuantityChange: (qty: number) => void;
  onAddToCart: () => void;
  isAddingToCart: boolean;
  inCart: boolean;
}

export const ProductPurchase = ({
  minQuantity,
  selectedQuantity,
  onQuantityChange,
  onAddToCart,
  isAddingToCart,
  inCart,
}: ProductPurchaseProps) => {
  const isQuantityInvalid = selectedQuantity < minQuantity;

  return (
    <>
      {/* ✅ SỬA: Thay thế Input/Label bằng component mới */}
      <div className="mb-5">
        <QuantitySelector
          minQuantity={minQuantity}
          selectedQuantity={selectedQuantity}
          onQuantityChange={onQuantityChange}
        />
      </div>

      {/* ✅ SỬA: Ẩn nút này trên mobile (lg:flex) */}
      <Button
        size="lg"
        className={cn(
          "w-full mb-6",
          "hidden lg:flex" // Ẩn trên mobile
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
    </>
  );
};
