// src/features/printer/utils/orderHelpers.ts

import { OrderStatus } from "@/types/order";
import {
  Check,
  Clock,
  Truck,
  Package,
  CheckCircle,
  XCircle,
  AlertCircle,
  Pencil,
  Archive,
  LucideIcon,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
// Định nghĩa cấu hình Status
const statusConfig: Record<
  OrderStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    icon: LucideIcon;
  }
> = {
  pending: { label: "Chờ xác nhận", variant: "secondary", icon: Clock },
  confirmed: { label: "Đã xác nhận", variant: "default", icon: Check },
  designing: { label: "Đang thiết kế", variant: "default", icon: Pencil },
  printing: { label: "Đang in", variant: "default", icon: Package },
  ready: { label: "Sẵn sàng", variant: "default", icon: Archive },
  shipping: { label: "Đang giao", variant: "default", icon: Truck },
  completed: { label: "Hoàn thành", variant: "default", icon: CheckCircle },
  cancelled: { label: "Đã hủy", variant: "destructive", icon: XCircle },
  refunded: { label: "Đã hoàn tiền", variant: "outline", icon: AlertCircle },
};

export const getStatusBadge = (status: OrderStatus) => {
  const config = statusConfig[status];

  if (!config) {
    return (
      <Badge variant="outline" className="gap-1">
        <AlertCircle size={14} />
        {status}
      </Badge>
    );
  }

  const { label, variant, icon: Icon } = config;
  return (
    <Badge variant={variant} className="gap-1 whitespace-nowrap">
      <Icon size={14} />
      {label}
    </Badge>
  );
};

export const getStatusActions = (orderStatus: OrderStatus) => {
  const actions: { label: string; status: OrderStatus; variant?: any }[] = [];

  switch (orderStatus) {
    case "pending":
      actions.push(
        { label: "Xác nhận", status: "confirmed", variant: "default" },
        { label: "Từ chối", status: "cancelled", variant: "destructive" }
      );
      break;
    case "confirmed":
      actions.push({
        label: "Thiết kế",
        status: "designing",
        variant: "default",
      });
      break;
    case "designing":
      actions.push({
        label: "Bắt đầu in",
        status: "printing",
        variant: "default",
      });
      break;
    case "printing":
      actions.push({
        label: "Sẵn sàng giao",
        status: "ready",
        variant: "default",
      });
      break;
    case "ready":
      actions.push({
        label: "Chuyển giao",
        status: "shipping",
        variant: "default",
      });
      break;
    case "shipping":
      actions.push({
        label: "Hoàn thành",
        status: "completed",
        variant: "default",
      });
      break;
    default:
      break;
  }
  return actions;
};
