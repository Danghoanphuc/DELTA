// src/pages/SwagOperationsDashboard.tsx
// ✅ Admin Swag Operations Dashboard

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Truck,
  Clock,
  AlertTriangle,
  Building2,
  DollarSign,
  RefreshCw,
  BarChart3,
  Boxes,
} from "lucide-react";
import {
  swagOpsService,
  DashboardStats,
} from "@/services/admin.swag-operations.service";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export default function SwagOperationsDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await swagOpsService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const statCards = [
    {
      title: "Chờ xử lý",
      value: stats?.pendingOrders || 0,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      onClick: () => navigate("/swag-ops/orders?status=paid"),
    },
    {
      title: "Đang xử lý",
      value: stats?.processingOrders || 0,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      onClick: () => navigate("/swag-ops/orders?status=processing"),
    },
    {
      title: "Đã gửi hôm nay",
      value: stats?.shippedToday || 0,
      icon: Truck,
      color: "text-green-600",
      bgColor: "bg-green-100",
      onClick: () => navigate("/swag-ops/orders?status=shipped"),
    },
    {
      title: "Cần chú ý",
      value: stats?.attentionNeeded || 0,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100",
      onClick: () => navigate("/swag-ops/orders?status=failed"),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Swag Operations</h1>
          <p className="text-gray-600">Quản lý đơn hàng và fulfillment</p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          Làm mới
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div
            key={index}
            onClick={stat.onClick}
            className="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stat.value}
                </h3>
              </div>
              <div
                className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}
              >
                <stat.icon className={stat.color} size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-orange-100">
              <Package className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Tổng đơn hàng</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats?.totalOrders || 0}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-green-100">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Tổng doanh thu</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {formatCurrency(stats?.totalRevenue || 0)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-100">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Tổ chức</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats?.totalOrganizations || 0}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h3 className="font-semibold text-gray-900 mb-4">Hành động nhanh</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <button
            onClick={() => navigate("/swag-ops/fulfillment")}
            className="p-4 border rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all text-left"
          >
            <Package className="w-8 h-8 mb-2 text-orange-500" />
            <h4 className="font-medium text-gray-900">Fulfillment Queue</h4>
            <p className="text-sm text-gray-500">Xử lý đơn hàng</p>
          </button>

          <button
            onClick={() => navigate("/swag-ops/orders")}
            className="p-4 border rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all text-left"
          >
            <Truck className="w-8 h-8 mb-2 text-blue-500" />
            <h4 className="font-medium text-gray-900">Tất cả đơn hàng</h4>
            <p className="text-sm text-gray-500">Xem và quản lý</p>
          </button>

          <button
            onClick={() => navigate("/swag-ops/inventory")}
            className="p-4 border rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all text-left"
          >
            <Boxes className="w-8 h-8 mb-2 text-green-500" />
            <h4 className="font-medium text-gray-900">Tồn kho</h4>
            <p className="text-sm text-gray-500">Quản lý inventory</p>
          </button>

          <button
            onClick={() => navigate("/swag-ops/analytics")}
            className="p-4 border rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all text-left"
          >
            <BarChart3 className="w-8 h-8 mb-2 text-purple-500" />
            <h4 className="font-medium text-gray-900">Analytics</h4>
            <p className="text-sm text-gray-500">Báo cáo & thống kê</p>
          </button>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Phân bổ theo trạng thái
        </h3>
        <div className="space-y-3">
          {Object.entries(stats?.ordersByStatus || {}).map(
            ([status, count]) => {
              const statusLabels: Record<string, string> = {
                draft: "Nháp",
                pending_info: "Chờ thông tin",
                pending_payment: "Chờ thanh toán",
                paid: "Đã thanh toán",
                processing: "Đang xử lý",
                kitting: "Đang đóng gói",
                shipped: "Đã gửi",
                delivered: "Đã giao",
                cancelled: "Đã hủy",
                failed: "Thất bại",
              };
              const statusColors: Record<string, string> = {
                draft: "bg-gray-500",
                pending_info: "bg-yellow-500",
                pending_payment: "bg-orange-500",
                paid: "bg-blue-500",
                processing: "bg-indigo-500",
                kitting: "bg-purple-500",
                shipped: "bg-cyan-500",
                delivered: "bg-green-500",
                cancelled: "bg-gray-400",
                failed: "bg-red-500",
              };
              const total = stats?.totalOrders || 1;
              const percent = Math.round((count / total) * 100);

              return (
                <div key={status} className="flex items-center gap-4">
                  <div className="w-32 text-sm text-gray-600">
                    {statusLabels[status] || status}
                  </div>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        statusColors[status] || "bg-gray-500"
                      } rounded-full`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="w-16 text-sm text-right font-medium">
                    {count} ({percent}%)
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}
