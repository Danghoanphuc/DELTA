import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/components/ui/carousel";
import { PrinterProduct } from "@/types/product";
import { useGlobalModalContext } from "@/contexts/GlobalModalProvider";
import { UniversalProductCard } from "./business/UniversalProductCard";
import { cn } from "@/shared/lib/utils";

interface ChatProductCarouselProps {
  products: PrinterProduct[];
}

export const ChatProductCarousel = ({ products }: ChatProductCarouselProps) => {
  const { openQuickView } = useGlobalModalContext();

  if (!products?.length) return null;

  return (
    <div className="relative group/carousel">
      <Carousel
        opts={{ align: "start", loop: false }}
        className="w-full max-w-xs md:max-w-md"
      >
        <CarouselContent className="-ml-3">
          {products.map((product) => {
            const lowestPrice =
              product.pricing?.reduce(
                (min, p) => Math.min(min, p.pricePerUnit),
                Infinity
              ) || 0;
            const primaryImage = product.images?.[0]?.url;

            return (
              <CarouselItem
                key={product._id}
                className="pl-3 basis-4/5 md:basis-2/3"
              >
                <UniversalProductCard
                  id={product._id}
                  name={product.name}
                  price={lowestPrice}
                  image={primaryImage}
                  printerName={product.printerInfo?.businessName}
                  layout="carousel-item"
                  onOpenQuickView={openQuickView}
                />
              </CarouselItem>
            );
          })}
        </CarouselContent>

        {/* Navigation Controls - Minimalist */}
        {products.length > 1 && (
          <>
            <CarouselPrevious
              className={cn(
                "absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8",
                "bg-white border border-stone-200 shadow-sm text-stone-500",
                "hover:bg-primary hover:border-primary hover:text-white transition-colors duration-300",
                "opacity-0 group-hover/carousel:opacity-100 transition-opacity" // Chỉ hiện khi hover vào vùng carousel
              )}
            />
            <CarouselNext
              className={cn(
                "absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8",
                "bg-white border border-stone-200 shadow-sm text-stone-500",
                "hover:bg-primary hover:border-primary hover:text-white transition-colors duration-300",
                "opacity-0 group-hover/carousel:opacity-100 transition-opacity"
              )}
            />
          </>
        )}
      </Carousel>
    </div>
  );
};
