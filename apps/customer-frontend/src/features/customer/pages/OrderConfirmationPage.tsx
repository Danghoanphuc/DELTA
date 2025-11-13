// src/features/shop/pages/OrderConfirmationPage.tsx (CẬP NHẬT HOÀN CHỈNH)

// ❌ GỠ BỎ: import { Sidebar } from "@/components/Sidebar";
// ❌ GỠ BỎ: import { MobileNav } from "@/components/MobileNav";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Clock, Loader2 } from "lucide-react"; // ✅ Thêm Loader2

// ✅ SỬA ĐƯỜNG DẪN: Sử dụng alias tuyệt đối
import { useOrderConfirmation } from "@/features/shop/hooks/useOrderConfirmation";
import { OrderSuccessHeader } from "@/features/shop/components/OrderSuccessHeader";
import { OrderSummaryCard } from "@/features/shop/components/OrderSummaryCard";
import { OrderConfirmationSidebar } from "@/features/shop/components/OrderConfirmationSidebar";

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
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-gray-600">Không tìm thấy đơn hàng.</p>
      </div>
    );
  }

  return (
    // ❌ GỠ BỎ: <div ...>, <Sidebar />, <MobileNav />
    <>
      {/*
        ✅ Căn giữa và thêm padding
        (AppLayout đã xử lý pt-16, ta chỉ cần pt-6 cho nội dung)
      */}
      <div className="max-w-4xl mx-auto p-4 md:p-8 pt-6">
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

      {/* Custom CSS for animations (Giữ nguyên từ file cũ) */}
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
    </>
  );
}
