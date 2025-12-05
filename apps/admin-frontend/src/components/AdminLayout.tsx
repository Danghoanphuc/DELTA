// apps/admin-frontend/src/components/AdminLayout.tsx
import { useState, useEffect, useCallback } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAdminAuthStore } from "@/store/useAdminAuthStore";
import { signOut } from "@/services/adminAuthService";
import { swagOpsService } from "@/services/admin.swag-operations.service";
import {
  LayoutDashboard,
  Package,
  Truck,
  BarChart3,
  Boxes,
  Users,
  Building,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  ChevronRight,
  Settings,
  HelpCircle,
  ShoppingBag,
  FolderTree,
  Factory,
} from "lucide-react";

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface NavDivider {
  type: "divider";
  label?: string;
}

type NavItemOrDivider = NavItem | NavDivider;

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [fulfillmentCount, setFulfillmentCount] = useState(0);
  const { admin } = useAdminAuthStore((state) => ({ admin: state.admin }));

  // Fetch badge counts
  const fetchCounts = useCallback(async () => {
    try {
      const stats = await swagOpsService.getDashboardStats();
      setPendingCount(stats.pendingOrders || 0);
      setFulfillmentCount(stats.processingOrders || 0);
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  }, []);

  useEffect(() => {
    fetchCounts();
    // Refresh every 30 seconds
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [fetchCounts]);

  const navItems: NavItemOrDivider[] = [
    {
      label: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
    },
    { type: "divider", label: "SWAG OPERATIONS" },
    {
      label: "Đơn hàng",
      path: "/swag-ops/orders",
      icon: Package,
      badge: pendingCount,
    },
    {
      label: "Fulfillment",
      path: "/swag-ops/fulfillment",
      icon: Truck,
      badge: fulfillmentCount,
    },
    {
      label: "Tồn kho",
      path: "/swag-ops/inventory",
      icon: Boxes,
    },
    {
      label: "Analytics",
      path: "/swag-ops/analytics",
      icon: BarChart3,
    },
    { type: "divider", label: "PRODUCT CATALOG" },
    {
      label: "Sản phẩm",
      path: "/catalog/products",
      icon: ShoppingBag,
    },
    {
      label: "Danh mục",
      path: "/catalog/categories",
      icon: FolderTree,
    },
    {
      label: "Nhà cung cấp",
      path: "/catalog/suppliers",
      icon: Factory,
    },
    { type: "divider", label: "QUẢN TRỊ" },
    {
      label: "Quản lý Users",
      path: "/users",
      icon: Users,
    },
    {
      label: "Duyệt Nhà in",
      path: "/printer-vetting",
      icon: Building,
    },
  ];

  // Generate breadcrumb from path
  const getBreadcrumb = () => {
    const pathMap: Record<string, string> = {
      "/": "Dashboard",
      "/swag-ops/orders": "Đơn hàng",
      "/swag-ops/fulfillment": "Fulfillment",
      "/swag-ops/inventory": "Tồn kho",
      "/swag-ops/analytics": "Analytics",
      "/catalog/products": "Sản phẩm",
      "/catalog/categories": "Danh mục",
      "/catalog/suppliers": "Nhà cung cấp",
      "/users": "Quản lý Users",
      "/printer-vetting": "Duyệt Nhà in",
    };

    const path = location.pathname;

    // Handle dynamic routes
    if (path.startsWith("/swag-ops/orders/") && path !== "/swag-ops/orders") {
      return ["Đơn hàng", "Chi tiết đơn"];
    }
    if (path.startsWith("/catalog/products/") && path !== "/catalog/products") {
      return ["Sản phẩm", "Chi tiết"];
    }

    return [pathMap[path] || "Dashboard"];
  };

  const handleLogout = () => {
    signOut();
    navigate("/login");
  };

  const breadcrumb = getBreadcrumb();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 flex-shrink-0">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-bold text-gray-900">Printz Admin</span>
          </NavLink>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item, index) => {
            if ("type" in item && item.type === "divider") {
              return (
                <div key={index} className="pt-4 pb-2">
                  {item.label && (
                    <span className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {item.label}
                    </span>
                  )}
                </div>
              );
            }
            const navItem = item as NavItem;
            const Icon = navItem.icon;
            return (
              <NavLink
                key={navItem.path}
                to={navItem.path}
                end={navItem.path === "/"}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-orange-50 text-orange-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  {navItem.label}
                </div>
                {navItem.badge !== undefined && navItem.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-orange-500 text-white rounded-full">
                    {navItem.badge > 99 ? "99+" : navItem.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
            <HelpCircle className="w-5 h-5" />
            Trợ giúp
          </button>
          <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
            <Settings className="w-5 h-5" />
            Cài đặt
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb */}
            <nav className="hidden sm:flex items-center gap-1 text-sm">
              <NavLink
                to="/"
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Home
              </NavLink>
              {breadcrumb.map((item, index) => (
                <span key={index} className="flex items-center gap-1">
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <span
                    className={
                      index === breadcrumb.length - 1
                        ? "text-gray-900 font-medium"
                        : "text-gray-500"
                    }
                  >
                    {item}
                  </span>
                </span>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="hidden md:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm đơn hàng..."
                  className="w-64 pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Notifications */}
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              {pendingCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-orange-600">
                    {admin?.displayName?.charAt(0)?.toUpperCase() || "A"}
                  </span>
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {admin?.displayName || "Admin"}
                </span>
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {admin?.displayName || "Admin"}
                      </p>
                      <p className="text-xs text-gray-500">{admin?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
