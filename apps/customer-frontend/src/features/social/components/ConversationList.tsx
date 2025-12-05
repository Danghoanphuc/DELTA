import {
  Search,
  ListFilter,
  Trash2,
  Users,
  BellOff,
  CheckCircle2,
  Pin,
  MoreHorizontal,
} from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import type { ChatConversation } from "@/types/chat";
import { useSocialChatStore } from "../hooks/useSocialChatStore";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  deleteConversation,
  muteConversation,
} from "../../chat/services/chat.api.service";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/shared/lib/utils";
import { toast } from "@/shared/utils/toast";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/shared/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/shared/components/ui/dropdown-menu";

// Helper function to strip HTML tags from DOMPurify sanitized content
const stripHtmlTags = (html: string): string => {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

// --- AVATAR COMPONENT ---
const ConversationAvatar = ({
  src,
  alt,
  fallback,
  isGroup,
  isOnline,
}: {
  src: string | null;
  alt: string;
  fallback: string;
  isGroup: boolean;
  isOnline?: boolean;
}) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Show fallback if no src or error occurred
  const showFallback = !src || error;

  return (
    <div className="relative h-12 w-12 flex-shrink-0">
      <div
        className={cn(
          "h-full w-full overflow-hidden rounded-2xl shadow-sm ring-1 ring-inset ring-black/5 transition-transform",
          isGroup
            ? "bg-gradient-to-br from-stone-100 to-stone-200"
            : "bg-stone-100",
          "flex items-center justify-center"
        )}
      >
        {/* Always render fallback as background */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            !showFallback && loaded && "opacity-0"
          )}
        >
          {isGroup ? (
            <Users size={20} className="text-stone-400" />
          ) : (
            <span className="font-serif text-lg font-bold text-stone-500">
              {fallback}
            </span>
          )}
        </div>

        {/* Image overlay */}
        {src && !error && (
          <img
            src={src}
            className={cn(
              "absolute inset-0 h-full w-full object-cover rounded-2xl transition-opacity duration-200",
              loaded ? "opacity-100" : "opacity-0"
            )}
            alt={alt}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
        )}
      </div>
      {!isGroup && isOnline && (
        <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500" />
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
  const [newlyCreatedId, setNewlyCreatedId] = useState<string | null>(null);

  const currentUser = useAuthStore((s) => s.user);
  const {
    unreadCounts,
    removeConversation,
    typingUsers,
    markAsRead,
    messagesByConversation,
  } = useSocialChatStore();
  const queryClient = useQueryClient();

  // Track newly created conversations for highlight effect
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversations.length > 0) {
      const newest = conversations[0];
      const isNew =
        Date.now() - new Date(newest.createdAt || 0).getTime() < 3000;
      if (isNew && newest._id !== newlyCreatedId) {
        setNewlyCreatedId(newest._id);

        // Scroll to top smoothly when new conversation is added
        if (listRef.current) {
          listRef.current.scrollTo({ top: 0, behavior: "smooth" });
        }

        setTimeout(() => setNewlyCreatedId(null), 3000);
      }
    }
  }, [conversations]);

  // Deduplicate and sort conversations by lastMessageAt (most recent first)
  const uniqueConversations = useMemo(() => {
    const seen = new Set<string>();
    const unique = conversations.filter((conv) => {
      if (seen.has(conv._id)) return false;
      seen.add(conv._id);
      return true;
    });

    // Sort by lastMessageAt descending (newest first)
    return unique.sort((a, b) => {
      const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [conversations]);

  const filteredConversations = uniqueConversations.filter((conv) => {
    let matchSearch = true;
    if (searchTerm.trim()) {
      const isGroup = conv.type === "group";
      let displayName = conv.title || "";
      if (!isGroup && conv.participants) {
        const partner = conv.participants.find(
          (p: any) => (p.userId?._id || p.userId) !== currentUser?._id
        )?.userId;
        if (partner && typeof partner === "object") {
          displayName = partner.displayName || partner.username || "";
        }
      }
      matchSearch = displayName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    }
    let matchUnread = true;
    if (isUnreadFilter) {
      matchUnread = (unreadCounts[conv._id] || 0) > 0;
    }
    return matchSearch && matchUnread;
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      removeConversation(deleteId);
      setDeleteId(null);
      toast.success("Đã xóa cuộc trò chuyện");
      await deleteConversation(deleteId);
    } catch (error) {
      toast.error("Lỗi khi xóa");
      queryClient.invalidateQueries({ queryKey: ["socialConversations"] });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-white">
      {/* Header Search */}
      <div className="sticky top-0 z-10 bg-white/80 px-4 py-4 backdrop-blur-md">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-serif text-2xl font-bold text-stone-900">
            Tin nhắn
          </h1>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setIsUnreadFilter(!isUnreadFilter)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full transition-all border",
                    isUnreadFilter
                      ? "bg-primary text-white border-primary shadow-md"
                      : "bg-transparent text-stone-400 border-stone-200 hover:border-primary hover:text-primary"
                  )}
                >
                  <ListFilter size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Lọc tin chưa đọc</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="relative group">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 transition-colors group-focus-within:text-primary"
          />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 w-full rounded-xl bg-stone-50 border-none pl-10 pr-4 text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:ring-1 focus:ring-primary/20 transition-all"
            placeholder="Tìm kiếm đối thoại..."
          />
        </div>
      </div>

      {/* List */}
      <div
        ref={listRef}
        className="flex-1 space-y-1 overflow-y-auto px-2 pb-2 custom-scrollbar"
        style={{ scrollBehavior: "smooth" }}
      >
        {isLoading ? (
          [1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="mx-2 h-[76px] rounded-2xl bg-stone-50 animate-pulse"
            />
          ))
        ) : filteredConversations.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-stone-400">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-50">
              <Search size={24} className="opacity-20" />
            </div>
            <p className="font-sans text-sm">
              {isUnreadFilter
                ? "Đã đọc hết tin nhắn"
                : "Không tìm thấy kết quả"}
            </p>
          </div>
        ) : (
          <LayoutGroup>
            <AnimatePresence initial={false}>
              {filteredConversations.map((conversation: any) => {
                const unread = unreadCounts[conversation._id] || 0;
                const isActive = activeId === conversation._id;
                const isGroup = conversation.type === "group";

                // Data Processing
                let displayTitle = conversation.title || "Cuộc trò chuyện";
                let displayAvatar = null;
                let displayInitial = "?";
                let isOnline = false;

                if (isGroup) {
                  displayTitle = conversation.title || "Nhóm mới";
                  displayAvatar = conversation.avatarUrl;
                  displayInitial = displayTitle[0]?.toUpperCase() || "G";
                } else {
                  const partner = conversation.participants?.find(
                    (p: any) => (p.userId?._id || p.userId) !== currentUser?._id
                  )?.userId;
                  if (partner && typeof partner === "object") {
                    displayTitle =
                      partner.displayName || partner.username || "Người dùng";
                    displayAvatar = partner.avatarUrl || null;
                    displayInitial = (displayTitle[0] || "?").toUpperCase();
                    isOnline = partner.isOnline === true;
                  }
                }

                // Message Preview Logic (Same as before but refined)
                const conversationLastMessage = (conversation as any)
                  .lastMessage;
                const messages = messagesByConversation[conversation._id] || [];
                const lastMessage =
                  conversationLastMessage ||
                  (messages.length > 0 ? messages[messages.length - 1] : null);
                const isTyping =
                  (typingUsers[conversation._id] || []).length > 0;

                let previewText =
                  conversation.lastMessagePreview || "Bắt đầu trò chuyện";
                let isMe = false;

                if (lastMessage) {
                  const senderId =
                    typeof lastMessage.sender === "string"
                      ? lastMessage.sender
                      : lastMessage.sender?._id;
                  isMe = senderId === currentUser?._id;

                  if (lastMessage.type === "image")
                    previewText = "Đã gửi một ảnh";
                  else if (lastMessage.type === "file")
                    previewText = "Đã gửi một tệp";
                  else if (lastMessage.content?.text) {
                    // Strip HTML tags from DOMPurify formatted content
                    previewText = stripHtmlTags(lastMessage.content.text);
                  }
                }

                const isNewlyCreated = conversation._id === newlyCreatedId;

                return (
                  <motion.div
                    layout
                    layoutId={conversation._id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      },
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.9,
                      transition: { duration: 0.2 },
                    }}
                    key={conversation._id}
                    onClick={() => onSelect(conversation._id)}
                    className={cn(
                      "group relative flex w-full cursor-pointer items-center gap-3 rounded-2xl p-3 transition-all duration-200",
                      isActive
                        ? "bg-stone-100"
                        : "bg-transparent hover:bg-stone-50",
                      isNewlyCreated && "ring-2 ring-primary/30 bg-primary/5"
                    )}
                  >
                    <ConversationAvatar
                      src={
                        displayAvatar
                          ? `${displayAvatar}?v=${new Date(
                              conversation.updatedAt
                            ).getTime()}`
                          : null
                      }
                      alt={displayTitle}
                      fallback={displayInitial}
                      isGroup={isGroup}
                      isOnline={isOnline}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 flex items-center justify-between">
                        <h3
                          className={cn(
                            "truncate font-sans text-[15px] font-bold transition-colors",
                            unread > 0
                              ? "text-stone-900"
                              : "text-stone-700 group-hover:text-stone-900"
                          )}
                        >
                          {displayTitle}
                        </h3>
                        {conversation.lastMessageAt && (
                          <span className="shrink-0 font-mono text-[10px] text-stone-400">
                            {formatDistanceToNow(
                              new Date(conversation.lastMessageAt),
                              { addSuffix: false, locale: vi }
                            ).replace("khoảng ", "")}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={cn(
                            "truncate text-[13px] leading-snug max-w-[180px]",
                            unread > 0
                              ? "font-bold text-stone-800"
                              : "font-medium text-stone-500",
                            isTyping && "text-primary animate-pulse"
                          )}
                        >
                          {isTyping ? (
                            "Đang nhập..."
                          ) : (
                            <>
                              {isMe && (
                                <span className="mr-1 text-stone-400">
                                  Bạn:
                                </span>
                              )}
                              {previewText}
                            </>
                          )}
                        </p>

                        {/* Unread Badge / Context Menu */}
                        <div className="flex shrink-0 items-center gap-1">
                          {unread > 0 && (
                            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                              {unread > 99 ? "99+" : unread}
                            </span>
                          )}

                          {/* Menu 3 chấm ẩn hiện khi hover */}
                          <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="opacity-0 group-hover:opacity-100 transition-opacity flex h-7 w-7 items-center justify-center rounded-full hover:bg-stone-100"
                              >
                                <MoreHorizontal
                                  size={14}
                                  className="text-stone-400"
                                />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-48 bg-white z-50 shadow-xl border border-stone-100 rounded-xl p-1"
                            >
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(conversation._id);
                                }}
                                className="rounded-lg cursor-pointer"
                              >
                                <CheckCircle2 size={14} className="mr-2" /> Đánh
                                dấu đã đọc
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toast.success("Đã ghim");
                                }}
                                className="rounded-lg cursor-pointer"
                              >
                                <Pin size={14} className="mr-2" /> Ghim hội
                                thoại
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  muteConversation(conversation._id, true);
                                }}
                                className="rounded-lg cursor-pointer"
                              >
                                <BellOff size={14} className="mr-2" /> Tắt thông
                                báo
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="my-1 bg-stone-100" />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteId(conversation._id);
                                }}
                                className="text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg cursor-pointer"
                              >
                                <Trash2 size={14} className="mr-2" /> Xóa hội
                                thoại
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
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
        onConfirm={handleDelete}
        title="Xóa cuộc trò chuyện?"
        description="Lịch sử tin nhắn sẽ bị xóa vĩnh viễn và không thể khôi phục."
        confirmText="Xóa ngay"
        cancelText="Hủy"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
