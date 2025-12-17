// apps/admin-frontend/src/components/suppliers/SupplierPerformanceCard.tsx
// ✅ SOLID: Single Responsibility - Display performance metrics

import {
  TrendingUp,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  BarChart3,
} from "lucide-react";
import {
  SupplierPerformanceMetrics,
  LeadTimeRecord,
} from "@/services/catalog.service";

interface SupplierPerformanceCardProps {
  performance: SupplierPerformanceMetrics;
  leadTimeHistory: LeadTimeRecord[];
}

export function SupplierPerformanceCard({
  performance,
  leadTimeHistory,
}: SupplierPerformanceCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getScoreColor = (
    score: number,
    thresholds: { good: number; warning: number }
  ) => {
    if (score >= thresholds.good) return "text-green-600";
    if (score >= thresholds.warning) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* On-Time Delivery */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <span
              className={`text-2xl font-bold ${getScoreColor(
                performance.onTimeDeliveryRate || 0,
                { good: 90, warning: 80 }
              )}`}
            >
              {(performance.onTimeDeliveryRate || 0).toFixed(1)}%
            </span>
          </div>
          <p className="text-sm font-medium text-gray-900">Giao đúng hạn</p>
          <p className="text-xs text-gray-500 mt-1">
            {performance.onTimeDeliveries || 0}/
            {performance.completedOrders || 0} đơn
          </p>
        </div>

        {/* Quality Score */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <span
              className={`text-2xl font-bold ${getScoreColor(
                performance.qualityScore || 0,
                { good: 95, warning: 90 }
              )}`}
            >
              {(performance.qualityScore || 0).toFixed(1)}%
            </span>
          </div>
          <p className="text-sm font-medium text-gray-900">Chất lượng</p>
          <p className="text-xs text-gray-500 mt-1">
            {performance.passedQCChecks || 0}/{performance.totalQCChecks || 0}{" "}
            QC pass
          </p>
        </div>

        {/* Average Lead Time */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {(performance.averageLeadTime || 0).toFixed(1)}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-900">
            Lead time TB (ngày)
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {performance.minLeadTime || 0} - {performance.maxLeadTime || 0} ngày
          </p>
        </div>

        {/* Average Cost */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              {formatCurrency(performance.averageCost || 0)}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-900">Chi phí TB/đơn</p>
          <p className="text-xs text-gray-500 mt-1">
            Tổng: {formatCurrency(performance.totalSpent || 0)}
          </p>
        </div>
      </div>

      {/* Lead Time History */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">Lịch sử lead time</h3>
          </div>
          <span className="text-sm text-gray-500">
            {leadTimeHistory?.length || 0} bản ghi
          </span>
        </div>

        {!Array.isArray(leadTimeHistory) || leadTimeHistory.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Chưa có dữ liệu lead time
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                    Mã đơn
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                    Ngày đặt
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                    Dự kiến
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                    Thực tế
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                    Lead time
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leadTimeHistory.slice(0, 10).map((record) => (
                  <tr
                    key={record.productionOrderId}
                    className="hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
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
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                          <CheckCircle className="w-3 h-3" />
                          Đúng hạn
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">
                          <XCircle className="w-3 h-3" />
                          Trễ
                        </span>
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
