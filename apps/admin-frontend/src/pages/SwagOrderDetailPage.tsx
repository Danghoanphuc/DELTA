// src/pages/SwagOrderDetailPage.tsx
// ✅ Admin Swag Order Detail & Fulfillment

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  User,
  MapPin,
  RefreshCw,
  Play,
  AlertCircle,
  History,
} from "lucide-react";
import { swagOpsService } from "@/services/admin.swag-operations.service";

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

const SHIPMENT_STATUS_CONFIG: Record<string, { label: string; color: string }> =
  {
    pending: { label: "Chờ xử lý", color: "bg-gray-100 text-gray-700" },
    processing: { label: "Đang xử lý", color: "bg-blue-100 text-blue-700" },
    shipped: { label: "Đã gửi", color: "bg-cyan-100 text-cyan-700" },
    in_transit: {
      label: "Đang vận chuyển",
      color: "bg-indigo-100 text-indigo-700",
    },
    out_for_delivery: {
      label: "Đang giao",
      color: "bg-orange-100 text-orange-700",
    },
    delivered: { label: "Đã giao", color: "bg-green-100 text-green-700" },
    failed: { label: "Thất bại", color: "bg-red-100 text-red-700" },
  };

export default function SwagOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<any>(null);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);

  // Modal states
  const [showShipModal, setShowShipModal] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("ghn");
  const [carriers, setCarriers] = useState<
    Array<{ id: string; name: string; available: boolean }>
  >([]);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState<any>(null);

  // Fetch order
  const fetchOrder = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [orderData, logs, carriersData] = await Promise.all([
        swagOpsService.getOrder(id),
        swagOpsService.getOrderActivityLog(id),
        swagOpsService.getCarriers(),
      ]);
      setOrder(orderData);
      setActivityLog(logs || []);
      setCarriers(carriersData || []);
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // View tracking
  const handleViewTracking = async (recipientId: string) => {
    if (!id) return;
    try {
      const tracking = await swagOpsService.getTrackingInfo(id, recipientId);
      setTrackingInfo(tracking);
      setShowTrackingModal(true);
    } catch (error) {
      console.error("Error fetching tracking:", error);
    }
  };

  // Start processing
  const handleStartProcessing = async () => {
    if (!id) return;
    setIsUpdating(true);
    try {
      await swagOpsService.startProcessing(id);
      fetchOrder();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Complete kitting
  const handleCompleteKitting = async () => {
    if (!id) return;
    setIsUpdating(true);
    try {
      await swagOpsService.completeKitting(id);
      fetchOrder();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Mark as shipped
  const handleMarkShipped = async () => {
    if (!id || selectedRecipients.length === 0) return;
    setIsUpdating(true);
    try {
      const trackingNumbers: Record<string, string> = {};
      selectedRecipients.forEach((rid) => {
        trackingNumbers[rid] = trackingNumber;
      });

      await swagOpsService.bulkUpdateShipments(id, {
        recipientIds: selectedRecipients,
        status: "shipped",
        trackingNumbers,
        carrier,
      });

      setShowShipModal(false);
      setSelectedRecipients([]);
      setTrackingNumber("");
      fetchOrder();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Toggle recipient selection
  const toggleRecipient = (recipientId: string) => {
    setSelectedRecipients((prev) =>
      prev.includes(recipientId)
        ? prev.filter((id) => id !== recipientId)
        : [...prev, recipientId]
    );
  };

  const toggleAllRecipients = () => {
    if (!order) return;
    const allIds = order.recipientShipments
      .filter(
        (s: any) =>
          s.shipmentStatus !== "delivered" && s.shipmentStatus !== "shipped"
      )
      .map((s: any) => s.recipient.toString());

    if (selectedRecipients.length === allIds.length) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(allIds);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
        <p className="text-lg font-medium">Không tìm thấy đơn hàng</p>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.draft;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/swag-ops/orders")}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {order.orderNumber}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}
            >
              {statusConfig.label}
            </span>
          </div>
          <p className="text-gray-600">{order.name}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {order.status === "paid" && (
            <button
              onClick={handleStartProcessing}
              disabled={isUpdating}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              Bắt đầu xử lý
            </button>
          )}
          {order.status === "processing" && (
            <button
              onClick={handleCompleteKitting}
              disabled={isUpdating}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
            >
              <Package className="w-4 h-4" />
              Hoàn tất đóng gói
            </button>
          )}
          {(order.status === "kitting" || order.status === "processing") &&
            selectedRecipients.length > 0 && (
              <button
                onClick={() => setShowShipModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <Truck className="w-4 h-4" />
                Gửi hàng ({selectedRecipients.length})
              </button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              Thông tin đơn hàng
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Tổ chức</p>
                <p className="font-medium">
                  {order.organization?.businessName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Bộ quà</p>
                <p className="font-medium">
                  {order.swagPack?.name || order.packSnapshot?.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tổng tiền</p>
                <p className="font-medium text-orange-600">
                  {formatCurrency(order.pricing?.total || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ngày tạo</p>
                <p className="font-medium">{formatDate(order.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Recipients */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">
                Người nhận ({order.totalRecipients})
              </h2>
              <button
                onClick={toggleAllRecipients}
                className="text-sm text-orange-600 hover:underline"
              >
                {selectedRecipients.length > 0
                  ? "Bỏ chọn tất cả"
                  : "Chọn tất cả chưa gửi"}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left w-10"></th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Người nhận
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Địa chỉ
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                      Thông tin
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Mã vận đơn
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.recipientShipments?.map(
                    (shipment: any, index: number) => {
                      const shipmentStatus =
                        SHIPMENT_STATUS_CONFIG[shipment.shipmentStatus] ||
                        SHIPMENT_STATUS_CONFIG.pending;
                      const canSelect =
                        shipment.shipmentStatus !== "delivered" &&
                        shipment.shipmentStatus !== "shipped";

                      return (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3">
                            {canSelect && (
                              <input
                                type="checkbox"
                                checked={selectedRecipients.includes(
                                  shipment.recipient?.toString() || shipment._id
                                )}
                                onChange={() =>
                                  toggleRecipient(
                                    shipment.recipient?.toString() ||
                                      shipment._id
                                  )
                                }
                                className="w-4 h-4 text-orange-500 rounded"
                              />
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="font-medium">
                                  {shipment.recipientInfo?.firstName}{" "}
                                  {shipment.recipientInfo?.lastName}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {shipment.recipientInfo?.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                              <div className="text-sm">
                                {shipment.shippingAddress?.street && (
                                  <p>{shipment.shippingAddress.street}</p>
                                )}
                                <p className="text-gray-500">
                                  {[
                                    shipment.shippingAddress?.ward,
                                    shipment.shippingAddress?.district,
                                    shipment.shippingAddress?.city,
                                  ]
                                    .filter(Boolean)
                                    .join(", ")}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {shipment.selfServiceCompleted ? (
                              <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <Clock className="w-5 h-5 text-yellow-500 mx-auto" />
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${shipmentStatus.color}`}
                            >
                              {shipmentStatus.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {shipment.trackingNumber ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewTracking(
                                    shipment.recipient?.toString() ||
                                      shipment._id
                                  );
                                }}
                                className="font-mono text-sm text-blue-600 hover:underline"
                              >
                                {shipment.trackingNumber}
                              </button>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Activity Log */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Tiến độ</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Chờ xử lý</span>
                <span className="font-medium">
                  {order.stats?.pendingInfo || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Đang xử lý</span>
                <span className="font-medium">
                  {order.stats?.processing || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Đã gửi</span>
                <span className="font-medium text-cyan-600">
                  {order.stats?.shipped || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Đã giao</span>
                <span className="font-medium text-green-600">
                  {order.stats?.delivered || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Thất bại</span>
                <span className="font-medium text-red-600">
                  {order.stats?.failed || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <History className="w-5 h-5" />
              Lịch sử hoạt động
            </h2>
            {activityLog.length === 0 ? (
              <p className="text-gray-500 text-sm">Chưa có hoạt động nào</p>
            ) : (
              <div className="space-y-3">
                {activityLog.slice(0, 10).map((log: any, index: number) => (
                  <div key={index} className="flex gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5" />
                    <div>
                      <p className="text-gray-900">{log.action}</p>
                      <p className="text-gray-500 text-xs">
                        {log.by?.displayName || "System"} • {formatDate(log.at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ship Modal */}
      {showShipModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Gửi hàng</h3>
            <p className="text-gray-600 mb-4">
              Đánh dấu {selectedRecipients.length} người nhận là đã gửi hàng
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đơn vị vận chuyển
                </label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {carriers.length > 0 ? (
                    carriers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.available ? "✓" : "(Demo)"}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="ghn">Giao Hàng Nhanh</option>
                      <option value="ghtk">Giao Hàng Tiết Kiệm</option>
                      <option value="viettelpost">Viettel Post</option>
                      <option value="jt">J&T Express</option>
                      <option value="ninja">Ninja Van</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã vận đơn (áp dụng cho tất cả)
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="VD: GHN123456789"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowShipModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleMarkShipped}
                disabled={isUpdating}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                {isUpdating ? "Đang xử lý..." : "Xác nhận gửi hàng"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      {showTrackingModal && trackingInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Theo dõi vận chuyển</h3>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Trạng thái</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    trackingInfo.status === "delivered"
                      ? "bg-green-100 text-green-700"
                      : trackingInfo.status === "in_transit"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {trackingInfo.status}
                </span>
              </div>
              {trackingInfo.estimatedDelivery && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Dự kiến giao</span>
                  <span className="font-medium">
                    {formatDate(trackingInfo.estimatedDelivery)}
                  </span>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {trackingInfo.events?.map((event: any, index: number) => (
                <div key={index} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        index === 0 ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                    {index < trackingInfo.events.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-200 my-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-medium text-gray-900">
                      {event.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      {event.location && `${event.location} • `}
                      {formatDate(event.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setShowTrackingModal(false);
                setTrackingInfo(null);
              }}
              className="w-full mt-4 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
