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
import { formatPrice, formatDate } from "@/features/printer/utils/formatters"; // <-- Import mới
import {
  getStatusBadge,
  getStatusActions,
} from "@/features/printer/utils/orderHelpers"; // <-- Import mới

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
        <TableHeader>{/* ... (TableHead giữ nguyên) ... */}</TableHeader>
        <TableBody>
          {orders.map((order) => {
            const actions = getStatusActions(order.status); // <-- Logic đã được tách
            return (
              <TableRow key={order._id}>
                <TableCell className="font-medium">
                  <Link
                    to={`/printer/orders/${order._id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {order.orderNumber}
                  </Link>
                </TableCell>
                <TableCell>{/* ... (Nội dung giữ nguyên) ... */}</TableCell>
                <TableCell>{/* ... (Nội dung giữ nguyên) ... */}</TableCell>
                <TableCell className="font-semibold text-blue-600">
                  {formatPrice(order.total)} {/* <-- Dùng helper */}
                </TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>{" "}
                {/* <-- Dùng helper */}
                <TableCell className="text-sm text-gray-500">
                  {formatDate(order.createdAt)} {/* <-- Dùng helper */}
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
