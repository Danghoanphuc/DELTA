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
// import { useNavigate } from "react-router-dom"; // 1. LOẠI BỎ
import { Separator } from "@/shared/components/ui/separator";

interface CustomizationState {
  notes: string;
  fileUrl: string;
}

interface ProductCustomizationProps {
  product: PrinterProduct;
  customization: CustomizationState;
  onCustomizationChange: (
    field: keyof CustomizationState,
    value: string
  ) => void;
  isCustomizable: boolean;
  onStartEditing: () => void; // 2. THÊM PROP MỚI
}

export const ProductCustomization = ({
  product,
  customization,
  onCustomizationChange,
  isCustomizable,
  onStartEditing, // 3. NHẬN PROP
}: ProductCustomizationProps) => {
  // const navigate = useNavigate(); // LOẠI BỎ

  // const handleDesignClick = () => { // LOẠI BỎ
  //   navigate(`/design-editor?productId=${product._id}`);
  // };

  const hasSpecs =
    product.specifications?.material ||
    product.specifications?.size ||
    product.specifications?.color ||
    product.productionTime;

  return (
    <Card className="mb-4 bg-white border-none shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Thông số & Tùy chỉnh</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-gray-700 grid grid-cols-1 gap-x-4 gap-y-3">
        {/* === PHẦN 1: Thông số (Giữ nguyên) === */}
        {hasSpecs ? (
          <>
            {product.specifications?.material && (
              <div>
                <strong>Chất liệu:</strong> {product.specifications.material}
              </div>
            )}
            {product.specifications?.size && (
              <div>
                <strong>Kích thước:</strong> {product.specifications.size}
              </div>
            )}
            {product.specifications?.color && (
              <div>
                <strong>In ấn:</strong> {product.specifications.color}
              </div>
            )}
            {product.productionTime && (
              <div>
                <strong>Thời gian SX:</strong> {product.productionTime.min}-
                {product.productionTime.max} ngày
              </div>
            )}
          </>
        ) : (
          <p className="text-xs text-gray-500">
            Sản phẩm không có thông số tùy chọn.
          </p>
        )}

        {/* === PHẦN 2: Tùy chỉnh (CHỈ HIỂN THỊ NẾU isCustomizable) === */}
        {isCustomizable && (
          <div className="mt-4 pt-4 border-t space-y-4">
            {/* 4. SỬA onClick -> onStartEditing */}
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
              onClick={onStartEditing} // GỌI PROP CỦA CHA
              type="button"
            >
              <Brush size={20} className="mr-2" />
              Bắt đầu Thiết kế
            </Button>

            <div className="text-center text-xs text-gray-500">
              HOẶC
              <Separator className="my-2" />
            </div>

            {/* (Các tùy chọn phụ giữ nguyên) */}
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
                // (Cần logic để xử lý file upload này)
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
