// frontend/src/components/Sidebar.tsx (ĐÃ CẬP NHẬT)
import Logout from "./auth/Logout";
import {
  Home,
  Lightbulb,
  TrendingUp,
  FolderOpen,
  Settings,
  ShoppingBag,
  LogIn,
} from "lucide-react";
import UserAvatarFallback from "@/components/UserAvatarFallback";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Link, useLocation } from "react-router-dom";
import printzLogo from "@/assets/img/logo-printz.png";
import { Button } from "./ui/button";
export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: "Trang chủ", path: "/" },
    { icon: ShoppingBag, label: "Cửa hàng", path: "/shop" },
    { icon: Lightbulb, label: "Cảm hứng", path: "/inspiration" },
    { icon: TrendingUp, label: "Xu hướng", path: "/trends" },
    // { icon: Package, label: "Đơn hàng", path: "/orders" }, // <-- DÒNG NÀY ĐÃ BỊ XÓA
    { icon: FolderOpen, label: "Thiết kế của tôi", path: "/designs" },
    { icon: Settings, label: "Cài đặt", path: "/settings" },
  ];

  // ... (Phần còn lại giữ nguyên) ...
  return (
    <TooltipProvider>
      {/* Chỉ hiển thị trên desktop */}
      <div className="hidden lg:flex fixed left-0 top-0 h-screen w-20 bg-white border-r border-gray-200 flex-col items-center py-6 z-50">
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
            const isActive = item.path === location.pathname;
            return (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.path}
                    title={item.label}
                    className={`w-full h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 text-white shadow-lg"
                        : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                    }`}
                  >
                    <item.icon size={24} />
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
            <button className="w-12 h-12 rounded-full overflow-hidden hover:ring-2 hover:ring-blue-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
              <UserAvatarFallback
                name={user?.displayName || user?.username || "G"}
                size={48}
                bgColor={user ? "bg-indigo-100" : "bg-gray-200"}
                textColor={user ? "text-indigo-600" : "text-gray-600"}
                src={user?.avatarUrl}
              />
            </button>
          </PopoverTrigger>

          <PopoverContent
            side="right"
            align="start"
            className="w-60 p-4 rounded-lg shadow-lg bg-white border border-gray-100"
            sideOffset={5}
          >
            {user ? (
              <>
                {/* === TRẠNG THÁI ĐÃ ĐĂNG NHẬP === */}
                <div className="flex items-center space-x-3 mb-4 border-b pb-3">
                  <UserAvatarFallback
                    name={user.displayName || user.username}
                    size={40}
                    bgColor="bg-indigo-100"
                    textColor="text-indigo-600"
                    src={user.avatarUrl}
                  />
                  <div>
                    <p
                      className="font-semibold text-sm truncate"
                      title={user.displayName}
                    >
                      {user.displayName || user.username}
                    </p>
                    <p
                      className="text-xs text-gray-500 truncate"
                      title={user.email}
                    >
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col space-y-1">
                  <Link
                    to="/settings"
                    className="text-left text-sm px-2 py-1.5 hover:bg-gray-100 rounded block"
                  >
                    Cài đặt tài khoản
                  </Link>
                  <hr className="my-1 border-gray-200" />
                  <Logout />
                </div>
              </>
            ) : (
              <>
                {/* === TRẠNG THÁI KHÁCH (NGƯỜI LẠ) === */}
                <div className="text-center mb-4">
                  <p className="font-semibold text-sm">Chào mừng bạn!</p>
                  <p className="text-xs text-gray-500">
                    Vui lòng đăng nhập để trải nghiệm
                  </p>
                </div>
                <div className="flex flex-col space-y-2">
                  <Button asChild className="w-full">
                    <Link to="/signin">
                      <LogIn size={16} className="mr-2" />
                      Đăng nhập
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/signup">Đăng ký</Link>
                  </Button>
                </div>
              </>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </TooltipProvider>
  );
}
