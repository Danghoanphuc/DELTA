// features/shop/components/OrderSummaryCard.tsx
import { Card, CardContent } from "@/shared/components/ui/card";
import { Order } from "@/types/order";

interface OrderSummaryCardProps {
  order: Order;
  formatPrice: (price: number) => string;
}

export const OrderSummaryCard = ({
  order,
  formatPrice,
}: OrderSummaryCardProps) => (
  <Card className="shadow-md">
    <CardContent className="p-6">
      <h3 className="font-semibold text-lg mb-4">Tóm tắt đơn hàng</h3>
      <div className="space-y-3">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex gap-3 text-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0">
              {item.productSnapshot?.images?.[0] && (
                <img
                  src={item.productSnapshot.images[0].url}
                  alt={item.productName}
                  className="w-full h-full object-cover rounded-lg"
                />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{item.productName}</p>
              <p className="text-gray-500">
                {item.quantity} x {formatPrice(item.pricePerUnit)}
              </p>
            </div>
            <p className="font-semibold text-blue-600">
              {formatPrice(item.subtotal)}
            </p>
          </div>
        ))}
      </div>
      <div className="border-t mt-4 pt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Tạm tính:</span>
          <span>{formatPrice(order.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Phí vận chuyển:</span>
          <span>{formatPrice(order.shippingFee)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold border-t pt-2">
          <span>Tổng cộng:</span>
          <span className="text-blue-600">{formatPrice(order.total)}</span>
        </div>
      </div>
    </CardContent>
  </Card>
);
