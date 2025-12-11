/**
 * Order Trends Page
 *
 * Displays order analytics including:
 * - Order volume trends
 * - Revenue trends
 * - Average order value trends
 * - Orders by status
 *
 * @module pages/OrderTrendsPage
 */

import React, { useState } from "react";
import { useOrderAnalytics } from "../hooks/useAnalytics";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
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
  ShoppingCart,
  DollarSign,
  Target,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  draft: "#9CA3AF",
  pending_info: "#F59E0B",
  pending_payment: "#EF4444",
  paid: "#10B981",
  in_production: "#3B82F6",
  ready_to_ship: "#8B5CF6",
  shipped: "#06B6D4",
  delivered: "#059669",
  cancelled: "#DC2626",
};

export default function OrderTrendsPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [groupBy, setGroupBy] = useState<"day" | "week" | "month">("day");

  const { data, isLoading, filters, setFilters, refetch } = useOrderAnalytics({
    startDate,
    endDate,
    groupBy,
  });

  const handleApplyFilters = () => {
    setFilters({ startDate, endDate, groupBy });
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setGroupBy("day");
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

  // Calculate summary stats
  const totalOrders = (data?.orderVolumeTrend || []).reduce(
    (sum, d) => sum + d.orderCount,
    0
  );
  const totalRevenue = (data?.revenueTrend || []).reduce(
    (sum, d) => sum + d.revenue,
    0
  );
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Xu Hướng Đơn Hàng
          </h1>
          <p className="text-gray-600 mt-1">
            Theo dõi khối lượng và doanh thu đơn hàng
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nhóm theo
              </label>
              <Select
                value={groupBy}
                onValueChange={(value: any) => setGroupBy(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Ngày</SelectItem>
                  <SelectItem value="week">Tuần</SelectItem>
                  <SelectItem value="month">Tháng</SelectItem>
                </SelectContent>
              </Select>
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng đơn hàng</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {totalOrders}
                </p>
              </div>
              <ShoppingCart className="h-12 w-12 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng doanh thu</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {totalRevenue.toLocaleString("vi-VN", {
                    maximumFractionDigits: 0,
                  })}
                </p>
                <p className="text-xs text-gray-500">₫</p>
              </div>
              <DollarSign className="h-12 w-12 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Giá trị đơn TB</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {averageOrderValue.toLocaleString("vi-VN", {
                    maximumFractionDigits: 0,
                  })}
                </p>
                <p className="text-xs text-gray-500">₫</p>
              </div>
              <Target className="h-12 w-12 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Volume Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Xu Hướng Khối Lượng Đơn Hàng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data?.orderVolumeTrend || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="orderCount"
                stroke="#0088FE"
                name="Tổng đơn"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="newOrders"
                stroke="#00C49F"
                name="Đơn mới"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="completedOrders"
                stroke="#FFBB28"
                name="Đơn hoàn thành"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Revenue and AOV Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Xu Hướng Doanh Thu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.revenueTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#0088FE" name="Doanh thu" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AOV Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Xu Hướng Giá Trị Đơn Trung Bình
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data?.aovTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="averageOrderValue"
                  stroke="#8B5CF6"
                  name="AOV"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Orders by Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Đơn Hàng Theo Trạng Thái
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data?.ordersByStatus || []}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry: any) => `${entry.status}: ${entry.percent}%`}
                >
                  {(data?.ordersByStatus || []).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.status] || "#9CA3AF"}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-2">
              {(data?.ordersByStatus || []).map((status) => (
                <div
                  key={status.status}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <div
                      className="w-4 h-4 rounded mr-3"
                      style={{
                        backgroundColor:
                          STATUS_COLORS[status.status] || "#9CA3AF",
                      }}
                    />
                    <span className="font-medium">{status.status}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{status.count}</p>
                    <p className="text-sm text-gray-600">
                      {status.percentage}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
