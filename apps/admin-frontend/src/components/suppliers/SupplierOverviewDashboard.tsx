// apps/admin-frontend/src/components/suppliers/SupplierOverviewDashboard.tsx
// Dashboard tổng quan cho supplier với metrics SEO, social, analytics

import { useState, useEffect } from "react";
import {
  Eye,
  Share2,
  Heart,
  MessageCircle,
  TrendingUp,
  Globe,
  Search,
  Users,
  Calendar,
  ExternalLink,
  RefreshCw,
  BarChart3,
  Star,
  Award,
} from "lucide-react";
import { Supplier } from "@/services/catalog.service";

interface SupplierOverviewDashboardProps {
  supplier: Supplier;
}

interface AnalyticsData {
  // SEO Metrics
  seo: {
    searchRanking: number;
    organicTraffic: number;
    backlinks: number;
    keywordRanking: number;
  };

  // Social Metrics
  social: {
    totalShares: number;
    facebookShares: number;
    linkedinShares: number;
    instagramFollowers: number;
    engagement: number;
  };

  // Content Performance
  content: {
    totalViews: number;
    uniqueVisitors: number;
    avgTimeOnPage: number;
    bounceRate: number;
    totalPosts: number;
    totalProducts: number;
  };

  // Business Metrics
  business: {
    totalOrders: number;
    revenue: number;
    customerSatisfaction: number;
    repeatCustomers: number;
  };
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

      // Mock data for now
      const mockData: AnalyticsData = {
        seo: {
          searchRanking: Math.floor(Math.random() * 10) + 1,
          organicTraffic: Math.floor(Math.random() * 5000) + 1000,
          backlinks: Math.floor(Math.random() * 50) + 10,
          keywordRanking: Math.floor(Math.random() * 20) + 5,
        },
        social: {
          totalShares: Math.floor(Math.random() * 500) + 100,
          facebookShares: Math.floor(Math.random() * 200) + 50,
          linkedinShares: Math.floor(Math.random() * 100) + 20,
          instagramFollowers: Math.floor(Math.random() * 2000) + 500,
          engagement: Math.floor(Math.random() * 10) + 2,
        },
        content: {
          totalViews: Math.floor(Math.random() * 10000) + 2000,
          uniqueVisitors: Math.floor(Math.random() * 3000) + 800,
          avgTimeOnPage: Math.floor(Math.random() * 300) + 120,
          bounceRate: Math.floor(Math.random() * 30) + 20,
          totalPosts: Math.floor(Math.random() * 20) + 5,
          totalProducts: Math.floor(Math.random() * 50) + 10,
        },
        business: {
          totalOrders: Math.floor(Math.random() * 100) + 20,
          revenue: Math.floor(Math.random() * 1000000) + 200000,
          customerSatisfaction: Math.floor(Math.random() * 20) + 80,
          repeatCustomers: Math.floor(Math.random() * 30) + 40,
        },
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

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
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
        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
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

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Views */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-blue-600 font-medium">
              +12% tuần này
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {formatNumber(analytics.content.totalViews)}
          </h3>
          <p className="text-sm text-gray-600">Lượt xem tổng</p>
        </div>

        {/* Social Shares */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-500 rounded-lg">
              <Share2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-green-600 font-medium">
              +8% tuần này
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {formatNumber(analytics.social.totalShares)}
          </h3>
          <p className="text-sm text-gray-600">Lượt chia sẻ</p>
        </div>

        {/* SEO Ranking */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Search className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-purple-600 font-medium">
              #{analytics.seo.searchRanking}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {formatNumber(analytics.seo.organicTraffic)}
          </h3>
          <p className="text-sm text-gray-600">Organic Traffic</p>
        </div>

        {/* Customer Satisfaction */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-500 rounded-lg">
              <Star className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-orange-600 font-medium">
              Xuất sắc
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {analytics.business.customerSatisfaction}%
          </h3>
          <p className="text-sm text-gray-600">Hài lòng khách hàng</p>
        </div>
      </div>

      {/* Detailed Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SEO Performance */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Search className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              SEO Performance
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Search Ranking</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">
                  #{analytics.seo.searchRanking}
                </span>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Organic Traffic</span>
              <span className="text-lg font-semibold">
                {formatNumber(analytics.seo.organicTraffic)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Backlinks</span>
              <span className="text-lg font-semibold">
                {analytics.seo.backlinks}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Keywords Ranking</span>
              <span className="text-lg font-semibold">
                {analytics.seo.keywordRanking}
              </span>
            </div>
          </div>
        </div>

        {/* Social Media Performance */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Social Media
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Instagram Followers</span>
              <span className="text-lg font-semibold">
                {formatNumber(analytics.social.instagramFollowers)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Facebook Shares</span>
              <span className="text-lg font-semibold">
                {analytics.social.facebookShares}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">LinkedIn Shares</span>
              <span className="text-lg font-semibold">
                {analytics.social.linkedinShares}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Engagement Rate</span>
              <span className="text-lg font-semibold">
                {analytics.social.engagement}%
              </span>
            </div>
          </div>
        </div>

        {/* Content Performance */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Globe className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Content Performance
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Unique Visitors</span>
              <span className="text-lg font-semibold">
                {formatNumber(analytics.content.uniqueVisitors)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Avg. Time on Page</span>
              <span className="text-lg font-semibold">
                {formatTime(analytics.content.avgTimeOnPage)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Bounce Rate</span>
              <span className="text-lg font-semibold">
                {analytics.content.bounceRate}%
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Posts</span>
              <span className="text-lg font-semibold">
                {analytics.content.totalPosts}
              </span>
            </div>
          </div>
        </div>

        {/* Business Metrics */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Award className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Business Metrics
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Orders</span>
              <span className="text-lg font-semibold">
                {analytics.business.totalOrders}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Revenue</span>
              <span className="text-lg font-semibold">
                {formatCurrency(analytics.business.revenue)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Repeat Customers</span>
              <span className="text-lg font-semibold">
                {analytics.business.repeatCustomers}%
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Rating</span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-lg font-semibold">
                  {supplier.rating || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex items-center gap-2 p-3 text-left hover:bg-gray-50 rounded-lg border border-gray-200">
            <MessageCircle className="w-5 h-5 text-blue-500" />
            <div>
              <p className="font-medium text-gray-900">Tạo bài viết</p>
              <p className="text-xs text-gray-500">Đăng content mới</p>
            </div>
          </button>

          <button className="flex items-center gap-2 p-3 text-left hover:bg-gray-50 rounded-lg border border-gray-200">
            <BarChart3 className="w-5 h-5 text-green-500" />
            <div>
              <p className="font-medium text-gray-900">Xem báo cáo</p>
              <p className="text-xs text-gray-500">Chi tiết analytics</p>
            </div>
          </button>

          <button className="flex items-center gap-2 p-3 text-left hover:bg-gray-50 rounded-lg border border-gray-200">
            <Share2 className="w-5 h-5 text-purple-500" />
            <div>
              <p className="font-medium text-gray-900">Chia sẻ profile</p>
              <p className="text-xs text-gray-500">Social media</p>
            </div>
          </button>

          <button className="flex items-center gap-2 p-3 text-left hover:bg-gray-50 rounded-lg border border-gray-200">
            <Calendar className="w-5 h-5 text-orange-500" />
            <div>
              <p className="font-medium text-gray-900">Lên lịch post</p>
              <p className="text-xs text-gray-500">Content calendar</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
