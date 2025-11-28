// src/features/chat/components/ChatMessages.tsx

import { useRef, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChatMessage } from "@/types/chat";
import { cn } from "@/shared/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { BotAvatar } from "./BotAvatar"; 
import { UserAvatarComponent } from "./UserAvatarComponent"; 
import { MessageBubble } from "./MessageBubble";

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
  const { user } = useAuthStore();
  
  const fallbackRef = useRef<HTMLDivElement>(null);
  const parentRef = scrollContainerRef || fallbackRef;

  const virtualizer = useVirtualizer({
    count: messages.length, 
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, 
    overscan: 5,
  });

  // Auto Scroll Logic
  useEffect(() => {
    const scrollElement = parentRef.current;
    if (!scrollElement) return;
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return;

    const isUser = lastMessage.senderType === 'User';
    const meta = lastMessage.metadata as any;
    const isAiActive = lastMessage.senderType === 'AI' && 
        (meta?.status === 'thinking' || meta?.status === 'streaming' || meta?.status === 'pending');

    if (isUser || isAiActive) {
         requestAnimationFrame(() => {
             const { scrollHeight, scrollTop, clientHeight } = scrollElement;
             const isNearBottom = scrollHeight - scrollTop - clientHeight < 300;
             if (isNearBottom || isUser) {
                scrollElement.scrollTo({ top: scrollElement.scrollHeight, behavior: 'smooth' });
             }
         });
    }
  }, [messages, parentRef]);

  return (
    <div 
      ref={!scrollContainerRef ? fallbackRef : undefined}
      className={cn(
        "relative w-full px-2", 
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
          const nextMessage = messages[virtualItem.index + 1]; 
          const prevMessage = messages[virtualItem.index - 1]; 

          const msgSenderId = typeof message.sender === 'object' && message.sender !== null 
              ? message.sender._id 
              : message.sender;
          
          const isUser = 
              (message.senderType?.toLowerCase() === "user") || 
              (!!user?._id && msgSenderId === user._id) || 
              message._id.startsWith("temp_");

          const isSameSenderAsPrev = prevMessage?.senderType === message.senderType;
          const isSameSenderAsNext = nextMessage?.senderType === message.senderType;

          // 🔥 FIX 2: Logic Avatar hiển thị
          const isLastMessage = virtualItem.index === messages.length - 1;
          // Hiện avatar nếu: Tin tiếp theo khác người gửi HOẶC đây là tin cuối cùng của list
          const showAvatar = !isSameSenderAsNext || isLastMessage;

          return (
            <div
              key={message._id}
              ref={virtualizer.measureElement}
              data-index={virtualItem.index}
              className={cn(
                "absolute top-0 left-0 w-full px-2 md:px-4",
                isSameSenderAsPrev ? "pt-1" : "pt-4"
              )}
              style={{ transform: `translateY(${virtualItem.start}px)` }}
            >
               <div className={cn(
                   "flex gap-3 max-w-3xl mx-auto items-end",
                   isUser ? "flex-row-reverse" : "flex-row"
               )}>
                  
                  {/* CỘT AVATAR */}
                  <div className="flex-shrink-0 w-10 min-w-[40px] flex flex-col justify-end"> 
                      {showAvatar ? (
                          isUser ? (
                              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden shadow-sm ring-1 ring-gray-100">
                                  <UserAvatarComponent />
                              </div>
                          ) : (
                              <BotAvatar 
                                 isThinking={(message.metadata as any)?.status === 'thinking'}
                                 className="w-8 h-8 md:w-10 md:h-10" 
                              />
                          )
                      ) : (
                          <div className="w-8 md:w-10 min-w-[32px]" /> 
                      )}
                  </div>

                  {/* CỘT NỘI DUNG */}
                  <div className={cn(
                      "flex flex-col min-w-0 max-w-[85%] md:max-w-[80%]", 
                      isUser ? "items-end" : "items-start"
                  )}> 
                      <MessageBubble 
                          message={message} 
                          isUser={isUser}
                          isFirst={!isSameSenderAsPrev}
                          isLast={!isSameSenderAsNext}
                      />
                  </div>
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}