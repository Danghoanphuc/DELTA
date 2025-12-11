// src/components/fulfillment/OrderCard.tsx
// ✅ SOLID: Single Responsibility - Display draggable order card

import { DragEvent } from "react";
import {
  GripVertical,
  Users,
  Building2,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { SwagOrder } from "@/services/admin.swag-operations.service";

interface OrderCardProps {
  order: SwagOrder;
  isDragging?: boolean;
  isUpdating?: boolean;
  draggable?: boolean;
  onDragStart?: (e: DragEvent, order: SwagOrder) => void;
  onDragEnd?: () => void;
  onClick?: () => void;
  onAction?: () => void;
  actionLabel?: string;
  actionColor?: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function OrderCard({
  order,
  isDragging = false,
  isUpdating = false,
  draggable = true,
  onDragStart,
  onDragEnd,
  onClick,
  onAction,
  actionLabel,
  actionColor,
}: OrderCardProps) {
  return (
    <div
      draggable={draggable}
      onDragStart={(e) => onDragStart?.(e, order)}
      onDragEnd={onDragEnd}
      className={`bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-50" : ""
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-2">
          <GripVertical className="w-4 h-4 text-gray-300 mt-1 flex-shrink-0" />
          <div>
            <p className="font-mono text-sm font-medium text-orange-600">
              {order.orderNumber}
            </p>
            <p className="text-sm text-gray-600 truncate max-w-44">
              {order.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          {order.totalRecipients}
        </div>
      </div>

      {/* Organization */}
      <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
        <Building2 className="w-4 h-4" />
        <span className="truncate">{order.organization?.businessName}</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">{formatDate(order.createdAt)}</span>
        <span className="font-medium">
          {formatCurrency(order.pricing?.total || 0)}
        </span>
      </div>

      {/* Action Button */}
      {onAction && actionLabel && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAction();
          }}
          disabled={isUpdating}
          className={`w-full mt-3 py-2 rounded-lg text-sm font-medium text-white ${actionColor} disabled:opacity-50`}
        >
          {isUpdating ? (
            <RefreshCw className="w-4 h-4 animate-spin mx-auto" />
          ) : (
            <span className="flex items-center justify-center gap-2">
              {actionLabel}
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </button>
      )}
    </div>
  );
}
