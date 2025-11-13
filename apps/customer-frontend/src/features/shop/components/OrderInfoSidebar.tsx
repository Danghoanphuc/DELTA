// features/shop/components/OrderInfoSidebar.tsx
// (Component này sẽ chứa: Summary, Payment, Contact, Timeline)
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { Badge } from "@/shared/components/ui/badge";
import { CreditCard, User, Mail, Package } from "lucide-react";
import { Order, OrderStatus } from "@/types/order";

interface OrderInfoSidebarProps {
  order: Order;
  isPrinter: boolean;
  formatPrice: (price: number) => string;
  formatDate: (date: string) => string;
  getStatusConfig: (status: OrderStatus) => any;
}

export const OrderInfoSidebar = ({
  order,
  isPrinter,
  formatPrice,
}: OrderInfoSidebarProps) => (
  <div className="space-y-6">
    {/* Order Summary */}
    <Card>
      <CardHeader>
        <CardTitle>Tổng quan đơn hàng</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>Tạm tính:</span>
          <span className="font-medium">{formatPrice(order.subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Phí vận chuyển:</span>
          <span className="font-medium">{formatPrice(order.shippingFee)}</span>
        </div>
        <Separator />
        <div className="flex justify-between text-lg font-bold">
          <span>Tổng cộng:</span>
          <span className="text-blue-600">{formatPrice(order.total)}</span>
        </div>
      </CardContent>
    </Card>

    {/* Payment Info */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CreditCard size={18} className="text-blue-600" /> Thanh toán
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Phương thức:</span>
          <span className="font-medium">
            {order.paymentMethod === "cod" && "Thanh toán khi nhận hàng"}
            {/* ... (các phương thức khác) ... */}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Trạng thái:</span>
          <Badge
            variant={order.paymentStatus === "paid" ? "default" : "secondary"}
          >
            {order.paymentStatus === "paid" && "Đã thanh toán"}
            {order.paymentStatus === "pending" && "Chờ thanh toán"}
          </Badge>
        </div>
      </CardContent>
    </Card>

    {/* Contact Info */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {isPrinter ? (
            <User size={18} className="text-blue-600" />
          ) : (
            <Package size={18} className="text-blue-600" />
          )}
          {isPrinter ? "Thông tin khách hàng" : "Nhà in"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {isPrinter ? (
          <>
            <div className="flex items-center gap-2">
              <User size={16} className="text-gray-400" />
              <span>{order.customerName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-gray-400" />
              <span>{order.customerEmail}</span>
            </div>
          </>
        ) : (
          <p className="font-semibold">{order.printerId?.displayName}</p>
        )}
      </CardContent>
    </Card>

    {/* Timeline */}
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Lịch sử đơn hàng</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {order.statusHistory?.map((_, index) => (
            <div key={index} className="flex gap-3"></div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);
