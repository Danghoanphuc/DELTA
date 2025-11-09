// src/components/QuickAccessWidget.tsx (FIXED)

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/shared/components/ui/hover-card";
import { Button } from "@/shared/components/ui/button";
import { Link } from "react-router-dom";
import {
  MessageSquarePlus,
  ShoppingBag,
  History,
  Bell,
  HelpCircle,
  Archive,
  Search,
  User,
  CreditCard,
  Cog,
} from "lucide-react";
import { NativeScrollArea as ScrollArea } from "@/shared/components/ui/NativeScrollArea";
import { ChatMessage, ChatConversation } from "@/types/chat";
import { cn } from "@/shared/lib/utils";
import { Separator } from "@/shared/components/ui/separator";
import { Badge } from "@/shared/components/ui/badge";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";

// (Các component con ChatHoverContent, CartHoverContent... giữ nguyên)
// ... (Component con giữ nguyên) ...
interface ChatHoverContentProps {
  conversations: ChatConversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
}
const ChatHoverContent = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewChat,
}: ChatHoverContentProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  return (
    <div className="flex flex-col space-y-2">
      <h4 className="font-semibold text-sm text-gray-800 px-1 mb-1">
        Trợ lý Chat
      </h4>
      <Button
        variant="ghost"
        className="w-full justify-start text-gray-700 hover:bg-blue-50 hover:text-blue-700"
        onClick={onNewChat}
      >
        <MessageSquarePlus size={18} className="mr-2" />
        Chat mới
      </Button>
      <Separator className="my-1" />
      <div className="px-1">
        <h5 className="font-semibold text-xs text-gray-500 mb-2 flex items-center gap-1.5">
          <History size={14} />
          Lịch sử chat gần đây
        </h5>
        {conversations.length > 0 ? (
          <ScrollArea className="h-40 pr-2">
            <div className="space-y-1.5 text-xs">
              {conversations.map((convo) => (
                <Button
                  key={convo._id}
                  variant="ghost"
                  onClick={() => onSelectConversation(convo._id)}
                  className={cn(
                    "w-full justify-start text-left h-auto py-1.5",
                    currentConversationId === convo._id
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600"
                  )}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium truncate">
                      {convo.title}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(convo.updatedAt)}
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <p className="text-sm text-gray-400 p-2 italic">
            Chưa có lịch sử chat.
          </p>
        )}
      </div>
    </div>
  );
};
const CartHoverContent = () => (
  <div className="flex flex-col space-y-2">
    <h4 className="font-semibold text-sm text-gray-800 px-1 mb-1">Đơn hàng</h4>
    <Button
      variant="ghost"
      asChild
      className="w-full justify-start text-gray-700 hover:bg-blue-50 hover:text-blue-700"
    >
      <Link to="/shop">
        <ShoppingBag size={18} className="mr-2" />
        Giỏ hàng của tôi
      </Link>
    </Button>
    <Button
      variant="ghost"
      asChild
      className="w-full justify-start text-gray-700 hover:bg-blue-50 hover:text-blue-700"
    >
      <Link to="/orders">
        <Archive size={18} className="mr-2" />
        Quản lý đơn hàng
      </Link>
    </Button>
  </div>
);
const NotificationsHoverContent = () => (
  <div className="flex flex-col space-y-2">
    <h4 className="font-semibold text-sm text-gray-800 px-1 mb-1">Thông báo</h4>
    <div className="text-sm text-gray-700 p-2 hover:bg-gray-50 rounded-md">
      <p className="font-medium">Chào mừng đến với PrintZ!</p>
      <p className="text-xs text-gray-500">Hãy bắt đầu trò chuyện với AI...</p>
    </div>
    <div className="text-sm text-gray-700 p-2 hover:bg-gray-50 rounded-md">
      <p className="font-medium">Đơn hàng #DH001 đã được xác nhận.</p>
      <p className="text-xs text-gray-500">1 giờ trước</p>
    </div>
  </div>
);
const SupportHoverContent = ({ onNewChat }: { onNewChat: () => void }) => (
  <div className="flex flex-col">
    <h4 className="font-semibold text-base text-gray-800 px-1 mb-2">
      Trung tâm hỗ trợ
    </h4>
    <Button
      variant="ghost"
      className="w-full justify-start text-gray-700 hover:bg-blue-50 hover:text-blue-700"
      onClick={onNewChat}
    >
      <MessageSquarePlus size={18} className="mr-2" />
      Gửi tin nhắn cho AI
    </Button>
    <Separator className="my-2" />
    <h5 className="font-semibold text-sm text-gray-800 px-1 mb-2">
      Câu hỏi thường gặp
    </h5>
    <div className="relative mb-2 px-1">
      <Search
        size={16}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input
        type="text"
        placeholder="Tìm kiếm..."
        className="w-full pl-8 pr-3 py-1.5 text-sm border rounded-md"
      />
    </div>
    <div className="flex flex-col">
      <Button
        variant="ghost"
        className="w-full justify-start text-gray-700"
        asChild
      >
        <Link to="/settings">
          <User size={18} className="mr-2 text-gray-500" />
          Tài khoản
        </Link>
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start text-gray-700"
        asChild
      >
        <Link to="/orders">
          <CreditCard size={18} className="mr-2 text-gray-500" />
          Thanh toán
        </Link>
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start text-gray-700"
        asChild
      >
        <Link to="/process">
          <Cog size={18} className="mr-2 text-gray-500" />
          Vận hành
        </Link>
      </Button>
    </div>
    <Separator className="my-2" />
    <Button variant="ghost" size="sm" className="w-full text-blue-600" asChild>
      <Link to="/contact">Xem tất cả chủ đề</Link>
    </Button>
  </div>
);

// (Props và component chính)
interface QuickAccessWidgetProps {
  recentMessages: ChatMessage[];
  onNewChat: () => void;
  conversations: ChatConversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
}
export function QuickAccessWidget({
  recentMessages,
  onNewChat,
  conversations,
  currentConversationId,
  onSelectConversation,
}: QuickAccessWidgetProps) {
  const { accessToken } = useAuthStore();
  const { getCartItemCount } = useCartStore();
  const isAuthenticated = !!accessToken;
  const cartItemCount = getCartItemCount(isAuthenticated);
  const notificationCount = 3; // (Placeholder)

  const commonHoverProps = {
    openDelay: 100,
    closeDelay: 150,
  };
  const commonContentProps = {
    side: "left" as const,
    align: "end" as const,
    className: "w-72 p-3 bg-white rounded-lg shadow-xl border border-gray-100",
    sideOffset: 12,
  };
  const commonTriggerProps =
    "w-12 h-12 bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors relative";

  return (
    <div className="fixed top-1/2 -translate-y-1/2 right-4 z-40 flex flex-col gap-1 p-2 bg-white/80 backdrop-blur-sm rounded-l-2xl shadow-lg border border-r-0 border-gray-200">
      {/* 2. Icon Chat */}
      <HoverCard {...commonHoverProps}>
        <HoverCardTrigger asChild>
          <Button variant="ghost" size="icon" className={commonTriggerProps}>
            <MessageSquarePlus size={22} />
          </Button>
        </HoverCardTrigger>
        <HoverCardContent {...commonContentProps}>
          <ChatHoverContent
            conversations={conversations}
            currentConversationId={currentConversationId}
            onSelectConversation={onSelectConversation}
            onNewChat={onNewChat}
          />
        </HoverCardContent>
      </HoverCard>

      {/* 3. Icon Giỏ hàng (ĐÃ FIX BADGE) */}
      <HoverCard {...commonHoverProps}>
        <HoverCardTrigger asChild>
          <Button variant="ghost" size="icon" className={commonTriggerProps}>
            <ShoppingBag size={22} />
            {cartItemCount > 0 && (
              /* ✅ SỬA LỖI: Gỡ bỏ w-5, dùng min-w-5 và padding */
              <span
                className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1.5 flex items-center justify-center p-0 rounded-full
                           bg-blue-600 text-white text-[10px] font-bold leading-none"
              >
                {cartItemCount}
              </span>
            )}
          </Button>
        </HoverCardTrigger>
        <HoverCardContent {...commonContentProps}>
          <CartHoverContent />
        </HoverCardContent>
      </HoverCard>

      {/* 4. Icon Thông báo (ĐÃ FIX BADGE) */}
      <HoverCard {...commonHoverProps}>
        <HoverCardTrigger asChild>
          <Button variant="ghost" size="icon" className={commonTriggerProps}>
            <Bell size={22} />
            {notificationCount > 0 && (
              /* ✅ SỬA LỖI: Gỡ bỏ w-5, dùng min-w-5 và padding */
              <span
                className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1.5 flex items-center justify-center p-0 rounded-full
                           bg-red-600 text-white text-[10px] font-bold leading-none"
              >
                {notificationCount}
              </span>
            )}
          </Button>
        </HoverCardTrigger>
        <HoverCardContent {...commonContentProps}>
          <NotificationsHoverContent />
        </HoverCardContent>
      </HoverCard>

      {/* 5. Icon Hỗ trợ */}
      <HoverCard {...commonHoverProps}>
        <HoverCardTrigger asChild>
          <Button variant="ghost" size="icon" className={commonTriggerProps}>
            <HelpCircle size={22} />
          </Button>
        </HoverCardTrigger>
        <HoverCardContent {...commonContentProps}>
          <SupportHoverContent onNewChat={onNewChat} />
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}
