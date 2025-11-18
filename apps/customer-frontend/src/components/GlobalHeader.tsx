// src/components/GlobalHeader.tsx (CẬP NHẬT - PHIÊN BẢN "LAI")
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Package,
  FolderOpen,
  Compass, // Khám phá
  LayoutGrid, // Cửa hàng
  ShoppingCart,
  Bell,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { UserContextSwitcher } from "./UserContextSwitcher";
import { SearchAutocomplete } from "./SearchAutocomplete";
import printzLogo from "@/assets/img/logo-printz.png";
import { cn } from "@/shared/lib/utils";

// Props (như đã thống nhất)
interface GlobalHeaderProps {
  onSearchSubmit?: (term: string) => void;
  cartItemCount: number;
  onCartClick: () => void;
}

export function GlobalHeader({
  onSearchSubmit,
  cartItemCount,
  onCartClick,
}: GlobalHeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ ĐIỀU HƯỚNG CẤP 1 (TRÊN HEADER)
  const navItems = [
    { label: "Khám phá", path: "/app", icon: Compass },
    { label: "Cửa hàng", path: "/shop", icon: LayoutGrid },
    { label: "Thiết kế", path: "/designs", icon: FolderOpen },
    { label: "Đơn hàng", path: "/orders", icon: Package },
  ];

  const getIsActive = (path: string) => {
    if (path === "/app") return location.pathname === "/app";
    return location.pathname.startsWith(path);
  };

  return (
    <header className="hidden lg:block fixed top-0 left-0 right-0 z-40 h-16 bg-white/95 backdrop-blur-lg border-b border-gray-200">
      <div className="flex items-center justify-between h-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 gap-2">
        {/* --- 1. Logo & Nav (Desktop Only - Hidden on Mobile) --- */}
        <div className="hidden lg:flex items-center gap-4 flex-shrink-0 relative z-20 pr-2">
          <Link to="/app" className="flex items-center gap-2 flex-shrink-0">
            <img src={printzLogo} alt="PrintZ Logo" className="w-10 h-10" />
            <span className="font-bold text-xl text-gray-800">
              Printz
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            {navItems.map((item) => (
              <Button
                key={item.path}
                asChild
                variant={getIsActive(item.path) ? "secondary" : "ghost"}
                className={cn(
                  "font-medium",
                  getIsActive(item.path) ? "text-blue-600" : "text-gray-600"
                )}
              >
                <Link to={item.path}>
                  <item.icon size={16} className="mr-1.5" />
                  {item.label}
                </Link>
              </Button>
            ))}
          </nav>
        </div>

        {/* --- 2. Search Bar (Mobile: Flexible Width with margin, Desktop: Max Width) --- */}
        {onSearchSubmit && (
          <div className="flex-1 max-w-xl mx-4 min-w-0 relative z-10">
            <SearchAutocomplete onSearchSubmit={onSearchSubmit} />
          </div>
        )}

        {/* --- 3. Tiện ích (Cart & User) --- */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="Thông báo"
            onClick={() => navigate("/notifications")}
          >
            <Bell size={20} />
          </Button>
          {/* Cart Icon - Always Visible */}
          <Button
            variant="ghost"
            size="icon"
            className="relative micro-bounce"
            onClick={onCartClick}
            aria-label={`Giỏ hàng có ${cartItemCount} sản phẩm`}
          >
            <ShoppingCart size={22} />
            {cartItemCount > 0 && (
              <span
                className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1.5 flex items-center justify-center p-0 rounded-full bg-blue-600 text-white text-[10px] font-bold leading-none animate-pulse"
                aria-live="polite"
              >
                {cartItemCount > 99 ? "99+" : cartItemCount}
              </span>
            )}
          </Button>
          {/* User Switcher */}
          <div>
            <UserContextSwitcher contextColor="blue" />
          </div>
        </div>
      </div>
    </header>
  );
}