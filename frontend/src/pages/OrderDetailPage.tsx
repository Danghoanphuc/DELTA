// frontend/src/pages/OrderDetailPage.tsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  User,
  Mail,
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Order, OrderStatus } from "@/types/order";
import { useAuthStore } from "@/stores/useAuthStore";
import api from "@/lib/axios";
import { toast } from "sonner";

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const isPrinter = user?.role === "printer";

  // ==================== FETCH ORDER ====================
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

      setLoading(true);
      try {
        // Endpoint khác nhau cho customer và printer
        const endpoint = isPrinter
          ? `/orders/printer/${orderId}`
          : `/orders/${orderId}`;

        const res = await api.get(endpoint);

        console.log("📦 Order fetched:", res.data);

        setOrder(res.data?.order || res.data?.data?.order);
      } catch (err: any) {
        console.error("❌ Error fetching order:", err);
        toast.error("Không thể tải thông tin đơn hàng");
        navigate(isPrinter ? "/printer/orders" : "/orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, isPrinter, navigate]);

  // ==================== HELPERS ====================
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusConfig = (status: OrderStatus) => {
    const configs: Record<
      OrderStatus,
      {
        label: string;
        icon: any;
        color: string;
        bgColor: string;
      }
    > = {
      pending: {
        label: "Chờ xác nhận",
        icon: Clock,
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
      },
      confirmed: {
        label: "Đã xác nhận",
        icon: CheckCircle,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
      },
      designing: {
        label: "Đang thiết kế",
        icon: Package,
        color: "text-purple-600",
        bgColor: "bg-purple-100",
      },
      printing: {
        label: "Đang in",
        icon: Package,
        color: "text-indigo-600",
        bgColor: "bg-indigo-100",
      },
      ready: {
        label: "Sẵn sàng giao",
        icon: Package,
        color: "text-cyan-600",
        bgColor: "bg-cyan-100",
      },
      shipping: {
        label: "Đang giao hàng",
        icon: Truck,
        color: "text-orange-600",
        bgColor: "bg-orange-100",
      },
      completed: {
        label: "Hoàn thành",
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-100",
      },
      cancelled: {
        label: "Đã hủy",
        icon: XCircle,
        color: "text-red-600",
        bgColor: "bg-red-100",
      },
      refunded: {
        label: "Đã hoàn tiền",
        icon: CreditCard,
        color: "text-gray-600",
        bgColor: "bg-gray-100",
      },
    };

    return configs[status];
  };

  // ==================== LOADING STATE ====================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <MobileNav />
        <div className="lg:ml-20 pt-16 lg:pt-0 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
          </div>
        </div>
      </div>
    );
  }

  // ==================== ERROR STATE ====================
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <MobileNav />
        <div className="lg:ml-20 pt-16 lg:pt-0 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Không tìm thấy đơn hàng
            </h3>
            <Button onClick={() => navigate(isPrinter ? "/" : "/orders")}>
              Quay lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <MobileNav />

      <div className="lg:ml-20 pt-16 lg:pt-0">
        <div className="max-w-6xl mx-auto p-4 md:p-6">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate(isPrinter ? "/" : "/orders")}
              className="mb-4"
            >
              <ArrowLeft size={18} className="mr-2" />
              Quay lại
            </Button>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Chi tiết đơn hàng
                </h1>
                <p className="text-gray-600">Mã đơn: {order.orderNumber}</p>
              </div>

              {/* Status Badge */}
              <div
                className={`${statusConfig.bgColor} ${statusConfig.color} px-4 py-2 rounded-lg flex items-center gap-2 font-semibold`}
              >
                <StatusIcon size={20} />
                {statusConfig.label}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package size={20} className="text-blue-600" />
                    Sản phẩm đặt hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index}>
                      {index > 0 && <Separator className="my-4" />}
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {item.productSnapshot?.images?.[0]?.url ? (
                            <img
                              src={item.productSnapshot.images[0].url}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={32} className="text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {item.productName}
                          </h4>

                          {/* Specifications */}
                          {item.specifications && (
                            <div className="text-sm text-gray-600 space-y-1">
                              {item.specifications.material && (
                                <p>
                                  • Chất liệu: {item.specifications.material}
                                </p>
                              )}
                              {item.specifications.size && (
                                <p>• Kích thước: {item.specifications.size}</p>
                              )}
                              {item.specifications.color && (
                                <p>• In ấn: {item.specifications.color}</p>
                              )}
                            </div>
                          )}

                          {/* Customization */}
                          {item.customization?.notes && (
                            <div className="mt-2 p-2 bg-yellow-50 rounded text-sm text-gray-700">
                              <p className="font-medium">Ghi chú:</p>
                              <p>{item.customization.notes}</p>
                            </div>
                          )}

                          {/* Quantity & Price */}
                          <div className="mt-2 flex items-center gap-4 text-sm">
                            <span className="text-gray-600">
                              Số lượng: <strong>{item.quantity}</strong>
                            </span>
                            <span className="text-gray-600">
                              Đơn giá:{" "}
                              <strong>{formatPrice(item.pricePerUnit)}</strong>
                            </span>
                            <span className="text-blue-600 font-semibold ml-auto">
                              {formatPrice(item.subtotal)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin size={20} className="text-blue-600" />
                    Địa chỉ giao hàng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-semibold text-gray-900">
                      {order.shippingAddress.recipientName}
                    </p>
                    <p className="text-gray-600">
                      {order.shippingAddress.phone}
                    </p>
                    <p className="text-gray-600">
                      {order.shippingAddress.street}
                      {order.shippingAddress.ward &&
                        `, ${order.shippingAddress.ward}`}
                      {`, ${order.shippingAddress.district}`}
                      {`, ${order.shippingAddress.city}`}
                    </p>
                    {order.shippingAddress.notes && (
                      <p className="text-sm text-gray-500 mt-2">
                        Ghi chú: {order.shippingAddress.notes}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Customer Notes (if any) */}
              {order.customerNotes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Ghi chú đơn hàng
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{order.customerNotes}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Summary & Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Tổng quan đơn hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tạm tính:</span>
                    <span className="font-medium">
                      {formatPrice(order.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phí vận chuyển:</span>
                    <span className="font-medium">
                      {formatPrice(order.shippingFee)}
                    </span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Giảm giá:</span>
                      <span className="font-medium">
                        -{formatPrice(order.discount)}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng:</span>
                    <span className="text-blue-600">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CreditCard size={18} className="text-blue-600" />
                    Thanh toán
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phương thức:</span>
                    <span className="font-medium">
                      {order.paymentMethod === "cod" &&
                        "Thanh toán khi nhận hàng"}
                      {order.paymentMethod === "bank-transfer" &&
                        "Chuyển khoản"}
                      {order.paymentMethod === "momo" && "MoMo"}
                      {order.paymentMethod === "zalopay" && "ZaloPay"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    <Badge
                      variant={
                        order.paymentStatus === "paid" ? "default" : "secondary"
                      }
                    >
                      {order.paymentStatus === "paid" && "Đã thanh toán"}
                      {order.paymentStatus === "pending" && "Chờ thanh toán"}
                      {order.paymentStatus === "refunded" && "Đã hoàn tiền"}
                    </Badge>
                  </div>
                  {order.payment.paidAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Thời gian:</span>
                      <span className="text-sm">
                        {formatDate(order.payment.paidAt)}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Info */}
              {isPrinter ? (
                // Show customer info for printer
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <User size={18} className="text-blue-600" />
                      Thông tin khách hàng
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <span>{order.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-gray-400" />
                      <span>{order.customerEmail}</span>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                // Show printer info for customer
                order.printerId && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Package size={18} className="text-blue-600" />
                        Nhà in
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <p className="font-semibold">
                        {order.printerId.displayName}
                      </p>
                    </CardContent>
                  </Card>
                )
              )}

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Lịch sử đơn hàng</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.statusHistory?.map((history, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              index === 0 ? "bg-blue-600" : "bg-gray-300"
                            }`}
                          />
                          {index < (order.statusHistory?.length || 0) - 1 && (
                            <div className="w-0.5 h-full bg-gray-200 my-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium text-sm">
                            {getStatusConfig(history.status).label}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(history.timestamp)}
                          </p>
                          {history.note && (
                            <p className="text-xs text-gray-600 mt-1">
                              {history.note}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
