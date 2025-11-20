// src/features/shop/components/details/ProductPurchaseSheet.tsx
import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
} from "@/shared/components/ui/drawer"; // (Component Bước 1)
import { Button } from "@/shared/components/ui/button";
import { ShoppingCart, Loader2 } from "lucide-react";
import { PrinterProduct } from "@/types/product";
import { ImageWithFallback } from "@/features/figma/ImageWithFallback";
import { QuantitySelector } from "./QuantitySelector"; // (Component trên)
import { Separator } from "@/shared/components/ui/separator";
import { useCartStore } from "@/stores/useCartStore"; // (Import store để check lỗi)

interface ProductPurchaseSheetProps {
  isOpen: boolean;
  onClose: () => void;
  product: PrinterProduct;
  onAddToCart: () => Promise<void>;
  onBuyNow: () => Promise<void>;
  isAddingToCart: boolean;
  inCart: boolean;
  minQuantity: number;
  selectedQuantity: number;
  onQuantityChange: (qty: number) => void;
  formatPrice: (price: number) => string;
  currentPricePerUnit: number;
  mode: "cart" | "buy";
}

export const ProductPurchaseSheet = ({
  isOpen,
  onClose,
  product,
  onAddToCart,
  onBuyNow,
  isAddingToCart,
  inCart,
  minQuantity,
  selectedQuantity,
  onQuantityChange,
  formatPrice,
  currentPricePerUnit,
  mode,
}: ProductPurchaseSheetProps) => {
  const primaryImage = product.images?.[0]?.url || "/placeholder-product.jpg";
  const totalPrice = currentPricePerUnit * selectedQuantity;

  const handleSubmit = async () => {
    if (mode === "cart") {
      await onAddToCart();
      // Tự động đóng nếu thêm thành công
      if (!useCartStore.getState().isLoading) {
        onClose();
      }
    } else {
      await onBuyNow();
      // (onBuyNow sẽ tự điều hướng, không cần đóng)
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>
        <div className="max-w-md mx-auto w-full p-4">
          <DrawerHeader className="p-0 mb-4">
            <div className="flex gap-3 items-start">
              <ImageWithFallback
                src={primaryImage}
                alt={product.name}
                className="w-20 h-20 rounded-md border"
              />
              <div className="pt-2">
                <DrawerTitle className="text-lg font-bold text-blue-600">
                  {formatPrice(currentPricePerUnit)}
                </DrawerTitle>
                <DrawerDescription className="text-sm">
                  Tồn kho: {product.stock || "N/A"}
                </DrawerDescription>
              </div>
            </div>
          </DrawerHeader>

          <Separator className="my-4" />

          {/* Body: Chọn số lượng */}
          <QuantitySelector
            minQuantity={minQuantity}
            selectedQuantity={selectedQuantity}
            onQuantityChange={onQuantityChange}
          />

          <Separator className="my-4" />

          {/* Footer: Nút hành động */}
          <DrawerFooter className="p-0">
            <Button
              onClick={handleSubmit}
              disabled={isAddingToCart}
              size="lg"
              className="w-full text-base py-6 bg-blue-600 hover:bg-blue-700"
            >
              {isAddingToCart ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ShoppingCart className="w-5 h-5 mr-2" />
              )}
              {isAddingToCart
                ? "Đang xử lý..."
                : mode === "cart"
                ? inCart
                  ? "Cập nhật giỏ hàng"
                  : "Thêm vào giỏ hàng"
                : "Mua ngay"}
              ({formatPrice(totalPrice)})
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
