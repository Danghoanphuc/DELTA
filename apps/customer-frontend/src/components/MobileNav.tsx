// src/components/MobileNav.tsx (CẬP NHẬT)
import {
  Compass, // Khám phá
  LayoutGrid, // Cửa hàng
  FolderOpen, // Thiết kế
  MessageCircle, // Chat AI
  Package, // Đơn hàng
  User, // Cá nhân
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/shared/lib/utils";

export function MobileNav() {
  const location = useLocation();

  // 5 icon điều hướng chính cho mobile
  const menuItems = [
    { icon: Compass, label: "Khám phá", path: "/app" },
    { icon: LayoutGrid, label: "Cửa hàng", path: "/shop" },
    {
      icon: MessageCircle,
      label: "Chat AI",
      path: "/app?openChat=zin",
      isCentral: true,
    },
    { icon: Package, label: "Đơn hàng", path: "/orders" },
    { icon: User, label: "Cá nhân", path: "/settings" },
  ];

  const getIsActive = (path: string) => {
    const [pathname] = path.split("?");
    if (pathname === "/app") {
      return location.pathname === "/app";
    }
    return location.pathname.startsWith(pathname);
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/95 backdrop-blur-lg border-t border-gray-200 z-30 shadow-lg safe-bottom">
      <nav className="h-full flex items-center justify-around px-2">
        {menuItems.map((item) => {
          const isActive = getIsActive(item.path);

          // NÚT TRUNG TÂM (CHAT AI)
          if (item.isCentral) {
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative -translate-y-4 w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-lg transition-all duration-300 active:scale-90 hover:scale-105",
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white ring-2 ring-blue-400 ring-offset-2"
                    : "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                )}
                aria-label={item.label}
              >
                <item.icon
                  size={28}
                  className={isActive ? "stroke-[2.5]" : "stroke-[2]"}
                />
                <span className="text-[9px] font-bold mt-0.5 leading-tight">
                  {item.label}
                </span>
              </Link>
            );
          }

          // CÁC NÚT CÒN LẠI
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 min-w-[64px] active:scale-95",
                isActive
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50/50"
              )}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative">
                <item.icon
                  size={22}
                  className={cn(
                    "transition-all duration-300",
                    isActive ? "stroke-[2.5]" : "stroke-[2]"
                  )}
                />
                {isActive && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                )}
              </div>
              <span
                className={cn(
                  "text-[11px] leading-tight text-center transition-all duration-300",
                  isActive ? "font-semibold" : "font-medium"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
