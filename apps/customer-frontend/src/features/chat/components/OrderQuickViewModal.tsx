// src/features/chat/components/OrderQuickViewModal.tsx (CẬP NHẬT)
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Link } from "react-router-dom";
// ✅ BƯỚC 1: IMPORT CONTEXT MỚI
import { useGlobalModalContext } from "@/contexts/GlobalModalProvider";
// ❌ GỠ BỎ: import { useChatContext } from "../context/ChatProvider";
import { Loader2 } from "lucide-react";
import { Order } from "@/types/order";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";

// (getStatusVariant giữ nguyên)
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
  // ✅ BƯỚC 2: SỬ DỤNG CONTEXT MỚI
  const {
    isQuickViewOrderLoading,
    quickViewOrderData: order,
    closeOrderQuickView,
  } = useGlobalModalContext();

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

      {/* 2. Thông tin (Giữ nguyên) */}
      <div className="mt-4 max-h-80 overflow-y-auto pr-2">
        {/* ... (Danh sách sản phẩm) ... */}
        {/* ... (Tổng tiền) ... */}
      </div>

      {/* 3. Footer Nút Bấm */}
      <DialogFooter className="mt-6 sm:justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          className="w-full sm:w-auto"
          asChild
        >
          <Link to={`/orders/${order._id}`} target="_blank">
            Xem chi tiết đầy đủ
          </Link>
        </Button>
        <Button
          type="button"
          className="w-full sm:w-auto"
          onClick={closeOrderQuickView}
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
  // ✅ BƯỚC 3: SỬ DỤNG CONTEXT MỚI
  const { quickViewOrderId, closeOrderQuickView } = useGlobalModalContext();

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
