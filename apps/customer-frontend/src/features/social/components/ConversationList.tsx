// apps/customer-frontend/src/features/social/components/ConversationList.tsx
// ✅ FIXED: Nút Plus (+) mở Modal tạo nhóm

import { Search, Plus, Trash2, Users, CheckCheck } from "lucide-react"; // Added CheckCheck icon
import { useState } from "react";
import type { ChatConversation } from "@/types/chat";
import { useSocialChatStore } from "../hooks/useSocialChatStore";
import { deleteConversation, markAllConversationsAsRead } from "../../chat/services/chat.api.service";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/shared/lib/utils";
import { toast } from "sonner";
import { CreateGroupModal } from "./CreateGroupModal"; // ✅ Import Modal
import { useQueryClient } from "@tanstack/react-query"; // ✅ NEW: Import useQueryClient

interface ConversationListProps {
  conversations: ChatConversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  isLoading: boolean;
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  isLoading,
}: ConversationListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false); // ✅ State Modal

  const {
    unreadCounts,
    markAllAsRead,
    totalUnread,
  } = useSocialChatStore();
  
  const queryClient = useQueryClient();

  // ✅ FIXED: Sử dụng conversations từ props (đã được sync từ API)
  // Không cần storeConversations vì conversations từ props đã là source of truth
  const filteredConversations = conversations.filter((conv) =>
    conv.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (
    e: React.MouseEvent,
    conversationId: string,
    title: string
  ) => {
    e.stopPropagation();
    if (!window.confirm(`Bạn có chắc chắn muốn xóa cuộc trò chuyện "${title}"?`)) {
      return;
    }
    try {
      await deleteConversation(conversationId);
      toast.success("Đã xóa cuộc trò chuyện");
      // ✅ FIXED: Invalidate query để refetch conversations
      queryClient.invalidateQueries({ queryKey: ["socialConversations"] });
    } catch (error) {
      console.error("Delete failed", error);
      toast.error("Không thể xóa cuộc trò chuyện này");
    }
  };

  // ✅ NEW: Xử lý đánh dấu tất cả là đã đọc
  const handleMarkAllAsRead = async () => {
    if (totalUnread === 0) {
      toast.info("Không có tin nhắn chưa đọc");
      return;
    }
    try {
      await markAllConversationsAsRead();
      markAllAsRead(); // Update store
      toast.success("Đã đánh dấu tất cả là đã đọc");
    } catch (error) {
      console.error("Mark all as read failed", error);
      toast.error("Không thể đánh dấu đã đọc");
    }
  };

  return (
    <>
      <div className="flex flex-col h-full w-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">Tin nhắn</h1>
            
            <div className="flex items-center gap-2">
              {/* ✅ NÚT ĐÁNH DẤU ĐÃ ĐỌC */}
              {totalUnread > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="p-2 hover:bg-green-50 text-gray-600 hover:text-green-600 rounded-full transition border border-transparent hover:border-green-100 relative"
                  title="Đánh dấu tất cả là đã đọc"
                >
                  <CheckCheck size={20} />
                  {totalUnread > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {totalUnread > 99 ? "99+" : totalUnread}
                    </span>
                  )}
                </button>
              )}
              
              {/* ✅ NÚT TẠO NHÓM */}
              <button
                onClick={() => setIsCreateGroupOpen(true)}
                className="p-2 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-full transition border border-transparent hover:border-blue-100"
                title="Tạo nhóm chat mới"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Tìm kiếm cuộc trò chuyện..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Đang tải...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchTerm
                ? "Không tìm thấy cuộc trò chuyện"
                : "Chưa có cuộc trò chuyện nào"}
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const unread = unreadCounts[conversation._id] || 0;
              const isActive = activeId === conversation._id;
              const title = conversation.title || "Cuộc trò chuyện";
              const isGroup = conversation.type === "group"; // Check group type

              return (
                <div
                  key={conversation._id}
                  onClick={() => onSelect(conversation._id)}
                  className={cn(
                    "group relative w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition border-b border-gray-100 cursor-pointer",
                    isActive && "bg-blue-50 hover:bg-blue-50"
                  )}
                >
                  {/* Avatar */}
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0",
                    isGroup ? "bg-gradient-to-br from-orange-400 to-pink-500" : "bg-gradient-to-br from-purple-400 to-blue-500"
                  )}>
                    {isGroup ? <Users size={20} className="text-white"/> : (title[0]?.toUpperCase() || "?")}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-baseline justify-between mb-1">
                      <h3
                        className={cn(
                          "font-semibold text-sm truncate pr-6",
                          unread > 0 ? "text-gray-900" : "text-gray-700"
                        )}
                      >
                        {title}
                      </h3>
                      {conversation.lastMessageAt && (
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                          {formatDistanceToNow(
                            new Date(conversation.lastMessageAt),
                            {
                              addSuffix: true,
                              locale: vi,
                            }
                          )}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <p
                        className={cn(
                          "text-sm truncate",
                          unread > 0
                            ? "text-gray-900 font-medium"
                            : "text-gray-500"
                        )}
                      >
                        {conversation.type === "customer-bot"
                          ? "💬 Nhắn tin với AI"
                          : isGroup ? "👥 Nhóm thảo luận" : "👤 Chat với bạn bè"}
                      </p>
                      {unread > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full flex-shrink-0">
                          {unread > 99 ? "99+" : unread}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDelete(e, conversation._id, title)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                    title="Xóa cuộc trò chuyện"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ✅ Render Modal */}
      <CreateGroupModal 
        isOpen={isCreateGroupOpen} 
        onClose={() => setIsCreateGroupOpen(false)}
        onSuccess={(newId) => onSelect(newId)}
      />
    </>
  );
}