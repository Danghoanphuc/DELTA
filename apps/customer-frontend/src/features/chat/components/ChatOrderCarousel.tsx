// src/features/chat/components/ChatOrderCarousel.tsx (ĐÃ SỬA)

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/components/ui/carousel";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
// ✅ BƯỚC 1: IMPORT CONTEXT TOÀN CỤC (GLOBAL)
import { useGlobalModalContext } from "@/contexts/GlobalModalProvider";
// ❌ GỠ BỎ: useChatContext

// ... (Interface và getStatusVariant giữ nguyên) ...
interface SimplifiedOrder {
  _id: string;
  orderNumber: string;
  status: string;
  total: number;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
  }>;
  createdAt: string;
}
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

const ChatOrderCard = ({ order }: { order: SimplifiedOrder }) => {
  // ✅ BƯỚC 2: SỬ DỤNG CONTEXT TOÀN CỤC
  const { openOrderQuickView } = useGlobalModalContext();

  // (Logic an toàn giữ nguyên)
  const firstItem =
    order.items && order.items.length > 0 ? order.items[0] : null;
  const orderTitle = firstItem
    ? firstItem.productName +
      (order.items.length > 1 ? ` và ${order.items.length - 1} sp khác` : "")
    : "Đơn hàng";

  return (
    <Card className="overflow-hidden shadow-md border">
      <CardContent className="p-4">
        {/* (Header thẻ giữ nguyên) */}
        <div className="flex justify-between items-center mb-2">
          <p className="font-semibold text-sm truncate">#{order.orderNumber}</p>
          <Badge
            className={cn(
              "text-xs px-2 py-0.5",
              getStatusVariant(order.status)
            )}
          >
            {order.status}
          </Badge>
        </div>
        <p className="text-xs text-gray-500 mb-3 truncate">{orderTitle}</p>
        <div className="flex items-center justify-between">
          <span className="text-blue-600 font-bold text-sm">
            {order.total.toLocaleString("vi-VN")}đ
          </span>
          {/* ✅ BƯỚC 3: Kích hoạt modal toàn cục */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => openOrderQuickView(order._id)}
          >
            Xem
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ... (Carousel chính giữ nguyên) ...
interface ChatOrderCarouselProps {
  orders: SimplifiedOrder[];
}
export const ChatOrderCarousel = ({ orders }: ChatOrderCarouselProps) => {
  return (
    <Carousel
      opts={{
        align: "start",
        loop: false,
      }}
      className="w-full max-w-xs md:max-w-md"
    >
      <CarouselContent className="-ml-3">
        {orders.map((order) => (
          <CarouselItem key={order._id} className="pl-3 basis-4/5">
            <ChatOrderCard order={order} />
          </CarouselItem>
        ))}
      </CarouselContent>
      {orders.length > 1 && (
        <>
          <CarouselPrevious className="absolute left-2 -translate-y-1/2" />
          <CarouselNext className="absolute right-2 -translate-y-1/2" />
        </>
      )}
    </Carousel>
  );
};
