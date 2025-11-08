// features/shop/components/ProductCard.tsx (SỬA LỖI MASONRY LẦN 2)
import { useState } from "react";
// ... (imports giữ nguyên) ...
import { ShoppingCart, Heart, Brush } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Product, PrinterProduct } from "@/types/product";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { LoginPopup } from "@/features/auth/components/LoginPopup";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { cn } from "@/shared/lib/utils";
import { Card, CardContent, CardFooter } from "@/shared/components/ui/card";
import { ImageWithFallback } from "@/features/figma/ImageWithFallback";

// ... (Interface, state, functions giữ nguyên) ...
interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  const { addToCart, isInCart } = useCartStore();
  const { accessToken } = useAuthStore();
  const isAuthenticated = !!accessToken;

  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url;

  const lowestPrice = product.pricing.reduce(
    (min, p) => Math.min(min, p.pricePerUnit),
    Infinity
  );

  const formatPrice = (price: number) => {
    // ... (logic formatPrice giữ nguyên) ...
    if (!Number.isFinite(price) || price === 0) {
      return "Liên hệ";
    }
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    // ... (logic handleAddToCart giữ nguyên) ...
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowLoginPopup(true);
      return;
    }
    if (inCart) {
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
      toast.success("Đã thêm vào giỏ");
    } catch (err) {
      console.error("Lỗi khi thêm vào giỏ từ ProductCard:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const inCart = isInCart(product._id, isAuthenticated);

  const isCustomizable =
    product.assets &&
    product.assets.surfaces &&
    product.assets.surfaces.length > 0;

  return (
    <>
      <LoginPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        message="Đăng nhập để thêm sản phẩm vào giỏ hàng và đặt hàng"
      />

      <Card
        className="group relative overflow-hidden rounded-lg shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col"
        style={{ breakInside: "avoid" }} // Quan trọng cho Masonry
      >
        {/* --- PHẦN HÌNH ẢNH (Clickable) --- */}
        {/*
          SỬA LỖI TẠI ĐÂY:
          1. Gỡ bỏ 'relative' và 'max-h-[600px]' khỏi <Link>.
          2. Gỡ bỏ spacer <div style={{ paddingBottom: "75%" }} />.
          3. Gỡ bỏ 'absolute', 'inset-0' khỏi <ImageWithFallback>.
          4. Thêm 'max-h-[600px]' (clamp) vào thẳng <ImageWithFallback>.
        */}
        <Link
          to={`/products/${product._id}`}
          className="block overflow-hidden" // Container đơn giản
        >
          <ImageWithFallback
            src={
              primaryImage ||
              "https://placehold.co/400x300/f1f5f9/94a3b8?text=Image"
            }
            alt={product.name}
            className="w-full h-auto object-cover max-h-[600px] group-hover:scale-105 transition-transform duration-300" // Chiều cao tự nhiên + clamp
            loading="lazy"
          />
        </Link>

        {/* --- BADGES (Giữ nguyên) --- */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1.5">
          {/* ... (badges) ... */}
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

        {/* --- NỘI DUNG (Giữ nguyên) --- */}
        <CardContent className="p-3 flex-1">
          <Link
            to={`/products/${product._id}`}
            className="font-semibold text-sm line-clamp-2 mb-1 hover:text-blue-600"
            title={product.name}
          >
            {product.name}
          </Link>
          <p
            className="text-xs text-gray-500 line-clamp-1"
            title={product.printerInfo?.businessName}
          >
            bởi {product.printerInfo?.businessName || "Nhà in uy tín"}
          </p>
        </CardContent>

        {/* --- CHÂN CARD (Giữ nguyên) --- */}
        <CardFooter className="p-3 pt-0 flex items-center justify-between">
          <p
            className="text-base font-bold text-blue-600"
            title={formatPrice(lowestPrice)}
          >
            {formatPrice(lowestPrice)}
          </p>

          <div className="flex items-center gap-1">
            {/* Nút Yêu thích */}
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full w-9 h-9 text-gray-400 hover:text-red-500 hover:bg-red-50"
              title="Yêu thích"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toast.info("Tính năng Yêu thích đang phát triển");
              }}
            >
              <Heart size={16} />
            </Button>

            {/* Nút Tùy chỉnh (Nếu có) */}
            {isCustomizable && (
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full w-9 h-9 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                title="Tùy chỉnh"
                asChild
                onClick={(e) => e.stopPropagation()}
              >
                <Link to={`/design-editor?productId=${product._id}`}>
                  <Brush size={16} />
                </Link>
              </Button>
            )}

            {/* Nút Thêm vào giỏ (Nếu không cần tùy chỉnh) */}
            {!isCustomizable && (
              <Button
                size="icon"
                variant={inCart ? "default" : "ghost"}
                className={cn(
                  "rounded-full w-9 h-9",
                  inCart
                    ? "bg-blue-600 text-white"
                    : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                )}
                title={inCart ? "Đã có trong giỏ" : "Thêm vào giỏ"}
                onClick={handleAddToCart}
                disabled={isLoading || !product.isActive}
              >
                <ShoppingCart size={16} />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
