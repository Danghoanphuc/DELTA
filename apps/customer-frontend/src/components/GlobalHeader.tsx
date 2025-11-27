// src/components/GlobalHeader.tsx
// ✅ FIXED: Z-Index, Redirect, Dropdown visibility

import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Package,
  FolderOpen,
  Compass,
  LayoutGrid,
  ShoppingCart,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { UserContextSwitcher } from "./UserContextSwitcher";
import { SearchAutocomplete } from "./SearchAutocomplete";
import { NotificationInbox } from "./NotificationInbox";
import printzLogo from "@/assets/img/logo-printz.png";
import { cn } from "@/shared/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSocialChatStore } from "@/features/social/hooks/useSocialChatStore";

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
  const isAuthenticated = useAuthStore((state) => !!state.accessToken);
  const totalUnreadMessages = useSocialChatStore((state) => state.totalUnread);

  const navItems = [
    { label: "Khám phá", path: "/app", icon: Compass },
    { label: "Cửa hàng", path: "/shop", icon: LayoutGrid },
    { label: "Thiết kế", path: "/designs", icon: FolderOpen },
    { label: "Đơn hàng", path: "/orders", icon: Package },
  ];
  const getIsActive = (path: string) =>
    path === "/app"
      ? location.pathname === "/app"
      : location.pathname.startsWith(path);

  return (
    // ✅ Header để z-40, nhưng Dropdown sẽ là z-50
    <header className="hidden lg:block fixed top-0 left-0 right-0 z-40 h-16 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 gap-2">
        {/* Logo & Nav */}
        <div className="hidden lg:flex items-center gap-4 flex-shrink-0 relative pr-2">
          <Link to="/app" className="flex items-center gap-2 flex-shrink-0">
            <img src={printzLogo} alt="PrintZ Logo" className="w-10 h-10" />
            <span className="font-bold text-xl text-gray-800">Printz</span>
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

        {/* Search */}
        {onSearchSubmit && (
          <div className="flex-1 max-w-xl mx-4 min-w-0 relative">
            <SearchAutocomplete onSearchSubmit={onSearchSubmit} />
          </div>
        )}

        {/* Icons */}
        <div className="flex items-center gap-2">
          <NotificationInbox />

          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => navigate("/messages")}
          >
            <MessageCircle size={20} />
            {isAuthenticated && totalUnreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full bg-blue-600 text-white text-[10px] font-bold">
                {totalUnreadMessages > 99 ? "99+" : totalUnreadMessages}
              </span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative micro-bounce"
            onClick={onCartClick}
          >
            <ShoppingCart size={22} />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full bg-blue-600 text-white text-[10px] font-bold">
                {cartItemCount > 99 ? "99+" : cartItemCount}
              </span>
            )}
          </Button>

          <div className="pl-2">
            <UserContextSwitcher contextColor="blue" />
          </div>
        </div>
      </div>
    </header>
  );
}
