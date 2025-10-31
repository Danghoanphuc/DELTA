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
import { Button } from "@/shared/components/ui/button"; // ✅ THÊM
import { Brush } from "lucide-react"; // ✅ THÊM
import { useNavigate } from "react-router-dom"; // ✅ THÊM

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
}: ProductCustomizationProps) => {
  const navigate = useNavigate(); // ✅ THÊM

  // ✅ THÊM: Hàm điều hướng đến trang editor
  const handleDesignClick = () => {
    // Chúng ta sẽ tạo route này ở Bước 3
    // Nó sẽ gửi ID sản phẩm qua URL
    navigate(`/design-editor?productId=${product._id}`);
  };

  return (
    <Card className="mb-4 bg-white border-none shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Thông số & Tùy chỉnh</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-gray-700 grid grid-cols-1 gap-x-4 gap-y-3">
        {/* ... (Các thông số material, size, v.v. giữ nguyên) ... */}
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

        {/* === THAY ĐỔI TỪ ĐÂY === */}
        <div className="mt-4 pt-4 border-t space-y-4">
          {/* 1. Nút bấm thiết kế MỚI */}
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
            onClick={handleDesignClick}
            type="button" // Ngăn form submit nếu có
          >
            <Brush size={20} className="mr-2" />
            Tùy chỉnh Thiết kế
          </Button>

          {/* 2. Giữ lại Ghi chú */}
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

          {/* 3. Giữ lại chức năng upload file có sẵn */}
          <div>
            <Label htmlFor="fileUpload" className="font-medium">
              Hoặc tải lên file thiết kế có sẵn
            </Label>
            <Input
              id="fileUpload"
              type="file"
              className="mt-1"
              // (Bạn sẽ cần logic để xử lý file upload này sau)
            />
          </div>
        </div>
        {/* === KẾT THÚC THAY ĐỔI === */}
      </CardContent>
    </Card>
  );
};
