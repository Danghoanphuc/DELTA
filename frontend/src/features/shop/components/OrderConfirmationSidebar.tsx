// features/shop/components/OrderConfirmationSidebar.tsx
import { Link } from "react-router-dom";
import { MapPin, Home, Eye, Mail } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Order } from "@/types/order";

interface OrderConfirmationSidebarProps {
  order: Order;
}

export const OrderConfirmationSidebar = ({
  order,
}: OrderConfirmationSidebarProps) => (
  <div className="space-y-6">
    {/* Primary Actions */}
    <Card className="shadow-md border-2 border-blue-100">
      <CardContent className="p-6 space-y-3">
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
          asChild
        >
          <Link to={`/orders/${order._id}`}>
            <Eye size={20} className="mr-2" />
            Theo dõi đơn hàng
          </Link>
        </Button>
        <Button variant="outline" className="w-full border-2 py-6" asChild>
          <Link to="/shop">
            <Home size={20} className="mr-2" />
            Tiếp tục mua sắm
          </Link>
        </Button>
      </CardContent>
    </Card>

    {/* Email Confirmation */}
    <Card className="shadow-md bg-green-50 border-green-200">
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          <Mail size={24} className="text-green-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-gray-900 mb-1">
              Email xác nhận đã được gửi
            </p>
            <p className="text-sm text-gray-600">
              Chi tiết đơn hàng đã gửi về{" "}
              <span className="font-medium">{order.customerEmail}</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Shipping Address */}
    <Card className="shadow-md">
      <CardContent className="p-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <MapPin size={18} className="text-blue-600" />
          Địa chỉ giao hàng
        </h3>
        <div className="text-sm text-gray-700">
          <p className="font-medium mb-1">
            {order.shippingAddress.recipientName}
          </p>
          <p className="text-gray-600">{order.shippingAddress.phone}</p>
          <p className="text-gray-600 mt-2">
            {order.shippingAddress.street}
            {order.shippingAddress.ward && `, ${order.shippingAddress.ward}`}
            <br />
            {order.shippingAddress.district}, {order.shippingAddress.city}
          </p>
        </div>
      </CardContent>
    </Card>

    {/* AI Assistant Widget */}
    <Card className="shadow-md bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
      <CardContent className="p-6">
        {/* ... (Nội dung AI Card) ... */}
      </CardContent>
    </Card>

    {/* Promo Badge */}
    <Card className="shadow-md bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
      <CardContent className="p-6 text-center">
        {/* ... (Nội dung Promo Card) ... */}
      </CardContent>
    </Card>

    {/* Support */}
    <Card className="shadow-md">
      <CardContent className="p-6 text-center text-sm text-gray-600">
        <p className="mb-2">Cần hỗ trợ?</p>
        <p className="font-semibold text-blue-600">📞 1900 1234</p>
      </CardContent>
    </Card>
  </div>
);
