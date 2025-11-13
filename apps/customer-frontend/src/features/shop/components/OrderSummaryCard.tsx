// features/shop/components/OrderSummaryCard.tsx
import { Card, CardContent } from "@/shared/components/ui/card";
import { Order } from "@/types/order";
import { Cart, CartItem } from "@/stores/useCartStore";

interface OrderSummaryCardProps {
  order?: Order;
  cart?: Cart;
  formatPrice?: (price: number) => string;
}

const defaultFormatPrice = (price: number) => 
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export const OrderSummaryCard = ({
  order,
  cart,
  formatPrice = defaultFormatPrice,
}: OrderSummaryCardProps) => {
  // Use cart if provided, otherwise use order
  const items = cart?.items || order?.items || [];
  const subtotal = cart?.totalAmount || order?.subtotal || 0;
  const shippingFee = order?.shippingFee || 0;
  const total = cart?.totalAmount || order?.total || subtotal;

  return (
    <Card className="shadow-md">
      <CardContent className="p-6">
        <h3 className="font-semibold text-lg mb-4">Tóm tắt đơn hàng</h3>
        <div className="space-y-3">
          {items.map((item: any, idx: number) => {
            const isCartItem = 'productId' in item;
            const productName = isCartItem ? item.product?.name || 'Sản phẩm' : item.productName;
            const imageUrl = isCartItem 
              ? item.product?.images?.[0]?.url 
              : item.productSnapshot?.images?.[0]?.url;
            const quantity = item.quantity;
            const pricePerUnit = isCartItem 
              ? (item.selectedPrice?.pricePerUnit || 0)
              : item.pricePerUnit;
            const itemSubtotal = item.subtotal;
            
            return (
              <div key={idx} className="flex gap-3 text-sm">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0">
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt={productName}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{productName}</p>
                  <p className="text-gray-500">
                    {quantity} x {formatPrice(pricePerUnit)}
                  </p>
                </div>
                <p className="font-semibold text-blue-600">
                  {formatPrice(itemSubtotal)}
                </p>
              </div>
            );
          })}
        </div>
        <div className="border-t mt-4 pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Tạm tính:</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {shippingFee > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Phí vận chuyển:</span>
              <span>{formatPrice(shippingFee)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Tổng cộng:</span>
            <span className="text-blue-600">{formatPrice(total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
