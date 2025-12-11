// apps/admin-frontend/src/components/delivery-management/SwagOrdersTab.tsx
// ✅ Swag Orders Tab Component

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Package,
  RefreshCw,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import { useSwagOrders } from "@/hooks/useSwagOrders";
import { OrderFilters } from "@/components/swag-ops/OrderFilters";
import { AdminOrderThreadDialog } from "@/components/order-detail/AdminOrderThreadDialog";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
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

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: "Nháp", color: "bg-gray-100 text-gray-700" },
  pending_info: {
    label: "Chờ thông tin",
    color: "bg-yellow-100 text-yellow-700",
  },
  pending_payment: {
    label: "Chờ thanh toán",
    color: "bg-orange-100 text-orange-700",
  },
  paid: { label: "Đã thanh toán", color: "bg-blue-100 text-blue-700" },
  processing: { label: "Đang xử lý", color: "bg-indigo-100 text-indigo-700" },
  kitting: { label: "Đang đóng gói", color: "bg-purple-100 text-purple-700" },
  shipped: { label: "Đã gửi", color: "bg-cyan-100 text-cyan-700" },
  delivered: { label: "Đã giao", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Đã hủy", color: "bg-gray-100 text-gray-500" },
  failed: { label: "Thất bại", color: "bg-red-100 text-red-700" },
};

export function SwagOrdersTab() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "all"
  );
  const [orgFilter, setOrgFilter] = useState(
    searchParams.get("organization") || "all"
  );
  const [dateFrom, setDateFrom] = useState(searchParams.get("dateFrom") || "");
  const [dateTo, setDateTo] = useState(searchParams.get("dateTo") || "");

  // Chat dialog state
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [chatOrderId, setChatOrderId] = useState("");
  const [chatOrderNumber, setChatOrderNumber] = useState("");

  const {
    orders,
    organizations,
    pagination,
    isLoading,
    isExporting,
    exportOrders,
  } = useSwagOrders({
    search,
    status: statusFilter,
    organization: orgFilter,
    dateFrom,
    dateTo,
    page: parseInt(searchParams.get("page") || "1"),
  });

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (orgFilter !== "all") params.set("organization", orgFilter);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    params.set("page", "1");
    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    setSearchParams(params);
  };

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex justify-end gap-2">
        <button
          onClick={exportOrders}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isExporting ? "Đang xuất..." : "Export CSV"}
        </button>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          Làm mới
        </button>
      </div>

      {/* Filters */}
      <OrderFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        orgFilter={orgFilter}
        onOrgChange={setOrgFilter}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
        onApplyFilters={handleApplyFilters}
        organizations={organizations}
      />

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Không có đơn hàng nào</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Mã đơn
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Tổ chức
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Bộ quà
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                  Người nhận
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                  Tiến độ
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                  Tổng tiền
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                  Ngày tạo
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const statusConfig =
                  STATUS_CONFIG[order.status] || STATUS_CONFIG.draft;
                const deliveredPercent =
                  order.totalRecipients > 0
                    ? Math.round(
                        (order.stats.delivered / order.totalRecipients) * 100
                      )
                    : 0;

                return (
                  <tr key={order._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm font-medium">
                        {order.orderNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-900">
                        {order.organization?.businessName || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {order.swagPack?.name || "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {order.totalRecipients}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${deliveredPercent}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {deliveredPercent}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
                      >
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(order.pricing?.total || 0)}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {/* Chat Icon */}
                        <button
                          onClick={() => {
                            setChatOrderId(order._id);
                            setChatOrderNumber(order.orderNumber);
                            setShowChatDialog(true);
                          }}
                          className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                          title="Chat với khách hàng và shipper"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>

                        {/* View Detail */}
                        <button
                          onClick={() =>
                            navigate(`/swag-ops/orders/${order._id}`)
                          }
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-gray-500">
              Hiển thị {orders.length} / {pagination.total} đơn hàng
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-4 py-2 text-sm">
                Trang {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Chat Dialog */}
      <AdminOrderThreadDialog
        orderId={chatOrderId}
        orderNumber={chatOrderNumber}
        open={showChatDialog}
        onOpenChange={setShowChatDialog}
      />
    </div>
  );
}
