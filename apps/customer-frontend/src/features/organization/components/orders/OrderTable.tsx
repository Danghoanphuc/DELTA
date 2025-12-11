// src/features/organization/components/orders/OrderTable.tsx
// ✅ SOLID: Single Responsibility - Table display only

import {
  Send,
  Users,
  MoreHorizontal,
  Eye,
  XCircle,
  Loader2,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import { SwagOrder } from "../../services/swag-order.service";
import { ORDER_STATUS_CONFIG } from "./status-config";

interface OrderTableProps {
  orders: SwagOrder[];
  isLoading: boolean;
  onViewDetail: (orderId: string) => void;
  onCancel: (orderId: string) => void;
  onCreateNew: () => void;
  onOpenChat: (orderId: string) => void;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function OrderTable({
  orders,
  isLoading,
  onViewDetail,
  onCancel,
  onCreateNew,
  onOpenChat,
}: OrderTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Send className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium mb-2">Chưa có đơn gửi quà nào</p>
        <p className="text-sm mb-6">Bắt đầu gửi quà cho team của bạn</p>
        <Button
          className="bg-orange-500 hover:bg-orange-600"
          onClick={onCreateNew}
        >
          <Send className="w-4 h-4 mr-2" />
          Gửi quà ngay
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="p-4 text-left text-sm font-medium text-gray-600">
              Mã đơn
            </th>
            <th className="p-4 text-left text-sm font-medium text-gray-600">
              Tên
            </th>
            <th className="p-4 text-left text-sm font-medium text-gray-600">
              Bộ quà
            </th>
            <th className="p-4 text-center text-sm font-medium text-gray-600">
              Người nhận
            </th>
            <th className="p-4 text-center text-sm font-medium text-gray-600">
              Tiến độ
            </th>
            <th className="p-4 text-center text-sm font-medium text-gray-600">
              Trạng thái
            </th>
            <th className="p-4 text-right text-sm font-medium text-gray-600">
              Tổng tiền
            </th>
            <th className="p-4"></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const statusConfig =
              ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.draft;
            const StatusIcon = statusConfig.icon;
            const deliveredPercent =
              order.totalRecipients > 0
                ? Math.round(
                    (order.stats.delivered / order.totalRecipients) * 100
                  )
                : 0;

            return (
              <tr key={order._id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <span className="font-mono text-sm">{order.orderNumber}</span>
                </td>
                <td className="p-4">
                  <p className="font-medium text-gray-900">{order.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </p>
                </td>
                <td className="p-4 text-gray-600">
                  {order.swagPack?.name || "-"}
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{order.totalRecipients}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${deliveredPercent}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">
                      {deliveredPercent}%
                    </span>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <Badge className={statusConfig.color}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusConfig.label}
                  </Badge>
                </td>
                <td className="p-4 text-right font-medium">
                  {formatCurrency(order.pricing?.total || 0)}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {/* Chat Icon - Always visible */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onOpenChat(order._id)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      title="Chat với admin và shipper"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onViewDetail(order._id)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        {["draft", "pending_info", "pending_payment"].includes(
                          order.status
                        ) && (
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => onCancel(order._id)}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Hủy đơn
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
