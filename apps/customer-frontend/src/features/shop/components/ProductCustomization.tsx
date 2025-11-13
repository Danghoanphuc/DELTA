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
import { Brush } from "lucide-react";
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
}

export const ProductCustomization = ({
  product,
  customization = { notes: '', fileUrl: '' },
  onCustomizationChange = () => {},
  onStartEditing,
  onPurchase,
}: ProductCustomizationProps) => {
  // ❌ Đã xóa logic 'hasSpecs'. Component này chỉ tập trung vào TÙY CHỈNH.

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
