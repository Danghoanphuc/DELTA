// apps/customer-frontend/src/features/social/components/ConversationList.tsx
// ✅ FIXED: Status Dot không còn bị cắt (Đưa ra ngoài overflow-hidden)
// ✅ FEATURE: Hiển thị tin nhắn mới nhất (lastMessagePreview)

import { Search, ListFilter, Trash2, Users } from "lucide-react";
import { useState } from "react";
import type { ChatConversation } from "@/types/chat";
import { useSocialChatStore } from "../hooks/useSocialChatStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { deleteConversation } from "../../chat/services/chat.api.service";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/shared/lib/utils";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/shared/components/ui/tooltip";

// --- SUB-COMPONENT: AVATAR (Đã tách Dot ra ngoài) ---
const ConversationAvatar = ({ 
  src, 
  alt, 
  fallback, 
  isGroup,
  isOnline
}: { 
  src: string | null, 
  alt: string, 
  fallback: string, 
  isGroup: boolean,
  isOnline?: boolean
}) => {
  const [error, setError] = useState(false);

  return (
    // 1. Wrapper Relative định vị khung
    <div className="relative w-12 h-12 flex-shrink-0">
      
      {/* 2. Avatar Container (Tròn + Cắt ảnh thừa) */}
      <div className={cn(
        "w-full h-full rounded-full flex items-center justify-center font-bold overflow-hidden border border-gray-100 shadow-sm",
        isGroup 
          ? "bg-gradient-to-br from-orange-400 to-pink-500" 
          : "bg-gradient-to-br from-blue-500 to-purple-600",
        (!src || error) && "text-white"
      )}>
        {!src || error ? (
          isGroup ? <Users size={20} /> : <span className="text-lg leading-none">{fallback}</span>
        ) : (
          <img 
            src={src} 
            className="w-full h-full object-cover animate-in fade-in duration-300" 
            alt={alt} 
            onError={() => setError(true)}
          />
        )}
      </div>

      {/* 3. Chấm xanh (Nằm ĐÈ LÊN KHUNG ẢNH, tuyệt đối không bị cắt) */}
      {!isGroup && isOnline && (
        <span className="absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full bg-green-500 ring-2 ring-white shadow-md z-10" />
      )}
    </div>
  );
};

