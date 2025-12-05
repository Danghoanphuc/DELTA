// src/features/organization/components/orders/status-config.ts
// ✅ SOLID: Single Responsibility - Status configuration only

import {
  Clock,
  CheckCircle,
  RefreshCw,
  Package,
  Truck,
  XCircle,
} from "lucide-react";

export const ORDER_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: any }
> = {
  draft: { label: "Nháp", color: "bg-gray-100 text-gray-700", icon: Clock },
  pending_info: {
    label: "Chờ thông tin",
    color: "bg-yellow-100 text-yellow-700",
    icon: Clock,
  },
  pending_payment: {
    label: "Chờ thanh toán",
    color: "bg-orange-100 text-orange-700",
    icon: Clock,
  },
  paid: {
    label: "Đã thanh toán",
    color: "bg-blue-100 text-blue-700",
    icon: CheckCircle,
  },
  processing: {
    label: "Đang xử lý",
    color: "bg-blue-100 text-blue-700",
    icon: RefreshCw,
  },
  kitting: {
    label: "Đang đóng gói",
    color: "bg-purple-100 text-purple-700",
    icon: Package,
  },
  shipped: {
    label: "Đang giao",
    color: "bg-indigo-100 text-indigo-700",
    icon: Truck,
  },
  delivered: {
    label: "Đã giao",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Đã hủy",
    color: "bg-red-100 text-red-700",
    icon: XCircle,
  },
  failed: {
    label: "Thất bại",
    color: "bg-red-100 text-red-700",
    icon: XCircle,
  },
};

export const SHIPMENT_STATUS_CONFIG: Record<
  string,
  { label: string; color: string }
> = {
  pending: { label: "Chờ xử lý", color: "bg-gray-100 text-gray-700" },
  processing: { label: "Đang xử lý", color: "bg-blue-100 text-blue-700" },
  shipped: { label: "Đã gửi", color: "bg-indigo-100 text-indigo-700" },
  in_transit: {
    label: "Đang vận chuyển",
    color: "bg-purple-100 text-purple-700",
  },
  out_for_delivery: {
    label: "Đang giao",
    color: "bg-orange-100 text-orange-700",
  },
  delivered: { label: "Đã giao", color: "bg-green-100 text-green-700" },
  failed: { label: "Thất bại", color: "bg-red-100 text-red-700" },
};
