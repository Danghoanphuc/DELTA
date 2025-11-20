// features/shop/components/OrderSummaryCard.tsx
import { Card, CardContent } from "@/shared/components/ui/card";
import { Order } from "@/types/order";
import { Cart } from "@/stores/useCartStore";
import { Package } from "lucide-react";

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
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="text-blue-600" size={20} />
          <h3 className="font-semibold text-lg">Tóm tắt đơn hàng</h3>
        </div>
        
        <div className="space-y-3">
          {items.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Không có sản phẩm</p>
          ) : (
            items.map((item: any, idx: number) => {
              const isCartItem = 'productId' in item;
              const productName = isCartItem ? item.product?.name || 'Sản phẩm' : item.productName || 'Sản phẩm';
              
              // ✅ FIX: Multiple fallbacks for image URL
              let imageUrl = '';
              if (isCartItem) {
                imageUrl = item.product?.images?.[0]?.url || '';
              } else {
                // For order items, try multiple sources
                imageUrl = item.imageUrl || 
                          item.productSnapshot?.images?.[0]?.url || 
                          item.thumbnailUrl || 
                          '';
              }
              
              const quantity = item.quantity || 0;
              const pricePerUnit = isCartItem 
                ? (item.selectedPrice?.pricePerUnit || 0)
                : (item.pricePerUnit || 0);
              const itemSubtotal = item.subtotal || 0;
              
              return (
                <div key={idx} className="flex gap-3 pb-3 border-b last:border-b-0">
                  {/* Image */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={productName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to placeholder on error
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center bg-gray-200">
                              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                              </svg>
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                      {productName}
                    </p>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1">
                      {quantity} x {formatPrice(pricePerUnit)}
                    </p>
                  </div>
                  
                  {/* Price */}
                  <div className="flex items-center">
                    <p className="font-semibold text-blue-600 text-sm sm:text-base">
                      {formatPrice(itemSubtotal)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {/* Totals */}
        <div className="border-t mt-4 pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Tạm tính:</span>
            <span className="font-medium">{formatPrice(subtotal)}</span>
          </div>
          {shippingFee > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Phí vận chuyển:</span>
              <span className="font-medium">{formatPrice(shippingFee)}</span>
            </div>
          )}
          <div className="flex justify-between text-base sm:text-lg font-bold border-t pt-3 mt-3">
            <span>Tổng cộng:</span>
            <span className="text-blue-600">{formatPrice(total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
