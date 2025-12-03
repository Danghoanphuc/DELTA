// apps/customer-frontend/src/features/social/components/SocialNavMobile.tsx

import { Link, useLocation } from "react-router-dom";
import { MessageCircle, Users, Settings, Bot, Home } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useSocialChatStore } from "@/features/social/hooks/useSocialChatStore";
import { useConnectionStore } from "@/stores/useConnectionStore";

export function SocialNavMobile() {
  const location = useLocation();
  const totalUnreadMessages = useSocialChatStore((state) => state.totalUnread);
  const pendingRequestsCount = useConnectionStore(
    (state) => state.pendingRequests.length
  );

  const navItems = [
    // 1. TIN NHẮN (Core Feature)
    {
      icon: MessageCircle,
      label: "Tin nhắn",
      path: "/messages",
      activePattern: /^\/messages/,
      badge: totalUnreadMessages,
    },
    // 2. DANH BẠ
    {
      icon: Users,
      label: "Danh bạ",
      path: "/friends",
      activePattern: /^\/friends/,
      badge: pendingRequestsCount,
    },
    // 3. HOME (Trung tâm - Thoát ra App chính)
    {
      icon: Home,
      label: "Trang chủ",
      path: "/app",
      activePattern: /^\/app|^\/shop/,
    },
    // 4. AI (Giờ là một tiện ích bình thường)
    {
      icon: Bot,
      label: "Zin AI",
      path: "/chat",
      activePattern: /^\/chat/,
    },
    // 5. MENU
    {
      icon: Settings,
      label: "Menu",
      path: "/settings",
      activePattern: /^\/settings/,
    },
  ];

  const isActive = (pattern: RegExp) => pattern.test(location.pathname);

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 h-[60px] bg-white border-t border-stone-100 z-50 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
      <div className="flex h-full items-center justify-between px-2">
        {navItems.map((item) => {
          const active = isActive(item.activePattern);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "group relative flex flex-1 flex-col items-center justify-center h-full gap-1 transition-all active:scale-95",
                active
                  ? "text-stone-900"
                  : "text-stone-400 hover:text-stone-600"
              )}
            >
              {/* Active Indicator (Top Line) */}
              {active && (
                <span className="absolute top-0 w-8 h-0.5 bg-stone-900 rounded-b-sm" />
              )}

              <div className="relative p-1">
                <item.icon
                  size={22} // Kích thước đồng nhất
                  strokeWidth={active ? 2.5 : 1.8} // Nét đậm khi active
                  className="transition-all duration-200"
                />

                {/* Notification Badge */}
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white ring-2 ring-white animate-in zoom-in">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                ) : null}
              </div>

              {/* Label nhỏ gọn */}
              <span
                className={cn(
                  "text-[10px] leading-none transition-all",
                  active ? "font-bold" : "font-medium"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
