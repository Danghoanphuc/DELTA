// features/shop/components/OrderConfirmationSidebar.tsx
import { Link } from "react-router-dom";
import { MapPin, Home, Eye, Mail, Phone } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Order } from "@/types/order";

interface OrderConfirmationSidebarProps {
  order: Order;
}

export const OrderConfirmationSidebar = ({
  order,
}: OrderConfirmationSidebarProps) => (
  <div className="space-y-4 sm:space-y-6">
    {/* Primary Actions */}
    <Card className="shadow-md border-2 border-blue-100 hover:shadow-lg transition-shadow">
      <CardContent className="p-4 sm:p-6 space-y-3">
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 text-base sm:text-lg py-5 sm:py-6"
          asChild
        >
          <Link to={`/my-orders/${order._id}`}>
            <Eye size={20} className="mr-2" />
            Theo dõi đơn hàng
          </Link>
        </Button>
        <Button variant="outline" className="w-full border-2 py-5 sm:py-6" asChild>
          <Link to="/shop">
            <Home size={20} className="mr-2" />
            Tiếp tục mua sắm
          </Link>
        </Button>
      </CardContent>
    </Card>

    {/* Email Confirmation */}
    <Card className="shadow-md bg-green-50 border-green-200 hover:shadow-lg transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <Mail size={24} className="text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
              Email xác nhận đã được gửi
            </p>
            <p className="text-xs sm:text-sm text-gray-600">
              Chi tiết đơn hàng đã gửi về{" "}
              <span className="font-medium break-all">{order.customerEmail}</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Shipping Address */}
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
          <MapPin size={18} className="text-blue-600" />
          Địa chỉ giao hàng
        </h3>
        <div className="text-xs sm:text-sm text-gray-700 space-y-1">
          <p className="font-medium">
            {order.shippingAddress.recipientName}
          </p>
          <p className="text-gray-600 flex items-center gap-1">
            <Phone size={14} className="inline" />
            {order.shippingAddress.phone}
          </p>
          <p className="text-gray-600 mt-2">
            {order.shippingAddress.street}
            {order.shippingAddress.ward && `, ${order.shippingAddress.ward}`}
            <br />
            {order.shippingAddress.district}, {order.shippingAddress.city}
          </p>
          {order.shippingAddress.notes && (
            <p className="text-gray-500 italic mt-2 text-xs">
              Ghi chú: {order.shippingAddress.notes}
            </p>
          )}
        </div>
      </CardContent>
    </Card>

    {/* Support Card */}
    <Card className="shadow-md bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 hover:shadow-lg transition-shadow">
      <CardContent className="p-4 sm:p-6 text-center">
        <p className="text-sm text-gray-600 mb-2">Cần hỗ trợ?</p>
        <a 
          href="tel:19001234" 
          className="inline-flex items-center gap-2 font-semibold text-blue-600 text-lg hover:text-blue-700 transition-colors"
        >
          <Phone size={20} />
          1900 1234
        </a>
        <p className="text-xs text-gray-500 mt-2">
          Hoạt động 24/7 để hỗ trợ bạn
        </p>
      </CardContent>
    </Card>
  </div>
);
