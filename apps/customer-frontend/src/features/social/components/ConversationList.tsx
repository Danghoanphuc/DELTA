// apps/customer-frontend/src/features/social/components/ConversationList.tsx
import { Search, Plus, Trash2, Users, CheckCheck } from "lucide-react";
import { useState } from "react";
import type { ChatConversation } from "@/types/chat";
import { useSocialChatStore } from "../hooks/useSocialChatStore";
import { useAuthStore } from "@/stores/useAuthStore"; // ✅ NEW: Import auth store
import { deleteConversation, markAllConversationsAsRead } from "../../chat/services/chat.api.service";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/shared/lib/utils";
import { toast } from "sonner";
import { CreateGroupModal } from "./CreateGroupModal";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

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
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  
  // ✅ NEW: Lấy current user để xác định partner
  const currentUser = useAuthStore((s) => s.user);
  
  const { unreadCounts, markAllAsRead, totalUnread, removeConversation } = useSocialChatStore();
  const queryClient = useQueryClient();

  // ✅ IMPROVED FILTER: Tìm kiếm theo tên hiển thị thực tế
  const filteredConversations = conversations.filter((conv) => {
    // Logic tính tên hiển thị (giống logic render bên dưới)
    const isGroup = conv.type === "group";
    let displayName = conv.title || "";
    
    if (!isGroup && conv.participants) {
      const partner = conv.participants.find(
        (p: any) => (p.userId?._id || p.userId) !== currentUser?._id
      )?.userId;
      if (partner && typeof partner === 'object' && 'displayName' in partner) {
        displayName = partner.displayName || partner.username || "";
      }
    }
    
    return displayName.toLowerCase().includes(searchTerm.toLowerCase());
  });

 const handleDelete = async (e: React.MouseEvent, conversationId: string, title: string) => {
   e.stopPropagation();
   if (!window.confirm(`Xóa cuộc trò chuyện "${title}"?`)) return;
   try {
     // 1. Xóa UI ngay lập tức (Optimistic UI)
     removeConversation(conversationId); 
     
     // 2. Gọi API xóa
     await deleteConversation(conversationId);
     
     toast.success("Đã xóa");
     queryClient.invalidateQueries({ queryKey: ["socialConversations"] });
   } catch (error) {
     toast.error("Lỗi khi xóa");
     // Nếu lỗi thì invalidate để load lại cuộc trò chuyện
     queryClient.invalidateQueries({ queryKey: ["socialConversations"] });
   }
 };

  const handleMarkAllAsRead = async () => {
    if (totalUnread === 0) return toast.info("Đã đọc hết rồi!");
    try {
      await markAllConversationsAsRead();
      markAllAsRead();
      toast.success("Đã đánh dấu tất cả là đã đọc");
    } catch (error) {
      toast.error("Lỗi hệ thống");
    }
  };

  return (
    <>
      <div className="flex flex-col h-full w-full bg-white">
        {/* Header Clean */}
        <div className="p-4 pb-2 border-b border-gray-100 bg-white z-10 sticky top-0">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tin nhắn</h1>
            <div className="flex items-center gap-1">
              {totalUnread > 0 && (
                <button onClick={handleMarkAllAsRead} className="w-8 h-8 flex items-center justify-center hover:bg-green-50 text-gray-400 hover:text-green-600 rounded-full transition-colors" title="Đã đọc tất cả">
                  <CheckCheck size={18} />
                </button>
              )}
              <button onClick={() => setIsCreateGroupOpen(true)} className="w-8 h-8 flex items-center justify-center hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-full transition-colors" title="Tạo nhóm">
                <Plus size={20} />
              </button>
            </div>
          </div>

          <div className="relative group">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-200 rounded-xl outline-none text-sm transition-all"
            />
          </div>
        </div>

        {/* List with Motion */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {isLoading ? (
            <div className="space-y-3 pt-2">
               {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse mx-2"/>)}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-sm">
               <p>Chưa có tin nhắn nào</p>
            </div>
          ) : (
            <LayoutGroup>
              <AnimatePresence initial={false}>
                {filteredConversations.map((conversation) => {
                  const unread = unreadCounts[conversation._id] || 0;
                  const isActive = activeId === conversation._id;
                  const isGroup = conversation.type === "group";

                  // ✅ LOGIC QUAN TRỌNG: Tìm partner để hiển thị tên và avatar
                  let displayTitle = conversation.title || "Cuộc trò chuyện";
                  let displayAvatar = null;
                  let displayInitial = "?";

                  if (isGroup) {
                    displayInitial = conversation.title?.[0]?.toUpperCase() || "G";
                  } else {
                    // Tìm người kia trong mảng participants
                    const partner = conversation.participants?.find(
                      (p: any) => (p.userId?._id || p.userId) !== currentUser?._id
                    )?.userId;

                    if (partner && typeof partner === 'object' && !Array.isArray(partner) && '_id' in partner) {
                      const partnerObj = partner as { _id: string; displayName?: string; username?: string; avatarUrl?: string };
                      displayTitle = partnerObj.displayName || partnerObj.username || "Người dùng";
                      displayAvatar = partnerObj.avatarUrl || null;
                      displayInitial = (displayTitle[0] || "?").toUpperCase();
                    }
                  }

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={conversation._id}
                      onClick={() => onSelect(conversation._id)}
                      className={cn(
                        "group relative w-full p-3 mb-1 flex items-center gap-3 rounded-xl cursor-pointer transition-all border border-transparent",
                        isActive 
                          ? "bg-blue-50/80 border-blue-100 shadow-sm" 
                          : "hover:bg-gray-50 hover:border-gray-100"
                      )}
                    >
                      {/* Avatar hiển thị thông minh */}
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm overflow-hidden",
                        isGroup ? "bg-gradient-to-br from-orange-400 to-pink-500" : "bg-gradient-to-br from-blue-500 to-purple-600"
                      )}>
                        {displayAvatar ? (
                           <img src={displayAvatar} className="w-full h-full object-cover" alt="Avatar" />
                        ) : (
                           isGroup ? <Users size={20} /> : displayInitial
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h3 className={cn("font-semibold text-sm truncate pr-2", unread > 0 ? "text-gray-900" : "text-gray-700")}>
                            {displayTitle}
                          </h3>
                          {conversation.lastMessageAt && (
                            <span className="text-[10px] text-gray-400 flex-shrink-0">
                              {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: false, locale: vi }).replace("khoảng ", "")}
                            </span>
                          )}
                        </div>

                        <div className="flex justify-between items-center mt-0.5">
                          <p className={cn("text-xs truncate max-w-[140px]", unread > 0 ? "text-gray-800 font-medium" : "text-gray-500")}>
                            {conversation.type === "customer-bot" ? "Zin AI Support" : isGroup ? "Tin nhắn nhóm" : "Tin nhắn mới"}
                          </p>
                          
                          {unread > 0 && (
                            <motion.span 
                              initial={{ scale: 0 }} animate={{ scale: 1 }}
                              className="min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm"
                            >
                              {unread > 99 ? "99+" : unread}
                            </motion.span>
                          )}
                        </div>
                      </div>

                      {/* Hover Action */}
                      <button
                        onClick={(e) => handleDelete(e, conversation._id, displayTitle)}
                        className="absolute right-2 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </LayoutGroup>
          )}
        </div>
      </div>

      <CreateGroupModal 
        isOpen={isCreateGroupOpen} 
        onClose={() => setIsCreateGroupOpen(false)}
        onSuccess={(newId) => onSelect(newId)}
      />
    </>
  );
}