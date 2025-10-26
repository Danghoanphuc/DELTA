// frontend/src/pages/printer/OrderManagement.tsx (ĐÃ SỬA)

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order, OrderStatus } from "@/types/order";
import api from "@/lib/axios";
import { toast } from "sonner";
import { OrderStatsGrid } from "@/components/printer/OrderStatsGrid";
import { OrderFilterBar } from "@/components/printer/OrderFilterBar";
import { OrderTable } from "@/components/printer/OrderTable";
import { OrderEmptyState } from "@/components/printer/OrderEmptyState";
// KHẮC PHỤC: Xóa import 'Package' không được sử dụng
// import { Package } from "lucide-react";

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
      // Chỉ fetch khi có search term hoặc khi xóa hết search term
      fetchOrders();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ==================== UPDATE ORDER STATUS ====================
  const handleUpdateStatus = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    try {
      await api.put(`/orders/printer/${orderId}/status`, {
        status: newStatus,
      });

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
        <OrderStatsGrid stats={stats} />

        {/* Main Card */}
        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle>Danh sách đơn hàng</CardTitle>
            <OrderFilterBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              // KHẮC PHỤC: Gói setter trong 1 arrow function để khớp type
              onStatusChange={(value) => setStatusFilter(value)}
              sortBy={sortBy}
              // KHẮC PHỤC: Gói setter trong 1 arrow function để khớp type
              onSortChange={(value) =>
                setSortBy(value as "newest" | "oldest" | "highest" | "lowest")
              }
            />
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
                <p className="mt-4 text-gray-500">Đang tải đơn hàng...</p>
              </div>
            ) : orders.length === 0 ? (
              <OrderEmptyState />
            ) : (
              <OrderTable
                orders={orders}
                onUpdateStatus={handleUpdateStatus}
                loading={loading}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
