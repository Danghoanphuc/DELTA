// src/features/shop/components/details/ProductSpecsSection.tsx
// (Phải export default để dùng React.lazy)
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Product } from "@/types/product"; //

const ProductSpecsSection = ({ product }: { product: Product }) => {
  const specs = product.specifications; //

  return (
    <Card className="mt-6 shadow-sm border-none">
      <CardHeader>
        <CardTitle>Thông số Kỹ thuật</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div className="border-b pb-2">
            <span className="text-sm text-gray-500">Chất liệu</span>
            <p className="font-medium text-lg">
              {specs?.material || "Đang cập nhật"}
            </p>
          </div>
          <div className="border-b pb-2">
            <span className="text-sm text-gray-500">Kích thước</span>
            <p className="font-medium text-lg">
              {specs?.size || "Đang cập nhật"}
            </p>
          </div>
          <div className="border-b pb-2">
            <span className="text-sm text-gray-500">Công nghệ in</span>
            <p className="font-medium text-lg">
              {specs?.color || "Đang cập nhật"}
            </p>
          </div>
          <div className="border-b pb-2">
            <span className="text-sm text-gray-500">Hoàn thiện</span>
            <p className="font-medium text-lg">
              {specs?.finishing || "Đang cập nhật"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductSpecsSection;
