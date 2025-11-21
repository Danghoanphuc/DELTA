// apps/customer-frontend/src/features/social/components/SocialNavMobile.tsx
import { Link, useLocation } from "react-router-dom";
import { 
  MessageCircle, 
  Users, 
  Settings, 
  Bot, 
  LayoutGrid, 
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useSocialChatStore } from "@/features/social/hooks/useSocialChatStore";
import { useConnectionStore } from "@/stores/useConnectionStore";

export function SocialNavMobile() {
  const location = useLocation();
  const totalUnreadMessages = useSocialChatStore((state) => state.totalUnread);
  const pendingRequestsCount = useConnectionStore((state) => state.pendingRequests.length);

  const navItems = [
    // 1. TIN NHẮN (Đảo lên đầu giống Zalo)
    { 
      icon: MessageCircle, 
      label: "Tin nhắn", 
      path: "/messages",
      activePattern: /^\/messages/,
      badge: totalUnreadMessages
    },
    // 2. DANH BẠ
    { 
      icon: Users, 
      label: "Danh bạ", 
      path: "/friends",
      activePattern: /^\/friends/,
      badge: pendingRequestsCount
    },
    // 3. AI (Giữa)
    {
      icon: Bot,
      label: "Zin AI",
      path: "/chat",
      activePattern: /^\/chat/,
      isCentral: true 
    },
    // 4. TRANG CHỦ (Lùi về sau - Nút thoát)
    { 
      icon: LayoutGrid, 
      label: "Trang chủ", 
      path: "/app",
      activePattern: /^\/app|^\/shop/,
      isExit: true
    },
    // 5. CÀI ĐẶT
    {
      icon: Settings,
      label: "Cài đặt",
      path: "/settings",
      activePattern: /^\/settings/
    }
  ];

  const isActive = (pattern: RegExp) => pattern.test(location.pathname);

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 z-50 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex h-full items-center justify-around px-2">
        {navItems.map((item) => {
            const active = isActive(item.activePattern);

            if (item.isCentral) {
                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                            "relative -translate-y-5 w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-xl transition-all duration-300 active:scale-90",
                            active
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white ring-4 ring-white"
                            : "bg-white text-blue-600 border border-gray-100"
                        )}
                    >
                        <item.icon size={26} strokeWidth={active ? 2.5 : 2} />
                    </Link>
                );
            }

            return (
                <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                    "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors active:scale-95 relative",
                    active ? "text-blue-700" : "text-gray-400 hover:text-gray-600",
                    item.isExit && !active && "text-gray-500"
                    )}
                >
                    <div className="relative">
                        <item.icon 
                            size={24} 
                            strokeWidth={active ? 2.5 : 2}
                            className={cn("transition-all", active && "scale-110")}
                        />
                        {item.badge && item.badge > 0 ? (
                            <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-1 ring-white animate-bounce">
                                {item.badge > 99 ? "99+" : item.badge}
                            </span>
                        ) : null}
                    </div>
                    <span className={cn("text-[10px] font-medium leading-none", active ? "font-bold" : "")}>
                        {item.label}
                    </span>
                </Link>
            );
        })}
      </div>
    </div>
  );
}