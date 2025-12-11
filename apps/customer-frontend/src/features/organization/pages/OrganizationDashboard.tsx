// src/features/organization/pages/OrganizationDashboard.tsx
// ✅ SOLID Refactored - B2B Organization Dashboard

import { useSearchParams } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  Users,
  Gift,
  UserCheck,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Loader2,
  MapPin,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import { useDashboardStats } from "../hooks";
import { DeliveryMapView } from "@/features/delivery-checkin/components/DeliveryMapView";

// Delivery Map Widget Component
function DeliveryMapWidget({ onViewDetails }: { onViewDetails: () => void }) {
  return (
    <div className="relative w-full h-full">
      <DeliveryMapView
        onViewThread={(threadId) => console.log("View thread:", threadId)}
        className="absolute inset-0"
      />
      {/* Overlay with click to view details */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      <button
        onClick={onViewDetails}
        className="absolute bottom-4 right-4 px-4 py-2 bg-white/95 backdrop-blur-sm text-stone-900 rounded-lg shadow-lg hover:bg-white transition-all font-semibold text-sm flex items-center gap-2 pointer-events-auto"
      >
        <MapPin className="w-4 h-4" />
        Xem toàn màn hình
      </button>
    </div>
  );
}

export function OrganizationDashboard() {
  const [, setSearchParams] = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.activeOrganizationProfile);
  const { stats, isLoading } = useDashboardStats();

  const navigateTo = (tab: string) => {
    setSearchParams({ tab });
  };

  const statCards = [
    {
      title: "Bộ quà",
      value: stats?.swagPacks?.totalPacks || 0,
      subtext: `${stats?.swagPacks?.activePacks || 0} đang hoạt động`,
      icon: Gift,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      iconBg: "bg-orange-500",
      borderColor: "border-orange-100",
      hoverBorder: "hover:border-orange-300",
      onClick: () => navigateTo("swag-packs"),
    },
    {
      title: "Người nhận",
      value: stats?.recipients?.totalCount || 0,
      subtext: "Trong danh sách",
      icon: UserCheck,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-500",
      borderColor: "border-blue-100",
      hoverBorder: "hover:border-blue-300",
      onClick: () => navigateTo("recipients"),
    },
    {
      title: "Tồn kho",
      value: stats?.inventory?.totalQuantity || 0,
      subtext: `${stats?.inventory?.totalSkus || 0} SKU`,
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      iconBg: "bg-purple-500",
      borderColor: "border-purple-100",
      hoverBorder: "hover:border-purple-300",
      onClick: () => navigateTo("inventory"),
    },
    {
      title: "Đơn hàng",
      value: stats?.orders?.total || 0,
      subtext: `${stats?.orders?.pending || 0} đang xử lý`,
      icon: ShoppingCart,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      iconBg: "bg-emerald-500",
      borderColor: "border-emerald-100",
      hoverBorder: "hover:border-emerald-300",
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
      <div className="flex-1 flex items-center justify-center bg-stone-50">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-stone-50">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card
              key={index}
              className={`border-2 ${stat.borderColor} ${stat.bgColor} shadow-sm hover:shadow-md ${stat.hoverBorder} transition-all cursor-pointer`}
              onClick={stat.onClick}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-mono uppercase tracking-wider text-stone-500 mb-2">
                      {stat.title}
                    </p>
                    <h3 className="text-3xl font-bold text-stone-900 mb-2">
                      {stat.value}
                    </h3>
                    <span className={`text-sm font-medium ${stat.color}`}>
                      {stat.subtext}
                    </span>
                  </div>
                  <div
                    className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center shadow-sm`}
                  >
                    <stat.icon
                      className="text-white"
                      size={24}
                      strokeWidth={2.5}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Alerts */}
        {stats?.inventory?.lowStockCount &&
          stats.inventory.lowStockCount > 0 && (
            <Card className="border-2 border-amber-200 bg-amber-50 shadow-sm mb-8">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-amber-900">
                      {stats.inventory.lowStockCount} sản phẩm sắp hết hàng
                    </p>
                    <p className="text-sm text-amber-700">
                      Kiểm tra và đặt thêm hàng
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-2 border-amber-600 text-amber-700 hover:bg-amber-600 hover:text-white"
                  onClick={() => navigateTo("inventory")}
                >
                  Xem chi tiết
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}

        {/* Quick Actions & Delivery Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Quick Actions */}
          <Card className="border-2 border-stone-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-stone-900 font-bold">
                Hành động nhanh
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className="p-5 border-2 border-stone-200 hover:border-orange-300 hover:bg-orange-50 transition-all text-left bg-white shadow-sm hover:shadow-md rounded-xl group"
                  >
                    <div className="w-12 h-12 bg-stone-100 group-hover:bg-orange-500 rounded-xl flex items-center justify-center mb-3 transition-colors">
                      <action.icon
                        className="w-6 h-6 text-stone-600 group-hover:text-white transition-colors"
                        strokeWidth={2}
                      />
                    </div>
                    <h3 className="font-semibold text-stone-900 mb-1">
                      {action.title}
                    </h3>
                    <p className="text-sm text-stone-500">
                      {action.description}
                    </p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Map Widget */}
          <Card className="border-2 border-stone-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-stone-900 font-bold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                Bản đồ giao hàng
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateTo("delivery-map")}
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
              >
                Xem chi tiết
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative h-[400px] bg-stone-100 rounded-b-lg overflow-hidden">
                <DeliveryMapWidget
                  onViewDetails={() => navigateTo("delivery-map")}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started */}
        {stats?.swagPacks?.totalPacks === 0 &&
          stats?.recipients?.totalCount === 0 && (
            <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 shadow-md mb-8">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Gift className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
                <h2 className="text-2xl font-bold text-stone-900 mb-2">
                  Bắt đầu với PrintZ
                </h2>
                <p className="text-stone-600 mb-6 max-w-md mx-auto">
                  Tạo bộ quà đầu tiên và import danh sách người nhận để bắt đầu
                  gửi quà tặng cho team
                </p>
                <div className="flex gap-4 justify-center">
                  <Button
                    variant="outline"
                    className="border-2 border-stone-300 text-stone-700 hover:bg-stone-700 hover:text-white hover:border-stone-700"
                    onClick={() => navigateTo("recipients")}
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Import người nhận
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg"
                    onClick={() => navigateTo("swag-packs")}
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    Tạo bộ quà
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

        {/* Recent Activity */}
        <Card className="border-2 border-stone-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-stone-900 font-bold">
              Hoạt động gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-8 h-8 text-stone-400" />
              </div>
              <p className="font-semibold text-stone-700 mb-1">
                Chưa có hoạt động nào
              </p>
              <p className="text-sm text-stone-500">
                Các hoạt động sẽ hiển thị tại đây
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default OrganizationDashboard;
