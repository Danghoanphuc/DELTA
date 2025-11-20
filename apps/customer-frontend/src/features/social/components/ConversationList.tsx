// apps/customer-frontend/src/features/social/components/ConversationList.tsx
// ✅ SOCIAL CHAT: List of conversations (Added Delete Feature)

import { Search, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import type { ChatConversation } from "@/types/chat";
import { useSocialChatStore } from "../hooks/useSocialChatStore";
import { deleteConversation } from "../../chat/services/chat.api.service"; // ✅ Import API xóa
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/shared/lib/utils";
import { toast } from "sonner";

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
  // ✅ Lấy store để cập nhật state sau khi xóa
  const {
    unreadCounts,
    conversations: storeConversations,
    setConversations,
  } = useSocialChatStore();

  const filteredConversations = conversations.filter((conv) =>
    conv.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Hàm xử lý xóa
  const handleDelete = async (
    e: React.MouseEvent,
    conversationId: string,
    title: string
  ) => {
    e.stopPropagation(); // Ngăn không cho click vào item (mở chat)

    if (
      !window.confirm(`Bạn có chắc chắn muốn xóa cuộc trò chuyện "${title}"?`)
    ) {
      return;
    }

    try {
      // 1. Gọi API xóa
      await deleteConversation(conversationId);

      // 2. Cập nhật Store (Xóa khỏi danh sách ngay lập tức)
      const updatedList = storeConversations.filter(
        (c) => c._id !== conversationId
      );
      setConversations(updatedList);

      toast.success("Đã xóa cuộc trò chuyện");
    } catch (error) {
      console.error("Delete failed", error);
      toast.error("Không thể xóa cuộc trò chuyện này");
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">Tin nhắn</h1>
          <Link
            to="/friends"
            className="p-2 hover:bg-gray-100 rounded-full transition"
            title="Tạo cuộc trò chuyện mới"
          >
            <Plus size={20} className="text-gray-600" />
          </Link>
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
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {title[0]?.toUpperCase() || "?"}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-baseline justify-between mb-1">
                    <h3
                      className={cn(
                        "font-semibold text-sm truncate pr-6", // Thêm padding phải để tránh đè nút xóa
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
                      {/* Preview loại chat */}
                      {conversation.type === "ai"
                        ? "💬 Nhắn tin với AI"
                        : "👥 Chat với bạn bè"}
                    </p>
                    {unread > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full flex-shrink-0">
                        {unread > 99 ? "99+" : unread}
                      </span>
                    )}
                  </div>
                </div>

                {/* ✅ DELETE BUTTON (Chỉ hiện khi hover) */}
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
  );
}
