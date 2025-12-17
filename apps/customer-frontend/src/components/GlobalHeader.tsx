// apps/customer-frontend/src/components/GlobalHeader.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
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

  // Logic ẩn header khi ở trong không gian "Immersive" (Chat, Bạn bè)
  const hiddenRoutes = ["/messages", "/chat", "/friends"];
  const isWorkspaceMode = hiddenRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  if (isWorkspaceMode) return null;

  // MENU: Dùng từ ngữ "Giám tuyển"
  const navItems = [
    { label: "Sảnh Chính", path: "/app" }, // Thay Trang chủ
    { label: "Bộ Sưu Tập", path: "/shop" }, // Thay Cửa hàng
    { label: "Hồ Sơ", path: "/orders" }, // Thay Đơn hàng
  ];

  const getIsActive = (path: string) =>
    path === "/app"
      ? location.pathname === "/app"
      : location.pathname.startsWith(path);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-20 bg-[#F9F8F6]/95 backdrop-blur-md border-b border-stone-200 transition-all duration-300 shadow-sm">
      <div className="flex items-center justify-between h-full max-w-[1600px] mx-auto px-6 lg:px-12">
        {/* 1. LEFT: LOGO */}
        <div className="flex items-center w-[200px]">
          <Logo variant="full" />
        </div>

        {/* 2. CENTER: NAVIGATION - Font Serif sang trọng */}
        <nav className="hidden lg:flex items-center gap-10">
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
                    "text-[14px] font-serif font-bold tracking-wide transition-colors duration-500 relative inline-block",
                    isActive
                      ? "text-amber-800"
                      : "text-stone-500 group-hover:text-stone-900"
                  )}
                >
                  {item.label}
                  {/* Underline hiệu ứng mực loang */}
                  <span
                    className={cn(
                      "absolute -bottom-1 left-0 w-full h-[2px] bg-amber-800 transition-transform duration-500 origin-left rounded-full opacity-80",
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
        <div className="flex items-center justify-end gap-5 w-[300px] relative z-50">
          {onSearchSubmit && (
            <div className="hidden xl:block w-60">
              <SearchAutocomplete
                onSearchSubmit={onSearchSubmit}
                placeholder="Tìm kiếm tác phẩm..."
                className="font-serif"
              />
            </div>
          )}

          <div className="flex items-center gap-4">
            <div
              className="group opacity-80 hover:opacity-100 transition-opacity"
              title="Thông báo"
            >
              <NotificationInbox />
            </div>

            <button
              className="relative group p-1"
              onClick={onCartClick}
              title="Giỏ hàng"
            >
              <ShoppingCart
                size={22}
                strokeWidth={1.5}
                className="text-stone-600 group-hover:text-amber-800 transition-colors"
              />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 bg-amber-700 text-white text-[9px] font-mono font-bold flex items-center justify-center rounded-full border border-[#F9F8F6]">
                  {cartItemCount}
                </span>
              )}
            </button>

            <div className="h-6 w-px bg-stone-300 mx-2"></div>

            <UserContextSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
