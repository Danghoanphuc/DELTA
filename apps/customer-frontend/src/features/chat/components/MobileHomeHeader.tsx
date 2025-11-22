import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/shared/components/ui/input";
import { Search, Bell, ShoppingCart, Wand2, Building2, Timer, CalendarDays, MessageCircle } from "lucide-react";
import { useUnreadCount } from "@/features/notifications/hooks/useNotifications";
import { useSocialChatStore } from "@/features/social/hooks/useSocialChatStore";

interface MobileHomeHeaderProps {
  onSearch: (term: string) => void;
}

const quickUtilityItems = [
  { label: "Printz Studio", icon: Wand2, href: "/design-editor" },
  { label: "Printz B2B", icon: Building2, href: "/contact" },
  { label: "In gấp 24h", icon: Timer, href: "/shop?fast=1" },
  { label: "Theo sự kiện", icon: CalendarDays, href: "/inspiration" },
];

export const MobileHomeHeader = ({ onSearch }: MobileHomeHeaderProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // ✅ Get unread counts
  const { unreadCount } = useUnreadCount();
  const totalUnreadMessages = useSocialChatStore((state) => state.totalUnread);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      return;
    }
    onSearch(trimmed);
    setSearchTerm("");
  };

  return (
    <div className="mx-3 rounded-3xl bg-gradient-to-b from-[#e7f9ff] via-[#fef5ff] to-white shadow-[0_20px_60px_rgba(45,96,255,0.15)] border border-blue-100/50 px-4 pt-5 pb-5 relative overflow-hidden">
      {/* Background decoration - Adjusted contrast */}
      <div className="absolute inset-0 opacity-50 pointer-events-none">
        <div className="absolute -top-10 -left-12 w-44 h-44 bg-[#d9f0ff] rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffe4fb] rounded-full blur-3xl" />
      </div>

      <div className="relative z-20 space-y-4">
        <form className="flex flex-col space-y-3" onSubmit={handleSubmit}>
          <div className="flex items-center gap-3">
            {/* Search Bar: White background + Shadow + Darker Border */}
            <div className="flex flex-1 items-center gap-2 rounded-2xl border border-gray-300 bg-white px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
              <Search size={18} className="text-gray-500" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm sản phẩm hoặc dịch vụ..."
                className="border-none shadow-none p-0 focus-visible:ring-0 text-sm bg-transparent placeholder:text-gray-400 text-gray-800 font-medium"
              />
            </div>

            {/* Action Buttons Group */}
            <div className="flex items-center gap-2">
              {/* ✅ SOCIAL CHAT: Messages Icon */}
              <Link
                to="/messages"
                className="relative h-10 w-10 rounded-2xl border border-gray-200 bg-white flex items-center justify-center text-gray-600 shadow-sm hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all"
                aria-label="Tin nhắn"
              >
                <MessageCircle size={20} strokeWidth={1.8} />
                {totalUnreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full bg-blue-600 text-white text-[10px] font-bold leading-none shadow-sm ring-2 ring-white">
                    {totalUnreadMessages > 99 ? "99+" : totalUnreadMessages}
                  </span>
                )}
              </Link>
              
              {/* Notifications */}
              <Link
                to="/notifications"
                className="relative h-10 w-10 rounded-2xl border border-gray-200 bg-white flex items-center justify-center text-gray-600 shadow-sm hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all"
                aria-label="Thông báo"
              >
                <Bell size={20} strokeWidth={1.8} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold leading-none shadow-sm ring-2 ring-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
              
              {/* Cart */}
              <Link
                to="/cart"
                className="h-10 w-10 rounded-2xl border border-gray-200 bg-white flex items-center justify-center text-gray-600 shadow-sm hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all"
                aria-label="Giỏ hàng"
              >
                <ShoppingCart size={20} strokeWidth={1.8} />
              </Link>
            </div>
          </div>

          {/* Quick Utility Grid: Solid white cards with shadow */}
          <div className="grid grid-cols-4 gap-2">
            {quickUtilityItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex flex-col items-center gap-1.5 rounded-2xl border border-gray-100 bg-white p-2.5 text-center shadow-sm hover:shadow-md hover:border-blue-100 hover:bg-blue-50 transition-all group"
              >
                <item.icon size={22} className="text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-[11px] font-medium text-gray-700 group-hover:text-blue-700 leading-tight">
                  {item.label}
                </span>
              </a>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
};