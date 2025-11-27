// src/features/chat/components/ChatMessages.tsx

import { useRef, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChatMessage } from "@/types/chat";
import { cn } from "@/shared/lib/utils";
import { useChatContext } from "../context/ChatProvider";

// Components
import { MessageBubble } from "./MessageBubble";
import { ThinkingBubble } from "./ThinkingBubble";

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoadingAI: boolean; 
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}

export function ChatMessages({ 
  messages, 
  isLoadingAI,
  scrollContainerRef 
}: ChatMessagesProps) {
  const chatContext = useChatContext();
  // ✅ Type-safe access: currentThought có thể không có trong tất cả các hook
  const currentThought = (chatContext as any)?.currentThought;
  const isContextLoading = chatContext?.isLoadingAI;

  // Trạng thái loading tổng hợp
  const isThinking = !!currentThought || isContextLoading || isLoadingAI;

  const fallbackRef = useRef<HTMLDivElement>(null);
  const parentRef = scrollContainerRef || fallbackRef;

  // Virtualizer setup
  const virtualizer = useVirtualizer({
    count: messages.length, 
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5,
  });

  // ✅ LOGIC CHẶT CHẼ HƠN: Fix Double Bubble
  // 1. Kiểm tra tin nhắn cuối cùng có phải là AI đang trả lời không?
  const lastMessage = messages[messages.length - 1];
  const isAiResponding = lastMessage?.senderType === 'AI';
  
  // 2. Chỉ hiện Sticky Bubble khi:
  // - Đang có tín hiệu loading/thinking từ context
  // - VÀ AI CHƯA xuất hiện trong danh sách tin nhắn (nghĩa là đang chờ packet đầu tiên)
  const showStickyBubble = (!!currentThought || isLoadingAI || isContextLoading) && !isAiResponding;

  // Auto-scroll logic
  useEffect(() => {
    const scrollElement = parentRef.current;
    if (!scrollElement) return;

    const checkNearBottom = () => {
      const { scrollHeight, scrollTop, clientHeight } = scrollElement;
      return scrollHeight - scrollTop - clientHeight < 300;
    };

    if (checkNearBottom() || isThinking) {
      setTimeout(() => {
        scrollElement.scrollTo({ top: scrollElement.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
  }, [messages.length, isThinking, currentThought]); 

  return (
    <div 
      ref={!scrollContainerRef ? fallbackRef : undefined}
      className={cn(
        "relative w-full",
        !scrollContainerRef && "h-full overflow-y-auto custom-scrollbar"
      )}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const message = messages[virtualItem.index];
          return (
            <div
              key={message._id}
              ref={virtualizer.measureElement}
              data-index={virtualItem.index}
              className="absolute top-0 left-0 w-full px-4"
              style={{ transform: `translateY(${virtualItem.start}px)` }}
            >
               <div className="py-3">
                  <MessageBubble message={message} />
               </div>
            </div>
          );
        })}
      </div>

      {/* ✅ STICKY BUBBLE: Chỉ hiện khi AI chưa kịp đẩy tin nhắn nào vào list */}
      {showStickyBubble && (
         <div className="px-4 py-2 animate-in fade-in slide-in-from-bottom-2 duration-300 mt-2">
             <ThinkingBubble 
                icon={currentThought?.icon || "⚡"} 
                text={currentThought?.text || "Zin đang kết nối..."} 
             />
         </div>
      )}
      
      {/* Spacer chỉ hiện khi Bubble hiện */}
      {showStickyBubble && <div className="h-16" />}
    </div>
  );
}