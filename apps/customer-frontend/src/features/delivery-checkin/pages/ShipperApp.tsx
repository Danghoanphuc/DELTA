// apps/customer-frontend/src/features/delivery-checkin/pages/ShipperApp.tsx
/**
 * Shipper Portal App - Main entry point for shipper delivery check-in
 * Mobile-optimized interface for shippers to check-in and view history
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  Package,
  MapPin,
  History,
  LogOut,
  Menu,
  X,
  User,
  Truck,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { ShipperCheckinPage } from "./ShipperCheckinPage";
import { ShipperCheckinHistoryPage } from "./ShipperCheckinHistoryPage";
import { TodayRoutePage } from "./TodayRoutePage";

type TabType = "route" | "checkin" | "history";

export function ShipperApp() {
  const [activeTab, setActiveTab] = useState<TabType>("route");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  const handleLogout = async () => {
    await signOut();
    navigate("/signin");
  };

  const tabs = [
    {
      id: "route" as TabType,
      label: "Lộ trình",
      icon: Truck,
      description: "Đơn hàng hôm nay",
    },
    {
      id: "checkin" as TabType,
      label: "Check-in",
      icon: MapPin,
      description: "Tạo check-in giao hàng",
    },
    {
      id: "history" as TabType,
      label: "Lịch sử",
      icon: History,
      description: "Xem lịch sử check-in",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 rounded-xl p-2.5">
              <Truck className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Shipper Portal
              </h1>
              <p className="text-xs text-gray-500">Giao hàng & Check-in</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-orange-50 text-orange-600"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <tab.icon className="w-5 h-5" />
              <div className="flex-1 text-left">
                <div>{tab.label}</div>
                <div className="text-xs text-gray-500 font-normal">
                  {tab.description}
                </div>
              </div>
            </button>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
              <User className="w-4 h-4 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.displayName || "Shipper"}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Đăng xuất
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50">
        <header className="bg-white border-b border-gray-200">
          <div className="px-4 py-3 flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 rounded-xl p-2">
                <Truck className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  Shipper Portal
                </h1>
                <p className="text-xs text-gray-500">Giao hàng & Check-in</p>
              </div>
            </div>

            {/* Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="border-t border-gray-100 bg-white p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600 pb-2 border-b">
                <User className="w-4 h-4" />
                <span>{user?.displayName || "Shipper"}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Đăng xuất
              </Button>
            </div>
          )}
        </header>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <div className="pb-20 lg:pb-0">
          {activeTab === "route" && <TodayRoutePage />}
          {activeTab === "checkin" && <ShipperCheckinPage />}
          {activeTab === "history" && <ShipperCheckinHistoryPage />}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
                activeTab === tab.id
                  ? "text-orange-600"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <tab.icon
                className={cn(
                  "w-5 h-5",
                  activeTab === tab.id && "text-orange-600"
                )}
              />
              {tab.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default ShipperApp;
