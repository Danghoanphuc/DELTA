import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/shared/components/ui/input";
import { Search, ShoppingBag, MessageSquare, X } from "lucide-react"; // Đổi icon
import { useSocialChatStore } from "@/features/social/hooks/useSocialChatStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useInputIntelligence } from "@/features/chat/hooks/useInputIntelligence";
import { cn } from "@/shared/lib/utils";

interface MobileHomeHeaderProps {
  onSearch: (term: string) => void;
}

export const MobileHomeHeader = ({ onSearch }: MobileHomeHeaderProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const { analyzeInput, suggestions, suggestionType } = useInputIntelligence();
  const totalUnreadMessages = useSocialChatStore((state) => state.totalUnread);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
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

  return (
    // Container: Giống một tấm thẻ bài nổi nhẹ trên nền
    <div className="mx-4 mt-4 rounded-sm bg-white/95 backdrop-blur-md shadow-sm border border-stone-200 pt-3 pb-3 px-3 relative z-50">
      <div className="relative z-20">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center gap-3">
            {/* Thanh tìm kiếm: Border bottom style (cổ điển) */}
            <div
              className={cn(
                "flex flex-1 items-center gap-2 px-2 py-2 transition-all duration-300 border-b",
                isFocused
                  ? "border-amber-800 bg-stone-50"
                  : "border-stone-200 bg-transparent"
              )}
            >
              <Search
                size={18}
                className={cn(
                  "transition-colors",
                  isFocused ? "text-amber-800" : "text-stone-400"
                )}
                strokeWidth={1.5}
              />
              <Input
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={() => setIsFocused(true)}
                // Placeholder lịch sự
                placeholder="Tìm kiếm tác phẩm..."
                className="border-none shadow-none p-0 focus-visible:ring-0 text-sm bg-transparent placeholder:text-stone-400 text-stone-900 font-serif placeholder:italic h-auto rounded-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="text-stone-400 hover:text-stone-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Icons Group: Minimal & Tinh tế */}
            <div className="flex items-center gap-1">
              <Link
                to="/messages"
                className="relative h-10 w-10 flex items-center justify-center text-stone-600 hover:text-amber-800 transition-colors"
              >
                <MessageSquare size={22} strokeWidth={1.2} />
                {totalUnreadMessages > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-600 ring-2 ring-white"></span>
                )}
              </Link>

              <Link
                to="/cart"
                className="relative h-10 w-10 flex items-center justify-center text-stone-600 hover:text-amber-800 transition-colors"
              >
                <ShoppingBag size={22} strokeWidth={1.2} />
                {/* Dot indicator thay vì số */}
                <span className="absolute top-2 right-2 h-1.5 w-1.5 bg-amber-600 rounded-full"></span>
              </Link>
            </div>
          </div>

          {/* DROPDOWN GỢI Ý: Style giấy */}
          {isFocused && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-[#F9F8F6] rounded-sm shadow-xl border border-stone-200 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
              <div className="px-3 py-2 bg-stone-100 border-b border-stone-200 text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                {suggestionType === "order"
                  ? "Hồ sơ của bạn"
                  : "Gợi ý Giám tuyển"}
              </div>
              {suggestions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSearch(item.name);
                    setSearchTerm(item.name);
                    setIsFocused(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-white flex items-center justify-between group transition-colors border-b border-stone-100 last:border-0"
                >
                  <span className="text-sm font-medium text-stone-700 group-hover:text-amber-900 font-serif">
                    {item.name}
                  </span>
                  {(item as any).status && (
                    <span className="text-[9px] px-2 py-0.5 bg-stone-200 rounded-sm text-stone-600 uppercase tracking-wider">
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
