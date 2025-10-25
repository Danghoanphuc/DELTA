// frontend/src/components/MobileNav.tsx
import { useState } from "react";
import {
  Menu,
  X,
  Home,
  Lightbulb,
  TrendingUp,
  Package,
  FolderOpen,
  Settings,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import UserAvatarFallback from "@/components/UserAvatarFallback";
import Logout from "@/components/auth/Logout";
import printzLogo from "@/assets/img/printz.png";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: "Trang chủ", path: "/" },
    { icon: Lightbulb, label: "Cảm hứng", path: "/inspiration" },
    { icon: TrendingUp, label: "Xu hướng", path: "/trends" },
    { icon: Package, label: "Đơn hàng", path: "/orders" },
    { icon: FolderOpen, label: "Thiết kế", path: "/designs" },
    { icon: Settings, label: "Cài đặt", path: "/settings" },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-50">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={printzLogo} alt="PrintZ" className="w-8 h-8" />
          <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            PrintZ
          </span>
        </Link>

        {/* Hamburger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40 mt-16"
            onClick={() => setIsOpen(false)}
          />
          <div className="lg:hidden fixed top-16 left-0 right-0 bottom-0 bg-white z-40 overflow-y-auto">
            {/* User Profile Section */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <UserAvatarFallback
                  name={user?.displayName || user?.username || "U"}
                  size={48}
                  bgColor="bg-indigo-100"
                  textColor="text-indigo-600"
                  src={user?.avatarUrl}
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {user?.displayName || user?.username}
                  </p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <nav className="p-4">
              {menuItems.map((item) => {
                const isActive = item.path === location.pathname;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-gray-200">
              <Logout />
            </div>
          </div>
        </>
      )}
    </>
  );
}
