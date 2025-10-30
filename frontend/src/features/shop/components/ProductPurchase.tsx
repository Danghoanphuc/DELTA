// features/shop/components/ProductPurchase.tsx
import React from "react";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { ShoppingCart } from "lucide-react";

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
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onQuantityChange(Math.max(1, parseInt(e.target.value) || 1));
  };

  const isQuantityInvalid = selectedQuantity < minQuantity;

  return (
    <>
      {/* Quantity Selector */}
      <div className="mb-5">
        <Label htmlFor="quantity" className="mb-2 block font-medium">
          Số lượng
        </Label>
        <Input
          id="quantity"
          type="number"
          min={minQuantity}
          value={selectedQuantity}
          onChange={handleQuantityChange}
          className="w-28"
        />
        {isQuantityInvalid && (
          <p className="text-xs text-red-500 mt-1">
            Số lượng tối thiểu: {minQuantity}
          </p>
        )}
      </div>

      {/* Add to Cart Button */}
      <Button
        size="lg"
        className="w-full mb-6"
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
