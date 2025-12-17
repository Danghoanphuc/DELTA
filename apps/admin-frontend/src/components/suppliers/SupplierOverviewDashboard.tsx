// apps/admin-frontend/src/components/suppliers/SupplierOverviewDashboard.tsx
// Simplified dashboard tổng quan cho supplier - tập trung vào metrics quan trọng

import { useState, useEffect } from "react";
import {
  Eye,
  ShoppingCart,
  DollarSign,
  Star,
  FileText,
  Package,
  TrendingUp,
  Users,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Supplier } from "@/services/catalog.service";

interface SupplierOverviewDashboardProps {
  supplier: Supplier;
}

interface AnalyticsData {
  // Core Metrics - Chỉ số quan trọng nhất
  totalViews: number;
  totalOrders: number;
  revenue: number;
  customerSatisfaction: number;

  // Content Stats
  totalPosts: number;
  totalProducts: number;

  // Performance
  avgOrderValue: number;
  repeatCustomerRate: number;
}

export function SupplierOverviewDashboard({
  supplier,
}: SupplierOverviewDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchAnalytics();
  }, [supplier._id]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with real API call
      // const data = await supplierApi.getAnalytics(supplier._id);

      // Simplified realistic mock data
      const baseMultiplier = supplier.isPreferred ? 1.5 : 1;
      const ratingMultiplier = (supplier.rating || 3) / 5;
      const typeMultiplier =
        supplier.type === "artisan"
          ? 1.2
          : supplier.type === "manufacturer"
          ? 1.8
          : 1;

      const multiplier = baseMultiplier * ratingMultiplier * typeMultiplier;

      // Generate consistent data based on supplier ID
      const seed = supplier._id
        .slice(-4)
        .split("")
        .reduce((a, b) => a + b.charCodeAt(0), 0);
      const seededRandom = (min: number, max: number) => {
        const x = Math.sin(seed) * 10000;
        return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
      };

      const totalOrders = Math.floor((25 + seededRandom(10, 30)) * multiplier);
      const revenue = Math.floor(
        (300000 + seededRandom(100000, 500000)) * multiplier
      );

      const mockData: AnalyticsData = {
        totalViews: Math.floor((3000 + seededRandom(1000, 3000)) * multiplier),
        totalOrders,
        revenue,
        customerSatisfaction: Math.min(100, 75 + (supplier.rating || 3) * 5),
        totalPosts: Math.floor((8 + seededRandom(2, 8)) * multiplier),
        totalProducts: Math.floor((15 + seededRandom(5, 15)) * multiplier),
        avgOrderValue: Math.floor(revenue / Math.max(1, totalOrders)),
        repeatCustomerRate: Math.floor(45 + (supplier.rating || 3) * 8),
      };

      setAnalytics(mockData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Không thể tải dữ liệu analytics
        </h3>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tổng quan</h2>
          <p className="text-gray-500 mt-1">
            Cập nhật lần cuối: {lastUpdated.toLocaleString("vi-VN")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`${import.meta.env.VITE_CUSTOMER_URL || ""}/artisans/${
              supplier.code
            }`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Xem trang công khai
          </a>
          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Làm mới
          </button>
        </div>
      </div>

      {/* Key Metrics - 4 chỉ số chính */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Views */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500 rounded-lg">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-blue-600 font-medium bg-blue-200 px-2 py-1 rounded-full">
              Tháng này
            </span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">
            {formatNumber(analytics.totalViews)}
          </h3>
          <p className="text-sm text-gray-600">Lượt xem profile</p>
        </div>

        {/* Total Orders */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-green-600 font-medium bg-green-200 px-2 py-1 rounded-full">
              Tổng cộng
            </span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">
            {analytics.totalOrders}
          </h3>
          <p className="text-sm text-gray-600">Đơn hàng</p>
        </div>

        {/* Revenue */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-purple-600 font-medium bg-purple-200 px-2 py-1 rounded-full">
              Doanh thu
            </span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">
            {formatNumber(analytics.revenue)}
          </h3>
          <p className="text-sm text-gray-600">VND</p>
        </div>

        {/* Customer Satisfaction */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-500 rounded-lg">
              <Star className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-orange-600 font-medium bg-orange-200 px-2 py-1 rounded-full">
              Đánh giá
            </span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">
            {analytics.customerSatisfaction}%
          </h3>
          <p className="text-sm text-gray-600">Hài lòng</p>
        </div>
      </div>

      {/* Secondary Metrics - 2 hàng thông tin bổ sung */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gray-100 rounded-lg">
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Nội dung</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Bài viết</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">
                {analytics.totalPosts}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Sản phẩm</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">
                {analytics.totalProducts}
              </span>
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gray-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Hiệu suất</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Giá trị đơn TB</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">
                {formatCurrency(analytics.avgOrderValue)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Khách hàng quay lại</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">
                {analytics.repeatCustomerRate}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Summary */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-orange-500 rounded-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Tóm tắt hiệu suất
            </h3>
            <p className="text-gray-700 leading-relaxed">
              <strong>{supplier.name}</strong> đã có{" "}
              <strong>{analytics.totalOrders} đơn hàng</strong> với doanh thu{" "}
              <strong>{formatCurrency(analytics.revenue)}</strong>. Tỷ lệ hài
              lòng khách hàng đạt{" "}
              <strong>{analytics.customerSatisfaction}%</strong> và có{" "}
              <strong>{analytics.repeatCustomerRate}%</strong> khách hàng quay
              lại.
              {supplier.isPreferred && (
                <span className="inline-flex items-center gap-1 ml-2 px-2 py-1 bg-orange-200 text-orange-800 rounded-full text-xs font-medium">
                  <Star className="w-3 h-3" />
                  Đối tác ưu tiên
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
