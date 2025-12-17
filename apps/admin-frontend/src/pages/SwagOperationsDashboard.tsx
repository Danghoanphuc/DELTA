// apps/admin-frontend/src/pages/SwagOperationsDashboard.tsx
// ✅ SOLID Compliant: Single Responsibility - UI rendering only

import { useNavigate } from "react-router-dom";
import {
  Package,
  Building2,
  DollarSign,
  RefreshCw,
  BarChart3,
  FileText,
} from "lucide-react";
import { useSwagOperations } from "@/hooks/useSwagOperations";
import { StatCard } from "@/components/swag-ops/StatCard";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export default function SwagOperationsDashboard() {
  const navigate = useNavigate();
  const { stats, isLoading, fetchStats } = useSwagOperations();

  const statCards = [
    {
      title: "Tổng đơn hàng",
      value: stats?.totalOrders || 0,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Tổ chức",
      value: stats?.totalOrganizations || 0,
      icon: Building2,
      color: "text-green-600",
      bgColor: "bg-green-100",
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý chung</h1>
          <p className="text-gray-600">Tổng quan hệ thống</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
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
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h3 className="font-semibold text-gray-900 mb-4">Hành động nhanh</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate("/catalog/products")}
            className="p-4 border rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all text-left"
          >
            <Package className="w-8 h-8 mb-2 text-orange-500" />
            <h4 className="font-medium text-gray-900">Quản lý SP/DV</h4>
            <p className="text-sm text-gray-500">Sản phẩm & dịch vụ</p>
          </button>

          <button
            onClick={() => navigate("/catalog/suppliers")}
            className="p-4 border rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all text-left"
          >
            <Building2 className="w-8 h-8 mb-2 text-blue-500" />
            <h4 className="font-medium text-gray-900">Đối tác</h4>
            <p className="text-sm text-gray-500">Quản lý đối tác</p>
          </button>

          <button
            onClick={() => navigate("/documents/invoices")}
            className="p-4 border rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all text-left"
          >
            <FileText className="w-8 h-8 mb-2 text-green-500" />
            <h4 className="font-medium text-gray-900">Chứng từ</h4>
            <p className="text-sm text-gray-500">Hóa đơn & chứng từ</p>
          </button>

          <button
            onClick={() => navigate("/analytics")}
            className="p-4 border rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all text-left"
          >
            <BarChart3 className="w-8 h-8 mb-2 text-purple-500" />
            <h4 className="font-medium text-gray-900">Báo cáo</h4>
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
