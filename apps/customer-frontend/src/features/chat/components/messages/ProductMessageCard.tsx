// apps/customer-frontend/src/features/chat/components/messages/ProductMessageCard.tsx
// ✅ RICH MESSAGES: Product card component for chat

import { Link } from "react-router-dom";
import { ShoppingCart, ExternalLink } from "lucide-react";
import { ProductMetadata } from "@/types/chat";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface ProductMessageCardProps {
  metadata: ProductMetadata;
  isUserMessage?: boolean;
}

export function ProductMessageCard({ metadata, isUserMessage = false }: ProductMessageCardProps) {
  const {
    productId,
    productName,
    productSlug,
    price,
    image,
    category,
    printerName,
  } = metadata;

  // Format price
  const formattedPrice = price
    ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(price)
    : "Liên hệ";

  // Product link
  const productLink = productSlug ? `/products/${productSlug}` : `/products/${productId}`;

  return (
    <div
      className={cn(
        "rounded-lg shadow-sm border overflow-hidden max-w-sm",
        "bg-white dark:bg-gray-800",
        "border-gray-200 dark:border-gray-700",
        "transition-all hover:shadow-md"
      )}
    >
      {/* Product Image & Info */}
      <div className="flex gap-3 p-3">
        {/* Image */}
        {image ? (
          <div className="flex-shrink-0">
            <img
              src={image}
              alt={productName}
              className="w-20 h-20 object-cover rounded-md"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="flex-shrink-0 w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
            <span className="text-gray-400 text-xs">No image</span>
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-2 mb-1">
            {productName || "Sản phẩm"}
          </h4>
          
          {printerName && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              {printerName}
            </p>
          )}
          
          {category && (
            <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              {category}
            </span>
          )}
        </div>
      </div>

      {/* Price & Actions */}
      <div className="border-t border-gray-100 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center justify-between gap-2">
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {formattedPrice}
          </div>
          
          <div className="flex gap-2">
            {/* View Details Button */}
            <Link to={productLink}>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-3 text-xs"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Chi tiết
              </Button>
            </Link>

            {/* Add to Cart Button */}
            <Link to={productLink}>
              <Button
                size="sm"
                className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700"
              >
                <ShoppingCart className="w-3 h-3 mr-1" />
                Mua ngay
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

