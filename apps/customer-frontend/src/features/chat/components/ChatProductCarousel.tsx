// src/features/chat/components/ChatProductCarousel.tsx (ĐÃ SỬA)

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/components/ui/carousel";
import { Card, CardContent } from "@/shared/components/ui/card";
import { PrinterProduct } from "@/types/product";
import { ImageWithFallback } from "@/features/figma/ImageWithFallback";
import { Button } from "@/shared/components/ui/button";
// ✅ BƯỚC 1: IMPORT CONTEXT TOÀN CỤC (GLOBAL)
import { useGlobalModalContext } from "@/contexts/GlobalModalProvider";
// ❌ GỠ BỎ: useChatContext

// ... (ChatProductCard giữ nguyên giao diện) ...
const ChatProductCard = ({ product }: { product: PrinterProduct }) => {
  // ✅ BƯỚC 2: SỬ DỤNG CONTEXT TOÀN CỤC
  const { openQuickView } = useGlobalModalContext();
  const primaryImage = product.images?.[0]?.url || "/placeholder-product.jpg";
  const lowestPrice =
    product.pricing.reduce(
      (min, p) => Math.min(min, p.pricePerUnit),
      Infinity
    ) || 0;

  return (
    <Card className="overflow-hidden shadow-md border">
      <div className="aspect-square bg-gray-100">
        <ImageWithFallback
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-3">
        <p className="font-semibold text-sm truncate mb-1">{product.name}</p>
        <p className="text-xs text-gray-500 mb-2 truncate">
          {product.printerInfo?.businessName || "Từ nhiều nhà in"}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-blue-600 font-bold text-sm">
            {lowestPrice.toLocaleString("vi-VN")}đ
          </span>
          {/* ✅ BƯỚC 3: Kích hoạt modal toàn cục */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => openQuickView(product._id)}
          >
            Xem
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ... (Carousel chính giữ nguyên) ...
interface ChatProductCarouselProps {
  products: PrinterProduct[];
}
export const ChatProductCarousel = ({ products }: ChatProductCarouselProps) => {
  return (
    <Carousel
      opts={{
        align: "start",
        loop: false,
      }}
      className="w-full max-w-xs md:max-w-md"
    >
      <CarouselContent className="-ml-3">
        {products.map((product) => (
          <CarouselItem key={product._id} className="pl-3 basis-4/5">
            <ChatProductCard product={product} />
          </CarouselItem>
        ))}
      </CarouselContent>
      {products.length > 1 && (
        <>
          <CarouselPrevious className="absolute left-2 -translate-y-1/2" />
          <CarouselNext className="absolute right-2 -translate-y-1/2" />
        </>
      )}
    </Carousel>
  );
};
