// apps/customer-frontend/src/features/delivery-checkin/components/CheckinHistoryItem.tsx
/**
 * Individual check-in item in the history list
 * Displays thumbnail, timestamp, address, and order number
 *
 * Requirements: 9.2 - show thumbnail, timestamp, address, and order number
 */

import { MapPin, Clock, Package, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import type { DeliveryCheckin } from "../types";

interface CheckinHistoryItemProps {
  checkin: DeliveryCheckin;
  onView: (checkinId: string) => void;
  onDelete: (checkinId: string) => void;
  isDeleting?: boolean;
}

const STATUS_CONFIG = {
  pending: {
    label: "Đang xử lý",
    variant: "secondary" as const,
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  completed: {
    label: "Hoàn thành",
    variant: "default" as const,
    className: "bg-green-100 text-green-700 border-green-200",
  },
  failed: {
    label: "Thất bại",
    variant: "destructive" as const,
    className: "bg-red-100 text-red-700 border-red-200",
  },
};

export function CheckinHistoryItem({
  checkin,
  onView,
  onDelete,
  isDeleting,
}: CheckinHistoryItemProps) {
  const statusConfig = STATUS_CONFIG[checkin.status] || STATUS_CONFIG.pending;
  const primaryPhoto = checkin.photos?.[0];

  // Format date and time
  const checkinDate = new Date(checkin.checkinAt);
  const formattedDate = checkinDate.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const formattedTime = checkinDate.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Bạn có chắc chắn muốn xóa check-in này?")) {
      onDelete(checkin._id);
    }
  };

  return (
    <div
      className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onView(checkin._id)}
    >
      <div className="p-4">
        <div className="flex gap-4">
          {/* Thumbnail - Requirements: 9.2 */}
          <div className="flex-shrink-0">
            {primaryPhoto ? (
              <img
                src={primaryPhoto.thumbnailUrl}
                alt="Check-in photo"
                className="w-20 h-20 object-cover rounded-lg"
                loading="lazy"
              />
            ) : (
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Order Number and Status */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-900 truncate">
                  {checkin.orderNumber}
                </span>
              </div>
              <Badge className={statusConfig.className}>
                {statusConfig.label}
              </Badge>
            </div>

            {/* Address - Requirements: 9.2 */}
            <div className="flex items-start gap-2 mb-2">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600 line-clamp-2">
                {checkin.address?.formatted || "Không có địa chỉ"}
              </p>
            </div>

            {/* Timestamp - Requirements: 9.2 */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {formattedDate} lúc {formattedTime}
              </span>
              {checkin.photos?.length > 1 && (
                <span className="text-gray-400">
                  • {checkin.photos.length} ảnh
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col items-center justify-between">
            <ChevronRight className="w-5 h-5 text-gray-400" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 h-auto"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
