// src/features/organization/components/orders/OrderDetailModal.tsx
// ✅ SOLID: Single Responsibility - Order detail modal only

import { Loader2, CheckCircle, Clock, Mail } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import { SwagOrder } from "../../services/swag-order.service";
import { ORDER_STATUS_CONFIG, SHIPMENT_STATUS_CONFIG } from "./status-config";

interface OrderDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: SwagOrder | null;
  isLoading: boolean;
  onResendEmail: (orderId: string, recipientId: string) => void;
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

export function OrderDetailModal({
  open,
  onOpenChange,
  order,
  isLoading,
  onResendEmail,
}: OrderDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết đơn hàng {order?.orderNumber}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : (
          order && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Tên đợt gửi</p>
                  <p className="font-medium">{order.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Trạng thái</p>
                  <Badge className={ORDER_STATUS_CONFIG[order.status]?.color}>
                    {ORDER_STATUS_CONFIG[order.status]?.label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tổng tiền</p>
                  <p className="font-medium text-orange-600">
                    {formatCurrency(order.pricing?.total || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ngày tạo</p>
                  <p className="font-medium">{formatDate(order.createdAt)}</p>
                </div>
              </div>

              {/* Recipients */}
              <div>
                <h3 className="font-semibold mb-3">
                  Danh sách người nhận ({order.totalRecipients})
                </h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-3 text-left text-sm font-medium text-gray-600">
                          Người nhận
                        </th>
                        <th className="p-3 text-center text-sm font-medium text-gray-600">
                          Thông tin
                        </th>
                        <th className="p-3 text-center text-sm font-medium text-gray-600">
                          Trạng thái
                        </th>
                        <th className="p-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.recipientShipments?.map((shipment, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-3">
                            <p className="font-medium">
                              {shipment.recipientInfo.firstName}{" "}
                              {shipment.recipientInfo.lastName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {shipment.recipientInfo.email}
                            </p>
                          </td>
                          <td className="p-3 text-center">
                            {shipment.selfServiceCompleted ? (
                              <Badge className="bg-green-100 text-green-700">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Đã điền
                              </Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-700">
                                <Clock className="w-3 h-3 mr-1" />
                                Chờ điền
                              </Badge>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <Badge
                              className={
                                SHIPMENT_STATUS_CONFIG[shipment.shipmentStatus]
                                  ?.color
                              }
                            >
                              {
                                SHIPMENT_STATUS_CONFIG[shipment.shipmentStatus]
                                  ?.label
                              }
                            </Badge>
                            {shipment.trackingNumber && (
                              <p className="text-xs text-gray-500 mt-1">
                                #{shipment.trackingNumber}
                              </p>
                            )}
                          </td>
                          <td className="p-3">
                            {!shipment.selfServiceCompleted && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  onResendEmail(order._id, shipment.recipient)
                                }
                              >
                                <Mail className="w-4 h-4" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )
        )}
      </DialogContent>
    </Dialog>
  );
}
