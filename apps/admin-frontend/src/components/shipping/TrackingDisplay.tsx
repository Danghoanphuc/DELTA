// src/components/shipping/TrackingDisplay.tsx
// ✅ Tracking Display - Hiển thị thông tin tracking và timeline

import { useEffect } from "react";
import { useShipping } from "@/hooks/useShipping";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface TrackingDisplayProps {
  orderId: string;
  recipientId: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

export function TrackingDisplay({
  orderId,
  recipientId,
  autoRefresh = false,
  refreshInterval = 60000, // 1 minute
}: TrackingDisplayProps) {
  const { trackingInfo, getTracking, isLoading } = useShipping();

  useEffect(() => {
    getTracking(orderId, recipientId);

    if (autoRefresh) {
      const interval = setInterval(() => {
        getTracking(orderId, recipientId);
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [orderId, recipientId, autoRefresh, refreshInterval]);

  if (isLoading && !trackingInfo) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!trackingInfo) {
    return (
      <div className="text-center py-8 text-gray-500">
        Không có thông tin tracking
      </div>
    );
  }

  const { recipient, shipment, tracking } = trackingInfo;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      created: "bg-blue-100 text-blue-800",
      picked_up: "bg-yellow-100 text-yellow-800",
      in_transit: "bg-purple-100 text-purple-800",
      out_for_delivery: "bg-orange-100 text-orange-800",
      delivered: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      returned: "bg-gray-100 text-gray-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      created: "Đã tạo đơn",
      picked_up: "Đã lấy hàng",
      in_transit: "Đang vận chuyển",
      out_for_delivery: "Đang giao hàng",
      delivered: "Đã giao hàng",
      failed: "Giao thất bại",
      returned: "Đã hoàn trả",
      cancelled: "Đã hủy",
    };
    return texts[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">
              Tracking: {shipment.trackingNumber}
            </h3>
            <p className="text-sm text-gray-600">
              Carrier: {shipment.carrier.toUpperCase()}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
              tracking.status
            )}`}
          >
            {getStatusText(tracking.status)}
          </span>
        </div>

        {/* Recipient Info */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Người Nhận</h4>
          <p className="text-sm text-gray-600">
            {recipient.name} - {recipient.phone}
          </p>
        </div>

        {/* Estimated Delivery */}
        {tracking.estimatedDelivery && (
          <div className="border-t pt-4 mt-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Dự kiến giao:</span>{" "}
              {format(new Date(tracking.estimatedDelivery), "dd/MM/yyyy", {
                locale: vi,
              })}
            </p>
          </div>
        )}

        {/* Tracking URL */}
        {shipment.trackingUrl && (
          <div className="border-t pt-4 mt-4">
            <a
              href={shipment.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Xem chi tiết trên website carrier →
            </a>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Lịch Sử Vận Chuyển</h3>

        {tracking.events && tracking.events.length > 0 ? (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

            {/* Events */}
            <div className="space-y-6">
              {tracking.events.map((event, index) => (
                <div key={index} className="relative flex gap-4">
                  {/* Timeline dot */}
                  <div
                    className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      index === 0 ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    {index === 0 && (
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    )}
                  </div>

                  {/* Event content */}
                  <div className="flex-1 pb-6">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-medium text-gray-900">
                        {event.description || getStatusText(event.status)}
                      </p>
                      <span className="text-sm text-gray-500">
                        {format(new Date(event.timestamp), "dd/MM/yyyy HH:mm", {
                          locale: vi,
                        })}
                      </span>
                    </div>
                    {event.location && (
                      <p className="text-sm text-gray-600">{event.location}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">
            Chưa có thông tin vận chuyển
          </p>
        )}
      </div>

      {/* Refresh indicator */}
      {autoRefresh && (
        <div className="text-center text-sm text-gray-500">
          <svg
            className="inline-block w-4 h-4 mr-1 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Tự động cập nhật mỗi {refreshInterval / 1000}s
        </div>
      )}
    </div>
  );
}
