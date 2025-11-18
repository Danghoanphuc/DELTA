// src/features/chat/components/ChatHistorySidebar.tsx 

import { useMemo, useState, useRef, useEffect } from "react";
import { NativeScrollArea } from "@/shared/components/ui/NativeScrollArea";
import { ChatConversation } from "@/types/chat";
import { cn } from "@/shared/lib/utils";
import { MessageSquare, Clock, SearchX, MoreHorizontal, Pencil, Trash2, Check, X } from "lucide-react";
import { ChatHistorySkeleton } from "@/shared/components/ui/skeleton";
import { useChatContext } from "../context/ChatProvider"; // ✅ Import Context

interface ChatHistorySidebarProps {
  conversations: ChatConversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  searchQuery?: string;
  isLoading?: boolean;
}

export function ChatHistorySidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  searchQuery = "",
  isLoading = false,
}: ChatHistorySidebarProps) {
  // ✅ Lấy handler từ Context
  const { handleRenameConversation, handleDeleteConversation } = useChatContext();

  // ✅ Local State cho UI Menu & Edit
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
              setMenuOpenId(null);
          }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const query = searchQuery.toLowerCase();
    return conversations.filter((convo) => 
      convo.title?.toLowerCase().includes(query)
    );
  }, [conversations, searchQuery]);

  const safeFormatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      if (days === 0) return "Hôm nay";
      if (days === 1) return "Hôm qua";
      return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
    } catch (e) { return ""; }
  };

  const startEditing = (e: React.MouseEvent, convo: ChatConversation) => {
      e.stopPropagation();
      setEditingId(convo._id);
      setEditTitle(convo.title || "Đoạn chat mới");
      setMenuOpenId(null);
  };

  const saveTitle = (e: React.MouseEvent | React.KeyboardEvent, id: string) => {
      e.stopPropagation();
      if (editTitle.trim()) {
          handleRenameConversation(id, editTitle.trim());
      }
      setEditingId(null);
  };

  const cancelEdit = (e: React.MouseEvent) => {
      e.stopPropagation();
      setEditingId(null);
  };

  const deleteChat = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setMenuOpenId(null);
      handleDeleteConversation(id);
  };

  return (
    <div className="w-full h-full flex flex-col">      
      <NativeScrollArea className="flex-1">
        <div className="p-2 space-y-1 pb-20"> {/* Padding bottom để tránh bị che bởi footer mobile */}
          {isLoading ? (
            <ChatHistorySkeleton />
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4 opacity-50">
                {searchQuery ? (
                  <>
                    <SearchX size={32} className="mb-2 text-gray-400 dark:text-gray-500" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Không tìm thấy kết quả</p>
                  </>
                ) : (
                  <>
                    <Clock size={32} className="mb-2 text-gray-400 dark:text-gray-500" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Chưa có lịch sử</p>
                  </>
                )}
            </div>
          ) : (
            filteredConversations.map((convo) => (
              <div
                key={convo._id}
                className={cn(
                  "group relative w-full text-left px-3 py-3 rounded-lg transition-all duration-200 flex items-start gap-3 cursor-pointer",
                  currentConversationId === convo._id
                    ? "bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800/50 border border-transparent"
                )}
                onClick={() => onSelectConversation(convo._id)}
              >
                {/* Icon Logic */}
                <MessageSquare 
                  size={16} 
                  className={cn(
                    "mt-0.5 shrink-0 transition-colors", 
                    currentConversationId === convo._id 
                      ? "text-blue-600 dark:text-blue-400" 
                      : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600"
                  )} 
                />

                {/* Content Area */}
                <div className="min-w-0 flex-1 relative">
                    {/* Chế độ chỉnh sửa */}
                    {editingId === convo._id ? (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <input 
                                autoFocus
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && saveTitle(e, convo._id)}
                                className="flex-1 min-w-0 py-0.5 px-1 text-sm border border-blue-400 rounded bg-white dark:bg-gray-700 outline-none"
                            />
                            <button onClick={(e) => saveTitle(e, convo._id)} className="p-1 text-green-600 hover:bg-green-100 rounded"><Check size={14} /></button>
                            <button onClick={cancelEdit} className="p-1 text-red-500 hover:bg-red-100 rounded"><X size={14} /></button>
                        </div>
                    ) : (
                        // Chế độ hiển thị bình thường
                        <>
                            <div className={cn(
                                "truncate text-sm font-medium leading-tight pr-6", // pr-6 để tránh đè lên nút 3 chấm
                                currentConversationId === convo._id ? "text-blue-700 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
                            )}>
                                {convo.title || "Đoạn chat mới"} 
                            </div>
                            <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 font-medium">
                                {safeFormatDate(convo.updatedAt)}
                            </div>
                        </>
                    )}
                </div>

                {/* Action Menu Trigger (3 chấm) */}
                {!editingId && (
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setMenuOpenId(menuOpenId === convo._id ? null : convo._id);
                            }}
                            className={cn(
                                "p-1 rounded-md transition-opacity",
                                // Mobile: luôn hiện, Desktop: hiện khi hover hoặc đang active menu
                                "opacity-100 lg:opacity-0 lg:group-hover:opacity-100",
                                menuOpenId === convo._id ? "bg-gray-200 dark:bg-gray-700 opacity-100" : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400"
                            )}
                        >
                            <MoreHorizontal size={16} />
                        </button>

                        {/* Dropdown Menu Custom */}
                        {menuOpenId === convo._id && (
                            <div 
                                ref={menuRef}
                                className="absolute right-0 top-6 z-50 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 animate-in fade-in zoom-in-95 duration-100 origin-top-right"
                            >
                                <button 
                                    onClick={(e) => startEditing(e, convo)}
                                    className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 flex items-center gap-2"
                                >
                                    <Pencil size={12} />
                                    Đổi tên
                                </button>
                                <div className="h-[1px] bg-gray-100 dark:bg-gray-700 my-1"></div>
                                <button 
                                    onClick={(e) => deleteChat(e, convo._id)}
                                    className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2"
                                >
                                    <Trash2 size={12} />
                                    Xóa
                                </button>
                            </div>
                        )}
                    </div>
                )}
              </div>
            ))
          )}
        </div>
      </NativeScrollArea>
    </div>
  );
}