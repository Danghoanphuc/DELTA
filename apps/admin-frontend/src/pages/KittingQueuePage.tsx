// apps/admin-frontend/src/pages/KittingQueuePage.tsx
// ✅ Kitting Queue Page - Phase 6.2.1
// Display orders ready for kitting

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useKitting } from "../hooks/useKitting";
import { formatDate } from "../lib/utils";

export function KittingQueuePage() {
  const navigate = useNavigate();
  const { orders, isLoading, fetchKittingQueue } = useKitting();

  const [filters, setFilters] = useState({
    status: "pending",
    sortBy: "priority",
  });

  useEffect(() => {
    fetchKittingQueue(filters);
  }, [fetchKittingQueue, filters]);

  const handleStartKitting = (orderId: string) => {
    navigate(`/kitting/${orderId}`);
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: "Chờ kitting",
      in_progress: "Đang kitting",
      completed: "Hoàn tất",
    };
    return texts[status] || status;
  };

  if (isLoading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kitting Queue</h1>
        <p className="text-gray-600 mt-1">
          Danh sách đơn hàng sẵn sàng để đóng gói
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Tất cả</option>
              <option value="pending">Chờ kitting</option>
              <option value="in_progress">Đang kitting</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sắp xếp
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters({ ...filters, sortBy: e.target.value })
              }
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="priority">Ưu tiên</option>
              <option value="date">Ngày tạo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">Không có đơn hàng nào cần kitting</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đơn hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổ chức
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số người nhận
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày gửi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {order.organization.businessName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {order.totalRecipients} người
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {order.scheduledSendDate
                        ? formatDate(order.scheduledSendDate)
                        : "Ngay lập tức"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                        order.production.kittingStatus
                      )}`}
                    >
                      {getStatusText(order.production.kittingStatus)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleStartKitting(order._id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      {order.production.kittingStatus === "in_progress"
                        ? "Tiếp tục"
                        : "Bắt đầu"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
