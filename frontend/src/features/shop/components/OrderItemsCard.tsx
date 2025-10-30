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

interface OrderItemsCardProps {
  items: OrderItem[];
  formatPrice: (price: number) => string;
}

export const OrderItemsCard = ({ items, formatPrice }: OrderItemsCardProps) => (
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
              {item.productSnapshot?.images?.[0]?.url ? (
                <img
                  src={item.productSnapshot.images[0].url}
                  alt={item.productName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package size={32} className="text-gray-400 m-auto" />
              )}
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
