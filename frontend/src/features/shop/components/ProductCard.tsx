// features/shop/components/ProductCard.tsx

import { useState } from "react";
import { Heart, Star, MapPin, Eye } from "lucide-react"; // Gỡ bỏ 'Brush'
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Product } from "@/types/product";
import { useAuthStore } from "@/stores/useAuthStore";
import { LoginPopup } from "@/features/auth/components/LoginPopup";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { cn } from "@/shared/lib/utils";
import { Card } from "@/shared/components/ui/card";
import { ImageWithFallback } from "@/features/figma/ImageWithFallback";
import UserAvatarFallback from "@/components/UserAvatarFallback";

interface ProductCardProps {
  product: Product;
  onOpenQuickShop: (product: Product, mode: "cart" | "buy") => void;
}

export function ProductCard({ product, onOpenQuickShop }: ProductCardProps) {
  // (State và các hàm format/handle giữ nguyên)
  const [showLoginPopup, setShowLoginPopup] = useState(false);
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
    if (!Number.isFinite(price) || price === 0) {
      return "Liên hệ";
    }
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      setShowLoginPopup(true);
      return;
    }
    toast.info("Tính năng Yêu thích đang phát triển");
  };

  const printer = product.printerInfo;

  return (
    <>
      <LoginPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        message="Đăng nhập để lưu sản phẩm yêu thích"
      />

      <Card className="group relative overflow-hidden rounded-lg shadow-sm hover:shadow-xl transition-shadow duration-300 break-inside-avoid mb-3">
        {/* --- ẢNH SẢN PHẨM (Main Link) --- */}
        <Link to={`/products/${product._id}`} className="block overflow-hidden">
          <ImageWithFallback
            src={
              primaryImage ||
              "https://placehold.co/400x300/f1f5f9/94a3b8?text=Image"
            }
            alt={product.name}
            className="w-full h-auto object-cover transition-transform duration-300"
            loading="lazy"
          />
        </Link>

        {/* --- BADGES (Giữ nguyên) --- */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1.5">
          {!product.isActive && (
            <Badge variant="destructive" className="text-xs">
              Ngừng bán
            </Badge>
          )}
        </div>

        {/* --- Nút Yêu thích (Giữ nguyên) --- */}
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 z-10 rounded-full w-8 h-8 bg-white/70 text-gray-600 hover:text-red-500 hover:bg-red-50
                       opacity-0 group-hover:opacity-100 transition-opacity"
          title="Yêu thích"
          onClick={handleFavoriteClick}
        >
          <Heart size={16} />
        </Button>

        {/* ======================================================= */}
        {/* ✅ (A) DESKTOP: Hover Overlay (Giống Pinterest) */}
        {/* ======================================================= */}
        <Link
          to={`/products/${product._id}`}
          className={cn(
            "absolute inset-0 flex flex-col justify-end",
            "bg-gradient-to-t from-black/80 via-black/40 to-transparent",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
            "pointer-events-none",
            "hidden md:flex" // <-- Ẩn trên mobile
          )}
        >
          <div className="p-3 text-white pointer-events-auto">
            {/* Tên sản phẩm */}
            <p
              className="font-medium text-sm leading-snug line-clamp-2 mb-2"
              title={product.name}
            >
              {product.name}
            </p>
            {/* Nút CTA chính */}
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-white">
                {formatPrice(lowestPrice)}
              </span>
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/90 text-black hover:bg-white"
                asChild
              >
                <span className="pointer-events-auto">
                  <Eye size={16} className="mr-1.5" />
                  Xem
                </span>
              </Button>
            </div>
          </div>
        </Link>

        {/* ======================================================= */}
        {/* ✅ (B) MOBILE: Visible Footer (Giống Card Shopee) */}
        {/* ======================================================= */}
        <div className="md:hidden p-2.5 flex flex-col gap-1 bg-white">
          {/* Tên sản phẩm */}
          <Link
            to={`/products/${product._id}`}
            className="font-medium text-sm leading-snug line-clamp-2 hover:text-blue-600 h-[40px]"
            title={product.name}
          >
            {product.name}
          </Link>

          {/* Giá */}
          <p
            className="text-base font-bold text-blue-600"
            title={formatPrice(lowestPrice)}
          >
            {formatPrice(lowestPrice)}
          </p>

          {/* Thông tin nhà in (chỉ cho mobile) */}
          {printer && (
            <Link
              to={`/shop/printer/${printer._id}`} // (Giả định URL nhà in)
              className="flex items-center gap-2 pt-2 mt-1 border-t border-gray-100"
            >
              <UserAvatarFallback
                name={printer.businessName || ''}
                size={24}
                bgColor="bg-gray-100"
                textColor="text-gray-600"
                src={printer.logoUrl}
              />
              <span className="text-xs text-gray-600 truncate hover:underline">
                {printer.businessName}
              </span>
            </Link>
          )}
        </div>

        {/* ======================================================= */}
        {/* ✅ (C) DESKTOP: Visible Printer Footer */}
        {/* ======================================================= */}
        {printer && (
          <Link
            to={`/shop/printer/${printer._id}`} // (Giả định URL nhà in)
            className="hidden md:flex items-center gap-2 p-2.5 bg-white"
          >
            <UserAvatarFallback
              name={printer.businessName || ''}
              size={24}
              bgColor="bg-gray-100"
              textColor="text-gray-600"
              src={printer.logoUrl}
            />
            <span className="text-xs text-gray-600 truncate hover:underline">
              {printer.businessName}
            </span>
          </Link>
        )}
      </Card>
    </>
  );
}
