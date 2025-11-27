// src/features/chat/components/ChatHistorySidebar.tsx
import { useMemo, useState, useRef, useEffect } from "react";
import { NativeScrollArea } from "@/shared/components/ui/NativeScrollArea";
import { ChatConversation } from "@/types/chat";
import { cn } from "@/shared/lib/utils";
import { MessageSquare, Clock, SearchX, MoreHorizontal, Pencil, Trash2, Check, X, Sparkles } from "lucide-react";
import { ChatHistorySkeleton } from "@/shared/components/ui/skeleton";
import { useChatContext } from "../context/ChatProvider";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { useConfirmDialog } from "@/shared/hooks/useConfirmDialog";
import { useScrambleText } from "../hooks/useScrambleText";
import { motion, AnimatePresence } from "framer-motion";

interface ChatHistorySidebarProps {
  conversations: ChatConversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  searchQuery?: string;
  isLoading?: boolean;
  isVisible: boolean;
}

const thanosSnapVariant = {
  hidden: { opacity: 0, y: -20, height: 0 },
  visible: { 
    opacity: 1, y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 }
  },
  exit: { opacity: 0, x: -20, height: 0, transition: { duration: 0.2 } }
} as const;

// Component con hiển thị Title
function TitleWithScramble({ title, isActive, createdAt }: { title: string, isActive: boolean, createdAt?: string }) {
  // ✅ LOGIC CHỐT: Chat mới tạo (<10s) thì cho nhảy chào sân.
  // Chat cũ (>10s) thì im lặng.
  // Nếu đổi tên -> Hook tự lo -> Vẫn nhảy.
  const isBrandNew = useMemo(() => {
      if (!createdAt) return false;
      const diff = Date.now() - new Date(createdAt).getTime();
      return diff < 10000; // 10 giây
  }, [createdAt]);

  const { displayText, isScrambling } = useScrambleText({
    text: title,
    duration: 800,
    tick: 40, 
    playOnMount: isBrandNew, 
  });

  return (
    <div className="flex items-center min-w-0 h-5">
      {isScrambling && (
        <motion.span
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="mr-1.5 text-purple-500 inline-block shrink-0"
        >
          <Sparkles size={12} className="animate-spin" />
        </motion.span>
      )}
      <motion.div className={cn(
          "truncate text-sm font-medium leading-tight pr-2 rounded px-1 -mx-1 transition-all",
          isScrambling 
            ? "font-mono text-xs tracking-tighter bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-bold"
            : (isActive ? "text-blue-700 dark:text-blue-400" : "text-gray-700 dark:text-gray-300")
        )}>
        {displayText}
      </motion.div>
    </div>
  );
}

