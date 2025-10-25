// src/components/Sidebar.tsx (HOÀN CHỈNH - Đã khôi phục UserAvatarFallback)

import Logout from "./auth/Logout"; //
import {
  Home,
  Lightbulb,
  TrendingUp,
  Package,
  FolderOpen,
  Settings,
} from "lucide-react";
import UserAvatarFallback from "@/components/UserAvatarFallback"; // Import đúng component
import { useAuthStore } from "@/stores/useAuthStore"; //
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; //
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"; // Sử dụng Popover từ shadcn/ui
import { Link, useLocation } from "react-router-dom";
import printzLogo from "@/assets/img/printz.png"; //

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    { icon: Home, label: "Trang chủ", id: "home", path: "/" },
    {
      icon: Lightbulb,
      label: "Cảm hứng",
      id: "inspiration",
      path: "/inspiration",
    },
    { icon: TrendingUp, label: "Xu hướng", id: "trends", path: "/trends" },
    { icon: Package, label: "Đơn hàng", id: "orders", path: "/orders" },
    {
      icon: FolderOpen,
      label: "Thiết kế của tôi",
      id: "designs",
      path: "/designs",
    },
    { icon: Settings, label: "Cài đặt", id: "settings", path: "/settings" },
  ];

  return (
    <TooltipProvider>
      <div className="fixed left-0 top-0 h-screen w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6 z-50">
        {/* Logo */}
        <Link to="/" className="mb-8 block">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg hover:shadow-blue-300 transition-shadow overflow-hidden">
            <img
              src={printzLogo}
              alt="PrintZ Logo"
              className="w-full h-full object-contain p-1"
            />
          </div>
        </Link>

        {/* Menu Items */}
        <nav className="flex-1 flex flex-col gap-2 w-full px-3">
          {menuItems.map((item) => {
            const isActive = item.path === currentPath;
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <Link to={item.path || "#"} title={item.label}>
                    <button
                      className={`w-full h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 text-white shadow-lg"
                          : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                      }`}
                    >
                      <item.icon size={24} />
                    </button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {/* User Avatar & Popover */}
        <Popover>
          <PopoverTrigger asChild>
            {/* Avatar làm nút trigger */}
            <button className="w-12 h-12 rounded-full overflow-hidden hover:ring-2 hover:ring-blue-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
              <UserAvatarFallback
                name={user?.displayName || user?.username || "G"}
                size={48} // Kích thước khớp với button
                bgColor="bg-indigo-100"
                textColor="text-indigo-600"
                src={user?.avatarUrl}
              />
            </button>
          </PopoverTrigger>

          {/* Nội dung Popover */}
          <PopoverContent
            side="right"
            align="start"
            className="w-60 p-4 rounded-lg shadow-lg bg-white border border-gray-100" // Style gốc
            sideOffset={5} // Khoảng cách nhỏ
          >
            {/* Header Popover */}
            <div className="flex items-center space-x-3 mb-4 border-b pb-3">
              {/* 👇 *** KHÔI PHỤC UserAvatarFallback Ở ĐÂY *** 👇 */}
              <UserAvatarFallback
                name={user?.displayName || user?.username || "G"}
                size={40} // Kích thước nhỏ hơn trong popover
                bgColor="bg-indigo-100"
                textColor="text-indigo-600"
                src={user?.avatarUrl}
              />
              <div>
                <p
                  className="font-semibold text-sm truncate"
                  title={user?.displayName || user?.username}
                >
                  {user?.displayName || user?.username}
                </p>
                <p
                  className="text-xs text-gray-500 truncate"
                  title={user?.email}
                >
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Menu Popover */}
            <div className="flex flex-col space-y-1">
              <Link
                to="/settings"
                className="text-left text-sm px-2 py-1.5 hover:bg-gray-100 rounded block"
              >
                Cài đặt tài khoản
              </Link>
              <button
                className="text-left text-sm px-2 py-1.5 hover:bg-gray-100 rounded disabled:opacity-50"
                disabled
              >
                Chủ đề (Sắp có)
              </button>
              <button
                className="text-left text-sm px-2 py-1.5 hover:bg-gray-100 rounded disabled:opacity-50"
                disabled
              >
                Trợ giúp & tài nguyên
              </button>
              <hr className="my-1 border-gray-200" />
              {/* Component Logout riêng biệt */}
              <Logout />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </TooltipProvider>
  );
}
