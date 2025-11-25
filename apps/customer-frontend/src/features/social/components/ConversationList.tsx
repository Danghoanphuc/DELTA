// apps/customer-frontend/src/features/social/components/ConversationList.tsx

import { Search, ListFilter, Trash2, Users, BellOff, CheckCircle2, Pin } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { ChatConversation } from "@/types/chat";
import { useSocialChatStore } from "../hooks/useSocialChatStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { deleteConversation, muteConversation } from "../../chat/services/chat.api.service";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/shared/lib/utils";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/shared/components/ui/tooltip";

// --- Custom Context Menu Component (Không cần cài thư viện) ---
const CustomContextMenu = ({ x, y, onClose, onAction }: { x: number, y: number, onClose: () => void, onAction: (action: string) => void }) => {
    // Click outside handler
    useEffect(() => {
        const handleClick = () => onClose();
        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, [onClose]);

    return (
        <div 
            className="fixed z-[9999] w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 text-sm animate-in fade-in zoom-in-95 duration-100"
            style={{ top: y, left: x }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
        >
            <button onClick={() => onAction('read')} className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700">
                <CheckCircle2 size={14}/> Đánh dấu đã đọc
            </button>
            <button onClick={() => onAction('mute')} className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700">
                <BellOff size={14}/> Tắt thông báo
            </button>
            <button onClick={() => onAction('pin')} className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700">
                <Pin size={14}/> Ghim hội thoại
            </button>
            <div className="h-px bg-gray-100 my-1"/>
            <button onClick={() => onAction('delete')} className="w-full text-left px-3 py-2 hover:bg-red-50 flex items-center gap-2 text-red-600 font-medium">
                <Trash2 size={14}/> Xóa cuộc trò chuyện
            </button>
        </div>
    );
};

// --- SUB-COMPONENT: AVATAR ---
const ConversationAvatar = ({ 
  src, alt, fallback, isGroup, isOnline
}: { 
  src: string | null, alt: string, fallback: string, isGroup: boolean, isOnline?: boolean
}) => {
  const [error, setError] = useState(false);
  return (
    <div className="relative w-12 h-12 flex-shrink-0">
      <div className={cn(
        "w-full h-full rounded-full flex items-center justify-center font-bold overflow-hidden border border-gray-100 shadow-sm transition-transform",
        isGroup ? "bg-gradient-to-br from-orange-400 to-pink-500" : "bg-gradient-to-br from-blue-500 to-purple-600",
        (!src || error) && "text-white"
      )}>
        {!src || error ? (
          isGroup ? <Users size={20} /> : <span className="text-lg leading-none">{fallback}</span>
        ) : (
          <img src={src} className="w-full h-full object-cover animate-in fade-in duration-300" alt={alt} onError={() => setError(true)} />
        )}
      </div>
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

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, id: string } | null>(null);

  const currentUser = useAuthStore((s) => s.user);
  const { unreadCounts, removeConversation, typingUsers, markAsRead, messagesByConversation } = useSocialChatStore(); // ✅ Lấy messagesByConversation để lấy tin nhắn cuối
  const queryClient = useQueryClient();

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

  const handleContextMenu = (e: React.MouseEvent, conversationId: string) => {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, id: conversationId });
  };

  const handleContextAction = async (action: string) => {
      if (!contextMenu) return;
      const { id } = contextMenu;
      setContextMenu(null);

      if (action === 'delete') {
          setDeleteId(id);
      } else if (action === 'read') {
          markAsRead(id);
      } else if (action === 'mute') {
          // Mock optimistic update logic here if needed
          try {
              await muteConversation(id, true);
              toast.success("Đã tắt thông báo");
          } catch (e) { toast.error("Lỗi khi tắt thông báo"); }
      } else if (action === 'pin') {
          toast.success("Đã ghim (Demo)");
      }
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
    <div className="flex flex-col h-full w-full bg-white relative">
      {/* Header */}
      <div className="p-3 border-b border-gray-100 bg-white z-10 sticky top-0">
          <div className="flex items-center justify-between mb-3 px-1">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Tin nhắn</h1>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={() => setIsUnreadFilter(!isUnreadFilter)} 
                    className={cn(
                        "w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 border",
                        isUnreadFilter 
                            ? "bg-blue-600 text-white border-blue-600 shadow-md" 
                            : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-blue-600"
                    )}
                  > 
                    <ListFilter size={16} /> 
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
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-200 rounded-xl outline-none text-sm transition-all font-medium text-gray-700 placeholder:text-gray-400"
                  placeholder="Tìm kiếm..."
              />
          </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {isLoading ? (
            [1,2,3,4].map(i => <div key={i} className="h-[72px] bg-gray-50 rounded-xl animate-pulse mx-1"/>)
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-sm gap-2">
               <Search size={32} className="opacity-20" />
               <p>{isUnreadFilter ? "Đã đọc hết tin nhắn" : "Không tìm thấy tin nhắn"}</p>
            </div>
          ) : (
            <LayoutGroup>
              <AnimatePresence initial={false}>
                {filteredConversations.map((conversation: any) => {
                  const unread = unreadCounts[conversation._id] || 0;
                  const isActive = activeId === conversation._id;
                  const isGroup = conversation.type === "group";

                  // --- Logic hiển thị tên/avatar ---
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

                  // --- ✅ FEATURE 1: TYPING INDICATOR ---
                  const typers = typingUsers[conversation._id] || [];
                  const isTyping = typers.length > 0;

                  // --- ✅ FEATURE 2: LẤY TIN NHẮN CUỐI CÙNG ---
                  // Ưu tiên: 1. lastMessage từ conversation (đã được cập nhật từ socket), 2. Messages từ store, 3. lastMessagePreview, 4. Fallback
                  const conversationLastMessage = (conversation as any).lastMessage;
                  const messages = messagesByConversation[conversation._id] || [];
                  const storeLastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
                  
                  // Ưu tiên lastMessage từ conversation (real-time từ socket) hơn messages từ store
                  const lastMessage = conversationLastMessage || storeLastMessage;
                  
                  let previewText = "";
                  let lastSenderId: string | undefined = undefined;
                  
                  if (lastMessage) {
                    // Lấy sender ID
                    lastSenderId = typeof lastMessage.sender === 'string' 
                      ? lastMessage.sender 
                      : lastMessage.sender?._id;
                    
                    // Format preview text dựa trên loại message
                    if (lastMessage.type === 'system') {
                      previewText = lastMessage.content?.text || "Đã cập nhật thông tin nhóm";
                    } else if (lastMessage.type === 'image' || (lastMessage.content as any)?.attachments?.some((a: any) => a.type === 'image')) {
                      previewText = "📷 Đã gửi ảnh";
                    } else if (lastMessage.type === 'file' || (lastMessage.content as any)?.attachments?.length > 0) {
                      const attachments = (lastMessage.content as any)?.attachments || [];
                      const fileCount = attachments.length;
                      previewText = fileCount > 1 ? `📎 ${fileCount} tệp đính kèm` : `📎 ${attachments[0]?.originalName || 'Tệp đính kèm'}`;
                    } else if (lastMessage.content?.text) {
                      previewText = lastMessage.content.text;
                      // Giới hạn độ dài
                      if (previewText.length > 50) {
                        previewText = previewText.substring(0, 50) + "...";
                      }
                    } else {
                      previewText = "Tin nhắn";
                    }
                  } else if (conversation.lastMessagePreview) {
                    previewText = conversation.lastMessagePreview;
                  } else {
                    previewText = conversation.type === "customer-bot" 
                      ? "Zin AI Support" 
                      : isGroup 
                        ? "Tin nhắn nhóm" 
                        : "Tin nhắn mới";
                  }
                  
                  // Kiểm tra nếu là mình gửi
                  const isMe = lastSenderId === currentUser?._id;

                  if (isMe && !isTyping && previewText) {
                      previewText = `Bạn: ${previewText}`;
                  }

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.2 }}
                      key={conversation._id}
                      onClick={() => onSelect(conversation._id)}
                      onContextMenu={(e) => handleContextMenu(e, conversation._id)} // ✅ FEATURE 3: RIGHT CLICK
                      className={cn(
                        "group relative w-full p-3 flex items-center gap-3 rounded-xl cursor-pointer transition-all border border-transparent min-h-[72px]",
                        isActive ? "bg-blue-50/80 border-blue-100 shadow-sm" : "hover:bg-gray-50 hover:border-gray-100 bg-white"
                      )}
                    >
                      <ConversationAvatar 
                        src={finalAvatarUrl} alt={displayTitle} fallback={displayInitial} 
                        isGroup={isGroup} isOnline={isOnline} 
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          {/* ✅ TYPOGRAPHY: To hơn (15px) và Đậm hơn */}
                          <h3 className={cn(
                              "text-[15px] font-bold truncate pr-2 transition-colors", 
                              unread > 0 ? "text-gray-900" : "text-gray-700 group-hover:text-gray-900"
                          )}>
                            {displayTitle}
                          </h3>
                          {conversation.lastMessageAt && (
                            <span className="text-[10px] text-gray-400 flex-shrink-0 font-medium">
                              {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: false, locale: vi }).replace("khoảng ", "")}
                            </span>
                          )}
                        </div>

                        <div className="flex justify-between items-center">
                          <div className={cn(
                              "text-[13px] truncate max-w-[150px] leading-snug",
                              unread > 0 ? "text-gray-900 font-semibold" : "text-gray-500"
                          )}>
                             {isTyping ? (
                                 <span className="text-blue-600 font-medium italic animate-pulse flex items-center gap-1">
                                    <span className="w-1 h-1 bg-blue-600 rounded-full animate-bounce"/> 
                                    Đang soạn tin...
                                 </span>
                             ) : (
                                 <>
                                    {isGroup && unread > 0 && !isMe && <span className="text-blue-600 mr-1">Mới:</span>}
                                    <span className={cn(isMe && "text-gray-400")}>{previewText}</span>
                                 </>
                             )}
                          </div>
                          
                          {unread > 0 && (
                            <span className="min-w-[18px] h-[18px] px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm ring-2 ring-white">
                              {unread > 99 ? "99+" : unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </LayoutGroup>
          )}
      </div>

      {/* ✅ CUSTOM CONTEXT MENU PORTAL */}
      {contextMenu && (
          <CustomContextMenu 
              x={contextMenu.x} 
              y={contextMenu.y} 
              onClose={() => setContextMenu(null)}
              onAction={handleContextAction}
          />
      )}

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