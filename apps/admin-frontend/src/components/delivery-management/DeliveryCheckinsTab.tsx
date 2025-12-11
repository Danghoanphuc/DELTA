// apps/admin-frontend/src/components/delivery-management/DeliveryCheckinsTab.tsx
// ✅ Delivery Check-ins Tab Component

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  MapPin,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  Package,
  User,
  Truck,
  Calendar,
  Image,
  MessageSquare,
} from "lucide-react";
import api from "@/lib/axios";
import { AdminThreadDialog } from "@/components/delivery-checkins/AdminThreadDialog";
import { isFeatureEnabled } from "@/config/features";

interface DeliveryCheckin {
  _id: string;
  orderNumber: string;
  orderType: string;
  shipperName: string;
  shipperId?: {
    _id: string;
    displayName: string;
    email: string;
    avatarUrl?: string;
  };
  customerId?: {
    _id: string;
    displayName: string;
    email: string;
  };
  customerEmail: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  address: {
    formatted: string;
    district?: string;
    city?: string;
  };
  photos: Array<{
    url: string;
    thumbnailUrl: string;
  }>;
  notes: string;
  status: string;
  checkinAt: string;
  createdAt: string;
}

interface Stats {
  totalCheckins: number;
  byOrderType: Record<string, number>;
  byStatus: Record<string, number>;
  recentCheckins: Array<{ _id: string; count: number }>;
}

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
  pending: { label: "Đang xử lý", color: "bg-yellow-100 text-yellow-700" },
  completed: { label: "Hoàn tất", color: "bg-green-100 text-green-700" },
  failed: { label: "Thất bại", color: "bg-red-100 text-red-700" },
};

const ORDER_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  swag: { label: "SwagOrder", color: "bg-blue-100 text-blue-700" },
  master: { label: "MasterOrder", color: "bg-purple-100 text-purple-700" },
};

