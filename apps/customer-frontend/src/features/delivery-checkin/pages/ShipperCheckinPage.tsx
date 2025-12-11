// apps/customer-frontend/src/features/delivery-checkin/pages/ShipperCheckinPage.tsx
/**
 * Shipper Check-in Page
 * Mobile-optimized page for shippers to create delivery check-ins
 *
 * Requirements: 8.1, 8.2, 8.5, 8.6
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Package, MapPin, List } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { CheckinForm } from "../components/CheckinForm";
import type { DeliveryCheckin } from "../types";

export function ShipperCheckinPage() {
  const navigate = useNavigate();
  const [successCheckin, setSuccessCheckin] = useState<DeliveryCheckin | null>(
    null
  );

  const handleSuccess = (checkin: DeliveryCheckin) => {
    setSuccessCheckin(checkin);
  };

  const handleNewCheckin = () => {
    setSuccessCheckin(null);
  };

  const handleViewHistory = () => {
    navigate("/shipper/checkins");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleCallRecipient = () => {
    // TODO: Implement call functionality
    console.log("Call recipient");
  };

  const handleViewOrderDetail = () => {
    if (successCheckin) {
      navigate(`/shipper/orders/${successCheckin.orderNumber}`);
    }
  };

  // Success state
  if (successCheckin) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleGoBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold text-lg">Check-in thành công</h1>
        </header>

        {/* Success Content */}
        <div className="flex flex-col items-center justify-center p-6 lg:p-12 min-h-[calc(100vh-4rem)] lg:min-h-screen">
          <div className="bg-green-100 rounded-full p-6 lg:p-8 mb-6 lg:mb-8">
            <CheckCircle className="w-16 h-16 lg:w-20 lg:h-20 text-green-600" />
          </div>

          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            Check-in thành công!
          </h2>

          <p className="text-gray-600 text-center mb-6 lg:mb-8 lg:text-lg">
            Đơn hàng #{successCheckin.orderNumber} đã được ghi nhận giao hàng
            thành công.
          </p>

          <div className="bg-white rounded-xl p-4 lg:p-6 w-full max-w-sm lg:max-w-md shadow-sm border mb-6 lg:mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">#{successCheckin.orderNumber}</p>
                <p className="text-sm text-gray-500 truncate">
                  {successCheckin.address.formatted}
                </p>
              </div>
            </div>

            {successCheckin.photos.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {successCheckin.photos.slice(0, 4).map((photo, idx) => (
                  <img
                    key={idx}
                    src={photo.thumbnailUrl}
                    alt={`Ảnh ${idx + 1}`}
                    className="w-16 h-16 lg:w-20 lg:h-20 rounded-lg object-cover flex-shrink-0"
                  />
                ))}
                {successCheckin.photos.length > 4 && (
                  <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm text-gray-500">
                      +{successCheckin.photos.length - 4}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions - Like real delivery apps */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-sm lg:max-w-md mb-6">
            <Button
              variant="outline"
              onClick={handleViewOrderDetail}
              className="flex-1"
            >
              Chi tiết đơn
            </Button>
            <Button
              variant="outline"
              onClick={handleCallRecipient}
              className="flex-1"
            >
              Gọi người nhận
            </Button>
          </div>

          <div className="flex gap-3 w-full max-w-sm lg:max-w-md">
            <Button
              variant="outline"
              onClick={handleViewHistory}
              className="flex-1"
            >
              Xem lịch sử
            </Button>
            <Button onClick={handleNewCheckin} className="flex-1">
              Check-in mới
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Check-in form
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Header */}
      <header className="hidden lg:block bg-white border-b px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Check-in giao hàng
            </h1>
            <p className="text-gray-600 mt-1">
              Tạo check-in mới cho đơn hàng đã giao
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/shipper/route")}>
            <List className="w-4 h-4 mr-2" />
            Lộ trình hôm nay
          </Button>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={handleGoBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="font-semibold text-lg flex-1">Check-in giao hàng</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/shipper/route")}
        >
          <List className="w-5 h-5" />
        </Button>
      </header>

      {/* Form Content */}
      <div className="p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <CheckinForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
}
