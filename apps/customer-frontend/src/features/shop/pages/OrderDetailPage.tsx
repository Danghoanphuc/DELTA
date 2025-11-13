// features/shop/pages/OrderDetailPage.tsx
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { MapPin } from "lucide-react";
import { useOrderDetail } from "../hooks/useOrderDetail";
import { OrderDetailHeader } from "../components/OrderDetailHeader";
import { OrderItemsCard } from "../components/OrderItemsCard";
import { OrderInfoSidebar } from "../components/OrderInfoSidebar";

export function OrderDetailPage() {
  const {
    order,
    loading,
    isPrinter,
    navigate,
    formatPrice,
    formatDate,
    getStatusConfig,
  } = useOrderDetail();

  if (loading || !order) {
    // ... (Render Loading/Error state) ...
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>{loading ? "Đang tải..." : "Không tìm thấy đơn hàng"}</p>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const handleBack = () => navigate(isPrinter ? "/" : "/orders");

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <MobileNav />

      <div className="lg:ml-20 pt-16 lg:pt-0">
        <div className="max-w-6xl mx-auto p-4 md:p-6">
          <OrderDetailHeader
            orderNumber={order.orderNumber}
            statusConfig={statusConfig}
            onBack={handleBack}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <OrderItemsCard items={order.items} formatPrice={formatPrice} />

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin size={20} className="text-blue-600" />
                    Địa chỉ giao hàng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* ... (Render Shipping Address) ... */}
                </CardContent>
              </Card>

              {order.customerNotes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Ghi chú</CardTitle>
                  </CardHeader>
                  <CardContent>{order.customerNotes}</CardContent>
                </Card>
              )}
            </div>

            {/* Right Column */}
            <OrderInfoSidebar
              order={order}
              isPrinter={isPrinter}
              formatPrice={formatPrice}
              formatDate={formatDate}
              getStatusConfig={getStatusConfig}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
