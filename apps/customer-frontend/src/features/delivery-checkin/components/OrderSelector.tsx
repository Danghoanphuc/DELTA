// apps/customer-frontend/src/features/delivery-checkin/components/OrderSelector.tsx
/**
 * Order Selector Component
 * Displays assigned orders for shipper to select for check-in
 */

import { Package, MapPin, Loader2, RefreshCw, CheckCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import type { AssignedOrder } from "../types";

interface OrderSelectorProps {
  orders: AssignedOrder[];
  selectedOrder: AssignedOrder | null;
  isLoading: boolean;
  error: string | null;
  onSelect: (order: AssignedOrder) => void;
  onRefresh: () => void;
}

export function OrderSelector({
  orders,
  selectedOrder,
  isLoading,
  error,
  onSelect,
  onRefresh,
}: OrderSelectorProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <span className="ml-2 text-gray-500">Đang tải đơn hàng...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button variant="outline" onClick={onRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Thử lại
        </Button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Không có đơn hàng nào cần giao</p>
        <Button variant="outline" onClick={onRefresh} className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Làm mới
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Chọn đơn hàng</h3>
        <Button variant="ghost" size="sm" onClick={onRefresh}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {orders.map((order) => {
          const isSelected = selectedOrder?._id === order._id;

          return (
            <button
              key={order._id}
              type="button"
              onClick={() => onSelect(order)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    isSelected ? "bg-primary/10" : "bg-gray-100"
                  }`}
                >
                  <Package
                    className={`w-5 h-5 ${
                      isSelected ? "text-primary" : "text-gray-500"
                    }`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      #{order.orderNumber}
                    </span>
                    {isSelected && (
                      <CheckCircle className="w-4 h-4 text-primary" />
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mt-1">
                    {order.customerName}
                  </p>

                  <div className="flex items-start gap-1 mt-2 text-xs text-gray-500">
                    <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">
                      {order.customerAddress}
                    </span>
                  </div>

                  {order.items && order.items.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      {order.items.slice(0, 2).map((item, idx) => (
                        <span key={idx}>
                          {item.name} x{item.quantity}
                          {idx < Math.min(order.items.length, 2) - 1 && ", "}
                        </span>
                      ))}
                      {order.items.length > 2 && (
                        <span> +{order.items.length - 2} sản phẩm khác</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
