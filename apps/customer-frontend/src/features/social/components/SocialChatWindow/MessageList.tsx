// apps/customer-frontend/src/features/social/components/SocialChatWindow/MessageList.tsx
// ✅ FIXED: Giảm chiều cao Spacer xuống 1 nửa (h-20) cho vừa vặn

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
  unreadCount
}: MessageListProps) {
  return (
    <div className="flex-1 relative overflow-hidden"> 
      {/* Container chính */}
      <div
        ref={containerRef}
        onScroll={onScroll}
        className={cn(
          "h-full overflow-y-auto p-2 md:p-4 custom-scrollbar",
          "pb-4" // Padding bình thường
        )}
        style={{ scrollBehavior: isReady ? "smooth" : "auto" }}
      >
        {isReady ? (
          <>
            {messages.map((msg, index) => {
              const previousMessage = index > 0 ? messages[index - 1] : null;
              const nextMessage = index < messages.length - 1 ? messages[index + 1] : null; 
              
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
                />
              );
            })}
            
            {/* ✅ SPACER DIV: Giảm xuống h-20 (80px) - Vừa đủ thoát khỏi thanh Input */}
            <div className="h-20 w-full shrink-0" />

            {/* Anchor để scroll xuống đáy */}
            <div ref={scrollRef} className="h-px w-full" />
          </>
        ) : (
           <div style={{ height: `${Math.max(messages.length * 150, 600)}px` }} />
        )}
      </div>

      {/* Nút Scroll To Bottom - Hạ thấp xuống bottom-28 cho cân đối */}
      <AnimatePresence>
        {showScrollButton && (
            <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onClick={onScrollToBottom}
                className="absolute bottom-28 right-4 z-20 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors group"
            >
                <ChevronDown size={20} className="group-hover:translate-y-0.5 transition-transform" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -left-1 bg-red-500 text-white text-[10px] font-bold h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full shadow-sm ring-2 ring-white animate-in zoom-in">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}