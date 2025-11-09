// frontend/src/components/Sidebar.tsx (✅ UPDATED WITH SHARED COMPONENT)
import {
  Home,
  Lightbulb,
  TrendingUp,
  FolderOpen,
  Settings,
  ShoppingBag,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { Link, useLocation } from "react-router-dom";
import printzLogo from "@/assets/img/logo-printz.png";

// ✅ 1. Import component dùng chung mới
import { UserContextSwitcher } from "./UserContextSwitcher";

export function Sidebar() {
  const location = useLocation();

  // ✅ 2. Gỡ bỏ toàn bộ logic (useAuthStore, useNavigate, handleContextSwitch)

  const menuItems = [
    { icon: Home, label: "Trang chủ", path: "/" },
    { icon: ShoppingBag, label: "Cửa hàng", path: "/shop" },
    { icon: Lightbulb, label: "Cảm hứng", path: "/inspiration" },
    { icon: TrendingUp, label: "Xu hướng", path: "/trends" },
    { icon: FolderOpen, label: "Thiết kế của tôi", path: "/designs" },
    { icon: Settings, label: "Cài đặt", path: "/settings" },
  ];

  return (
    <TooltipProvider>
      <div className="hidden lg:flex fixed left-0 top-0 h-screen w-20 bg-white border-r border-gray-200 flex-col items-center py-6 z-50">
        {/* Logo (giữ nguyên) */}
        <Link to="/" className="mb-8 block">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg hover:shadow-blue-300 transition-shadow overflow-hidden">
            <img
              src={printzLogo}
              alt="PrintZ Logo"
              className="w-full h-full object-contain p-1"
            />
          </div>
        </Link>

        {/* Menu Items (giữ nguyên) */}
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

        {/* ✅ 3. Gỡ bỏ Popover cũ, thay bằng component mới */}
        <UserContextSwitcher contextColor="blue" />
      </div>
    </TooltipProvider>
  );
}
