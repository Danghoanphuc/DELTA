// apps/customer-frontend/src/components/GlobalHeader.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, MessageCircle, Search } from "lucide-react";
import { UserContextSwitcher } from "./UserContextSwitcher";
import { SearchAutocomplete } from "./SearchAutocomplete";
import { NotificationInbox } from "./NotificationInbox";
import { Logo } from "@/shared/components/ui/Logo";
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

  // 🔥 UPDATE: Danh sách các route "Workspace" cần không gian tuyệt đối
  // Thêm "/friends" vào đây là quan trọng nhất
  const hiddenRoutes = ["/messages", "/chat", "/friends"];
  const isWorkspaceMode = hiddenRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  // Nếu đang ở mode Workspace -> Kill Header ngay lập tức
  if (isWorkspaceMode) return null;

  const navItems = [
    { label: "Trang chủ", path: "/app" },
    { label: "Cửa hàng", path: "/shop" },
    { label: "Thiết kế", path: "/designs" },
    { label: "Đơn hàng", path: "/orders" },
  ];

  const getIsActive = (path: string) =>
    path === "/app"
      ? location.pathname === "/app"
      : location.pathname.startsWith(path);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-20 bg-[#F9F8F6]/95 backdrop-blur-md border-b border-stone-200 transition-all duration-300">
      <div className="flex items-center justify-between h-full max-w-[1600px] mx-auto px-6 lg:px-12">
        {/* 1. LEFT: LOGO */}
        <div className="flex items-center w-[200px]">
          <Logo variant="full" />
        </div>

        {/* 2. CENTER: NAVIGATION */}
        <nav className="hidden lg:flex items-center gap-12">
          {navItems.map((item) => {
            const isActive = getIsActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className="group py-2 inline-block relative"
              >
                <span
                  className={cn(
                    "text-[13px] font-sans font-bold uppercase tracking-[0.1em] transition-colors duration-300 relative inline-block",
                    isActive
                      ? "text-primary"
                      : "text-stone-500 group-hover:text-stone-900"
                  )}
                >
                  {item.label}
                  <span
                    className={cn(
                      "absolute -bottom-1 left-0 w-full h-[2px] bg-primary transition-transform duration-300 origin-left",
                      isActive
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-50"
                    )}
                  />
                </span>
              </Link>
            );
          })}
        </nav>

        {/* 3. RIGHT: ACTIONS */}
        <div className="flex items-center justify-end gap-6 w-[300px] relative z-50">
          {onSearchSubmit && (
            <div className="hidden xl:block w-56">
              <SearchAutocomplete
                onSearchSubmit={onSearchSubmit}
                placeholder="Tìm kiếm..."
              />
            </div>
          )}

          <div className="flex items-center gap-5">
            <div className="group" title="Thông báo">
              <NotificationInbox />
            </div>

            <button
              className="relative group"
              onClick={onCartClick}
              title="Giỏ hàng"
            >
              <ShoppingCart
                size={22}
                strokeWidth={1.2}
                className="text-stone-600 group-hover:text-primary transition-colors"
              />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 h-4 min-w-[16px] px-1 bg-primary text-white text-[9px] font-mono font-bold flex items-center justify-center rounded-full">
                  {cartItemCount}
                </span>
              )}
            </button>

            <div className="h-6 w-px bg-stone-300/50 mx-1"></div>

            <UserContextSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
