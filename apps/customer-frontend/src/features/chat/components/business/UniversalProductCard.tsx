import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { ImageWithFallback } from "@/features/figma/ImageWithFallback";

export interface UniversalProductProps {
  id: string;
  name: string;
  price: number;
  image?: string;
  printerName?: string;
  slug?: string;
  category?: string;
  layout?: "card" | "carousel-item";
  onOpenQuickView?: (id: string) => void;
}

export function UniversalProductCard({
  id,
  name,
  price,
  image,
  printerName,
  slug,
  category,
  layout = "card",
  onOpenQuickView,
}: UniversalProductProps) {
  const formattedPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price || 0);

  const productLink = slug ? `/products/${slug}` : `/products/${id}`;

  const containerClasses = cn(
    "group relative bg-white border border-stone-200 overflow-hidden transition-all hover:border-stone-400 hover:shadow-md",
    layout === "card"
      ? "rounded-xl max-w-sm"
      : "rounded-xl h-full flex flex-col"
  );

  return (
    <div className={containerClasses}>
      {/* Image Area */}
      <div
        className={cn(
          "relative bg-stone-50 overflow-hidden",
          layout === "card"
            ? "flex p-3 gap-3"
            : "aspect-[4/3] w-full border-b border-stone-100"
        )}
      >
        <div
          className={cn(
            "flex-shrink-0 relative overflow-hidden",
            layout === "card" ? "w-20 h-20 rounded-lg" : "w-full h-full"
          )}
        >
          <ImageWithFallback
            src={image || ""}
            alt={name}
            className={cn(
              "object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-105 mix-blend-multiply",
              layout === "card" && "rounded-lg"
            )}
          />
          {category && layout === "carousel-item" && (
            <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-white/90 text-black backdrop-blur-sm border border-stone-100 rounded-sm">
              {category}
            </span>
          )}
        </div>

        {/* Info Area (Card Layout Only) */}
        {layout === "card" && (
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h4 className="font-serif font-bold text-[15px] text-black line-clamp-2 mb-1 group-hover:underline decoration-1 underline-offset-2">
              <Link to={productLink}>{name}</Link>
            </h4>
            {printerName && (
              <p className="text-[11px] text-stone-500 truncate font-sans">
                by {printerName}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Content Area (Carousel Layout) */}
      {layout === "carousel-item" && (
        <div className="p-4 flex-1 flex flex-col">
          <h4 className="font-serif font-bold text-[15px] text-black leading-tight line-clamp-2 mb-1 group-hover:text-stone-700 transition-colors">
            <Link to={productLink}>{name}</Link>
          </h4>
          <p className="text-[11px] text-stone-500 mb-3 truncate font-sans">
            {printerName || "Printz Studio"}
          </p>

          <div className="mt-auto flex items-end justify-between gap-2 pt-3 border-t border-stone-100 border-dashed">
            <div className="text-[15px] font-bold text-black font-serif">
              {formattedPrice}
            </div>
            <div className="flex gap-1.5">
              {onOpenQuickView && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 text-xs border-stone-300 text-stone-700 hover:bg-stone-100 font-medium"
                  onClick={() => onOpenQuickView(id)}
                >
                  Xem
                </Button>
              )}
              <Link to={productLink}>
                <Button
                  size="sm"
                  className="h-8 px-3 text-xs bg-black text-white hover:bg-stone-800 shadow-none font-medium"
                >
                  <ShoppingCart className="w-3 h-3 mr-1.5" /> Mua
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Footer / Actions (Card Layout) */}
      {layout === "card" && (
        <div className="px-3 pb-3 pt-0 flex items-center justify-between">
          <div className="text-sm font-bold text-black font-serif">
            {formattedPrice}
          </div>
          <Link to={productLink}>
            <Button
              size="sm"
              className="h-7 px-3 text-xs bg-black text-white hover:bg-stone-800 shadow-none rounded-md"
            >
              Mua ngay
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
