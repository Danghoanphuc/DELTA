// frontend/src/pages/printer/OrderManagement.tsx (FULL IMPLEMENTATION)

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  Eye,
  Check,
  X,
  Clock,
  Truck,
  Package,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Order, OrderStatus } from "@/types/order";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "highest" | "lowest"
  >("newest");

  // ==================== FETCH ORDERS ====================
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/orders/printer/my-orders", {
        params: {
          status: statusFilter !== "all" ? statusFilter : undefined,
          search: searchTerm || undefined,
          sort: sortBy,
        },
      });
      setOrders(res.data.orders || []);
    } catch (err: any) {
      console.error("❌ Error fetching orders:", err);
      toast.error("Không thể tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, sortBy]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) fetchOrders();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ==================== UPDATE ORDER STATUS ====================
  const handleUpdateStatus = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    try {
      const res = await api.put(`/orders/printer/${orderId}/status`, {
        status: newStatus,
      });

      // Update local state
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      toast.success(`✅ Đã cập nhật trạng thái đơn hàng`);
    } catch (err: any) {
      console.error("❌ Update Status Error:", err);
      toast.error(
        err.response?.data?.message || "Không thể cập nhật trạng thái"
      );
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
    });
  };

  const getStatusBadge = (status: OrderStatus) => {
    const config: Record<
      OrderStatus,
      {
        label: string;
        variant: "default" | "secondary" | "destructive" | "outline";
        icon: any;
      }
    > = {
      pending: { label: "Chờ xác nhận", variant: "secondary", icon: Clock },
      confirmed: { label: "Đã xác nhận", variant: "default", icon: Check },
      printing: { label: "Đang in", variant: "default", icon: Package },
      shipping: { label: "Đang giao", variant: "default", icon: Truck },
      completed: { label: "Hoàn thành", variant: "default", icon: CheckCircle },
      cancelled: { label: "Đã hủy", variant: "destructive", icon: XCircle },
      refunded: {
        label: "Đã hoàn tiền",
        variant: "outline",
        icon: AlertCircle,
      },
    };

    const { label, variant, icon: Icon } = config[status];
    return (
      <Badge variant={variant} className="gap-1">
        <Icon size={14} />
        {label}
      </Badge>
    );
  };

  const getStatusActions = (order: Order) => {
    const actions: { label: string; status: OrderStatus; variant?: any }[] = [];

    switch (order.status) {
      case "pending":
        actions.push(
          { label: "Xác nhận", status: "confirmed", variant: "default" },
          { label: "Từ chối", status: "cancelled", variant: "destructive" }
        );
        break;
      case "confirmed":
        actions.push({
          label: "Bắt đầu in",
          status: "printing",
          variant: "default",
        });
        break;
      case "printing":
        actions.push({
          label: "Chuyển giao",
          status: "shipping",
          variant: "default",
        });
        break;
      case "shipping":
        actions.push({
          label: "Hoàn thành",
          status: "completed",
          variant: "default",
        });
        break;
    }

    return actions;
  };

  // ==================== STATS ====================
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    printing: orders.filter((o) => o.status === "printing").length,
    shipping: orders.filter((o) => o.status === "shipping").length,
    completed: orders.filter((o) => o.status === "completed").length,
  };

  // ==================== RENDER ====================
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Quản lý đơn hàng
          </h1>
          <p className="text-gray-600">Theo dõi và xử lý đơn hàng in ấn</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: "Tổng đơn", value: stats.total, color: "blue" },
            { label: "Chờ xác nhận", value: stats.pending, color: "yellow" },
            { label: "Đang in", value: stats.printing, color: "purple" },
            { label: "Đang giao", value: stats.shipping, color: "cyan" },
            { label: "Hoàn thành", value: stats.completed, color: "green" },
          ].map((stat) => (
            <Card key={stat.label} className="border-none shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Card */}
        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle>Danh sách đơn hàng</CardTitle>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <Input
                  placeholder="Tìm kiếm đơn hàng (mã, khách hàng...)"
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <Select
                value={statusFilter}
                onValueChange={(v: any) => setStatusFilter(v)}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="pending">Chờ xác nhận</SelectItem>
                  <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                  <SelectItem value="printing">Đang in</SelectItem>
                  <SelectItem value="shipping">Đang giao</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mới nhất</SelectItem>
                  <SelectItem value="oldest">Cũ nhất</SelectItem>
                  <SelectItem value="highest">Giá cao nhất</SelectItem>
                  <SelectItem value="lowest">Giá thấp nhất</SelectItem>
                </SelectContent>
              </Select>

              {/* Export Button */}
              <Button variant="outline" className="gap-2">
                <Download size={16} />
                Xuất file
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
                <p className="mt-4 text-gray-500">Đang tải đơn hàng...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <Package size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="font-semibold text-gray-700 mb-2">
                  Chưa có đơn hàng
                </h3>
                <p className="text-gray-500">Đơn hàng mới sẽ hiển thị ở đây</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã đơn</TableHead>
                      <TableHead>Khách hàng</TableHead>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead>Tổng tiền</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày đặt</TableHead>
                      <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-medium">
                          <Link
                            to={`/printer/orders/${order._id}`}
                            className="text-blue-600 hover:underline"
                          >
                            {order.orderNumber}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.customerName}</p>
                            <p className="text-xs text-gray-500">
                              {order.customerEmail}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {order.items.length} sản phẩm
                            <p className="text-xs text-gray-500">
                              {order.items[0]?.productName}
                              {order.items.length > 1 &&
                                ` +${order.items.length - 1}`}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-blue-600">
                          {formatPrice(order.total)}
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Xem chi tiết"
                              asChild
                            >
                              <Link to={`/printer/orders/${order._id}`}>
                                <Eye size={18} />
                              </Link>
                            </Button>

                            {getStatusActions(order).map((action) => (
                              <Button
                                key={action.status}
                                variant={action.variant || "ghost"}
                                size="sm"
                                onClick={() =>
                                  handleUpdateStatus(order._id, action.status)
                                }
                                disabled={loading}
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
