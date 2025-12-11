// src/pages/SwagAnalyticsPage.tsx
// ✅ SOLID Refactored: UI composition only

import {
  BarChart3,
  TrendingUp,
  Package,
  Truck,
  Clock,
  AlertTriangle,
  Download,
  RefreshCw,
  Calendar,
  Building2,
} from "lucide-react";
import { useAnalytics } from "@/hooks/useSwagAnalytics";
import { MetricCard } from "@/components/analytics/MetricCard";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export default function SwagAnalyticsPage() {
  const {
    dateRange,
    setDateRange,
    isLoading,
    orderTrends,
    fulfillmentMetrics,
    topOrganizations,
    carrierPerformance,
    inventoryAlerts,
    fetchAnalytics,
    exportCSV,
  } = useAnalytics();

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Báo cáo và thống kê Swag Operations</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, from: e.target.value }))
              }
              className="border-none focus:outline-none text-sm"
            />
            <span className="text-gray-400">-</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, to: e.target.value }))
              }
              className="border-none focus:outline-none text-sm"
            />
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Fulfillment Metrics */}
      {fulfillmentMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <MetricCard
            icon={Clock}
            iconColor="text-blue-500"
            label="Thời gian xử lý TB"
            value={`${fulfillmentMetrics.avgProcessingTime}h`}
          />
          <MetricCard
            icon={Truck}
            iconColor="text-cyan-500"
            label="Thời gian gửi TB"
            value={`${fulfillmentMetrics.avgShippingTime}h`}
          />
          <MetricCard
            icon={Package}
            iconColor="text-green-500"
            label="Thời gian giao TB"
            value={`${fulfillmentMetrics.avgDeliveryTime}h`}
          />
          <MetricCard
            icon={TrendingUp}
            iconColor="text-orange-500"
            label="Tỷ lệ hoàn thành"
            value={`${fulfillmentMetrics.fulfillmentRate}%`}
            valueColor="text-green-600"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Order Trends Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Xu hướng đơn hàng
          </h3>
          {orderTrends.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Chưa có dữ liệu</p>
          ) : (
            <div className="space-y-2">
              {orderTrends.slice(-10).map((trend) => (
                <div key={trend.date} className="flex items-center gap-4">
                  <span className="w-24 text-sm text-gray-500">
                    {trend.date}
                  </span>
                  <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (trend.orders /
                            Math.max(...orderTrends.map((t) => t.orders))) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="w-12 text-sm font-medium text-right">
                    {trend.orders}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Organizations */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Top tổ chức
          </h3>
          {topOrganizations.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Chưa có dữ liệu</p>
          ) : (
            <div className="space-y-3">
              {topOrganizations.slice(0, 5).map((org, index) => (
                <div
                  key={org.organizationId}
                  className="flex items-center gap-4"
                >
                  <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {org.businessName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {org.orders} đơn • {org.recipients} người nhận
                    </p>
                  </div>
                  <span className="font-medium text-green-600">
                    {formatCurrency(org.revenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Carrier Performance */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Hiệu suất vận chuyển
          </h3>
          {carrierPerformance.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Chưa có dữ liệu</p>
          ) : (
            <div className="space-y-4">
              {carrierPerformance.map((carrier) => (
                <div key={carrier.carrier} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{carrier.carrierName}</span>
                    <span
                      className={`text-sm font-medium ${
                        carrier.successRate >= 95
                          ? "text-green-600"
                          : carrier.successRate >= 90
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {carrier.successRate}% thành công
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>{carrier.shipments} đơn</span>
                    <span className="text-green-600">
                      {carrier.delivered} giao
                    </span>
                    <span className="text-red-600">
                      {carrier.failed} thất bại
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inventory Alerts */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Cảnh báo tồn kho
          </h3>
          {inventoryAlerts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 mx-auto mb-2 text-green-500" />
              <p className="text-gray-500">Không có cảnh báo</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {inventoryAlerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    alert.severity === "critical"
                      ? "bg-red-50 border-red-200"
                      : "bg-yellow-50 border-yellow-200"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle
                      className={`w-4 h-4 mt-0.5 ${
                        alert.severity === "critical"
                          ? "text-red-500"
                          : "text-yellow-500"
                      }`}
                    />
                    <div>
                      <p className="font-medium text-gray-900">{alert.item}</p>
                      <p className="text-sm text-gray-600">
                        {alert.organization} • SKU: {alert.sku}
                      </p>
                      <p className="text-sm">
                        Còn lại:{" "}
                        <span className="font-medium">{alert.quantity}</span>
                        {alert.threshold && ` / Ngưỡng: ${alert.threshold}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
