// features/shop/pages/OrderConfirmationPage.tsx
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Clock } from "lucide-react";
import { useOrderConfirmation } from "../hooks/useOrderConfirmation";
import { OrderSuccessHeader } from "../components/OrderSuccessHeader";
import { OrderSummaryCard } from "../components/OrderSummaryCard";
import { OrderConfirmationSidebar } from "../components/OrderConfirmationSidebar";

export function OrderConfirmationPage() {
  const {
    order,
    loading,
    showAnimation,
    copiedOrderNumber,
    estimatedDelivery,
    handleCopyOrderNumber,
    formatPrice,
  } = useOrderConfirmation();

  if (loading) {
    // ... (Loading UI giữ nguyên) ...
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-100">
      <Sidebar />
      <MobileNav />

      <div className="lg:ml-20 pt-16 lg:pt-0">
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          <OrderSuccessHeader
            showAnimation={showAnimation}
            orderNumber={order.orderNumber}
            copiedOrderNumber={copiedOrderNumber}
            onCopy={handleCopyOrderNumber}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Estimated Delivery */}
              <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Clock size={32} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">
                        Thời gian dự kiến nhận hàng
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        {estimatedDelivery}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <OrderSummaryCard order={order} formatPrice={formatPrice} />
            </div>

            {/* Right Column */}
            <OrderConfirmationSidebar order={order} />
          </div>
        </div>
      </div>
      {/* ... (CSS style tag giữ nguyên) ... */}
    </div>
  );
}
