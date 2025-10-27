// frontend/src/components/shop/ProductCard.tsx

import { useState } from "react";
import { ShoppingCart, Eye, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PrinterProduct } from "@/types/product"; // Đảm bảo import đúng type
import { useCartStore } from "@/stores/useCartStore";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface ProductCardProps {
  product: PrinterProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { addToCart, isInCart } = useCartStore();

  // Lấy ảnh chính hoặc ảnh đầu tiên từ Cloudinary URL
  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.url || // URL từ Cloudinary
    product.images?.[0]?.url || // URL từ Cloudinary
    "/placeholder-product.jpg"; // Fallback nếu không có ảnh

  // Lấy giá thấp nhất từ bậc giá đầu tiên (hoặc tính toán phức tạp hơn nếu cần)
  const lowestPrice = product.pricing.reduce(
    (min, p) => Math.min(min, p.pricePerUnit),
    Infinity // Giá trị khởi tạo là vô cùng lớn
  );

  // Format giá tiền Việt Nam
  const formatPrice = (price: number) => {
    // Xử lý trường hợp giá là Infinity hoặc không hợp lệ
    if (!Number.isFinite(price)) {
      return "Liên hệ"; // Hoặc giá trị mặc định khác
    }
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Ngăn navigation khi click vào nút trên card
    e.stopPropagation(); // Ngăn sự kiện nổi bọt lên Link cha

    if (isInCart(product._id)) {
      toast.info("Sản phẩm đã có trong giỏ hàng");
      return;
    }

    if (!product.isActive) {
      toast.error("Sản phẩm này đã ngừng bán.");
      return;
    }

    // Tìm bậc giá phù hợp với số lượng tối thiểu đầu tiên
    // (Logic này có thể cần phức tạp hơn nếu bạn muốn người dùng chọn số lượng ngay trên card)
    const defaultPriceTierIndex = 0; // Mặc định chọn bậc giá đầu tiên
    const defaultQuantity =
      product.pricing[defaultPriceTierIndex]?.minQuantity || 1;

    setIsLoading(true);
    try {
      await addToCart({
        productId: product._id,
        quantity: defaultQuantity,
        selectedPriceIndex: defaultPriceTierIndex,
        // customization: {} // Thêm customization nếu cần
      });
      // toast success đã có trong store
    } catch (err) {
      // toast error đã có trong store hoặc controller backend
      console.error("Lỗi khi thêm vào giỏ từ ProductCard:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const inCart = isInCart(product._id);

  return (
    // Link bao toàn bộ card để điều hướng đến trang chi tiết
    <Link to={`/products/${product._id}`} className="block h-full">
      {" "}
      {/* Thêm block và h-full */}
      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col">
        {" "}
        {/* Thêm flex flex-col */}
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={primaryImage} // Sử dụng trực tiếp URL Cloudinary
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" // Thay đổi hiệu ứng hover nhẹ nhàng hơn
            loading="lazy" // Thêm lazy loading
          />

          {/* Overlay on Hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full transform transition-transform hover:scale-110"
              title="Xem chi tiết"
              // Không cần onClick vì Link cha đã xử lý
            >
              <Eye size={18} />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full transform transition-transform hover:scale-110"
              title="Yêu thích"
              onClick={(e) => {
                e.preventDefault(); // Ngăn Link cha
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
            {/* Thêm Badge mới nếu cần, ví dụ: giảm giá */}
            {product.totalSold &&
              product.totalSold > 50 && ( // Ví dụ badge Bán chạy
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
        {/* Content - Thêm flex-grow để đẩy phần giá xuống dưới */}
        <CardContent className="p-4 flex flex-col flex-grow">
          {/* Category */}
          <Badge variant="outline" className="mb-2 text-xs self-start">
            {" "}
            {/* self-start để badge không chiếm full width */}
            {product.category || "Chưa phân loại"}
          </Badge>

          {/* Product Name */}
          <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 text-sm md:text-base group-hover:text-blue-600 transition-colors flex-grow">
            {" "}
            {/* Thêm flex-grow */}
            {product.name}
          </h3>

          {/* Specs Preview */}
          {(product.specifications?.material ||
            product.specifications?.size) && ( // Chỉ hiển thị nếu có thông tin
            <div className="text-xs text-gray-500 mb-3 space-y-0.5">
              {product.specifications.material && (
                <p className="line-clamp-1">
                  • {product.specifications.material}
                </p>
              )}
              {product.specifications.size && (
                <p className="line-clamp-1">• {product.specifications.size}</p>
              )}
            </div>
          )}

          {/* Thêm printerId để debug */}
          {/* <p className="text-xs text-red-500">Printer ID: {product.printerId}</p> */}

          {/* Price & Action - Đẩy xuống cuối CardContent */}
          <div className="mt-auto pt-3 border-t border-gray-100">
            {" "}
            {/* mt-auto đẩy xuống, pt-3 tạo khoảng cách */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Giá chỉ từ</p>
                <p className="text-lg font-bold text-blue-600">
                  {formatPrice(lowestPrice)}
                </p>
              </div>

              <Button
                size="sm"
                variant={inCart ? "secondary" : "default"} // Đổi variant nếu đã trong giỏ
                onClick={handleAddToCart}
                disabled={isLoading || !product.isActive} // Disable nếu đang loading hoặc ngừng bán
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
            {/* Production Time */}
            {product.productionTime && (
              <p className="text-xs text-gray-500 mt-2 text-right">
                ⏱️ SX: {product.productionTime.min}-{product.productionTime.max}{" "}
                ngày
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
