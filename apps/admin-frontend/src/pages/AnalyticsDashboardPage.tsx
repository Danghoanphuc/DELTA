/**
 * Analytics Dashboard Page
 *
 * Main analytics dashboard with overview and export functionality
 * Combines product, supplier, and order analytics
 *
 * @module pages/AnalyticsDashboardPage
 */

import React, { useState } from "react";
import {
  useProductAnalytics,
  useSupplierAnalytics,
  useOrderAnalytics,
  useReportExport,
} from "../hooks/useAnalytics";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Checkbox } from "../components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
  Users,
  ShoppingCart,
  DollarSign,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function AnalyticsDashboardPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    "products",
    "suppliers",
    "orders",
  ]);

  const productAnalytics = useProductAnalytics({ startDate, endDate });
  const supplierAnalytics = useSupplierAnalytics({ startDate, endDate });
  const orderAnalytics = useOrderAnalytics({ startDate, endDate });
  const { exportReport, isExporting } = useReportExport();

  const isLoading =
    productAnalytics.isLoading ||
    supplierAnalytics.isLoading ||
    orderAnalytics.isLoading;

  const handleRefreshAll = () => {
    productAnalytics.refetch();
    supplierAnalytics.refetch();
    orderAnalytics.refetch();
  };

  const handleExport = async () => {
    await exportReport({
      startDate,
      endDate,
      metrics: selectedMetrics,
    });
    setExportDialogOpen(false);
  };

  const toggleMetric = (metric: string) => {
    setSelectedMetrics((prev) =>
      prev.includes(metric)
        ? prev.filter((m) => m !== metric)
        : [...prev, metric]
    );
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
  const totalOrders = (orderAnalytics.data?.orderVolumeTrend || []).reduce(
    (sum, d) => sum + d.orderCount,
    0
  );
  const totalRevenue = (orderAnalytics.data?.revenueTrend || []).reduce(
    (sum, d) => sum + d.revenue,
    0
  );
  const totalProducts = (productAnalytics.data?.topProducts || []).length;
  const totalSuppliers = (supplierAnalytics.data?.supplierComparison || [])
    .length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Tổng Quan Phân Tích
          </h1>
          <p className="text-gray-600 mt-1">
            Dashboard tổng hợp dữ liệu kinh doanh
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Xuất báo cáo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Xuất Báo Cáo Phân Tích</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn dữ liệu xuất
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Checkbox
                        id="products"
                        checked={selectedMetrics.includes("products")}
                        onCheckedChange={() => toggleMetric("products")}
                      />
                      <label htmlFor="products" className="ml-2 text-sm">
                        Phân tích sản phẩm
                      </label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        id="suppliers"
                        checked={selectedMetrics.includes("suppliers")}
                        onCheckedChange={() => toggleMetric("suppliers")}
                      />
                      <label htmlFor="suppliers" className="ml-2 text-sm">
                        Phân tích nhà cung cấp
                      </label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        id="orders"
                        checked={selectedMetrics.includes("orders")}
                        onCheckedChange={() => toggleMetric("orders")}
                      />
                      <label htmlFor="orders" className="ml-2 text-sm">
                        Phân tích đơn hàng
                      </label>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleExport}
                  disabled={isExporting || selectedMetrics.length === 0}
                  className="w-full"
                >
                  {isExporting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Đang xuất...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Xuất báo cáo
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={handleRefreshAll} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <p className="text-2xl font-bold text-gray-900 mt-1">
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
                <p className="text-sm text-gray-600">Sản phẩm</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {totalProducts}
                </p>
              </div>
              <Package className="h-12 w-12 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Nhà cung cấp</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {totalSuppliers}
                </p>
              </div>
              <Users className="h-12 w-12 text-orange-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/analytics/products">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Package className="h-5 w-5 mr-2 text-purple-600" />
                Phân Tích Sản Phẩm
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Xem chi tiết top sản phẩm, doanh thu theo danh mục, và vòng quay
                tồn kho
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/analytics/suppliers">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Users className="h-5 w-5 mr-2 text-orange-600" />
                Phân Tích Nhà Cung Cấp
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                So sánh hiệu suất, tỷ lệ giao đúng hạn, và điểm chất lượng
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/analytics/orders">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                Xu Hướng Đơn Hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Theo dõi khối lượng đơn hàng, doanh thu, và giá trị đơn trung
                bình
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Top Products Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Top Sản Phẩm Bán Chạy
            </CardTitle>
            <Link to="/analytics/products">
              <Button variant="ghost" size="sm">
                Xem tất cả →
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={(productAnalytics.data?.topProducts || []).slice(0, 5)}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="productName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalSold" fill="#0088FE" name="Số lượng bán" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Order Volume Trend Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Xu Hướng Đơn Hàng
            </CardTitle>
            <Link to="/analytics/orders">
              <Button variant="ghost" size="sm">
                Xem tất cả →
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              data={(orderAnalytics.data?.orderVolumeTrend || []).slice(-7)}
            >
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
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
