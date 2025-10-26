// frontend/src/components/shop/ProductCard.tsx

import { useState } from "react";
import { ShoppingCart, Eye, Heart, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PrinterProduct } from "@/types/product";
import { useCartStore } from "@/stores/useCartStore";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface ProductCardProps {
  product: PrinterProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { addToCart, isInCart } = useCartStore();

  // Lấy ảnh chính hoặc ảnh đầu tiên
  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    "/placeholder-product.jpg";

  // Lấy giá thấp nhất
  const lowestPrice = product.pricing.reduce(
    (min, p) => Math.min(min, p.pricePerUnit),
    Infinity
  );

  // Format giá
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Ngăn navigation khi click vào card
    e.stopPropagation();

    if (isInCart(product._id)) {
      toast.info("Sản phẩm đã có trong giỏ hàng");
      return;
    }

    setIsLoading(true);
    try {
      await addToCart({
        productId: product._id,
        quantity: product.pricing[0]?.minQuantity || 1,
        selectedPriceIndex: 0, // Mặc định chọn giá đầu tiên
      });
    } catch (err) {
      // Error đã được toast trong store
    } finally {
      setIsLoading(false);
    }
  };

  const inCart = isInCart(product._id);

  return (
    <Link to={`/products/${product._id}`}>
      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-none h-full">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />

          {/* Overlay on Hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full"
              title="Xem chi tiết"
            >
              <Eye size={18} />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full"
              title="Yêu thích"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toast.info("Tính năng đang phát triển");
              }}
            >
              <Heart size={18} />
            </Button>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {!product.isActive && (
              <Badge variant="destructive">Ngừng bán</Badge>
            )}
            {product.totalSold && product.totalSold > 100 && (
              <Badge className="bg-orange-500">Bán chạy</Badge>
            )}
          </div>

          {/* Rating */}
          {product.rating && product.rating > 0 && (
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              ⭐ {product.rating.toFixed(1)}
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-4">
          {/* Category */}
          <Badge variant="outline" className="mb-2 text-xs">
            {product.category}
          </Badge>

          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>

          {/* Specs */}
          {product.specifications && (
            <div className="text-xs text-gray-500 mb-3 space-y-1">
              {product.specifications.material && (
                <p>• {product.specifications.material}</p>
              )}
              {product.specifications.size && (
                <p>• {product.specifications.size}</p>
              )}
            </div>
          )}

          {/* Price & Action */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Từ</p>
              <p className="text-lg font-bold text-blue-600">
                {formatPrice(lowestPrice)}
              </p>
            </div>

            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={isLoading || !product.isActive || inCart}
              className={
                inCart
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }
            >
              <ShoppingCart size={16} className="mr-1" />
              {isLoading ? "..." : inCart ? "Trong giỏ" : "Thêm"}
            </Button>
          </div>

          {/* Production Time */}
          {product.productionTime && (
            <p className="text-xs text-gray-500 mt-2">
              ⏱️ Thời gian: {product.productionTime.min}-
              {product.productionTime.max} ngày
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
