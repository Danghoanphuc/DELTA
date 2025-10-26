// src/components/printer/OrderTable.tsx (COMPONENT MỚI)
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Order, OrderStatus } from "@/types/order";
import { Link } from "react-router-dom";
import {
  Eye,
  Check,
  Clock,
  Truck,
  Package,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

// ==================== HELPERS (Chuyển vào component con) ====================
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getStatusBadge = (status: OrderStatus) => {
  const config: Record<
    OrderStatus,
    {
      label: string;
      variant: "default" | "secondary" | "destructive" | "outline";
      icon: any;
    }
  > = {
    pending: { label: "Chờ xác nhận", variant: "secondary", icon: Clock },
    confirmed: { label: "Đã xác nhận", variant: "default", icon: Check },
    printing: { label: "Đang in", variant: "default", icon: Package },
    shipping: { label: "Đang giao", variant: "default", icon: Truck },
    completed: { label: "Hoàn thành", variant: "default", icon: CheckCircle },
    cancelled: { label: "Đã hủy", variant: "destructive", icon: XCircle },
    refunded: {
      label: "Đã hoàn tiền",
      variant: "outline",
      icon: AlertCircle,
    },
  };

  const { label, variant, icon: Icon } = config[status];
  return (
    <Badge variant={variant} className="gap-1">
      <Icon size={14} />
      {label}
    </Badge>
  );
};

const getStatusActions = (order: Order) => {
  const actions: { label: string; status: OrderStatus; variant?: any }[] = [];

  switch (order.status) {
    case "pending":
      actions.push(
        { label: "Xác nhận", status: "confirmed", variant: "default" },
        { label: "Từ chối", status: "cancelled", variant: "destructive" }
      );
      break;
    case "confirmed":
      actions.push({
        label: "Bắt đầu in",
        status: "printing",
        variant: "default",
      });
      break;
    case "printing":
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
  }
  return actions;
};
// =================================================================

interface OrderTableProps {
  orders: Order[];
  loading: boolean;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
}

export function OrderTable({
  orders,
  loading,
  onUpdateStatus,
}: OrderTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã đơn</TableHead>
            <TableHead>Khách hàng</TableHead>
            <TableHead>Sản phẩm</TableHead>
            <TableHead>Tổng tiền</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ngày đặt</TableHead>
            <TableHead className="text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order._id}>
              <TableCell className="font-medium">
                <Link
                  to={`/printer/orders/${order._id}`}
                  className="text-blue-600 hover:underline"
                >
                  {order.orderNumber}
                </Link>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{order.customerName}</p>
                  <p className="text-xs text-gray-500">{order.customerEmail}</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {order.items.length} sản phẩm
                  <p className="text-xs text-gray-500">
                    {order.items[0]?.productName}
                    {order.items.length > 1 && ` +${order.items.length - 1}`}
                  </p>
                </div>
              </TableCell>
              <TableCell className="font-semibold text-blue-600">
                {formatPrice(order.total)}
              </TableCell>
              <TableCell>{getStatusBadge(order.status)}</TableCell>
              <TableCell className="text-sm text-gray-500">
                {formatDate(order.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Xem chi tiết"
                    asChild
                  >
                    <Link to={`/printer/orders/${order._id}`}>
                      <Eye size={18} />
                    </Link>
                  </Button>

                  {getStatusActions(order).map((action) => (
                    <Button
                      key={action.status}
                      variant={action.variant || "ghost"}
                      size="sm"
                      onClick={() => onUpdateStatus(order._id, action.status)}
                      disabled={loading}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
