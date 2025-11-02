// frontend/src/components/shop/ProductCard.tsx (UPDATED)

import { useState } from "react";
import { ShoppingCart, Eye, Heart } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { PrinterProduct } from "@/types/product";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore"; // ✅ THÊM
import { LoginPopup } from "@/features/auth/components/LoginPopup"; // ✅ THÊM
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface ProductCardProps {
  product: PrinterProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false); // ✅ THÊM

  const { addToCart, isInCart } = useCartStore();
  const { accessToken } = useAuthStore(); // ✅ THÊM - Kiểm tra đăng nhập

  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    "/placeholder-product.jpg";

  const lowestPrice = product.pricing.reduce(
    (min, p) => Math.min(min, p.pricePerUnit),
    Infinity
  );

  const formatPrice = (price: number) => {
    if (!Number.isFinite(price)) {
      return "Liên hệ";
    }
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // ✅ CẬP NHẬT - Xử lý thêm vào giỏ hàng với login check
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // ✅ KIỂM TRA ĐĂNG NHẬP
    if (!accessToken) {
      // Chưa đăng nhập -> Hiện popup
      setShowLoginPopup(true);
      return;
    }

    if (isInCart(product._id)) {
      toast.info("Sản phẩm đã có trong giỏ hàng");
      return;
    }

    if (!product.isActive) {
      toast.error("Sản phẩm này đã ngừng bán.");
      return;
    }

    const defaultPriceTierIndex = 0;
    const defaultQuantity =
      product.pricing[defaultPriceTierIndex]?.minQuantity || 1;

    setIsLoading(true);
    try {
      await addToCart({
        productId: product._id,
        quantity: defaultQuantity,
        selectedPriceIndex: defaultPriceTierIndex,
      });
    } catch (err) {
      console.error("Lỗi khi thêm vào giỏ từ ProductCard:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const inCart = isInCart(product._id);

  return (
    <>
      {/* ✅ THÊM LoginPopup */}
      <LoginPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        message="Đăng nhập để thêm sản phẩm vào giỏ hàng và đặt hàng"
      />

      <Link to={`/products/${product._id}`} className="block h-full">
        <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            <img
              src={primaryImage}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />

            {/* Overlay on Hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
              <Button
                size="icon"
                variant="secondary"
                className="rounded-full transform transition-transform hover:scale-110"
                title="Xem chi tiết"
              >
                <Eye size={18} />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="rounded-full transform transition-transform hover:scale-110"
                title="Yêu thích"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toast.info("Tính năng Yêu thích đang phát triển");
                }}
              >
                <Heart size={18} />
              </Button>
            </div>

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {!product.isActive && (
                <Badge variant="destructive" className="text-xs">
                  Ngừng bán
                </Badge>
              )}
              {product.totalSold && product.totalSold > 50 && (
                <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-xs">
                  Bán chạy
                </Badge>
              )}
            </div>

            {/* Rating */}
            {product.rating !== undefined && product.rating > 0 && (
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-sm">
                ⭐ {product.rating.toFixed(1)}
              </div>
            )}
          </div>

          {/* Content */}
          <CardContent className="p-4 flex flex-col flex-grow">
            <Badge variant="outline" className="mb-2 text-xs self-start">
              {product.category || "Chưa phân loại"}
            </Badge>

            <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 text-sm md:text-base group-hover:text-blue-600 transition-colors flex-grow">
              {product.name}
            </h3>

            {(product.specifications?.material ||
              product.specifications?.size) && (
              <div className="text-xs text-gray-500 mb-3 space-y-0.5">
                {product.specifications.material && (
                  <p className="line-clamp-1">
                    • {product.specifications.material}
                  </p>
                )}
                {product.specifications.size && (
                  <p className="line-clamp-1">
                    • {product.specifications.size}
                  </p>
                )}
              </div>
            )}

            {/* Price & Action */}
            <div className="mt-auto pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Giá chỉ từ</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatPrice(lowestPrice)}
                  </p>
                </div>

                <Button
                  size="sm"
                  variant={inCart ? "secondary" : "default"}
                  onClick={handleAddToCart}
                  disabled={isLoading || !product.isActive}
                  className={`transition-all ${
                    inCart
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  <ShoppingCart size={16} className="mr-1.5" />
                  {isLoading ? "..." : inCart ? "Trong giỏ" : "Thêm"}
                </Button>
              </div>

              {product.productionTime && (
                <p className="text-xs text-gray-500 mt-2 text-right">
                  ⏱️ SX: {product.productionTime.min}-
                  {product.productionTime.max} ngày
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </>
  );
}
