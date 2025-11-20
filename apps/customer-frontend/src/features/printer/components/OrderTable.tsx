// src/features/printer/components/OrderTable.tsx (ĐÃ LÀM SẠCH)
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import { Order, OrderStatus } from "@/types/order";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { formatPrice, formatDate } from "@/features/printer/utils/formatters";
import {
  getStatusBadge,
  getStatusActions,
} from "@/features/printer/utils/orderHelpers";
import { Badge } from "@/shared/components/ui/badge";

interface OrderTableProps {
  orders: Order[];
  loading: boolean;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
}

// ✅ Helper để hiển thị Artwork Status badge
const getArtworkStatusBadge = (status?: string) => {
  const statusConfig: Record<
    string,
    { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
  > = {
    pending_upload: {
      label: "Chờ upload",
      variant: "secondary",
    },
    pending_approval: {
      label: "Chờ duyệt",
      variant: "outline",
    },
    approved: {
      label: "Đã duyệt",
      variant: "default",
    },
    rejected: {
      label: "Từ chối",
      variant: "destructive",
    },
  };

  const config = statusConfig[status || "pending_upload"] || statusConfig.pending_upload;
  return (
    <Badge variant={config.variant} className="whitespace-nowrap">
      {config.label}
    </Badge>
  );
};

export function OrderTable({
  orders,
  loading,
  onUpdateStatus,
}: OrderTableProps) {
  // ✅ DEBUG: Log orders array để kiểm tra
  console.log("🔍 [OrderTable] orders:", orders);
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Mã đơn</TableHead>
            <TableHead>Khách hàng</TableHead>
            <TableHead className="text-right">Tổng tiền</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>File In</TableHead>
            <TableHead>Ngày đặt</TableHead>
            <TableHead className="text-right w-[200px]">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order, index) => {
            // ✅ DEBUG: Log mỗi order để xem _id
            console.log(`🔍 [OrderTable] order[${index}]:`, {
              _id: order._id,
              masterOrderId: order.masterOrderId,
              printerOrderId: order.printerOrderId,
              orderNumber: order.orderNumber,
            });
            
            const actions = getStatusActions(order.status);
            // ✅ FIX: Đảm bảo key luôn unique (dùng index làm fallback)
            const rowKey = order._id || `order-${index}`;
            return (
              <TableRow key={rowKey}>
                <TableCell className="font-medium">
                  <Link
                    to={`/printer/orders/${order._id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {order.orderNumber}
                  </Link>
                </TableCell>
                <TableCell>{order.customerName || "N/A"}</TableCell>
                <TableCell className="font-semibold text-blue-600 text-right">
                  {formatPrice(order.total || 0)}
                </TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
                <TableCell>
                  {getArtworkStatusBadge(
                    (order as any).artworkStatus || "pending_upload"
                  )}
                </TableCell>
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
                    {actions.map((action) => (
                      <Button
                        key={action.status}
                        variant={action.variant || "outline"}
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
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
