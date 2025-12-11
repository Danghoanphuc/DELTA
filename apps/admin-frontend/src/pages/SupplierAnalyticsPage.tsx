/**
 * Supplier Analytics Page
 *
 * Displays supplier performance analytics including:
 * - Supplier comparison table
 * - On-time delivery trends
 * - Quality score trends
 *
 * @module pages/SupplierAnalyticsPage
 */

import React, { useState } from "react";
import { useSupplierAnalytics } from "../hooks/useAnalytics";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Calendar,
  RefreshCw,
  TrendingUp,
  Clock,
  Star,
  DollarSign,
  Package,
} from "lucide-react";

export default function SupplierAnalyticsPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data, isLoading, filters, setFilters, refetch } =
    useSupplierAnalytics({
      startDate,
      endDate,
    });

  const handleApplyFilters = () => {
    setFilters({ startDate, endDate });
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setFilters({});
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Đang tải dữ liệu phân tích...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Phân Tích Nhà Cung Cấp
          </h1>
          <p className="text-gray-600 mt-1">
            Theo dõi hiệu suất và chất lượng nhà cung cấp
          </p>
        </div>
        <Button onClick={refetch} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Làm mới
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Từ ngày
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đến ngày
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleApplyFilters} className="flex-1">
                Áp dụng
              </Button>
              <Button onClick={handleReset} variant="outline">
                Đặt lại
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supplier Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            So Sánh Nhà Cung Cấp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Nhà cung cấp</th>
                  <th className="text-center py-3 px-4">
                    <div className="flex items-center justify-center">
                      <Package className="h-4 w-4 mr-1" />
                      Đơn hàng
                    </div>
                  </th>
                  <th className="text-center py-3 px-4">
                    <div className="flex items-center justify-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Giao đúng hạn
                    </div>
                  </th>
                  <th className="text-center py-3 px-4">
                    <div className="flex items-center justify-center">
                      <Star className="h-4 w-4 mr-1" />
                      Chất lượng
                    </div>
                  </th>
                  <th className="text-center py-3 px-4">
                    <div className="flex items-center justify-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Lead Time TB
                    </div>
                  </th>
                  <th className="text-right py-3 px-4">
                    <div className="flex items-center justify-end">
                      <DollarSign className="h-4 w-4 mr-1" />
                      Tổng chi phí
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {(data?.supplierComparison || []).map((supplier) => (
                  <tr
                    key={supplier.supplierId}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 font-medium">
                      {supplier.supplierName}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {supplier.totalOrders}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          supplier.onTimeDeliveryRate >= 90
                            ? "bg-green-100 text-green-800"
                            : supplier.onTimeDeliveryRate >= 70
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {supplier.onTimeDeliveryRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="font-medium">
                          {supplier.qualityScore.toFixed(1)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {supplier.averageLeadTime.toFixed(1)} ngày
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      {supplier.totalCost.toLocaleString("vi-VN")} ₫
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* On-Time Delivery Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Xu Hướng Giao Đúng Hạn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data?.onTimeDeliveryTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="onTimeRate"
                  stroke="#0088FE"
                  name="Tỷ lệ giao đúng hạn (%)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quality Score Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2" />
              Xu Hướng Điểm Chất Lượng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.qualityScoreTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="averageScore"
                  fill="#00C49F"
                  name="Điểm chất lượng trung bình"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Package className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold text-gray-900">
                {(data?.supplierComparison || []).reduce(
                  (sum, s) => sum + s.totalOrders,
                  0
                )}
              </p>
              <p className="text-sm text-gray-600">Tổng đơn hàng</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold text-gray-900">
                {(
                  (data?.supplierComparison || []).reduce(
                    (sum, s) => sum + s.onTimeDeliveryRate,
                    0
                  ) / (data?.supplierComparison || []).length || 0
                ).toFixed(1)}
                %
              </p>
              <p className="text-sm text-gray-600">Giao đúng hạn TB</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Star className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <p className="text-2xl font-bold text-gray-900">
                {(
                  (data?.supplierComparison || []).reduce(
                    (sum, s) => sum + s.qualityScore,
                    0
                  ) / (data?.supplierComparison || []).length || 0
                ).toFixed(1)}
              </p>
              <p className="text-sm text-gray-600">Điểm chất lượng TB</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold text-gray-900">
                {(data?.supplierComparison || [])
                  .reduce((sum, s) => sum + s.totalCost, 0)
                  .toLocaleString("vi-VN", { maximumFractionDigits: 0 })}
              </p>
              <p className="text-sm text-gray-600">Tổng chi phí (₫)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