export function ChatHistorySidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  searchQuery = "",
  isLoading = false,
}: ChatHistorySidebarProps) {
  const chatContext = useChatContext();
  const handleRenameConversation = (chatContext as any)?.handleRenameConversation;
  const handleDeleteConversation = (chatContext as any)?.handleDeleteConversation;
  const isLoadingConversations = (chatContext as any)?.isLoadingConversations || false;
  const { dialogState, openDialog, closeDialog } = useConfirmDialog();

  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
              setMenuOpenId(null);
          }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
    } catch (e) { return ""; }
  };

  const startEditing = (e: React.MouseEvent, convo: ChatConversation) => {
      e.stopPropagation();
      setEditingId(convo._id);
      setEditTitle(convo.title || "Chat mới");
      setMenuOpenId(null);
  };

  const saveTitle = (e: React.MouseEvent | React.KeyboardEvent, id: string) => {
      e.stopPropagation();
      if (editTitle.trim()) handleRenameConversation(id, editTitle.trim());
      setEditingId(null);
  };

  const deleteChat = (e: React.MouseEvent, id: string, title: string) => {
      e.preventDefault(); e.stopPropagation(); setMenuOpenId(null);
      openDialog({
        title: "Xóa hội thoại?",
        description: `"${title}" sẽ bị xóa vĩnh viễn.`,
        confirmText: "Xóa ngay", variant: "danger",
        onConfirm: async () => { if (handleDeleteConversation) await handleDeleteConversation(id); },
      });
  };

  return (
    <div className="w-full h-full flex flex-col">      
      <NativeScrollArea className="flex-1">
        <div className="p-2 space-y-1 pb-20">
          {isLoading || isLoadingConversations ? <ChatHistorySkeleton /> : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4 opacity-50">
               <SearchX size={32} className="mb-2 text-gray-400" />
               <p className="text-sm text-gray-500">Không tìm thấy</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout" initial={false}>
              {filteredConversations.map((convo) => (
                <motion.div
                  key={convo._id} layout variants={thanosSnapVariant} initial="hidden" animate="visible" exit="exit"
                  className={cn(
                    "group relative w-full text-left px-3 py-3 rounded-lg transition-colors duration-200 flex items-start gap-3 cursor-pointer",
                    menuOpenId === convo._id ? "z-50" : "z-0",
                    currentConversationId === convo._id ? "bg-white dark:bg-gray-800 shadow-sm border border-gray-200" : "hover:bg-gray-100 border border-transparent"
                  )}
                  onClick={() => onSelectConversation(convo._id)}
                >
                  <div className="mt-0.5 shrink-0">
                    {currentConversationId === convo._id ? <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-blue-600"><Sparkles size={16} /></motion.div> : <MessageSquare size={16} className="text-gray-400 group-hover:text-gray-600" />}
                  </div>
                  <div className="min-w-0 flex-1 relative">
                      {editingId === convo._id ? (
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <input autoFocus value={editTitle} onChange={(e) => setEditTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveTitle(e, convo._id)} className="flex-1 min-w-0 py-0.5 px-1 text-sm border border-blue-400 rounded bg-white outline-none" />
                              <button onClick={(e) => saveTitle(e, convo._id)} className="p-1 text-green-600 hover:bg-green-100 rounded"><Check size={14} /></button>
                              <button onClick={() => setEditingId(null)} className="p-1 text-red-500 hover:bg-red-100 rounded"><X size={14} /></button>
                          </div>
                      ) : (
                          <>
                              <TitleWithScramble 
                                  title={convo.title || "Đoạn chat mới"}
                                  isActive={currentConversationId === convo._id}
                                  createdAt={convo.createdAt} 
                              />
                              <div className="text-[10px] text-gray-400 mt-1.5 font-medium">{safeFormatDate(convo.updatedAt)}</div>
                          </>
                      )}
                  </div>
                  {!editingId && (
                      <div className="relative z-10" onClick={(e) => e.stopPropagation()}>
                          <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); setMenuOpenId(menuOpenId === convo._id ? null : convo._id); }} className={cn("p-1 rounded-md transition-opacity relative opacity-0 group-hover:opacity-100", menuOpenId === convo._id && "opacity-100 bg-gray-200")}>
                              <MoreHorizontal size={16} />
                          </button>
                          {menuOpenId === convo._id && (
                              <div ref={menuRef} className="absolute right-0 top-6 w-36 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 animate-in fade-in zoom-in-95">
                                  <button onClick={(e) => startEditing(e, convo)} className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"><Pencil size={13} /> Đổi tên</button>
                                  <div className="h-[1px] bg-gray-100 my-1"></div>
                                  <button onClick={(e) => deleteChat(e, convo._id, convo.title || "Chat")} className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"><Trash2 size={13} /> Xóa</button>
                              </div>
                          )}
                      </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </NativeScrollArea>
      <ConfirmDialog isOpen={dialogState.isOpen} onClose={closeDialog} onConfirm={dialogState.onConfirm} title={dialogState.title} description={dialogState.description} confirmText={dialogState.confirmText} cancelText={dialogState.cancelText} variant={dialogState.variant} />
    </div>
  );
}