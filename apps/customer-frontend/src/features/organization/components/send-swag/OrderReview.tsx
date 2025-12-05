// src/features/organization/components/send-swag/OrderReview.tsx
// ✅ SOLID: Single Responsibility - Order review only

import { Gift, Users, Truck, Mail, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import { SendSwagState } from "../../hooks/useSendSwag";

interface OrderReviewProps {
  state: SendSwagState;
  pricing: {
    packPrice: number;
    totalPacks: number;
    shipping: number;
    kitting: number;
    total: number;
  };
}

export function OrderReview({ state, pricing }: OrderReviewProps) {
  const getShippingLabel = () => {
    switch (state.shippingMethod) {
      case "express":
        return "Nhanh (1-2 ngày)";
      case "overnight":
        return "Hỏa tốc (trong ngày)";
      default:
        return "Tiêu chuẩn (3-5 ngày)";
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Xác nhận đơn hàng</h2>

      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Gift className="w-10 h-10 text-orange-500" />
          <div>
            <h3 className="font-semibold">{state.selectedPack?.name}</h3>
            <p className="text-sm text-gray-500">
              {state.selectedPack?.items?.length} sản phẩm
            </p>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="font-medium">
              {state.selectedRecipientIds.length} người nhận
            </span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Truck className="w-4 h-4 text-gray-500" />
            <span>{getShippingLabel()}</span>
          </div>
          {state.notifyRecipients && (
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <span>Sẽ gửi email thông báo</span>
            </div>
          )}
        </div>
      </div>

      {/* Pricing */}
      <div className="border rounded-lg p-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">
            Giá bộ quà ({state.selectedRecipientIds.length} x{" "}
            {formatCurrency(pricing.packPrice)})
          </span>
          <span>{formatCurrency(pricing.totalPacks)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Phí vận chuyển</span>
          <span>{formatCurrency(pricing.shipping)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Phí đóng gói</span>
          <span>{formatCurrency(pricing.kitting)}</span>
        </div>
        <div className="border-t pt-2 flex justify-between font-semibold text-lg">
          <span>Tổng cộng</span>
          <span className="text-orange-600">
            {formatCurrency(pricing.total)}
          </span>
        </div>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg text-yellow-800">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p className="text-sm">
          Sau khi xác nhận, đơn hàng sẽ được xử lý và không thể hủy. Vui lòng
          kiểm tra kỹ thông tin trước khi tiếp tục.
        </p>
      </div>
    </div>
  );
}
