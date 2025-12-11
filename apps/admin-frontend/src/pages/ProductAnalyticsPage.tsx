/**
 * Product Analytics Page
 *
 * Displays product performance analytics including:
 * - Top selling products
 * - Revenue by category
 * - Inventory turnover
 * - Slow-moving items
 *
 * @module pages/ProductAnalyticsPage
 */

import React, { useState } from "react";
import { useProductAnalytics } from "../hooks/useAnalytics";
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
  BarChart,
  Bar,
  LineChart,
  Line,
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
  Download,
  RefreshCw,
  TrendingUp,
  Package,
  DollarSign,
  AlertTriangle,
} from "lucide-react";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

export default function ProductAnalyticsPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [category, setCategory] = useState("all");

  const { data, isLoading, filters, setFilters, refetch } = useProductAnalytics(
    {
      startDate,
      endDate,
      category: category === "all" ? undefined : category,
    }
  );

  const handleApplyFilters = () => {
    setFilters({
      startDate,
      endDate,
      category: category === "all" ? undefined : category,
    });
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setCategory("all");
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
            Phân Tích Sản Phẩm
          </h1>
          <p className="text-gray-600 mt-1">
            Theo dõi hiệu suất và xu hướng bán hàng
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
                Danh mục
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="apparel">Quần áo</SelectItem>
                  <SelectItem value="accessories">Phụ kiện</SelectItem>
                  <SelectItem value="drinkware">Ly cốc</SelectItem>
                  <SelectItem value="tech">Công nghệ</SelectItem>
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

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Top Sản Phẩm Bán Chạy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.topProducts || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="productName" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="totalSold"
                fill="#0088FE"
                name="Số lượng bán"
              />
              <Bar
                yAxisId="right"
                dataKey="totalRevenue"
                fill="#00C49F"
                name="Doanh thu"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Revenue by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Doanh Thu Theo Danh Mục
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data?.revenueByCategory || []}
                  dataKey="revenue"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry: any) => `${entry.category}: ${entry.percent}%`}
                >
                  {(data?.revenueByCategory || []).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Inventory Turnover */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Vòng Quay Tồn Kho
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(data?.inventoryTurnover || []).slice(0, 5).map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {item.productName}
                    </p>
                    <p className="text-sm text-gray-600">
                      Tồn kho: {item.stockLevel} | {item.daysToSell} ngày
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">
                      {item.turnoverRate.toFixed(1)}x
                    </p>
                    <p className="text-xs text-gray-500">Vòng quay</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Slow Moving Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
            Sản Phẩm Bán Chậm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Sản phẩm</th>
                  <th className="text-right py-3 px-4">Ngày chưa bán</th>
                  <th className="text-right py-3 px-4">Tồn kho</th>
                  <th className="text-right py-3 px-4">Giá trị ước tính</th>
                </tr>
              </thead>
              <tbody>
                {(data?.slowMovingItems || []).map((item) => (
                  <tr
                    key={item.productId}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 font-medium">
                      {item.productName}
                    </td>
                    <td className="py-3 px-4 text-right text-yellow-600">
                      {item.daysSinceLastSale} ngày
                    </td>
                    <td className="py-3 px-4 text-right">{item.stockLevel}</td>
                    <td className="py-3 px-4 text-right font-medium">
                      {item.estimatedValue.toLocaleString("vi-VN")} ₫
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
