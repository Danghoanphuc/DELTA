// src/features/chat/components/ProductQuickViewModal.tsx (✅ SỬA LỖI NÚT ĐÓNG)

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Link } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/components/ui/carousel";
import { ImageWithFallback } from "@/features/figma/ImageWithFallback";
import { useChatContext } from "@/features/chat/context/ChatProvider";
import { Loader2 } from "lucide-react";

/**
 * Nội dung bên trong Modal
 */
const QuickViewContent = () => {
  // ✅ BƯỚC 1: LẤY HÀM closeQuickView TỪ CONTEXT
  const {
    isQuickViewLoading,
    quickViewProductData: product,
    closeQuickView,
  } = useChatContext();

  if (isQuickViewLoading || !product) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const primaryImage = product.images?.[0]?.url || "/placeholder-product.jpg";
  const lowestPrice =
    product.pricing.reduce(
      (min, p) => Math.min(min, p.pricePerUnit),
      Infinity
    ) || 0;

  return (
    <>
      {/* 1. Carousel Ảnh */}
      <Carousel className="w-full">
        <CarouselContent>
          {product.images && product.images.length > 0 ? (
            product.images.map((image, index) => (
              <CarouselItem key={index}>
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <ImageWithFallback
                    src={image.url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </CarouselItem>
            ))
          ) : (
            <CarouselItem>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <ImageWithFallback
                  src={primaryImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </CarouselItem>
          )}
        </CarouselContent>
        {product.images && product.images.length > 1 && (
          <>
            <CarouselPrevious className="absolute left-3" />
            <CarouselNext className="absolute right-3" />
          </>
        )}
      </Carousel>

      {/* 2. Thông tin */}
      <div className="mt-4">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {product.name}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-500 mt-1">
          Cung cấp bởi: {product.printerInfo?.businessName || "PrintZ"}
        </p>
        <p className="text-2xl font-bold text-blue-600 mt-3">
          Chỉ từ: {lowestPrice.toLocaleString("vi-VN")}đ
        </p>
      </div>

      {/* 3. Footer Nút Bấm */}
      <DialogFooter className="mt-6 sm:justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          className="w-full sm:w-auto"
          asChild
        >
          {/* Nút "Xem chi tiết" (mở tab mới) */}
          <Link to={`/products/${product._id}`} target="_blank">
            Xem chi tiết đầy đủ
          </Link>
        </Button>
        {/* ✅ BƯỚC 2: THÊM onClick VÀO NÚT "ĐÓNG" */}
        <Button
          type="button"
          className="w-full sm:w-auto"
          onClick={closeQuickView}
        >
          Đóng
        </Button>
      </DialogFooter>
    </>
  );
};

/**
 * Component Modal chính
 */
export const ProductQuickViewModal = () => {
  const { quickViewProductId, closeQuickView } = useChatContext();

  return (
    <Dialog
      open={!!quickViewProductId}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          closeQuickView();
        }
      }}
    >
      <DialogContent className="sm:max-w-md p-6">
        <QuickViewContent />
      </DialogContent>
    </Dialog>
  );
};
