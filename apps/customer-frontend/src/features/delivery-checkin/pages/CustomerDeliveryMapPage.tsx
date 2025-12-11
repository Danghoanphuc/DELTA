// apps/customer-frontend/src/features/delivery-checkin/pages/CustomerDeliveryMapPage.tsx
/**
 * Customer Delivery Map Page
 * Full page component for customer to view delivery check-ins on a map
 *
 * Requirements: 5.1, 5.2, 5.5, 5.6, 12.2, 12.3
 */

import { useNavigate } from "react-router-dom";
import { MapPin, ArrowLeft } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { DeliveryMapView } from "../components/DeliveryMapView";

export function CustomerDeliveryMapPage() {
  const navigate = useNavigate();

  const handleViewThread = (threadId: string) => {
    navigate(`/threads/${threadId}`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-3 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="flex items-center gap-2">
          <div className="bg-orange-100 rounded-full p-2">
            <MapPin className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Bản đồ giao hàng
            </h1>
            <p className="text-sm text-gray-500">
              Theo dõi các điểm giao hàng của bạn
            </p>
          </div>
        </div>
      </header>

      {/* Map container */}
      <main className="flex-1 relative">
        <DeliveryMapView
          onViewThread={handleViewThread}
          className="absolute inset-0"
        />
      </main>
    </div>
  );
}
