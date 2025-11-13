// src/features/customer/pages/CustomerOrdersPage.tsx (CẬP NHẬT)

import { useState, useEffect } from "react";
import { Package, Search, Eye, FileText } from "lucide-react";
// ❌ GỠ BỎ: Sidebar, MobileNav
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

  // (Logic hook (fetch, handle, format, filter...) giữ nguyên)
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
    if (!config) {
      return <Badge variant="outline">{status}</Badge>;
    }
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };
  const filteredOrders = orders.filter((order) => {
    if (!order) return false;
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    const searchTermLower = searchTerm.toLowerCase();
    const matchesOrderNumber =
      order.orderNumber?.toLowerCase().includes(searchTermLower) || false;
    const matchesProductName =
      order.items?.some((item) =>
        item.productName?.toLowerCase().includes(searchTermLower)
      ) || false;
    const matchesSearch = matchesOrderNumber || matchesProductName;
    return matchesStatus && matchesSearch;
  });

  return (
    // ❌ GỠ BỎ: Sidebar, MobileNav
    <>
      {/* ✅ Căn giữa và thêm padding */}
      <div className="pt-6 p-4 md:p-8 max-w-7xl mx-auto">
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

          {/* (Nội dung TabsContent giữ nguyên) */}
          <TabsContent value={statusFilter}>
            {loading ? (
              <div className="space-y-4">{/* ... (Skeleton) ... */}</div>
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
                    <Link to="/app">Bắt đầu mua sắm</Link>
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
                      {/* ... (Nội dung card đơn hàng) ... */}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};