export function DeliveryCheckinsTab() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [checkins, setCheckins] = useState<DeliveryCheckin[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCheckin, setSelectedCheckin] =
    useState<DeliveryCheckin | null>(null);
  const [isThreadDialogOpen, setIsThreadDialogOpen] = useState(false);

  // Filters
  const [orderTypeFilter, setOrderTypeFilter] = useState(
    searchParams.get("orderType") || "all"
  );
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "all"
  );
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const fetchCheckins = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", searchParams.get("page") || "1");
      params.set("limit", "20");
      if (orderTypeFilter !== "all") params.set("orderType", orderTypeFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);

      const res = await api.get(`/admin/delivery-checkins?${params}`);
      setCheckins(res.data?.data?.checkins || []);
      setPagination(res.data?.data?.pagination || pagination);
    } catch (error) {
      console.error("Error fetching checkins:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/delivery-checkins/stats");
      setStats(res.data?.data || null);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchCheckins();
    fetchStats();
  }, [searchParams]);

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (orderTypeFilter !== "all") params.set("orderType", orderTypeFilter);
    if (statusFilter !== "all") params.set("status", statusFilter);
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
      <div className="flex justify-end">
        <button
          onClick={() => {
            fetchCheckins();
            fetchStats();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="w-4 h-4" />
          Làm mới
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Tổng Check-ins</p>
                <p className="text-2xl font-bold">{stats.totalCheckins}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">SwagOrder</p>
                <p className="text-2xl font-bold">
                  {stats.byOrderType?.swag || 0}
                </p>
              </div>
            </div>
          </div>
          {/* MasterOrder stats - hidden when feature disabled */}
          {isFeatureEnabled("MASTER_ORDER_SYSTEM") && (
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Truck className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">MasterOrder</p>
                  <p className="text-2xl font-bold">
                    {stats.byOrderType?.master || 0}
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Hoàn tất</p>
                <p className="text-2xl font-bold">
                  {stats.byStatus?.completed || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Mã đơn, shipper, email..."
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại đơn
            </label>
            <select
              value={orderTypeFilter}
              onChange={(e) => setOrderTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="swag">SwagOrder</option>
              {/* MasterOrder option - hidden when feature disabled */}
              {isFeatureEnabled("MASTER_ORDER_SYSTEM") && (
                <option value="master">MasterOrder</option>
              )}
            </select>
          </div>
          <div className="w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="pending">Đang xử lý</option>
              <option value="completed">Hoàn tất</option>
              <option value="failed">Thất bại</option>
            </select>
          </div>
          <button
            onClick={handleApplyFilters}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
          >
            Áp dụng
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
            <p className="mt-2 text-gray-500">Đang tải...</p>
          </div>
        ) : checkins.length === 0 ? (
          <div className="p-8 text-center">
            <MapPin className="w-12 h-12 mx-auto text-gray-300" />
            <p className="mt-2 text-gray-500">Không có check-in nào</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Mã đơn
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Loại
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Shipper
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Địa chỉ
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ảnh
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Thời gian
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {checkins.map((checkin) => (
                <tr key={checkin._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="font-medium text-blue-600">
                      {checkin.orderNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        ORDER_TYPE_CONFIG[checkin.orderType]?.color ||
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {ORDER_TYPE_CONFIG[checkin.orderType]?.label ||
                        checkin.orderType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{checkin.shipperName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="max-w-xs truncate text-sm text-gray-600">
                      {checkin.address?.formatted || "N/A"}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {checkin.photos?.length > 0 ? (
                      <div className="flex items-center gap-1">
                        <Image className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{checkin.photos.length}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        STATUS_CONFIG[checkin.status]?.color ||
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {STATUS_CONFIG[checkin.status]?.label || checkin.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDate(checkin.checkinAt)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedCheckin(checkin)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCheckin(checkin);
                          setIsThreadDialogOpen(true);
                        }}
                        className="p-1 text-gray-400 hover:text-purple-600"
                        title="Thảo luận"
                      >
                        <MessageSquare className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Hiển thị {checkins.length} / {pagination.total} check-ins
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm">
                Trang {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedCheckin && !isThreadDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Chi tiết Check-in</h2>
                <button
                  onClick={() => setSelectedCheckin(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Mã đơn hàng</p>
                    <p className="font-medium">{selectedCheckin.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Loại đơn</p>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        ORDER_TYPE_CONFIG[selectedCheckin.orderType]?.color
                      }`}
                    >
                      {ORDER_TYPE_CONFIG[selectedCheckin.orderType]?.label}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Shipper</p>
                    <p className="font-medium">{selectedCheckin.shipperName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Thời gian</p>
                    <p className="font-medium">
                      {formatDate(selectedCheckin.checkinAt)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Địa chỉ</p>
                  <p className="font-medium">
                    {selectedCheckin.address?.formatted}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Tọa độ</p>
                  <p className="font-medium">
                    {selectedCheckin.location?.coordinates?.[1]?.toFixed(6)},{" "}
                    {selectedCheckin.location?.coordinates?.[0]?.toFixed(6)}
                  </p>
                </div>

                {selectedCheckin.notes && (
                  <div>
                    <p className="text-sm text-gray-500">Ghi chú</p>
                    <p className="font-medium">{selectedCheckin.notes}</p>
                  </div>
                )}

                {selectedCheckin.photos?.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Ảnh check-in</p>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedCheckin.photos.map((photo, idx) => (
                        <a
                          key={idx}
                          href={photo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={photo.thumbnailUrl || photo.url}
                            alt={`Check-in photo ${idx + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="pt-4 border-t">
                  <button
                    onClick={() => setIsThreadDialogOpen(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Mở thảo luận
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Thread Dialog */}
      {selectedCheckin && (
        <AdminThreadDialog
          checkinId={selectedCheckin._id}
          orderNumber={selectedCheckin.orderNumber}
          open={isThreadDialogOpen}
          onOpenChange={(open) => {
            setIsThreadDialogOpen(open);
            if (!open) {
              setSelectedCheckin(null);
            }
          }}
        />
      )}
    </div>
  );
}
