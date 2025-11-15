// src/features/chat/components/PromotionCarousel.tsx (CẬP NHẬT)
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/components/ui/carousel";
import { Card } from "@/shared/components/ui/card";
import { ImageWithFallback } from "@/features/figma/ImageWithFallback";
import Autoplay from "embla-carousel-autoplay";

// (Dữ liệu giả, sau này sẽ lấy từ API)
const promoBanners = [
  {
    id: 1,
    img: "https://images.unsplash.com/photo-1551033406-611cf9a28f67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    alt: "Giảm giá 50% In Card Visit",
    link: "/shop?category=business-card",
  },
  {
    id: 2,
    img: "https://images.unsplash.com/photo-1588444968576-f76c1350f35b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    alt: "Miễn phí thiết kế Hộp",
    link: "/shop?category=packaging",
  },
  {
    id: 3,
    img: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    alt: "In áo thun đồng phục",
    link: "/shop?category=t-shirt",
  },
];

export const PromotionCarousel = () => {

  return (
    // ❌ GỠ BỎ: div wrapper (max-w, px, mt)
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      plugins={[
        Autoplay({
          delay: 4000,
        }),
      ]}
      className="w-full" // Giữ w-full
    >
      <CarouselContent>
        {promoBanners.map((banner) => (
          <CarouselItem key={banner.id}>
            {/* ✅ SỬA: Card nên có aspect-ratio thay vì ảnh
                  (Giúp carousel đồng đều chiều cao khi đang kéo) 
              */}
            <Card className="overflow-hidden shadow-lg aspect-[3/1]">
              <a href={banner.link}>
                <ImageWithFallback
                  src={banner.img}
                  alt={banner.alt}
                  className="w-full h-full object-cover"
                />
              </a>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-2" />
      <CarouselNext className="absolute right-2" />
    </Carousel>
  );
};
