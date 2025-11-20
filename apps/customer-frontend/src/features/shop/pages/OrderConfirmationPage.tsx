// features/shop/pages/OrderConfirmationPage.tsx
import { MobileNav } from "@/components/MobileNav";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Clock, Loader2 } from "lucide-react";
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-100">
      <MobileNav />

      <div className="lg:ml-20 pt-16 lg:pt-0">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8">
          {/* Success Header */}
          <OrderSuccessHeader
            showAnimation={showAnimation}
            orderNumber={order.orderNumber}
            copiedOrderNumber={copiedOrderNumber}
            onCopy={handleCopyOrderNumber}
          />

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Left Column - Order Details */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Estimated Delivery Card */}
              <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Clock size={28} className="text-white sm:w-8 sm:h-8" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">
                        Thời gian dự kiến nhận hàng
                      </p>
                      <p className="text-xl sm:text-2xl font-bold text-blue-600">
                        {estimatedDelivery}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Summary Card */}
              <OrderSummaryCard order={order} formatPrice={formatPrice} />
            </div>

            {/* Right Column - Actions & Info */}
            <div className="lg:col-span-1">
              <OrderConfirmationSidebar order={order} />
            </div>
          </div>

          {/* Footer Note - Mobile Friendly */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi qua{" "}
              <a href="tel:19001234" className="text-blue-600 font-semibold hover:underline">
                1900 1234
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Custom Animation Styles */}
      <style>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
