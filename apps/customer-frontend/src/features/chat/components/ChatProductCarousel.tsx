// apps/customer-frontend/src/features/chat/components/ChatProductCarousel.tsx
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/components/ui/carousel";
import { PrinterProduct } from "@/types/product";
import { useGlobalModalContext } from "@/contexts/GlobalModalProvider";
// Import Component Atomic
import { UniversalProductCard } from "./business/UniversalProductCard";

interface ChatProductCarouselProps {
  products: PrinterProduct[];
}

export const ChatProductCarousel = ({ products }: ChatProductCarouselProps) => {
  const { openQuickView } = useGlobalModalContext();

  return (
    <Carousel
      opts={{ align: "start", loop: false }}
      className="w-full max-w-xs md:max-w-md"
    >
      <CarouselContent className="-ml-3">
        {products.map((product) => {
          // Adapter: Map data từ PrinterProduct sang UniversalProductProps
          const lowestPrice =
            product.pricing?.reduce(
              (min, p) => Math.min(min, p.pricePerUnit),
              Infinity
            ) || 0;
          const primaryImage = product.images?.[0]?.url;

          return (
            <CarouselItem key={product._id} className="pl-3 basis-4/5">
              <UniversalProductCard
                id={product._id}
                name={product.name}
                price={lowestPrice}
                image={primaryImage}
                printerName={product.printerInfo?.businessName}
                layout="carousel-item" // Chế độ hiển thị dọc cho carousel
                onOpenQuickView={openQuickView}
              />
            </CarouselItem>
          );
        })}
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
