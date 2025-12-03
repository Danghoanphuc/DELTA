// apps/customer-frontend/src/features/social/components/SocialChatWindow/MessageList.tsx

import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/shared/lib/utils";
import type { ChatMessage } from "@/types/chat";
import { MessageItem } from "./MessageItem";
import { ChevronDown } from "lucide-react";

interface MessageListProps {
  messages: ChatMessage[];
  conversation: any;
  currentUserId?: string;
  isReady: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  messageRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  onScroll: () => void;
  showScrollButton: boolean;
  onScrollToBottom: () => void;
  unreadCount: number;
  onReply?: (message: ChatMessage) => void;
}

export function MessageList({
  messages,
  conversation,
  currentUserId,
  isReady,
  containerRef,
  scrollRef,
  messageRefs,
  onScroll,
  showScrollButton,
  onScrollToBottom,
  unreadCount,
  onReply,
}: MessageListProps) {
  return (
    <div className="flex-1 relative overflow-hidden">
      <div
        ref={containerRef}
        onScroll={onScroll}
        className={cn(
          "h-full overflow-y-auto p-2 md:p-4 custom-scrollbar"
          // Bỏ pb ở đây, dùng Spacer bên dưới
        )}
        style={{ scrollBehavior: isReady ? "smooth" : "auto" }}
      >
        {isReady ? (
          <>
            {messages.map((msg, index) => {
              const previousMessage = index > 0 ? messages[index - 1] : null;
              const nextMessage =
                index < messages.length - 1 ? messages[index + 1] : null;

              return (
                <MessageItem
                  key={msg._id}
                  message={msg}
                  previousMessage={previousMessage}
                  nextMessage={nextMessage}
                  conversation={conversation}
                  currentUserId={currentUserId}
                  messageRef={(el) => {
                    if (msg._id) messageRefs.current[msg._id] = el;
                  }}
                  onReply={onReply}
                />
              );
            })}

            {/* ✅ SPACER VẬT LÝ: Đảm bảo gầm cao thoáng, không bị Input che */}
            {/* Dùng inline style để chắc chắn trình duyệt nhận 350px */}
            <div style={{ height: 150, width: "100%", flexShrink: 0 }} />

            {/* Anchor scroll nằm sau spacer -> Khi scroll bottom sẽ thấy spacer */}
            <div ref={scrollRef} className="h-px w-full" />
          </>
        ) : (
          <div
            style={{ height: `${Math.max(messages.length * 150, 600)}px` }}
          />
        )}
      </div>

      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={onScrollToBottom}
            // ✅ FIX: Neo nút scroll ở vị trí an toàn, trên Input
            className="absolute bottom-40 right-4 z-20 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors group"
          >
            <ChevronDown
              size={20}
              className="group-hover:translate-y-0.5 transition-transform"
            />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -left-1 bg-red-500 text-white text-[10px] font-bold h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full shadow-sm ring-2 ring-white animate-in zoom-in">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
