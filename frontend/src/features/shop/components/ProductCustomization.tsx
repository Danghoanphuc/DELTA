// features/shop/components/ProductCustomization.tsx
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
}

export const ProductCustomization = ({
  product,
  customization,
  onCustomizationChange,
}: ProductCustomizationProps) => (
  <Card className="mb-4 bg-white border-none shadow-sm">
    <CardHeader className="pb-2">
      <CardTitle className="text-base">Thông số & Tùy chỉnh</CardTitle>
    </CardHeader>
    <CardContent className="text-sm text-gray-700 grid grid-cols-1 gap-x-4 gap-y-3">
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
      <div className="mt-4 pt-4 border-t space-y-3">
        {/* Ghi chú tùy chỉnh */}
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
        {/* Upload file */}
        <div>
          <Label htmlFor="fileUpload" className="font-medium">
            Tải lên file thiết kế
          </Label>
          <Input id="fileUpload" type="file" className="mt-1" disabled />
          <p className="text-xs text-gray-500 mt-1">
            (Chức năng upload file sẽ được phát triển sau)
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
);
