import { Link } from "react-router-dom";
import { ShoppingCart, ExternalLink } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { ImageWithFallback } from "@/features/figma/ImageWithFallback"; // Tận dụng component có sẵn

// Interface thống nhất (Adapter Pattern)
export interface UniversalProductProps {
  id: string;
  name: string;
  price: number;
  image?: string;
  printerName?: string;
  slug?: string;
  category?: string;
  layout?: "card" | "carousel-item"; // Support nhiều kiểu hiển thị
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

  const Container = layout === "card" ? "div" : "div";
  const containerClasses = cn(
    "group rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-md",
    layout === "card" ? "max-w-sm shadow-sm" : "h-full flex flex-col"
  );

  return (
    <div className={containerClasses}>
      {/* Image Area */}
      <div
        className={cn(
          "relative bg-gray-100 overflow-hidden",
          layout === "card" ? "flex p-3 gap-3" : "aspect-square w-full"
        )}
      >
        <div
          className={cn(
            "flex-shrink-0 relative",
            layout === "card" ? "w-20 h-20 rounded-md" : "w-full h-full"
          )}
        >
          <ImageWithFallback
            src={image || ""}
            alt={name}
            className={cn(
              "object-cover w-full h-full transition-transform duration-500 group-hover:scale-105",
              layout === "card" && "rounded-md"
            )}
          />
          {category && layout === "carousel-item" && (
            <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold uppercase bg-white/90 text-gray-700 backdrop-blur-sm rounded-sm shadow-sm">
              {category}
            </span>
          )}
        </div>

        {/* Info Area (Card Layout Only) */}
        {layout === "card" && (
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
              <Link to={productLink}>{name}</Link>
            </h4>
            {printerName && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {printerName}
              </p>
            )}
            {category && (
              <span className="inline-block mt-1 px-2 py-0.5 text-[10px] rounded-full bg-blue-50 text-blue-600 w-fit">
                {category}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content Area (Carousel Layout) */}
      {layout === "carousel-item" && (
        <div className="p-3 flex-1 flex flex-col">
          <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
            <Link to={productLink}>{name}</Link>
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 truncate flex-1">
            {printerName || "Printz Studio"}
          </p>
        </div>
      )}

      {/* Footer / Actions */}
      <div
        className={cn(
          "p-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50",
          layout === "carousel-item" && "mt-auto"
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
            {formattedPrice}
          </div>

          <div className="flex gap-1.5">
            {onOpenQuickView && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs"
                onClick={() => onOpenQuickView(id)}
              >
                Xem
              </Button>
            )}
            <Link to={productLink}>
              <Button
                size="sm"
                className="h-7 px-2 text-xs bg-blue-600 hover:bg-blue-700"
              >
                <ShoppingCart className="w-3 h-3 mr-1" /> Mua
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
