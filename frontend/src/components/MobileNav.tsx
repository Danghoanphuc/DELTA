// frontend/src/components/MobileNav.tsx
import {
  Home,
  Lightbulb,
  TrendingUp,
  FolderOpen,
  ShoppingBag,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function MobileNav() {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: "Trang chủ", path: "/" },
    { icon: ShoppingBag, label: "Cửa hàng", path: "/shop" },
    { icon: Lightbulb, label: "Cảm hứng", path: "/inspiration" },
    { icon: TrendingUp, label: "Xu hướng", path: "/trends" },
    { icon: FolderOpen, label: "Thiết kế", path: "/designs" },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation - Chỉ hiển thị trên mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-lg border-t border-gray-200 z-50 shadow-lg">
        <nav className="h-full flex items-center justify-around px-2">
          {/* Menu Items */}
          {menuItems.map((item) => {
            const isActive = item.path === location.pathname;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                <div className="relative">
                  <item.icon
                    size={20}
                    className={isActive ? "stroke-[2.5]" : "stroke-[2]"}
                  />
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
                  )}
                </div>
                <span
                  className={`text-[10px] ${isActive ? "font-semibold" : ""}`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Spacer để tránh content bị che bởi bottom nav */}
      <div className="lg:hidden h-16" />
    </>
  );
}
