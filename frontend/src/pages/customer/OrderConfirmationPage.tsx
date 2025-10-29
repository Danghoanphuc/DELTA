// frontend/src/pages/customer/OrderConfirmationPage.tsx

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  CheckCircle,
  Package,
  MapPin,
  Clock,
  Home,
  Eye,
  Copy,
  Mail,
  MessageCircle,
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Order } from "@/types/order";
import api from "@/lib/axios";
import { toast } from "sonner";

export function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAnimation, setShowAnimation] = useState(false);
  const [copiedOrderNumber, setCopiedOrderNumber] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        navigate("/");
        return;
      }

      try {
        const res = await api.get(`/orders/${orderId}`);
        setOrder(res.data?.order || res.data?.data?.order);
        // Trigger animation after data loads
        setTimeout(() => setShowAnimation(true), 100);
      } catch (err: any) {
        console.error("❌ Error fetching order:", err);
        toast.error("Không thể tải thông tin đơn hàng");
        navigate("/shop");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  const handleCopyOrderNumber = () => {
    if (order?.orderNumber) {
      navigator.clipboard.writeText(order.orderNumber);
      setCopiedOrderNumber(true);
      toast.success("Đã sao chép mã đơn hàng!");
      setTimeout(() => setCopiedOrderNumber(false), 2000);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getEstimatedDelivery = () => {
    if (!order) return "";
    const orderDate = new Date(order.createdAt);
    const minDays = 3; // Customize based on your business
    const maxDays = 5;
    const minDate = new Date(orderDate);
    const maxDate = new Date(orderDate);
    minDate.setDate(minDate.getDate() + minDays);
    maxDate.setDate(maxDate.getDate() + maxDays);

    return `${minDate.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    })} - ${maxDate.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Đang xử lý đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-100">
      <Sidebar />
      <MobileNav />

      <div className="lg:ml-20 pt-16 lg:pt-0">
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          {/* Success Animation & Header */}
          <div
            className={`text-center mb-8 transition-all duration-700 ${
              showAnimation
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-10"
            }`}
          >
            {/* Animated Checkmark */}
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 md:w-32 md:h-32 mx-auto">
                <div
                  className={`absolute inset-0 bg-green-100 rounded-full transition-transform duration-500 ${
                    showAnimation ? "scale-100" : "scale-0"
                  }`}
                ></div>
                <div
                  className={`absolute inset-2 bg-green-500 rounded-full flex items-center justify-center transition-all duration-700 delay-200 ${
                    showAnimation
                      ? "scale-100 opacity-100"
                      : "scale-0 opacity-0"
                  }`}
                >
                  <CheckCircle
                    size={48}
                    className="text-white animate-bounce-slow"
                  />
                </div>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              🎉 Đặt hàng thành công!
            </h1>
            <p className="text-gray-600 text-lg mb-6">
              Cảm ơn bạn đã tin tưởng PrintZ. Chúng tôi sẽ chăm chút từng chi
              tiết để mang đến sản phẩm hoàn hảo nhất!
            </p>

            {/* Order Number with Copy */}
            <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg border-2 border-blue-100">
              <span className="text-sm text-gray-600">Mã đơn hàng:</span>
              <span className="text-xl font-bold text-blue-600">
                {order.orderNumber}
              </span>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleCopyOrderNumber}
                className="h-8 w-8 hover:bg-blue-50"
              >
                {copiedOrderNumber ? (
                  <CheckCircle size={16} className="text-green-600" />
                ) : (
                  <Copy size={16} className="text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Order Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Estimated Delivery - MOST IMPORTANT */}
              <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Clock size={32} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">
                        Thời gian dự kiến nhận hàng
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        {getEstimatedDelivery()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        (3-5 ngày làm việc kể từ khi xác nhận)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card className="shadow-md">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">
                    Tóm tắt đơn hàng
                  </h3>
                  <div className="space-y-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex gap-3 text-sm">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0">
                          {item.productSnapshot?.images?.[0] && (
                            <img
                              src={item.productSnapshot.images[0].url}
                              alt={item.productName}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {item.productName}
                          </p>
                          <p className="text-gray-500">
                            {item.quantity} x {formatPrice(item.pricePerUnit)}
                          </p>
                        </div>
                        <p className="font-semibold text-blue-600">
                          {formatPrice(item.subtotal)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="border-t mt-4 pt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tạm tính:</span>
                      <span>{formatPrice(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phí vận chuyển:</span>
                      <span>{formatPrice(order.shippingFee)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Tổng cộng:</span>
                      <span className="text-blue-600">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Actions & Info */}
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
                  <Button
                    variant="outline"
                    className="w-full border-2 py-6"
                    asChild
                  >
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
                        Chúng tôi đã gửi chi tiết đơn hàng về{" "}
                        <span className="font-medium">
                          {order.customerEmail}
                        </span>
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
                    <p className="text-gray-600">
                      {order.shippingAddress.phone}
                    </p>
                    <p className="text-gray-600 mt-2">
                      {order.shippingAddress.street}
                      {order.shippingAddress.ward &&
                        `, ${order.shippingAddress.ward}`}
                      <br />
                      {order.shippingAddress.district},{" "}
                      {order.shippingAddress.city}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* AI Assistant Widget */}
              <Card className="shadow-md bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                      <MessageCircle size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">
                        PrintZ Assistant
                      </p>
                      <p className="text-sm text-gray-600 mb-3">
                        Nếu bạn cần chỉnh sửa hoặc có thắc mắc về đơn hàng, cứ
                        hỏi tôi nhé! Tôi luôn ở đây 😊
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-purple-300 hover:bg-purple-100"
                        asChild
                      >
                        <Link to="/">Chat với AI</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Promo Badge */}
              <Card className="shadow-md bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    🎁 Cảm ơn bạn đã đặt hàng!
                  </p>
                  <div className="bg-white px-4 py-2 rounded-lg border-2 border-dashed border-orange-300 mb-2">
                    <p className="text-lg font-bold text-orange-600">
                      PRINTZ15
                    </p>
                  </div>
                  <p className="text-xs text-gray-600">
                    Giảm 15% cho đơn hàng tiếp theo
                    <br />
                    (Có hiệu lực trong 30 ngày)
                  </p>
                </CardContent>
              </Card>

              {/* Support */}
              <Card className="shadow-md">
                <CardContent className="p-6 text-center text-sm text-gray-600">
                  <p className="mb-2">Cần hỗ trợ?</p>
                  <p className="font-semibold text-blue-600">📞 1900 1234</p>
                  <p className="text-xs mt-2">Hotline hỗ trợ 24/7</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
