// src/features/organization/pages/OrganizationDashboard.tsx
// ✅ B2B Organization Dashboard (Real API)

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  Building2,
  Gift,
  UserCheck,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import api from "@/shared/lib/axios";

interface DashboardStats {
  swagPacks: { totalPacks: number; activePacks: number; draftPacks: number };
  recipients: { totalCount: number };
  inventory: {
    totalSkus: number;
    totalQuantity: number;
    lowStockCount: number;
  };
  orders: { total: number; pending: number };
}

export function OrganizationDashboard() {
  const [, setSearchParams] = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.activeOrganizationProfile);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all stats
  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const [swagPacksRes, recipientsRes, inventoryRes] =
        await Promise.allSettled([
          api.get("/swag-packs/stats"),
          api.get("/recipients/filters"),
          api.get("/inventory/stats"),
        ]);

      setStats({
        swagPacks:
          swagPacksRes.status === "fulfilled"
            ? swagPacksRes.value.data?.data
            : { totalPacks: 0, activePacks: 0, draftPacks: 0 },
        recipients:
          recipientsRes.status === "fulfilled"
            ? recipientsRes.value.data?.data
            : { totalCount: 0 },
        inventory:
          inventoryRes.status === "fulfilled"
            ? inventoryRes.value.data?.data?.stats
            : { totalSkus: 0, totalQuantity: 0, lowStockCount: 0 },
        orders: { total: (profile as any)?.totalOrders || 0, pending: 0 },
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [profile?.totalOrders]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const navigateTo = (tab: string) => {
    setSearchParams({ tab });
  };

  const statCards = [
    {
      title: "Swag Packs",
      value: stats?.swagPacks?.totalPacks || 0,
      subtext: `${stats?.swagPacks?.activePacks || 0} đang hoạt động`,
      icon: Gift,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      onClick: () => navigateTo("swag-packs"),
    },
    {
      title: "Người nhận",
      value: stats?.recipients?.totalCount || 0,
      subtext: "Trong danh sách",
      icon: UserCheck,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      onClick: () => navigateTo("recipients"),
    },
    {
      title: "Tồn kho",
      value: stats?.inventory?.totalQuantity || 0,
      subtext: `${stats?.inventory?.totalSkus || 0} SKU`,
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-50",
      onClick: () => navigateTo("inventory"),
    },
    {
      title: "Đơn hàng",
      value: stats?.orders?.total || 0,
      subtext: `${stats?.orders?.pending || 0} đang xử lý`,
      icon: ShoppingCart,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      onClick: () => navigateTo("orders"),
    },
  ];

  const quickActions = [
    {
      title: "Tạo Swag Pack",
      description: "Tạo bộ quà mới cho team",
      icon: Gift,
      onClick: () => navigateTo("swag-packs"),
    },
    {
      title: "Thêm người nhận",
      description: "Import danh sách từ CSV",
      icon: UserCheck,
      onClick: () => navigateTo("recipients"),
    },
    {
      title: "Xem tồn kho",
      description: "Kiểm tra hàng hóa",
      icon: Package,
      onClick: () => navigateTo("inventory"),
    },
    {
      title: "Mời thành viên",
      description: "Thêm đồng nghiệp vào team",
      icon: Users,
      onClick: () => navigateTo("team"),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-8 h-8 text-orange-500" />
            <h1 className="text-2xl font-bold text-gray-900">
              {profile?.businessName || "Dashboard"}
            </h1>
          </div>
          <p className="text-gray-600">
            Chào mừng {user?.displayName}! Đây là tổng quan về tài khoản doanh
            nghiệp của bạn.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card
              key={index}
              className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={stat.onClick}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {stat.value}
                    </h3>
                    <span className={`text-sm font-medium ${stat.color}`}>
                      {stat.subtext}
                    </span>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}
                  >
                    <stat.icon className={stat.color} size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Alerts */}
        {stats?.inventory?.lowStockCount &&
          stats.inventory.lowStockCount > 0 && (
            <Card className="border-none shadow-sm mb-8 border-l-4 border-l-yellow-500">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {stats.inventory.lowStockCount} sản phẩm sắp hết hàng
                    </p>
                    <p className="text-sm text-gray-500">
                      Kiểm tra và đặt thêm hàng
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateTo("inventory")}
                >
                  Xem chi tiết
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}

        {/* Quick Actions */}
        <Card className="border-none shadow-sm mb-8">
          <CardHeader>
            <CardTitle>Hành động nhanh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className="p-4 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all text-left"
                >
                  <action.icon className="w-8 h-8 mb-3 text-orange-500" />
                  <h3 className="font-medium text-gray-900 mb-1">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Getting Started (if new user) */}
        {stats?.swagPacks?.totalPacks === 0 &&
          stats?.recipients?.totalCount === 0 && (
            <Card className="border-none shadow-sm bg-gradient-to-r from-orange-50 to-red-50">
              <CardContent className="p-8 text-center">
                <Gift className="w-16 h-16 mx-auto mb-4 text-orange-500" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Bắt đầu với Printz
                </h2>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Tạo bộ quà đầu tiên và import danh sách người nhận để bắt đầu
                  gửi quà tặng cho team
                </p>
                <div className="flex gap-4 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => navigateTo("recipients")}
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Import người nhận
                  </Button>
                  <Button
                    className="bg-orange-500 hover:bg-orange-600"
                    onClick={() => navigateTo("swag-packs")}
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    Tạo Swag Pack
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

        {/* Recent Activity Placeholder */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Chưa có hoạt động nào</p>
              <p className="text-sm">Các hoạt động sẽ hiển thị tại đây</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default OrganizationDashboard;
