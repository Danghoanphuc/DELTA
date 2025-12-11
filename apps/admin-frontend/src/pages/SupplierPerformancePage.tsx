// apps/admin-frontend/src/pages/SupplierPerformancePage.tsx
// ✅ SOLID: Single Responsibility - UI rendering only

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Star,
  RefreshCw,
  ArrowUpDown,
} from "lucide-react";
import { supplierApi, SupplierComparison } from "@/services/catalog.service";
import { useToast } from "@/hooks/use-toast";

type SortField =
  | "onTimeRate"
  | "qualityScore"
  | "averageLeadTime"
  | "averageCost"
  | "rating";
type SortDirection = "asc" | "desc";

export default function SupplierPerformancePage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<SupplierComparison[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>("onTimeRate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setIsLoading(true);
    try {
      const data = await supplierApi.compareSuppliers();
      setSuppliers(data);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể tải dữ liệu",
        variant: "destructive",
      });
      console.error("Error fetching suppliers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedSuppliers = [...suppliers].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    const multiplier = sortDirection === "asc" ? 1 : -1;
    return (aValue - bValue) * multiplier;
  });

  const getPerformanceColor = (value: number, field: SortField) => {
    if (field === "onTimeRate" || field === "qualityScore") {
      if (value >= 95) return "text-green-600";
      if (value >= 90) return "text-yellow-600";
      return "text-red-600";
    }
    if (field === "averageLeadTime") {
      if (value <= 5) return "text-green-600";
      if (value <= 7) return "text-yellow-600";
      return "text-red-600";
    }
    return "text-gray-900";
  };

  const SortButton = ({
    field,
    label,
  }: {
    field: SortField;
    label: string;
  }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-orange-600"
    >
      {label}
      <ArrowUpDown className="w-4 h-4" />
      {sortField === field && (
        <span className="text-orange-600">
          {sortDirection === "asc" ? "↑" : "↓"}
        </span>
      )}
    </button>
  );

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          So sánh nhà cung cấp
        </h1>
        <p className="text-gray-600">Đánh giá hiệu suất và chất lượng</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">
              {suppliers.length}
            </span>
          </div>
          <p className="text-sm text-gray-600">Tổng số NCC</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-2xl font-bold text-green-600">
              {suppliers.filter((s) => s.onTimeRate >= 90).length}
            </span>
          </div>
          <p className="text-sm text-gray-600">Giao hàng tốt (≥90%)</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="text-2xl font-bold text-gray-900">
              {(
                suppliers.reduce((sum, s) => sum + s.rating, 0) /
                suppliers.length
              ).toFixed(1)}
            </span>
          </div>
          <p className="text-sm text-gray-600">Đánh giá TB</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            <span className="text-2xl font-bold text-red-600">
              {suppliers.filter((s) => s.onTimeRate < 80).length}
            </span>
          </div>
          <p className="text-sm text-gray-600">Cần cải thiện (&lt;80%)</p>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">
                  Nhà cung cấp
                </th>
                <th className="text-center py-4 px-4 text-sm font-medium text-gray-700">
                  <SortButton field="onTimeRate" label="Giao đúng hạn" />
                </th>
                <th className="text-center py-4 px-4 text-sm font-medium text-gray-700">
                  <SortButton field="qualityScore" label="Chất lượng" />
                </th>
                <th className="text-center py-4 px-4 text-sm font-medium text-gray-700">
                  <SortButton field="averageLeadTime" label="Lead time TB" />
                </th>
                <th className="text-right py-4 px-4 text-sm font-medium text-gray-700">
                  <SortButton field="averageCost" label="Chi phí TB" />
                </th>
                <th className="text-center py-4 px-4 text-sm font-medium text-gray-700">
                  Đơn hàng
                </th>
                <th className="text-center py-4 px-4 text-sm font-medium text-gray-700">
                  <SortButton field="rating" label="Đánh giá" />
                </th>
                <th className="text-center py-4 px-4 text-sm font-medium text-gray-700">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedSuppliers.map((supplier, index) => (
                <tr
                  key={supplier.supplierId}
                  className={`border-b hover:bg-gray-50 ${
                    index < 3 ? "bg-green-50/30" : ""
                  }`}
                >
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-gray-900">
                        {supplier.supplierName}
                      </p>
                      {index < 3 && (
                        <span className="text-xs text-green-600 font-medium">
                          Top {index + 1}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex flex-col items-center">
                      <span
                        className={`text-lg font-bold ${getPerformanceColor(
                          supplier.onTimeRate,
                          "onTimeRate"
                        )}`}
                      >
                        {supplier.onTimeRate.toFixed(1)}%
                      </span>
                      {supplier.onTimeRate >= 95 && (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      )}
                      {supplier.onTimeRate < 80 && (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`text-lg font-bold ${getPerformanceColor(
                        supplier.qualityScore,
                        "qualityScore"
                      )}`}
                    >
                      {supplier.qualityScore.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span
                        className={`font-medium ${getPerformanceColor(
                          supplier.averageLeadTime,
                          "averageLeadTime"
                        )}`}
                      >
                        {supplier.averageLeadTime.toFixed(1)} ngày
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {supplier.averageCost.toLocaleString()}đ
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="text-gray-900 font-medium">
                      {supplier.totalOrders}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium text-gray-900">
                        {supplier.rating.toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() =>
                        navigate(`/suppliers/${supplier.supplierId}`)
                      }
                      className="px-3 py-1 text-sm text-orange-600 hover:bg-orange-50 rounded-lg"
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top performers
          </h3>
          <div className="space-y-3">
            {sortedSuppliers.slice(0, 5).map((supplier, index) => (
              <div
                key={supplier.supplierId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-400">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">
                      {supplier.supplierName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {supplier.totalOrders} đơn hàng
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    {supplier.onTimeRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">On-time</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Need Improvement */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Cần cải thiện
          </h3>
          <div className="space-y-3">
            {sortedSuppliers
              .filter((s) => s.onTimeRate < 90 || s.qualityScore < 95)
              .slice(0, 5)
              .map((supplier) => (
                <div
                  key={supplier.supplierId}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {supplier.supplierName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {supplier.totalOrders} đơn hàng
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-red-600 font-medium">
                      On-time: {supplier.onTimeRate.toFixed(1)}%
                    </p>
                    <p className="text-sm text-red-600 font-medium">
                      Quality: {supplier.qualityScore.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            {sortedSuppliers.filter(
              (s) => s.onTimeRate < 90 || s.qualityScore < 95
            ).length === 0 && (
              <p className="text-gray-500 text-center py-4">
                Tất cả nhà cung cấp đều đạt tiêu chuẩn
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
