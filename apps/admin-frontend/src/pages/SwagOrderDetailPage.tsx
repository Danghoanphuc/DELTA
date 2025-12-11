// src/pages/SwagOrderDetailPage.tsx
// ✅ SOLID Refactored: UI composition only

import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Truck,
  Play,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useOrderDetail } from "@/hooks/useOrderDetail";
import { OrderInfo } from "@/components/order-detail/OrderInfo";
import { RecipientTable } from "@/components/order-detail/RecipientTable";
import { ShipmentModal } from "@/components/order-detail/ShipmentModal";
import { ActivityLog } from "@/components/order-detail/ActivityLog";
import { OrderChatWidget } from "@/components/order-detail/OrderChatWidget";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: "Nháp", color: "bg-gray-100 text-gray-700" },
  pending_info: {
    label: "Chờ thông tin",
    color: "bg-yellow-100 text-yellow-700",
  },
  pending_payment: {
    label: "Chờ thanh toán",
    color: "bg-orange-100 text-orange-700",
  },
  paid: { label: "Đã thanh toán", color: "bg-blue-100 text-blue-700" },
  processing: { label: "Đang xử lý", color: "bg-indigo-100 text-indigo-700" },
  kitting: { label: "Đang đóng gói", color: "bg-purple-100 text-purple-700" },
  shipped: { label: "Đã gửi", color: "bg-cyan-100 text-cyan-700" },
  delivered: { label: "Đã giao", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Đã hủy", color: "bg-gray-100 text-gray-500" },
  failed: { label: "Thất bại", color: "bg-red-100 text-red-700" },
};

export default function SwagOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const {
    order,
    activityLog,
    carriers,
    isLoading,
    isUpdating,
    startProcessing,
    completeKitting,
    bulkUpdateShipments,
    goBack,
  } = useOrderDetail(id);

  // Local state for recipient selection and modals
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [showShipModal, setShowShipModal] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("ghn");

  // Toggle recipient selection
  const toggleRecipient = (recipientId: string) => {
    setSelectedRecipients((prev) =>
      prev.includes(recipientId)
        ? prev.filter((id) => id !== recipientId)
        : [...prev, recipientId]
    );
  };

  const toggleAllRecipients = () => {
    if (!order) return;
    const allIds = order.recipientShipments
      .filter(
        (s: any) =>
          s.shipmentStatus !== "delivered" && s.shipmentStatus !== "shipped"
      )
      .map((s: any) => s.recipient.toString());

    if (selectedRecipients.length === allIds.length) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(allIds);
    }
  };

  // Handle shipment submission
  const handleMarkShipped = async () => {
    if (selectedRecipients.length === 0) return;

    const trackingNumbers: Record<string, string> = {};
    selectedRecipients.forEach((rid) => {
      trackingNumbers[rid] = trackingNumber;
    });

    try {
      await bulkUpdateShipments({
        recipientIds: selectedRecipients,
        status: "shipped",
        trackingNumbers,
        carrier,
      });

      setShowShipModal(false);
      setSelectedRecipients([]);
      setTrackingNumber("");
    } catch (error) {
      console.error("Error marking shipped:", error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  // Not found state
  if (!order) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
        <p className="text-lg font-medium">Không tìm thấy đơn hàng</p>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.draft;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={goBack} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {order.orderNumber}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}
            >
              {statusConfig.label}
            </span>
          </div>
          <p className="text-gray-600">{order.name}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {order.status === "paid" && (
            <button
              onClick={startProcessing}
              disabled={isUpdating}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              Bắt đầu xử lý
            </button>
          )}
          {order.status === "processing" && (
            <button
              onClick={completeKitting}
              disabled={isUpdating}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
            >
              <Package className="w-4 h-4" />
              Hoàn tất đóng gói
            </button>
          )}
          {(order.status === "kitting" || order.status === "processing") &&
            selectedRecipients.length > 0 && (
              <button
                onClick={() => setShowShipModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <Truck className="w-4 h-4" />
                Gửi hàng ({selectedRecipients.length})
              </button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Order Info & Recipients */}
        <div className="lg:col-span-2 space-y-6">
          <OrderInfo order={order} />
          <RecipientTable
            recipients={order.recipientShipments || []}
            selectedRecipients={selectedRecipients}
            onToggleRecipient={toggleRecipient}
            onToggleAll={toggleAllRecipients}
            onViewTracking={(recipientId) => {
              console.log("View tracking:", recipientId);
            }}
          />
        </div>

        {/* Right: Activity Log */}
        <div>
          <ActivityLog activities={activityLog} />
        </div>
      </div>

      {/* Shipment Modal */}
      <ShipmentModal
        isOpen={showShipModal}
        onClose={() => setShowShipModal(false)}
        selectedCount={selectedRecipients.length}
        carriers={carriers}
        carrier={carrier}
        trackingNumber={trackingNumber}
        onCarrierChange={setCarrier}
        onTrackingChange={setTrackingNumber}
        onSubmit={handleMarkShipped}
        isUpdating={isUpdating}
      />

      {/* Chat Widget */}
      {order && (
        <OrderChatWidget orderId={order._id} orderNumber={order.orderNumber} />
      )}
    </div>
  );
}
