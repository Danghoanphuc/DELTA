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
import { useGlobalModalContext } from "@/contexts/GlobalModalProvider";
import {
  Package,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

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

// 🔥 STATUS MAPPING: Tinh tế, không dùng màu mặc định
const getStatusConfig = (status: string) => {
  switch (status) {
    case "pending":
      return {
        color: "text-stone-600 bg-stone-100 border-stone-200",
        icon: Clock,
        label: "Đang chờ",
      };
    case "processing":
      return {
        color: "text-amber-700 bg-amber-50 border-amber-200",
        icon: Clock,
        label: "Đang xử lý",
      };
    case "shipping":
      return {
        color: "text-blue-700 bg-blue-50 border-blue-200",
        icon: Package,
        label: "Đang giao",
      };
    case "completed":
      return {
        color: "text-emerald-700 bg-emerald-50 border-emerald-200",
        icon: CheckCircle2,
        label: "Hoàn tất",
      };
    case "cancelled":
      return {
        color: "text-red-700 bg-red-50 border-red-200",
        icon: XCircle,
        label: "Đã hủy",
      };
    default:
      return {
        color: "text-stone-500 bg-stone-50 border-stone-200",
        icon: Package,
        label: status,
      };
  }
};

const ChatOrderCard = ({ order }: { order: SimplifiedOrder }) => {
  const { openOrderQuickView } = useGlobalModalContext();
  const statusConfig = getStatusConfig(order.status || "pending");
  const StatusIcon = statusConfig.icon;

  const firstItem = order.items?.[0];
  const orderTitle = firstItem
    ? firstItem.productName +
      (order.items.length > 1 ? ` (+${order.items.length - 1})` : "")
    : "Đơn hàng";

  return (
    <Card className="group overflow-hidden border border-stone-200 bg-white hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md">
      <CardContent className="p-4">
        {/* Header: Ticket Style with Perforated Line Effect */}
        <div className="flex justify-between items-start mb-3 pb-3 border-b border-dashed border-stone-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-stone-50 flex items-center justify-center border border-stone-100 rounded-sm group-hover:bg-primary/5 group-hover:text-primary transition-colors">
              <Package size={18} strokeWidth={1.5} />
            </div>
            <div>
              {/* Mã đơn dùng Font Mono -> Precision */}
              <p className="font-mono font-bold text-foreground text-sm tracking-tight leading-none">
                #{order.orderNumber || "ORDER"}
              </p>
              <p className="text-[11px] text-muted-foreground font-sans mt-1 uppercase tracking-wider">
                {new Date(order.createdAt).toLocaleDateString("vi-VN")}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "flex items-center gap-1 pl-1.5 pr-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-sm border",
              statusConfig.color
            )}
          >
            <StatusIcon size={10} />
            {statusConfig.label}
          </Badge>
        </div>

        {/* Body */}
        <div className="mb-3 min-h-[40px]">
          <p className="text-[13px] text-stone-700 font-medium font-sans leading-relaxed line-clamp-2">
            {orderTitle}
          </p>
        </div>

        {/* Footer: Price & Action */}
        <div className="flex items-end justify-between pt-1">
          <div>
            <p className="text-[10px] text-stone-400 font-mono uppercase tracking-wider mb-0.5">
              Tổng cộng
            </p>
            {/* Giá tiền dùng Serif & Primary Color -> Elegant & Important */}
            <span className="text-primary font-serif font-bold text-[18px] leading-none">
              {order.total?.toLocaleString("vi-VN") ?? 0}đ
            </span>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => openOrderQuickView(order._id)}
            className="h-8 pr-3 pl-3 text-xs border border-stone-200 hover:border-black hover:bg-black hover:text-white transition-all font-medium rounded-sm"
          >
            Chi tiết <ChevronRight size={14} className="ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const ChatOrderCarousel = ({
  orders,
}: {
  orders: SimplifiedOrder[];
}) => {
  if (!orders?.length) return null;

  return (
    <Carousel
      opts={{ align: "start", loop: false }}
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
          <CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 border-stone-200 bg-white/90 backdrop-blur hover:bg-primary hover:border-primary hover:text-white transition-all" />
          <CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 border-stone-200 bg-white/90 backdrop-blur hover:bg-primary hover:border-primary hover:text-white transition-all" />
        </>
      )}
    </Carousel>
  );
};
