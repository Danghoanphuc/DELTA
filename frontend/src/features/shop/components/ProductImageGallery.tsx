// src/features/shop/components/ProductImageGallery.tsx
// ✅ ĐÃ NÂNG CẤP: Sử dụng Carousel (Giống Tiki/Shopee)

import React, { useState } from "react"; // ✅ Import React và useState
import { PrinterProduct } from "@/types/product";
import { ImageWithFallback } from "@/features/figma/ImageWithFallback";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/components/ui/carousel"; // ✅ Import Carousel
import { Badge } from "@/shared/components/ui/badge"; // ✅ Import Badge

interface ProductImageGalleryProps {
  images: PrinterProduct["images"];
  name: string;
}

export const ProductImageGallery = ({
  images,
  name,
}: ProductImageGalleryProps) => {
  // ✅ State để đếm slide (giống 1/3 trong ảnh)
  const [current, setCurrent] = useState(1);
  const [count, setCount] = useState(0);
  const [api, setApi] = useState<any>(null); // (CarouselApi)

  const imageList =
    images && images.length > 0
      ? images
      : [{ url: "/placeholder-product.jpg" }];

  // ✅ Cập nhật state khi carousel khởi tạo hoặc thay đổi
  React.useEffect(() => {
    if (!api) {
      return;
    }
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <div className="relative">
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {imageList.map((image, index) => (
            <CarouselItem key={index}>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border shadow-inner">
                <ImageWithFallback
                  src={image.url}
                  alt={`${name} ảnh ${index + 1}`}
                  className="w-full h-full object-contain" // 'contain' để xem rõ
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* ✅ Hiển thị nút Prev/Next nếu có nhiều ảnh */}
        {imageList.length > 1 && (
          <>
            <CarouselPrevious className="absolute left-3" />
            <CarouselNext className="absolute right-3" />
          </>
        )}
      </Carousel>

      {/* ✅ Badge đếm số ảnh (Giống 1/3) */}
      {imageList.length > 1 && (
        <Badge
          variant="secondary"
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white border-none"
        >
          {current} / {count}
        </Badge>
      )}
    </div>
  );
};