// --- MAIN COMPONENT ---
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
  const [isUnreadFilter, setIsUnreadFilter] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentUser = useAuthStore((s) => s.user);
  const { unreadCounts, removeConversation } = useSocialChatStore();
  const queryClient = useQueryClient();

  // Filter Logic
  const filteredConversations = conversations.filter((conv) => {
    let matchSearch = true;
    if (searchTerm.trim()) {
        const isGroup = conv.type === "group";
        let displayName = conv.title || "";
        if (!isGroup && conv.participants) {
            const partner = conv.participants.find((p: any) => (p.userId?._id || p.userId) !== currentUser?._id)?.userId;
            if (partner && typeof partner === 'object') {
                displayName = partner.displayName || partner.username || "";
            }
        }
        matchSearch = displayName.toLowerCase().includes(searchTerm.toLowerCase());
    }
    let matchUnread = true;
    if (isUnreadFilter) {
        matchUnread = (unreadCounts[conv._id] || 0) > 0;
    }
    return matchSearch && matchUnread;
  });

  const onRequestDelete = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    setDeleteId(conversationId);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      removeConversation(deleteId);
      setDeleteId(null);
      toast.success("Đã xóa cuộc trò chuyện");
      await deleteConversation(deleteId);
    } catch (error) {
      toast.error("Lỗi khi xóa, vui lòng thử lại");
      queryClient.invalidateQueries({ queryKey: ["socialConversations"] });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white">
      {/* Header */}
      <div className="p-4 pb-2 border-b border-gray-100 bg-white z-10 sticky top-0">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tin nhắn</h1>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={() => setIsUnreadFilter(!isUnreadFilter)} 
                    className={cn(
                        "w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 border",
                        isUnreadFilter 
                            ? "bg-blue-600 text-white border-blue-600 shadow-md" 
                            : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-blue-600"
                    )}
                  > 
                    <ListFilter size={18} /> 
                  </button>
                </TooltipTrigger>
                <TooltipContent><p>Lọc tin chưa đọc</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="relative group">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-200 rounded-xl outline-none text-sm transition-all font-medium text-gray-700 placeholder:text-gray-400"
                  placeholder="Tìm kiếm đoạn chat..."
              />
          </div>
          
          <AnimatePresence>
            {isUnreadFilter && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="text-[11px] text-blue-600 font-semibold mt-2 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                      Đang hiển thị tin nhắn chưa đọc ({filteredConversations.length})
                  </div>
                </motion.div>
            )}
          </AnimatePresence>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {isLoading ? (
            [1,2,3,4].map(i => <div key={i} className="h-[72px] bg-gray-50 rounded-xl animate-pulse mx-1"/>)
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-sm gap-2">
               <Search size={32} className="opacity-20" />
               <p>{isUnreadFilter ? "Đã đọc hết tin nhắn" : "Không tìm thấy tin nhắn nào"}</p>
            </div>
          ) : (
            <LayoutGroup>
              <AnimatePresence initial={false}>
                {filteredConversations.map((conversation: any) => {
                  const unread = unreadCounts[conversation._id] || 0;
                  const isActive = activeId === conversation._id;
                  const isGroup = conversation.type === "group";

                  let displayTitle = conversation.title || "Cuộc trò chuyện";
                  let displayAvatar = null;
                  let displayInitial = "?";
                  let isOnline = false;

                  if (isGroup) {
                      displayTitle = conversation.title || "Nhóm mới";
                      displayAvatar = conversation.avatarUrl;
                      displayInitial = displayTitle[0]?.toUpperCase() || "G";
                  } else {
                      const partner = conversation.participants?.find((p: any) => (p.userId?._id || p.userId) !== currentUser?._id)?.userId;
                      if (partner && typeof partner === 'object') {
                          displayTitle = partner.displayName || partner.username || "Người dùng";
                          displayAvatar = partner.avatarUrl || null;
                          displayInitial = (displayTitle[0] || "?").toUpperCase();
                          isOnline = partner.isOnline === true;
                      }
                  }
                  
                  const lastUpdated = new Date(conversation.updatedAt || conversation.createdAt || Date.now()).getTime();
                  const finalAvatarUrl = displayAvatar ? `${displayAvatar}?v=${lastUpdated}` : null;

                  // ✅ LẤY TIN NHẮN MỚI NHẤT (Hoặc fallback)
                  const previewText = conversation.lastMessagePreview || 
                                      (conversation.type === "customer-bot" ? "Zin AI Support" : 
                                      isGroup ? "Tin nhắn nhóm" : "Tin nhắn mới");

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.2 }}
                      key={conversation._id}
                      onClick={() => onSelect(conversation._id)}
                      className={cn(
                        "group relative w-full p-3 flex items-center gap-3 rounded-xl cursor-pointer transition-all border border-transparent min-h-[72px]",
                        isActive ? "bg-blue-50/80 border-blue-100 shadow-sm" : "hover:bg-gray-50 hover:border-gray-100 bg-white"
                      )}
                    >
                      {/* Avatar */}
                      <ConversationAvatar 
                        src={finalAvatarUrl} alt={displayTitle} fallback={displayInitial} 
                        isGroup={isGroup} isOnline={isOnline} 
                      />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h3 className={cn("font-semibold text-sm truncate pr-2", unread > 0 ? "text-gray-900" : "text-gray-700")}>
                            {displayTitle}
                          </h3>
                          {conversation.lastMessageAt && (
                            <span className="text-[10px] text-gray-400 flex-shrink-0 font-medium">
                              {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: false, locale: vi }).replace("khoảng ", "")}
                            </span>
                          )}
                        </div>

                        <div className="flex justify-between items-center mt-0.5">
                          <p className={cn("text-xs truncate max-w-[140px]", unread > 0 ? "text-gray-900 font-medium" : "text-gray-500")}>
                            {/* ✅ HIỂN THỊ PREVIEW */}
                            {isGroup && unread > 0 && <span className="text-blue-600">Mới: </span>}
                            {previewText}
                          </p>
                          
                          {unread > 0 && (
                            <span className="min-w-[18px] h-[18px] px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm ring-2 ring-white">
                              {unread > 99 ? "99+" : unread}
                            </span>
                          )}
                        </div>
                      </div>

                      <button onClick={(e) => onRequestDelete(e, conversation._id)} className="absolute right-2 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10">
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </LayoutGroup>
          )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Xóa cuộc trò chuyện?"
        description="Hành động này không thể hoàn tác."
        confirmText="Xóa vĩnh viễn"
        cancelText="Giữ lại"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}