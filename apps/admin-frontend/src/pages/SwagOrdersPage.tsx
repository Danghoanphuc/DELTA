// src/pages/SwagOrdersPage.tsx
// ✅ Admin Swag Orders Management

import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Package,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Calendar,
} from "lucide-react";
import {
  swagOpsService,
  SwagOrder,
  Organization,
} from "@/services/admin.swag-operations.service";

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

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: any }
> = {
  draft: { label: "Nháp", color: "bg-gray-100 text-gray-700", icon: Clock },
  pending_info: {
    label: "Chờ thông tin",
    color: "bg-yellow-100 text-yellow-700",
    icon: Clock,
  },
  pending_payment: {
    label: "Chờ thanh toán",
    color: "bg-orange-100 text-orange-700",
    icon: Clock,
  },
  paid: {
    label: "Đã thanh toán",
    color: "bg-blue-100 text-blue-700",
    icon: CheckCircle,
  },
  processing: {
    label: "Đang xử lý",
    color: "bg-indigo-100 text-indigo-700",
    icon: Package,
  },
  kitting: {
    label: "Đang đóng gói",
    color: "bg-purple-100 text-purple-700",
    icon: Package,
  },
  shipped: { label: "Đã gửi", color: "bg-cyan-100 text-cyan-700", icon: Truck },
  delivered: {
    label: "Đã giao",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Đã hủy",
    color: "bg-gray-100 text-gray-500",
    icon: XCircle,
  },
  failed: {
    label: "Thất bại",
    color: "bg-red-100 text-red-700",
    icon: XCircle,
  },
};

export default function SwagOrdersPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [orders, setOrders] = useState<SwagOrder[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "all"
  );
  const [orgFilter, setOrgFilter] = useState(
    searchParams.get("organization") || "all"
  );
  const [dateFrom, setDateFrom] = useState(searchParams.get("dateFrom") || "");
  const [dateTo, setDateTo] = useState(searchParams.get("dateTo") || "");
  const [isExporting, setIsExporting] = useState(false);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: parseInt(searchParams.get("page") || "1"),
        limit: 20,
      };

      if (search) params.search = search;
      if (statusFilter !== "all") params.status = statusFilter;
      if (orgFilter !== "all") params.organization = orgFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const result = await swagOpsService.getOrders(params);
      setOrders(result.orders || []);
      setPagination(result.pagination || { page: 1, total: 0, totalPages: 1 });
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, search, statusFilter, orgFilter]);

  // Fetch organizations for filter
  const fetchOrganizations = useCallback(async () => {
    try {
      const orgs = await swagOpsService.getOrganizations();
      setOrganizations(orgs);
    } catch (error) {
      console.error("Error fetching organizations:", error);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchOrganizations();
  }, [fetchOrders, fetchOrganizations]);

  // Handle search
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (orgFilter !== "all") params.set("organization", orgFilter);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    params.set("page", "1");
    setSearchParams(params);
  };

  // Handle export
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await swagOpsService.exportOrders({
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        organization: orgFilter !== "all" ? orgFilter : undefined,
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `swag-orders-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    setSearchParams(params);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Đơn hàng Swag</h1>
          <p className="text-gray-600">Quản lý tất cả đơn gửi quà</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isExporting ? "Đang xuất..." : "Export CSV"}
          </button>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Làm mới
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-64 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo mã đơn hoặc tên..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setTimeout(handleSearch, 0);
            }}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="paid">Đã thanh toán</option>
            <option value="processing">Đang xử lý</option>
            <option value="kitting">Đang đóng gói</option>
            <option value="shipped">Đã gửi</option>
            <option value="delivered">Đã giao</option>
            <option value="failed">Thất bại</option>
          </select>

          {/* Organization Filter */}
          <select
            value={orgFilter}
            onChange={(e) => {
              setOrgFilter(e.target.value);
              setTimeout(handleSearch, 0);
            }}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">Tất cả tổ chức</option>
            {organizations.map((org) => (
              <option key={org._id} value={org._id}>
                {org.businessName}
              </option>
            ))}
          </select>

          {/* Date Range */}
          <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-1">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border-none focus:outline-none text-sm w-32"
              placeholder="Từ ngày"
            />
            <span className="text-gray-400">-</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border-none focus:outline-none text-sm w-32"
              placeholder="Đến ngày"
            />
          </div>

          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

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
                const StatusIcon = statusConfig.icon;
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
                        <StatusIcon className="w-3 h-3" />
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
                      <button
                        onClick={() =>
                          navigate(`/swag-ops/orders/${order._id}`)
                        }
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <Eye className="w-4 h-4 text-gray-500" />
                      </button>
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
    </div>
  );
}
