// frontend/src/pages/OrderDetailPage.tsx (NEW FILE)

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  User,
  Phone,
  Mail,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Order, OrderStatus } from "@/types/order";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/useAuthStore";

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const isPrinter = user?.role === "printer";

  // ==================== FETCH ORDER ====================
  const fetchOrder = async () => {
    if (!orderId) return;

    setLoading(true);
    try {
      const endpoint = isPrinter
        ? `/orders/printer/${orderId}`
        : `/orders/${orderId}`;

      const res = await api.get(endpoint);
      setOrder(res.data.order);
    } catch (err: any) {
      console.error("❌ Error fetching order:", err);
      toast.error("Không thể tải thông tin đơn hàng");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  // ==================== UPDATE STATUS (PRINTER ONLY) ====================
  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    if (!order || !isPrinter) return;

    setUpdating(true);
    try {
      await api.put(`/orders/printer/${order._id}/status`, {
        status: newStatus,
      });

      setOrder({ ...order, status: newStatus });
      toast.success("✅ Đã cập nhật trạng thái đơn hàng");
    } catch (err: any) {
      console.error("❌ Update Status Error:", err);
      toast.error("Không thể cập nhật trạng thái");
    } finally {
      setUpdating(false);
    }
  };

  // ==================== HELPERS ====================
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: OrderStatus) => {
    const config: Record<OrderStatus, { label: string; color: string }> = {
      pending: {
        label: "Chờ xác nhận",
        color: "bg-yellow-100 text-yellow-800",
      },
      confirmed: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-800" },
      printing: { label: "Đang in", color: "bg-purple-100 text-purple-800" },
      shipping: { label: "Đang giao", color: "bg-cyan-100 text-cyan-800" },
      completed: { label: "Hoàn thành", color: "bg-green-100 text-green-800" },
      cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-800" },
      refunded: { label: "Đã hoàn tiền", color: "bg-gray-100 text-gray-800" },
    };

    const { label, color } = config[status];
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>
        {label}
      </span>
    );
  };

  const getStatusActions = () => {
    if (!order || !isPrinter) return [];

    const actions: { label: string; status: OrderStatus; variant?: any }[] = [];

    switch (order.status) {
      case "pending":
        actions.push(
          { label: "✓ Xác nhận đơn", status: "confirmed", variant: "default" },
          { label: "✗ Từ chối", status: "cancelled", variant: "destructive" }
        );
        break;
      case "confirmed":
        actions.push({
          label: "🖨️ Bắt đầu in",
          status: "printing",
          variant: "default",
        });
        break;
      case "printing":
        actions.push({
          label: "🚚 Chuyển giao hàng",
          status: "shipping",
          variant: "default",
        });
        break;
      case "shipping":
        actions.push({
          label: "✅ Hoàn thành",
          status: "completed",
          variant: "default",
        });
        break;
    }

    return actions;
  };

  // ==================== LOADING ====================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Không tìm thấy đơn hàng</p>
      </div>
    );
  }

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
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft size={18} className="mr-2" />
              Quay lại
            </Button>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Đơn hàng #{order.orderNumber}
                </h1>
                <p className="text-gray-600">
                  Đặt ngày: {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="flex flex-col items-start md:items-end gap-3">
                {getStatusBadge(order.status)}
                {isPrinter && getStatusActions().length > 0 && (
                  <div className="flex gap-2">
                    {getStatusActions().map((action) => (
                      <Button
                        key={action.status}
                        variant={action.variant}
                        size="sm"
                        onClick={() => handleUpdateStatus(action.status)}
                        disabled={updating}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
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
                      <div className="flex gap-4">
                        {item.productSnapshot?.images?.[0] && (
                          <img
                            src={item.productSnapshot.images[0].url}
                            alt={item.productName}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {item.productName}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            Nhà in: {item.printerName}
                          </p>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                              {formatPrice(item.pricePerUnit)} x {item.quantity}
                            </p>
                            <p className="font-semibold text-blue-600">
                              {formatPrice(item.subtotal)}
                            </p>
                          </div>
                          {item.customization?.notes && (
                            <p className="text-xs text-gray-500 mt-2 italic">
                              Ghi chú: {item.customization.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      {index < order.items.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Customer Info (Printer View) */}
              {isPrinter && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User size={20} className="text-blue-600" />
                      Thông tin khách hàng
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User size={18} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Tên khách hàng</p>
                        <p className="font-medium">{order.customerName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail size={18} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{order.customerEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={18} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Số điện thoại</p>
                        <p className="font-medium">
                          {order.shippingAddress.phone}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Order Timeline */}
              {order.statusHistory && order.statusHistory.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock size={20} className="text-blue-600" />
                      Lịch sử đơn hàng
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {order.statusHistory.map((history, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                            {index < order.statusHistory!.length - 1 && (
                              <div className="w-0.5 h-full bg-gray-300 my-1"></div>
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <p className="font-medium text-gray-900">
                              {getStatusBadge(history.status)}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {formatDate(history.timestamp.toString())}
                            </p>
                            {history.note && (
                              <p className="text-sm text-gray-600 mt-1">
                                {history.note}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin size={20} className="text-blue-600" />
                    Địa chỉ giao hàng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium text-gray-900 mb-1">
                    {order.shippingAddress.recipientName}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    {order.shippingAddress.phone}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.shippingAddress.street}
                    {order.shippingAddress.ward &&
                      `, ${order.shippingAddress.ward}`}
                    <br />
                    {order.shippingAddress.district},{" "}
                    {order.shippingAddress.city}
                  </p>
                  {order.shippingAddress.notes && (
                    <p className="text-xs text-gray-500 mt-2 italic">
                      Ghi chú: {order.shippingAddress.notes}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Payment Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard size={20} className="text-blue-600" />
                    Thanh toán
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phương thức:</span>
                    <span className="font-medium">
                      {order.paymentMethod === "cod" ? "COD" : "Chuyển khoản"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Trạng thái:</span>
                    <span
                      className={`font-medium ${
                        order.paymentStatus === "paid"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {order.paymentStatus === "paid"
                        ? "Đã thanh toán"
                        : "Chưa thanh toán"}
                    </span>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tạm tính:</span>
                      <span>{formatPrice(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phí vận chuyển:</span>
                      <span>{formatPrice(order.shippingFee)}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Giảm giá:</span>
                        <span>-{formatPrice(order.discount)}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng:</span>
                    <span className="text-blue-600">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {order.customerNotes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Ghi chú từ khách hàng
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      {order.customerNotes}
                    </p>
                  </CardContent>
                </Card>
              )}

              {isPrinter && order.printerNotes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Ghi chú nội bộ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      {order.printerNotes}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
