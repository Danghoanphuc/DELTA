// features/shop/components/ProductInfo.tsx
import { Badge } from "@/shared/components/ui/badge";
import { PrinterProduct } from "@/types/product";

interface ProductInfoProps {
  product: PrinterProduct;
  currentPricePerUnit: number;
  formatPrice: (price: number) => string;
}

export const ProductInfo = ({
  product,
  currentPricePerUnit,
  formatPrice,
}: ProductInfoProps) => (
  <>
    <Badge variant="outline" className="mb-2">
      {product.category}
    </Badge>
    <h1 className="text-2xl md:text-3xl font-bold mb-3">{product.name}</h1>

    {/* Price */}
    <div className="mb-4">
      <span className="text-3xl font-bold text-blue-600 mr-2">
        {formatPrice(currentPricePerUnit)}
      </span>
      <span className="text-gray-500">/ sản phẩm</span>
      {product.pricing.length > 1 && (
        <p className="text-sm text-green-600">
          (Áp dụng cho số lượng từ {product.pricing[0].minQuantity}+)
        </p>
      )}
    </div>

    {/* Description */}
    {product.description && (
      <p className="text-gray-600 mb-4">{product.description}</p>
    )}
  </>
);
