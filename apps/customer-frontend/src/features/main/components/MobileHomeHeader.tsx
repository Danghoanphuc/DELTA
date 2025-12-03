// apps/customer-frontend/src/features/chat/components/MobileHomeHeader.tsx

import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/shared/components/ui/input";
import { Search, Bell, ShoppingCart, MessageCircle, X } from "lucide-react";
import { useUnreadCount } from "@/features/notifications/hooks/useNotifications";
import { useSocialChatStore } from "@/features/social/hooks/useSocialChatStore";
import { useAuthStore } from "@/stores/useAuthStore";
// ✅ IMPORT HOOK TRÍ TUỆ
import { useInputIntelligence } from "@/features/chat/hooks/useInputIntelligence";
import { cn } from "@/shared/lib/utils";

interface MobileHomeHeaderProps {
  onSearch: (term: string) => void;
}

export const MobileHomeHeader = ({ onSearch }: MobileHomeHeaderProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // ✅ Hook thông minh
  const { analyzeInput, suggestions, suggestionType } = useInputIntelligence();

  const isAuthenticated = useAuthStore((state) => !!state.accessToken);
  const { unreadCount } = useUnreadCount(isAuthenticated);
  const totalUnreadMessages = useSocialChatStore((state) => state.totalUnread);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    // Kích hoạt phân tích AI
    analyzeInput(val, val.length);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
      setSearchTerm("");
      setIsFocused(false);
    }
  };

  // Click outside để đóng suggestion
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="mx-3 mt-2 rounded-[24px] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100/50 pt-4 pb-4 px-4 relative overflow-visible z-50">
      <div className="relative z-20 space-y-4">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center gap-3">
            {/* Thanh tìm kiếm */}
            <div
              className={cn(
                "flex flex-1 items-center gap-2 rounded-2xl border bg-gray-50 px-3 py-2.5 transition-all duration-300",
                isFocused
                  ? "bg-white border-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.1)]"
                  : "border-gray-100 shadow-inner"
              )}
            >
              <Search
                size={18}
                className={cn(
                  "transition-colors",
                  isFocused ? "text-blue-600" : "text-gray-400"
                )}
              />
              <Input
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={() => setIsFocused(true)}
                placeholder="Tìm sản phẩm, đơn hàng..."
                className="border-none shadow-none p-0 focus-visible:ring-0 text-sm bg-transparent placeholder:text-gray-400 text-gray-800 font-medium h-auto"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Icons Group */}
            <div className="flex items-center gap-2">
              <Link
                to="/messages"
                className="relative h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <MessageCircle size={20} strokeWidth={2} />
                {totalUnreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full bg-blue-600 text-white text-[9px] font-bold ring-2 ring-white">
                    {totalUnreadMessages > 99 ? "99+" : totalUnreadMessages}
                  </span>
                )}
              </Link>

              <Link
                to="/cart"
                className="relative h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <ShoppingCart size={20} strokeWidth={2} />
                {/* Giả lập cart count nếu có prop */}
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full border-2 border-white"></span>
              </Link>
            </div>
          </div>

          {/* ✅ DROPDOWN GỢI Ý THÔNG MINH */}
          {isFocused && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
              <div className="px-3 py-2 bg-gray-50/50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {suggestionType === "order"
                  ? "Đơn hàng của bạn"
                  : "Sản phẩm gợi ý"}
              </div>
              {suggestions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSearch(item.name); // Hoặc navigate tới detail
                    setSearchTerm(item.name);
                    setIsFocused(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center justify-between group transition-colors"
                >
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                    {item.name}
                  </span>
                  {/* Nếu là order thì hiện status */}
                  {(item as any).status && (
                    <span className="text-[10px] px-2 py-0.5 bg-gray-100 rounded-full text-gray-500">
                      {(item as any).status}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
