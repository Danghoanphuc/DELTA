// src/features/customer/pages/CustomerOrdersPage.tsx
// ✅ FIXED: Responsive UI (Tabs scrollable, Stacked Cards on Mobile)

import { useState, useEffect } from "react";
import { Package, Search, Eye } from "lucide-react";
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
import { cn } from "@/shared/lib/utils";

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
      setOrders(res.data?.orders || res.data?.data?.orders || []);
    } catch (err: any) {
      console.error("❌ Error fetching orders:", err);
      toast.error("Không thể tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (cancellingId) return;
    setCancellingId(orderId);
    try {
      await api.patch(`/orders/${orderId}/cancel`);
      toast.success("Đã hủy đơn hàng thành công");
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
      pending: { label: "Chờ xác nhận", variant: "secondary" },
      // @ts-ignore
      processing: { label: "Đang xử lý", variant: "default" },
      confirmed: { label: "Đã xác nhận", variant: "default" },
      printing: { label: "Đang in", variant: "default" },
      shipping: { label: "Đang giao", variant: "default" },
      completed: { label: "Hoàn thành", variant: "default" },
      cancelled: { label: "Đã hủy", variant: "destructive" },
      refunded: { label: "Đã hoàn tiền", variant: "outline" },
      designing: { label: "Đang thiết kế", variant: "default" },
      ready: { label: "Sẵn sàng giao", variant: "default" },
    };
    const config = statusConfig[status];
    if (!config) return <Badge variant="outline">{status}</Badge>;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredOrders = orders.filter((order) => {
    if (!order) return false;
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const searchTermLower = searchTerm.toLowerCase();
    const matchesOrderNumber = order.orderNumber?.toLowerCase().includes(searchTermLower) || false;
    const matchesProductName = order.items?.some((item) =>
        item.productName?.toLowerCase().includes(searchTermLower)
      ) || false;
    return matchesStatus && (matchesOrderNumber || matchesProductName);
  });

  return (
    <div className="pt-4 px-3 md:pt-6 md:px-8 pb-24 max-w-7xl mx-auto">
      {/* Header Responsive */}
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1">
          Đơn hàng của tôi
        </h1>
        <p className="text-sm md:text-base text-gray-600">Theo dõi trạng thái đơn hàng</p>
      </div>

      {/* Search Responsive */}
      <div className="mb-4 md:mb-6">
        <div className="relative w-full md:max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input
            placeholder="Tìm mã đơn, tên sản phẩm..."
            className="pl-10 h-10 md:h-11 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs Responsive (Scrollable on Mobile) */}
      <Tabs
        value={statusFilter}
        onValueChange={(v: any) => setStatusFilter(v)}
        className="w-full"
      >
        <div className="w-full overflow-x-auto pb-2 no-scrollbar -mx-3 px-3 md:mx-0 md:px-0">
          <TabsList className="h-10 md:h-11 bg-gray-100/80 p-1 w-max md:w-auto min-w-full md:min-w-0 justify-start">
            <TabsTrigger value="all" className="px-3 md:px-4">Tất cả</TabsTrigger>
            <TabsTrigger value="pending" className="px-3 md:px-4">Chờ xác nhận</TabsTrigger>
            <TabsTrigger value="printing" className="px-3 md:px-4">Đang in</TabsTrigger>
            <TabsTrigger value="shipping" className="px-3 md:px-4">Đang giao</TabsTrigger>
            <TabsTrigger value="completed" className="px-3 md:px-4">Hoàn thành</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={statusFilter} className="mt-2 md:mt-4">
          {loading ? (
            <div className="space-y-4 text-center py-10 text-gray-500">Đang tải...</div>
          ) : filteredOrders.length === 0 ? (
            <Card className="border-dashed shadow-sm">
              <CardContent className="p-8 md:p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Package size={32} className="text-gray-300" />
                </div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1">
                  Chưa có đơn hàng
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Bạn chưa có đơn hàng nào trong mục này
                </p>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <Link to="/app">Mua sắm ngay</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {filteredOrders.map((order) => (
                <Card
                  key={order._id}
                  className="group hover:shadow-md transition-all border-gray-200 overflow-hidden"
                >
                  <CardContent className="p-4 md:p-6">
                    {/* ✅ MOBILE: Stack vertical (flex-col), TABLET+: Horizontal (flex-row) */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      
                      {/* LEFT: Info */}
                      <div className="min-w-0 flex-1 space-y-3">
                        {/* Header Card: Order ID & Badge */}
                        <div className="flex items-center justify-between md:justify-start gap-3">
                          <span className="text-xs md:text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            #{order.orderNumber}
                          </span>
                          {/* @ts-ignore */}
                          {getStatusBadge(order.status as any)}
                        </div>

                        {/* Product Name & Date */}
                        <div>
                            <h4 className="text-sm md:text-base font-semibold text-gray-900 line-clamp-2 leading-snug">
                                {order.items && order.items.length > 0
                                ? `${order.items[0].productName}${
                                    order.items.length > 1 ? ` (+${order.items.length - 1} món khác)` : ""
                                    }`
                                : "Đơn hàng không có sản phẩm"}
                            </h4>
                            <div className="mt-1 text-xs text-gray-500 flex items-center gap-2">
                                <span>Ngày đặt: {order.createdAt ? formatDate(order.createdAt as any) : "-"}</span>
                            </div>
                        </div>
                      </div>

                      {/* RIGHT: Actions & Price */}
                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 md:gap-1 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 mt-1 md:mt-0">
                        {/* Price */}
                        <div className="text-right">
                          <span className="text-xs text-gray-500 md:hidden mr-2">Tổng tiền:</span>
                          <span className="text-sm md:text-base font-bold text-blue-600">
                            {formatPrice(order.total || order.subtotal || 0)}
                          </span>
                        </div>

                        {/* Buttons Group */}
                        <div className="flex items-center gap-2">
                          {/* Nút Hủy (Chỉ hiện khi Pending) */}
                          {order.status === "pending" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 text-xs md:text-sm"
                              disabled={cancellingId === order._id}
                              onClick={() => handleCancelOrder(order._id)}
                            >
                              {cancellingId === order._id ? "Đang hủy..." : "Hủy"}
                            </Button>
                          )}
                          
                          {/* Nút Xem Chi Tiết */}
                          <Button asChild size="sm" variant="outline" className="h-8 md:h-9 text-xs md:text-sm border-gray-300">
                            <Link to={`/orders/${order._id}`}>
                              Xem chi tiết
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};