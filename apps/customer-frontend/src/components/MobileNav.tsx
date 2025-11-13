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
    <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-lg border-t border-gray-200 z-30 shadow-lg">
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
                  "relative -translate-y-4 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90",
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    : "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                )}
              >
                <item.icon
                  size={28}
                  className={isActive ? "stroke-[2.5]" : "stroke-[2]"}
                />
              </Link>
            );
          }

          // CÁC NÚT CÒN LẠI
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
  );
}
