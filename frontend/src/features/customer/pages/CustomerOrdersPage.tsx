// frontend/src/pages/customer/CustomerOrdersPage.tsx

import { useState, useEffect } from "react";
import { Package, Search, Eye, FileText } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { Order, OrderStatus } from "@/types/order";
import api from "@/shared/lib/axios";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export const CustomerOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/orders/my-orders");
      // KHẮC PHỤC 1: Đọc dữ liệu linh hoạt
      setOrders(res.data?.orders || res.data?.data?.orders || []);
    } catch (err: any) {
      console.error("❌ Error fetching orders:", err);
      toast.error("Không thể tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };
  const handleCancelOrder = async (orderId: string) => {
    if (cancellingId) return; // Không cho hủy 2 lần

    setCancellingId(orderId);
    try {
      // Giả sử endpoint là: PATCH /orders/:id/cancel
      await api.patch(`/orders/${orderId}/cancel`);

      toast.success("Đã hủy đơn hàng thành công");

      // Cập nhật UI ngay lập tức
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: "cancelled" } : order
        )
      );
    } catch (err: any) {
      console.error("❌ Error cancelling order:", err);
      toast.error("Hủy đơn hàng thất bại. Vui lòng thử lại.");
    } finally {
      setCancellingId(null);
    }
  };
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getStatusBadge = (status: OrderStatus) => {
    const statusConfig: Record<
      OrderStatus,
      {
        label: string;
        variant: "default" | "secondary" | "destructive" | "outline";
      }
    > = {
      // (Các trạng thái cũ giữ nguyên)
      pending: { label: "Chờ xác nhận", variant: "secondary" },
      confirmed: { label: "Đã xác nhận", variant: "default" },
      printing: { label: "Đang in", variant: "default" },
      shipping: { label: "Đang giao", variant: "default" },
      completed: { label: "Hoàn thành", variant: "default" },
      cancelled: { label: "Đã hủy", variant: "destructive" },
      refunded: { label: "Đã hoàn tiền", variant: "outline" },

      // KHẮC PHỤC: Bổ sung các trạng thái bị thiếu
      designing: { label: "Đang thiết kế", variant: "default" },
      ready: { label: "Sẵn sàng giao", variant: "default" },
    };

    // Kiểm tra an toàn phòng trường hợp có trạng thái lạ
    const config = statusConfig[status];
    if (!config) {
      return <Badge variant="outline">{status}</Badge>;
    }

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };
  // KHẮC PHỤC 2: Thêm các kiểm tra an toàn (safe checks) để chống crash
  const filteredOrders = orders.filter((order) => {
    // Nếu order bị lỗi, bỏ qua
    if (!order) {
      return false;
    }

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    // Kiểm tra tìm kiếm an toàn
    const searchTermLower = searchTerm.toLowerCase();

    // Thêm ? (optional chaining) để tránh crash nếu orderNumber là null/undefined
    const matchesOrderNumber =
      order.orderNumber?.toLowerCase().includes(searchTermLower) || false;

    // Thêm ? để tránh crash nếu items là null/undefined
    const matchesProductName =
      order.items?.some((item) =>
        item.productName?.toLowerCase().includes(searchTermLower)
      ) || false;

    const matchesSearch = matchesOrderNumber || matchesProductName;

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <MobileNav />
      <div className="lg:ml-20 pt-6 lg:pt-0 p-4 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Đơn hàng của tôi
          </h1>
          <p className="text-gray-600">Theo dõi tất cả đơn hàng của bạn</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <Input
              placeholder="Tìm theo mã đơn hoặc tên sản phẩm..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={statusFilter}
          onValueChange={(v: any) => setStatusFilter(v)}
        >
          <TabsList className="mb-6">
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="pending">Chờ xác nhận</TabsTrigger>
            <TabsTrigger value="printing">Đang in</TabsTrigger>
            <TabsTrigger value="shipping">Đang giao</TabsTrigger>
            <TabsTrigger value="completed">Hoàn thành</TabsTrigger>
          </TabsList>

          <TabsContent value={statusFilter}>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-24 bg-gray-200 rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredOrders.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package size={64} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Chưa có đơn hàng
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Bạn chưa có đơn hàng nào trong danh mục này
                  </p>
                  <Button asChild>
                    <Link to="/shop">Bắt đầu mua sắm</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <Card
                    key={order._id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6">
                      {/* Order Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">
                              {order.orderNumber}
                            </h3>
                            {getStatusBadge(order.status)}
                          </div>
                          <p className="text-sm text-gray-500">
                            Đặt ngày: {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500 mb-1">
                            Tổng tiền
                          </p>
                          <p className="text-xl font-bold text-blue-600">
                            {formatPrice(order.total)}
                          </p>
                        </div>
                      </div>

                      {/* Order Items Preview */}
                      <div className="border-t pt-4 mb-4">
                        <div className="space-y-2">
                          {order.items.slice(0, 2).map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-3 text-sm"
                            >
                              <Package size={16} className="text-gray-400" />
                              <span className="flex-1">{item.productName}</span>
                              <span className="text-gray-500">
                                x{item.quantity}
                              </span>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <p className="text-sm text-gray-500 pl-7">
                              ... và {order.items.length - 2} sản phẩm khác
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/orders/${order._id}`}>
                            <Eye size={16} className="mr-2" />
                            Chi tiết
                          </Link>
                        </Button>
                        {order.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600"
                            // KHẮC PHỤC: Thêm onClick và trạng thái loading
                            onClick={() => handleCancelOrder(order._id)}
                            disabled={cancellingId === order._id}
                          >
                            {cancellingId === order._id
                              ? "Đang hủy..."
                              : "Hủy đơn"}
                          </Button>
                        )}
                        {order.status === "completed" && (
                          <Button variant="outline" size="sm">
                            <FileText size={16} className="mr-2" />
                            Đánh giá
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
