// apps/admin-frontend/src/pages/ProductionQueuePage.tsx
// ✅ Production Queue Page
// Phase 5.2.1: Production Management UI - Queue Page

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProductionManagement } from "@/hooks/useProductionManagement";
import { ProductionOrder } from "@/services/admin.production.service";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả", color: "gray" },
  { value: "pending", label: "Chờ xác nhận", color: "yellow" },
  { value: "confirmed", label: "Đã xác nhận", color: "blue" },
  { value: "in_production", label: "Đang sản xuất", color: "purple" },
  { value: "qc_check", label: "Kiểm tra QC", color: "orange" },
  { value: "completed", label: "Hoàn thành", color: "green" },
  { value: "failed", label: "Thất bại", color: "red" },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  in_production: "bg-purple-100 text-purple-800",
  qc_check: "bg-orange-100 text-orange-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

export default function ProductionQueuePage() {
  const navigate = useNavigate();
  const {
    productionOrders,
    isLoading,
    fetchProductionOrdersByStatus,
    fetchDelayedOrders,
  } = useProductionManagement();

  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showDelayedOnly, setShowDelayedOnly] = useState(false);

  useEffect(() => {
    if (showDelayedOnly) {
      fetchDelayedOrders();
    } else {
      fetchProductionOrdersByStatus(
        selectedStatus === "all" ? "pending" : selectedStatus
      );
    }
  }, [
    selectedStatus,
    showDelayedOnly,
    fetchProductionOrdersByStatus,
    fetchDelayedOrders,
  ]);

  const handleViewDetail = (orderId: string) => {
    navigate(`/production-orders/${orderId}`);
  };

  const getStatusLabel = (status: string) => {
    return STATUS_OPTIONS.find((opt) => opt.value === status)?.label || status;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Production Queue</h1>
        <p className="text-gray-600 mt-1">
          Quản lý và theo dõi tiến độ production orders
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-4">
          {/* Status Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <div className="flex gap-2 flex-wrap">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSelectedStatus(option.value);
                    setShowDelayedOnly(false);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedStatus === option.value && !showDelayedOnly
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Delayed Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lọc đặc biệt
            </label>
            <button
              onClick={() => setShowDelayedOnly(!showDelayedOnly)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showDelayedOnly
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              🚨 Trễ hạn
            </button>
          </div>
        </div>
      </div>

      {/* Production Orders List */}
      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Đang tải...</p>
          </div>
        ) : productionOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Không có production orders
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Swag Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày hoàn thành dự kiến
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chi phí
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productionOrders.map((order) => {
                  const isDelayed =
                    new Date(order.expectedCompletionDate) < new Date() &&
                    !["completed", "failed"].includes(order.status);

                  return (
                    <tr
                      key={order._id}
                      className={`hover:bg-gray-50 ${
                        isDelayed ? "bg-red-50" : ""
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.swagOrderNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(order.orderedAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.supplierName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.supplierContact.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.items.length} items
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.items.reduce(
                            (sum, item) => sum + item.quantity,
                            0
                          )}{" "}
                          units
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            STATUS_COLORS[order.status]
                          }`}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                        {isDelayed && (
                          <div className="text-xs text-red-600 mt-1">
                            🚨 Trễ hạn
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(order.expectedCompletionDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(order.estimatedCost)}
                        </div>
                        {order.actualCost && (
                          <div className="text-sm text-gray-500">
                            Actual: {formatCurrency(order.actualCost)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewDetail(order._id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
