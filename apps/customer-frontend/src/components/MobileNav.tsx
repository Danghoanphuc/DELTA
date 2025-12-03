// src/components/MobileNav.tsx
import { Home, LayoutGrid, MessageCircle, Package, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/shared/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSocialChatStore } from "@/features/social/hooks/useSocialChatStore";

export function MobileNav() {
  const location = useLocation();
  const hiddenPatterns = [/^\/product\//, /^\/products\//];
  const shouldHide = hiddenPatterns.some((pattern) =>
    pattern.test(location.pathname)
  );

  const totalUnreadMessages = useSocialChatStore((state) => state.totalUnread);

  if (shouldHide) return null;

  const menuItems = [
    { icon: Home, label: "Feed", path: "/app" },
    { icon: LayoutGrid, label: "Shop", path: "/shop" },
    { icon: MessageCircle, label: "Chat", path: "/chat", isCentral: true },
    { icon: Package, label: "Orders", path: "/orders" },
    { icon: User, label: "Me", path: "/settings" },
  ];

  const getIsActive = (path: string) => {
    const [pathname] = path.split("?");
    if (pathname === "/app") return location.pathname === "/app";
    if (pathname === "/chat") return location.pathname.startsWith("/chat");
    return location.pathname.startsWith(pathname);
  };

  return (
    // STYLE: Nền giấy #F9F8F6, Border-top siêu mảnh. Không dùng màu đen đặc.
    <div className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-[#F9F8F6]/95 backdrop-blur-md border-t border-stone-200 z-30 safe-bottom">
      <nav className="h-full flex items-center justify-around px-2">
        {menuItems.map((item) => {
          const isActive = getIsActive(item.path);

          // NÚT TRUNG TÂM (Chat): Style tròn, nổi nhẹ, tinh tế
          if (item.isCentral) {
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative flex items-center justify-center w-12 h-12 rounded-full border transition-all duration-300 shadow-sm",
                  isActive
                    ? "bg-stone-900 border-stone-900 text-white"
                    : "bg-white border-stone-200 text-stone-600 hover:border-stone-400"
                )}
              >
                <item.icon size={20} strokeWidth={1.5} />
                {totalUnreadMessages > 0 && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#F9F8F6]" />
                )}
              </Link>
            );
          }

          // CÁC NÚT KHÁC: Minimalist Icon + Label Serif
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex-1 flex flex-col items-center justify-center gap-1 group"
            >
              <div
                className={cn(
                  "transition-all duration-300",
                  isActive ? "text-stone-900 -translate-y-1" : "text-stone-400"
                )}
              >
                <item.icon
                  size={22}
                  strokeWidth={1.5} // Nét mảnh
                  className="group-hover:text-stone-700 transition-colors"
                />
              </div>

              {/* Label: Chỉ hiện khi Active hoặc rất nhỏ */}
              <span
                className={cn(
                  "text-[9px] uppercase tracking-widest font-medium transition-opacity duration-300",
                  isActive ? "opacity-100 text-stone-900" : "opacity-0"
                )}
              >
                {item.label}
              </span>

              {/* Dot Indicator for Active State */}
              {isActive && (
                <div className="w-1 h-1 bg-stone-900 rounded-full mt-1 animate-in fade-in" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
