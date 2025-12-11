// apps/admin-frontend/src/pages/SupplierDetailPage.tsx
// ✅ SOLID: Single Responsibility - UI rendering only

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Star,
  TrendingUp,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import {
  supplierApi,
  Supplier,
  SupplierPerformanceMetrics,
  LeadTimeRecord,
} from "@/services/catalog.service";
import { useToast } from "@/hooks/use-toast";

export default function SupplierDetailPage() {
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [performance, setPerformance] =
    useState<SupplierPerformanceMetrics | null>(null);
  const [leadTimeHistory, setLeadTimeHistory] = useState<LeadTimeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    if (id) {
      fetchSupplierData();
    }
  }, [id]);

  const fetchSupplierData = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const [supplierData, performanceData, leadTimeData] = await Promise.all([
        supplierApi.getById(id),
        supplierApi.getPerformance(id),
        supplierApi.getLeadTimeHistory(id),
      ]);

      setSupplier(supplierData);
      setPerformance(performanceData);
      setLeadTimeHistory(leadTimeData);
      setRating(supplierData.rating);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description:
          error.response?.data?.message ||
          "Không thể tải thông tin nhà cung cấp",
        variant: "destructive",
      });
      console.error("Error fetching supplier data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRating = async (newRating: number) => {
    if (!id) return;

    try {
      await supplierApi.updateRating(id, newRating);
      setRating(newRating);
      toast({ title: "Thành công", description: "Đã cập nhật đánh giá" });
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description:
          error.response?.data?.message || "Không thể cập nhật đánh giá",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!supplier || !performance) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-600">Không tìm thấy nhà cung cấp</p>
          <button
            onClick={() => navigate("/suppliers")}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/suppliers")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {supplier.name}
                {supplier.isPreferred && (
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                )}
              </h1>
              <p className="text-gray-600">{supplier.code}</p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              supplier.isActive
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {supplier.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Thông tin liên hệ
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-gray-900">{supplier.contactInfo.email}</p>
            </div>
          </div>
          {supplier.contactInfo.phone && (
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Điện thoại</p>
                <p className="text-gray-900">{supplier.contactInfo.phone}</p>
              </div>
            </div>
          )}
          {supplier.contactInfo.city && (
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Địa chỉ</p>
                <p className="text-gray-900">
                  {supplier.contactInfo.address &&
                    `${supplier.contactInfo.address}, `}
                  {supplier.contactInfo.city}
                </p>
              </div>
            </div>
          )}
        </div>

        {supplier.capabilities && supplier.capabilities.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-500 mb-2">Năng lực</p>
            <div className="flex flex-wrap gap-2">
              {supplier.capabilities.map((cap) => (
                <span
                  key={cap}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                >
                  {cap}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Đánh giá</h2>
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleUpdateRating(star)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= rating
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="text-2xl font-bold text-gray-900">
            {rating.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* On-Time Delivery */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span
              className={`text-2xl font-bold ${
                performance.onTimeDeliveryRate >= 90
                  ? "text-green-600"
                  : performance.onTimeDeliveryRate >= 80
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {performance.onTimeDeliveryRate.toFixed(1)}%
            </span>
          </div>
          <p className="text-sm text-gray-600">Giao đúng hạn</p>
          <p className="text-xs text-gray-500 mt-1">
            {performance.onTimeDeliveries}/{performance.completedOrders} đơn
          </p>
        </div>

        {/* Quality Score */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <span
              className={`text-2xl font-bold ${
                performance.qualityScore >= 95
                  ? "text-green-600"
                  : performance.qualityScore >= 90
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {performance.qualityScore.toFixed(1)}%
            </span>
          </div>
          <p className="text-sm text-gray-600">Chất lượng</p>
          <p className="text-xs text-gray-500 mt-1">
            {performance.passedQCChecks}/{performance.totalQCChecks} QC pass
          </p>
        </div>

        {/* Average Lead Time */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">
              {performance.averageLeadTime.toFixed(1)}
            </span>
          </div>
          <p className="text-sm text-gray-600">Lead time TB</p>
          <p className="text-xs text-gray-500 mt-1">
            {performance.minLeadTime}-{performance.maxLeadTime} ngày
          </p>
        </div>

        {/* Average Cost */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-orange-600" />
            <span className="text-2xl font-bold text-gray-900">
              {performance.averageCost.toLocaleString()}đ
            </span>
          </div>
          <p className="text-sm text-gray-600">Chi phí TB</p>
          <p className="text-xs text-gray-500 mt-1">
            Tổng: {performance.totalSpent.toLocaleString()}đ
          </p>
        </div>
      </div>

      {/* Lead Time History */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Lịch sử lead time
        </h2>
        {leadTimeHistory.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Chưa có dữ liệu</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                    Mã đơn
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                    Ngày đặt
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                    Dự kiến
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                    Thực tế
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                    Lead time
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody>
                {leadTimeHistory.slice(0, 10).map((record) => (
                  <tr
                    key={record.productionOrderId}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {record.productionOrderNumber}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(record.orderedAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(
                        record.expectedCompletionDate
                      ).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(record.actualCompletionDate).toLocaleDateString(
                        "vi-VN"
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-right font-medium text-gray-900">
                      {record.leadTimeDays} ngày
                    </td>
                    <td className="py-3 px-4 text-center">
                      {record.wasOnTime ? (
                        <CheckCircle className="w-5 h-5 text-green-600 inline" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 inline" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
