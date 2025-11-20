// features/shop/components/ProductCustomization.tsx
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { PrinterProduct } from "@/types/product";
import { Button } from "@/shared/components/ui/button";
import { Brush, ShoppingCart } from "lucide-react";
import { Separator } from "@/shared/components/ui/separator";
import { cn } from "@/shared/lib/utils";

interface CustomizationState {
  notes: string;
  fileUrl: string;
}

interface ProductCustomizationProps {
  product?: PrinterProduct;
  customization?: CustomizationState;
  onCustomizationChange?: (
    field: keyof CustomizationState,
    value: string
  ) => void;
  onStartEditing: () => void;
  onPurchase?: () => void;
  // ✅ THÊM: Props cho nút thêm vào giỏ hàng
  onAddToCart?: () => void;
  isAddingToCart?: boolean;
  inCart?: boolean;
  minQuantity?: number;
  selectedQuantity?: number;
  onQuantityChange?: (qty: number) => void;
  pricePerUnit?: number;
  formatPrice?: (price: number) => string;
}

export const ProductCustomization = ({
  product,
  customization = { notes: '', fileUrl: '' },
  onCustomizationChange = () => {},
  onStartEditing,
  onPurchase,
  onAddToCart,
  isAddingToCart = false,
  inCart = false,
  minQuantity = 1,
  selectedQuantity = 1,
  onQuantityChange,
  pricePerUnit = 0,
  formatPrice = (price: number) => price.toString(),
}: ProductCustomizationProps) => {
  const isQuantityInvalid = selectedQuantity < minQuantity;

  return (
    // Chúng ta dùng Card mỏng hơn, không viền, chỉ để phân tách
    <Card className="bg-transparent border-none shadow-none">
      <CardContent className="p-0 space-y-4">
        {/* === NÚT THIẾT KẾ (CHO DESKTOP) === */}
        <Button
          className={cn(
            "w-full bg-blue-600 hover:bg-blue-700 text-lg py-6",
            "hidden lg:flex" // Ẩn trên mobile
          )}
          onClick={onStartEditing}
          type="button"
        >
          <Brush size={20} className="mr-2" />
          Bắt đầu Thiết kế
        </Button>

        {/* === NÚT THÊM VÀO GIỎ HÀNG === */}
        {onAddToCart && (
          <Button
            size="lg"
            variant="outline"
            className={cn(
              "w-full text-base font-semibold border-2",
              inCart
                ? "border-green-500 text-green-600 hover:bg-green-50"
                : "border-blue-600 text-blue-600 hover:bg-blue-50"
            )}
            onClick={onAddToCart}
            disabled={isAddingToCart}
          >
            <ShoppingCart size={20} className="mr-2" />
            {isAddingToCart
              ? "Đang thêm..."
              : inCart
              ? "✓ Đã có trong giỏ"
              : "Thêm vào giỏ hàng"}
          </Button>
        )}

        {/* === CÁC TÙY CHỌN PHỤ === */}
        <div className="text-center text-xs text-gray-500">
          HOẶC TÙY CHỈNH NÂNG CAO
          <Separator className="my-2" />
        </div>

        <div>
          <Label htmlFor="customNotes" className="font-medium">
            Ghi chú cho nhà in
          </Label>
          <Textarea
            id="customNotes"
            placeholder="VD: In cho tôi 2 mặt, cán màng mờ..."
            value={customization.notes}
            onChange={(e) => onCustomizationChange("notes", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="fileUpload" className="font-medium">
            Tải lên file thiết kế có sẵn
          </Label>
          <Input
            id="fileUpload"
            type="file"
            className="mt-1"
            // (Cần logic xử lý file upload)
          />
        </div>
      </CardContent>
    </Card>
  );
};
