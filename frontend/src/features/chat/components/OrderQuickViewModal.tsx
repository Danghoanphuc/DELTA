// src/features/chat/components/OrderQuickViewModal.tsx (TẠO MỚI)

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Link } from "react-router-dom";
import { useChatContext } from "../context/ChatProvider";
import { Loader2 } from "lucide-react";
import { Order } from "@/types/order";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";

const getStatusVariant = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-blue-100 text-blue-800";
  }
};

/**
 * Nội dung bên trong Modal
 */
const OrderQuickViewContent = () => {
  const {
    isQuickViewOrderLoading,
    quickViewOrderData: order,
    closeOrderQuickView, // <-- Lấy hàm đóng
  } = useChatContext();

  if (isQuickViewOrderLoading || !order) {
    return (
      <div className="flex items-center justify-center h-80">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      {/* 1. Header */}
      <DialogHeader>
        <DialogTitle className="text-lg font-bold flex justify-between items-center">
          <span>Đơn hàng #{order.orderNumber}</span>
          <Badge
            className={cn("text-sm px-3 py-1", getStatusVariant(order.status))}
          >
            {order.status}
          </Badge>
        </DialogTitle>
      </DialogHeader>

      {/* 2. Thông tin */}
      <div className="mt-4 max-h-80 overflow-y-auto pr-2">
        {/* Danh sách sản phẩm */}
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.productId} className="flex gap-3">
              <div className="w-16 h-16 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden">
                <img
                  src={
                    item.productSnapshot?.images?.[0]?.url ||
                    "/placeholder-product.jpg"
                  }
                  alt={item.productName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-grow">
                <p className="font-semibold text-sm">{item.productName}</p>
                <p className="text-xs text-gray-500">
                  {item.quantity} x {item.pricePerUnit.toLocaleString("vi-VN")}đ
                </p>
              </div>
              <p className="font-semibold text-sm text-right">
                {item.subtotal.toLocaleString("vi-VN")}đ
              </p>
            </div>
          ))}
        </div>

        {/* Tổng tiền */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between text-sm">
            <p className="text-gray-600">Tạm tính</p>
            <p>{order.subtotal.toLocaleString("vi-VN")}đ</p>
          </div>
          <div className="flex justify-between text-sm">
            <p className="text-gray-600">Phí vận chuyển</p>
            <p>{order.shippingFee.toLocaleString("vi-VN")}đ</p>
          </div>
          <div className="flex justify-between font-bold text-base mt-2">
            <p>Tổng cộng</p>
            <p className="text-blue-600">
              {order.total.toLocaleString("vi-VN")}đ
            </p>
          </div>
        </div>
      </div>

      {/* 3. Footer Nút Bấm */}
      <DialogFooter className="mt-6 sm:justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          className="w-full sm:w-auto"
          asChild
        >
          {/* Nút "Xem chi tiết" (mở tab mới) */}
          <Link to={`/account/orders/${order._id}`} target="_blank">
            Xem chi tiết đầy đủ
          </Link>
        </Button>
        {/* Nút "Đóng" (Sửa P1) */}
        <Button
          type="button"
          className="w-full sm:w-auto"
          onClick={closeOrderQuickView} // <-- Sửa P1
        >
          Đóng
        </Button>
      </DialogFooter>
    </>
  );
};

/**
 * Component Modal chính
 */
export const OrderQuickViewModal = () => {
  const { quickViewOrderId, closeOrderQuickView } = useChatContext();

  return (
    <Dialog
      open={!!quickViewOrderId}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          closeOrderQuickView();
        }
      }}
    >
      <DialogContent className="sm:max-w-md p-6">
        <OrderQuickViewContent />
      </DialogContent>
    </Dialog>
  );
};
