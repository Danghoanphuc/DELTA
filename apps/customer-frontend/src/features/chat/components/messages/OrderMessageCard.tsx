// apps/customer-frontend/src/features/chat/components/messages/OrderMessageCard.tsx
// ✅ RICH MESSAGES: Order card component for chat

import { Link } from "react-router-dom";
import { Package, ExternalLink, Clock } from "lucide-react";
import { OrderMetadata } from "@/types/chat";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";

interface OrderMessageCardProps {
  metadata: OrderMetadata;
  isUserMessage?: boolean;
}

// Status badge colors
const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  shipping: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

// Status labels in Vietnamese
const statusLabels: Record<string, string> = {
  pending: "Chờ xử lý",
  processing: "Đang xử lý",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
  completed: "Hoàn thành",
};

export function OrderMessageCard({ metadata, isUserMessage = false }: OrderMessageCardProps) {
  const {
    orderId,
    orderNumber,
    status = "pending",
    totalAmount,
    ...rest
  } = metadata;

  // Format price
  const formattedTotal = totalAmount
    ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(totalAmount)
    : "Liên hệ";

  // Order link
  const orderLink = `/orders/${orderId}`;

  // Get status color
  const statusColor = statusColors[status as keyof typeof statusColors] || statusColors.pending;
  const statusLabel = statusLabels[status] || status;

  return (
    <div
      className={cn(
        "rounded-lg shadow-sm border overflow-hidden max-w-sm",
        "bg-white dark:bg-gray-800",
        "border-gray-200 dark:border-gray-700",
        "transition-all hover:shadow-md"
      )}
    >
      {/* Order Header */}
      <div className="p-3 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                Đơn hàng #{orderNumber || orderId.slice(-6)}
              </div>
            </div>
          </div>
          
          <Badge className={cn("text-xs font-medium", statusColor)}>
            {statusLabel}
          </Badge>
        </div>
      </div>

      {/* Order Details */}
      <div className="p-3">
        {/* Total Amount */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Tổng tiền:
          </span>
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {formattedTotal}
          </span>
        </div>

        {/* Additional Info (optional) */}
        {rest.createdAt && (
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
            <Clock className="w-3 h-3" />
            <span>
              {new Date(rest.createdAt as string).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </span>
          </div>
        )}

        {/* Action Button */}
        <Link to={orderLink} className="block">
          <Button
            size="sm"
            variant="outline"
            className="w-full h-9 text-sm"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Xem chi tiết đơn hàng
          </Button>
        </Link>
      </div>
    </div>
  );
}

