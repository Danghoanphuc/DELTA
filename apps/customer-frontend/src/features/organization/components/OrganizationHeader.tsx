// apps/customer-frontend/src/features/organization/components/OrganizationHeader.tsx
// Organization Header with business name and action icons

import {
  Building2,
  Search,
  User,
  ChevronDown,
  MessageCircle,
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/shared/lib/utils";
import NotificationInbox from "@/features/notifications/components/NotificationInbox";
import { useSocialChatStore } from "@/features/social/hooks/useSocialChatStore";

interface OrganizationHeaderProps {
  className?: string;
}

export function OrganizationHeader({ className }: OrganizationHeaderProps) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.activeOrganizationProfile);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const totalUnreadMessages = useSocialChatStore((state) => state.totalUnread);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 bg-white border-b border-stone-200 shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left: Welcome Message */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-md">
            <span className="text-lg font-bold text-white">
              {user?.displayName?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
          <div>
            <h1 className="text-base font-bold text-stone-900">
              Chào mừng trở lại, {user?.displayName}! 👋
            </h1>
            <p className="text-xs text-stone-500">
              Đây là tổng quan về hoạt động kinh doanh của bạn
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-stone-50 hover:bg-stone-100 rounded-lg transition-colors text-stone-600 hover:text-stone-900">
            <Search className="w-4 h-4" />
            <span className="text-sm">Tìm kiếm...</span>
          </button>

          {/* Messages/Chat */}
          <button
            onClick={() => navigate("/messages")}
            className="relative p-2 hover:bg-stone-100 rounded-lg transition-colors group"
            title="Tin nhắn"
          >
            <MessageCircle className="w-5 h-5 text-stone-600 group-hover:text-stone-900" />
            {/* Badge for unread messages */}
            {totalUnreadMessages > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalUnreadMessages > 99 ? "99+" : totalUnreadMessages}
              </span>
            )}
          </button>

          {/* Notifications - Novu Inbox */}
          <div className="relative">
            <NotificationInbox />
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-stone-200" />

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-stone-50 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-sm font-bold text-white">
                  {user?.displayName?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-stone-900">
                  {user?.displayName || "User"}
                </p>
                <p className="text-xs text-stone-500">
                  {user?.email || "user@example.com"}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-stone-400" />
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border-2 border-stone-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-stone-100">
                    <p className="text-sm font-semibold text-stone-900">
                      {user?.displayName}
                    </p>
                    <p className="text-xs text-stone-500">{user?.email}</p>
                  </div>
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate("/account");
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-stone-700 hover:bg-stone-50 transition-colors flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      Tài khoản của tôi
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate("/settings");
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-stone-700 hover:bg-stone-50 transition-colors flex items-center gap-2"
                    >
                      <Building2 className="w-4 h-4" />
                      Cài đặt doanh nghiệp
                    </button>
                  </div>
                  <div className="border-t border-stone-100 pt-2">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        useAuthStore.getState().signOut();
                        navigate("/login");
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default OrganizationHeader;
