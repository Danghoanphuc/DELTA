// src/components/GlobalHeader.tsx
// ✅ FIXED: Z-Index, Redirect, Dropdown visibility

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Package,
  FolderOpen,
  Compass,
  LayoutGrid,
  ShoppingCart,
  Bell,
  MessageCircle,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { UserContextSwitcher } from "./UserContextSwitcher";
import { SearchAutocomplete } from "./SearchAutocomplete";
import printzLogo from "@/assets/img/logo-printz.png";
import { cn } from "@/shared/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSocialChatStore } from "@/features/social/hooks/useSocialChatStore";
import {
  useUnreadCount,
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
} from "@/features/notifications/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

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
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const isAuthenticated = useAuthStore((state) => !!state.accessToken);

  const { unreadCount } = useUnreadCount(isAuthenticated);
  const { data: notificationsData, isLoading: isLoadingNoti } =
    useNotifications({ page: 1, limit: 10 }, isAuthenticated);
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const totalUnreadMessages = useSocialChatStore((state) => state.totalUnread);

  // ✅ LOGIC REDIRECT CHÍNH XÁC
  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) markAsReadMutation.mutate(notification._id);
    setIsNotiOpen(false);

    const type = notification.type;
    const data = notification.data || {};

    console.log("Redirecting for:", type, data); // Debug log

    if (type === "connection_request") {
      navigate("/friends?tab=pending");
    } else if (type === "connection_accepted") {
      if (data.conversationId)
        navigate(`/messages?conversationId=${data.conversationId}`);
      else navigate("/friends");
    } else if (type.includes("order")) {
      navigate(data.orderId ? `/customer/orders/${data.orderId}` : "/orders");
    } else {
      navigate("/notifications");
    }
  };

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
          {/* ✅ DROPDOWN MENU - Z-Index cao để đè lên tất cả */}
          <DropdownMenu
            open={isNotiOpen}
            onOpenChange={setIsNotiOpen}
            modal={false}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative cursor-pointer outline-none focus:ring-0"
              >
                <Bell
                  size={20}
                  className={
                    unreadCount > 0 ? "text-gray-900" : "text-gray-500"
                  }
                />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold animate-in zoom-in">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>

            {/* ✅ Content: z-[100] để chắc chắn hiện ra */}
            <DropdownMenuContent
              className="w-80 p-0 mr-4 mt-2 shadow-2xl border-gray-200 bg-white z-[100]"
              align="end"
              sideOffset={8}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/90 backdrop-blur-sm">
                <h4 className="font-semibold text-sm text-gray-900">
                  Thông báo
                </h4>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsReadMutation.mutate()}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    <Check size={12} /> Đọc tất cả
                  </button>
                )}
              </div>
              <ScrollArea className="h-[320px] bg-white">
                {isLoadingNoti ? (
                  <div className="flex justify-center items-center h-32">
                    <Loader2 className="animate-spin text-gray-400" size={24} />
                  </div>
                ) : notificationsData?.data?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                    <Bell size={32} className="mb-2 opacity-20" />
                    <p className="text-sm">Không có thông báo</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {notificationsData?.data?.map((noti: any) => (
                      <div
                        key={noti._id}
                        onClick={() => handleNotificationClick(noti)}
                        className={cn(
                          "w-full text-left px-4 py-3 hover:bg-gray-50 transition cursor-pointer flex gap-3 items-start group",
                          !noti.isRead ? "bg-blue-50/40" : "bg-white"
                        )}
                      >
                        <div
                          className={cn(
                            "w-2 h-2 mt-1.5 rounded-full flex-shrink-0 transition-transform group-hover:scale-125",
                            !noti.isRead ? "bg-blue-600" : "bg-transparent"
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "text-sm text-gray-900 mb-0.5",
                              !noti.isRead && "font-semibold"
                            )}
                          >
                            {noti.title}
                          </p>
                          <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                            {noti.message}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {formatDistanceToNow(new Date(noti.createdAt), {
                              addSuffix: true,
                              locale: vi,
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              <div className="p-2 border-t border-gray-100 text-center bg-gray-50/50">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs h-8 text-gray-500"
                  onClick={() => {
                    setIsNotiOpen(false);
                    navigate("/notifications");
                  }}
                >
                  Xem tất cả
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

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
