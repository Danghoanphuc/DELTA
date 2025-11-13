// features/shop/components/LiveQuotePanel.tsx (COMPONENT MỚI)
// Component này sẽ thay thế 'ProductPurchase' khi ở chế độ sáng tạo

import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { ShoppingCart, Loader2, Info } from "lucide-react";
import { DecalItem } from "@/features/editor/types/decal.types";
import { PrinterProduct } from "@/types/product";

// Export interface này để EditingPanel có thể import
export interface LiveQuotePanelProps {
  product: PrinterProduct;
  decals: DecalItem[];
  basePrice: number;
  minQuantity: number;
  formatPrice: (price: number) => string;
  isSaving: boolean;
  onSaveAndAddToCart: () => Promise<void>;
  selectedQuantity: number;
  onQuantityChange: Dispatch<SetStateAction<number>>;
}

// Giả định phí/decal để demo
const DECAL_COST = 5000;

export const LiveQuotePanel: React.FC<LiveQuotePanelProps> = ({
  product,
  decals,
  basePrice,
  minQuantity,
  formatPrice,
  isSaving,
  onSaveAndAddToCart,
  selectedQuantity,
  onQuantityChange,
}) => {
  const [decalCost, setDecalCost] = useState(0);
  const [pricePerUnit, setPricePerUnit] = useState(basePrice);
  const [totalPrice, setTotalPrice] = useState(0);

  // === LOGIC BÁO GIÁ ĐỘNG (LIVE QUOTE) ===
  useEffect(() => {
    // 1. Tính phí thiết kế (dựa trên decal)
    const newDecalCost = decals.length * DECAL_COST;
    setDecalCost(newDecalCost);

    // 2. Tính giá / sản phẩm
    const newPricePerUnit = basePrice + newDecalCost;
    setPricePerUnit(newPricePerUnit);

    // 3. Tính tổng tiền
    const newTotalPrice = newPricePerUnit * selectedQuantity;
    setTotalPrice(newTotalPrice);
  }, [decals, selectedQuantity, basePrice]);
  // === KẾT THÚC LOGIC ===

  // Cập nhật số lượng tối thiểu khi nó thay đổi
  useEffect(() => {
    if (minQuantity > 0) {
      onQuantityChange(minQuantity);
    }
  }, [minQuantity, onQuantityChange]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onQuantityChange(
      Math.max(minQuantity, parseInt(e.target.value) || minQuantity)
    );
  };

  const isQuantityInvalid = selectedQuantity < minQuantity;

  return (
    <Card className="bg-white border-none shadow-sm">
      <CardContent className="p-6 space-y-4">
        {/* 1. Số lượng */}
        <div>
          <Label htmlFor="quantity" className="mb-2 block font-medium">
            Số lượng
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
              Số lượng tối thiểu: {minQuantity}
            </p>
          )}
        </div>

        {/* 2. Bảng báo giá động */}
        <div className="p-4 bg-gray-50 rounded-lg space-y-2">
          <h4 className="font-semibold text-sm mb-2">Tạm tính</h4>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Giá gốc sản phẩm:</span>
            <span>{formatPrice(basePrice)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              Phí tùy chỉnh ({decals.length} lớp):
            </span>
            <span>+ {formatPrice(decalCost)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-sm font-semibold">
            <span className="text-gray-800">Giá 1 sản phẩm:</span>
            <span>{formatPrice(pricePerUnit)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-blue-600 pt-2 border-t">
            <span>TỔNG CỘNG:</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
        </div>

        {/* 3. Nút CTA */}
        <Button
          size="lg"
          className="w-full bg-blue-600 hover:bg-blue-700"
          onClick={onSaveAndAddToCart}
          disabled={isSaving || isQuantityInvalid}
        >
          {isSaving ? (
            <Loader2 size={20} className="mr-2 animate-spin" />
          ) : (
            <ShoppingCart size={20} className="mr-2" />
          )}
          {isSaving ? "Đang xử lý..." : "Lưu & Thêm vào giỏ hàng"}
        </Button>

        <div className="flex items-start gap-2 text-xs text-gray-500 p-2 bg-blue-50 border border-blue-100 rounded-lg">
          <Info size={16} className="flex-shrink-0 text-blue-500 mt-0.5" />
          <p>
            Thiết kế của bạn sẽ được lưu vào "Kho thiết kế của tôi" để sử dụng
            lại lần sau.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
