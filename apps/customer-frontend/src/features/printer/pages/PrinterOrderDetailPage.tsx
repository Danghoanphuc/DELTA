// src/features/printer/pages/PrinterOrderDetailPage.tsx
// ✅ NEW: Trang chi tiết đơn hàng chuyên dụng cho Printer (Layout 3 cột)

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  ArrowLeft,
  Download,
  ExternalLink,
  CheckCircle,
  XCircle,
  Upload,
  FileText,
  MapPin,
  User,
  CreditCard,
  Package,
  Truck,
} from "lucide-react";
import { useOrderDetail } from "@/features/shop/hooks/useOrderDetail";
import { OrderStatus } from "@/types/order";
import { getStatusActions, getStatusBadge } from "@/features/printer/utils/orderHelpers";
import api from "@/shared/lib/axios";
import { toast } from "sonner";
import { Badge } from "@/shared/components/ui/badge";

export function PrinterOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  
  // ✅ FIX: Validate orderId trong useEffect (không gọi navigate trong render)
  useEffect(() => {
    if (!orderId || orderId === "undefined") {
      console.error("❌ PrinterOrderDetailPage - Invalid orderId:", orderId);
      toast.error("Mã đơn hàng không hợp lệ");
      navigate("/printer/dashboard?tab=orders");
    }
  }, [orderId, navigate]);
  
  // ✅ DEBUG: Log orderId để kiểm tra
  console.log("🔍 PrinterOrderDetailPage - orderId from useParams:", orderId);
  
  // ✅ FIX: Early return nếu orderId không hợp lệ (sau useEffect)
  if (!orderId || orderId === "undefined") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Đang chuyển hướng...</p>
      </div>
    );
  }
  
  const {
    order,
    loading,
    formatPrice,
    formatDate,
    getStatusConfig,
  } = useOrderDetail();
  
  // ✅ DEBUG: Log orderId sau khi useOrderDetail
  console.log("🔍 PrinterOrderDetailPage - orderId after useOrderDetail:", orderId);

  const [printerNotes, setPrinterNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // ✅ FIX: Update printerNotes khi order được load
  useEffect(() => {
    if (order) {
      setPrinterNotes((order as any)?.printerNotes || "");
    }
  }, [order]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Đang tải...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Không tìm thấy đơn hàng</p>
          <Button onClick={() => navigate("/printer/dashboard?tab=orders")}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const actions = getStatusActions(order.status);
  const artworkStatus = (order as any)?.artworkStatus || "pending_upload";

  const handleBack = () => navigate("/printer/dashboard?tab=orders");

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    setIsUpdatingStatus(true);
    try {
      await api.put(`/orders/printer/${orderId}/status`, {
        status: newStatus,
      });
      toast.success("✅ Đã cập nhật trạng thái đơn hàng");
      window.location.reload(); // Reload để lấy data mới
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Không thể cập nhật trạng thái"
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      await api.put(`/orders/printer/${orderId}/notes`, {
        printerNotes: printerNotes,
      });
      toast.success("✅ Đã lưu ghi chú");
    } catch (err: any) {
      toast.error("Không thể lưu ghi chú");
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleArtworkAction = async (action: "approve" | "reject") => {
    try {
      await api.put(`/orders/printer/${orderId}/artwork`, {
        artworkStatus: action === "approve" ? "approved" : "rejected",
      });
      toast.success(
        action === "approve" ? "✅ Đã duyệt file" : "❌ Đã từ chối file"
      );
      window.location.reload();
    } catch (err: any) {
      toast.error("Không thể cập nhật trạng thái file");
    }
  };

  // Helper để lấy file URL từ item
  const getItemFileUrl = (item: any) => {
    return (
      item.customization?.fileUrl ||
      item.options?.fileUrl ||
      item.designFileUrl ||
      null
    );
  };

  const getItemDesignId = (item: any) => {
    return (
      item.customization?.customizedDesignId ||
      item.options?.customizedDesignId ||
      null
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={handleBack} className="mb-4">
            <ArrowLeft size={18} className="mr-2" />
            Quay lại
          </Button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Quản lý đơn hàng
              </h1>
              <p className="text-gray-600">Mã đơn: {order.orderNumber}</p>
            </div>
            <div
              className={`${statusConfig.bgColor} ${statusConfig.color} px-4 py-2 rounded-lg flex items-center gap-2 font-semibold`}
            >
              <statusConfig.icon size={20} />
              {statusConfig.label}
            </div>
          </div>
        </div>

        {/* Layout 3 cột */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Cột 1: Thông tin (25%) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Tóm tắt đơn hàng */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tóm tắt đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng tiền:</span>
                  <span className="font-semibold text-blue-600">
                    {formatPrice(order.total || (order as any).printerTotalPrice || 0)}
                  </span>
                </div>
                {(order as any).commissionFee && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Hoa hồng:</span>
                    <span className="text-gray-700">
                      {formatPrice((order as any).commissionFee)}
                    </span>
                  </div>
                )}
                {(order as any).printerPayout && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Thực nhận:</span>
                    <span className="font-semibold text-green-600">
                      {formatPrice((order as any).printerPayout)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Thông tin khách hàng */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User size={18} />
                  Khách hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-medium">{order.customerName}</p>
                <p className="text-sm text-gray-600">{order.customerEmail}</p>
              </CardContent>
            </Card>

            {/* Địa chỉ giao hàng */}
            {order.shippingAddress && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin size={18} />
                    Địa chỉ giao hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p className="font-medium">
                    {order.shippingAddress.recipientName}
                  </p>
                  <p className="text-gray-600">
                    {order.shippingAddress.phone}
                  </p>
                  <p className="text-gray-600">
                    {order.shippingAddress.street}
                  </p>
                  <p className="text-gray-600">
                    {order.shippingAddress.ward && `${order.shippingAddress.ward}, `}
                    {order.shippingAddress.district},{" "}
                    {order.shippingAddress.city}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Thông tin thanh toán */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard size={18} />
                  Thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Phương thức:</span>
                  <span className="capitalize">
                    {order.paymentMethod || "COD"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái:</span>
                  <Badge
                    variant={
                      order.paymentStatus === "paid"
                        ? "default"
                        : order.paymentStatus === "pending"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {order.paymentStatus === "paid"
                      ? "✅ Đã thanh toán"
                      : order.paymentStatus === "pending"
                      ? "⏳ Chờ thanh toán"
                      : "💳 COD"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Ghi chú khách hàng */}
            {order.customerNotes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Ghi chú khách hàng</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{order.customerNotes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Cột 2: Sản xuất & File In (50%) - QUAN TRỌNG NHẤT */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quản lý File In (Artwork) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText size={18} />
                  Quản lý File In (Artwork)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {order.items.map((item, index) => {
                  const fileUrl = getItemFileUrl(item);
                  const designId = getItemDesignId(item);
                  return (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{item.productName}</h4>
                          <p className="text-sm text-gray-600">
                            Số lượng: {item.quantity} | Giá:{" "}
                            {formatPrice(item.pricePerUnit || 0)}/đơn vị
                          </p>
                        </div>
                        <Badge
                          variant={
                            artworkStatus === "approved"
                              ? "default"
                              : artworkStatus === "rejected"
                              ? "destructive"
                              : artworkStatus === "pending_approval"
                              ? "outline"
                              : "secondary"
                          }
                        >
                          {artworkStatus === "approved"
                            ? "Đã duyệt"
                            : artworkStatus === "rejected"
                            ? "Từ chối"
                            : artworkStatus === "pending_approval"
                            ? "Chờ duyệt"
                            : "Chờ upload"}
                        </Badge>
                      </div>

                      {/* File Actions */}
                      <div className="flex flex-wrap gap-2">
                        {fileUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="gap-2"
                          >
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download size={16} />
                              Tải File Gốc
                            </a>
                          </Button>
                        )}
                        {designId && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="gap-2"
                          >
                            <a
                              href={`/editor/${designId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink size={16} />
                              Mở Thiết kế 3D
                            </a>
                          </Button>
                        )}
                        {!fileUrl && !designId && (
                          <p className="text-sm text-gray-500">
                            Chưa có file đính kèm
                          </p>
                        )}
                      </div>

                      {/* Artwork Actions (chỉ hiển thị khi có file) */}
                      {index === 0 && fileUrl && artworkStatus === "pending_approval" && (
                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleArtworkAction("approve")}
                            className="gap-2"
                          >
                            <CheckCircle size={16} />
                            Duyệt File
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleArtworkAction("reject")}
                            className="gap-2"
                          >
                            <XCircle size={16} />
                            Yêu cầu sửa
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Gửi bản Proof (In thử) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Upload size={18} />
                  Gửi bản Proof (In thử)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Upload ảnh/PDF bản in thử để khách hàng duyệt trước khi in chính thức.
                </p>
                <Button variant="outline" size="sm" className="gap-2">
                  <Upload size={16} />
                  Upload Proof
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  (Tính năng đang phát triển)
                </p>
              </CardContent>
            </Card>

            {/* Ghi chú nội bộ */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ghi chú nội bộ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  placeholder="Nhập ghi chú nội bộ cho đơn hàng này..."
                  value={printerNotes}
                  onChange={(e) => setPrinterNotes(e.target.value)}
                  rows={4}
                />
                <Button
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  size="sm"
                >
                  {isSavingNotes ? "Đang lưu..." : "Lưu ghi chú"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Cột 3: Hành động & Lịch sử (25%) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Hành động */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Hành động</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {actions.map((action) => (
                  <Button
                    key={action.status}
                    variant={action.variant || "default"}
                    className="w-full"
                    onClick={() => handleUpdateStatus(action.status)}
                    disabled={isUpdatingStatus}
                  >
                    {action.label}
                  </Button>
                ))}
                {actions.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Không có hành động khả dụng
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Nhập mã vận đơn (khi ở trạng thái Ready hoặc Shipping) */}
            {(order.status === "ready" || order.status === "shipping") && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Truck size={18} />
                    Mã vận đơn
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <input
                    type="text"
                    placeholder="Nhập mã vận đơn..."
                    className="w-full px-3 py-2 border rounded-md"
                    defaultValue={(order as any).shippingCode || ""}
                  />
                  <Button variant="outline" size="sm" className="w-full">
                    Lưu mã vận đơn
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Lịch sử đơn hàng */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Lịch sử</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.statusHistory.map((history, index) => (
                      <div key={index} className="text-sm">
                        <div className="flex items-center gap-2">
                          <Package size={14} className="text-gray-400" />
                          <div>{getStatusBadge(history.status)}</div>
                        </div>
                        <p className="text-gray-500 ml-6">
                          {formatDate(history.timestamp)}
                        </p>
                        {history.note && (
                          <p className="text-gray-600 ml-6 text-xs">
                            {history.note}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

