// features/shop/components/OrderItemsCard.tsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { Package } from "lucide-react";
import { OrderItem } from "@/types/order";

// Inline SVG placeholder when image URL missing or broken
const PLACEHOLDER_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
      <rect width="160" height="160" fill="#f1f5f9"/>
      <path d="M40 110l24-30 18 22 12-16 26 24v10H40z" fill="#e2e8f0"/>
      <circle cx="60" cy="64" r="10" fill="#e2e8f0"/>
    </svg>`
  );

interface OrderItemsCardProps {
  items?: OrderItem[];
  formatPrice: (price: number) => string;
}

export const OrderItemsCard = ({ items = [], formatPrice }: OrderItemsCardProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Package size={20} className="text-blue-600" />
        Sản phẩm đặt hàng
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {items.map((item, index) => (
        <div key={index}>
          {index > 0 && <Separator className="my-4" />}
          <div className="flex gap-4">
            {/* Image */}
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              {(() => {
                // Try a robust set of possible image fields commonly used across flows
                const candidateUrls: Array<string | undefined> = [
                  // Unified backend-provided url
                  (item as any)?.imageUrl,
                  // Snapshot created when placing order
                  item.productSnapshot?.images?.[0]?.url as any,
                  // Direct thumbnail on item (backend mapped from product.assets/thumbnailUrl)
                  (item as any)?.thumbnailUrl,
                  // Product reference (when API returns populated product)
                  (item as any)?.product?.images?.[0]?.url,
                  (item as any)?.product?.thumbnailUrl,
                  // Customization/preview fields from design flow
                  (item as any)?.options?.previewUrl,
                  (item as any)?.options?.imageUrl,
                  (item as any)?.customization?.fileUrl,
                  (item as any)?.designFileUrl,
                  // Generic fallbacks
                  (item as any)?.image,
                  (item as any)?.thumbnail,
                ];

                const url = candidateUrls.find((u) => typeof u === "string" && u.trim().length > 0);

                if (url) {
                  return (
                    <img
                      src={url}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_IMG;
                      }}
                    />
                  );
                }
                return (
                  <img
                    src={PLACEHOLDER_IMG}
                    alt="placeholder"
                    className="w-full h-full object-cover"
                  />
                );
              })()}
            </div>
            {/* Info */}
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">
                {item.productName}
              </h4>
              {/* ... (Render specs, customization, ...) ... */}
              <div className="mt-2 flex items-center gap-4 text-sm">
                <span className="text-gray-600">
                  Số lượng: <strong>{item.quantity}</strong>
                </span>
                <span className="text-gray-600">
                  Đơn giá: <strong>{formatPrice(item.pricePerUnit)}</strong>
                </span>
                <span className="text-blue-600 font-semibold ml-auto">
                  {formatPrice(item.subtotal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);
