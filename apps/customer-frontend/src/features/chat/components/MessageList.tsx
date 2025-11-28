// apps/customer-frontend/src/features/chat/components/MessageList.tsx
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChatMessage, QuickReply } from "@/types/chat";
import { cn } from "@/shared/lib/utils";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore"; 

import { MessageBubble } from "./MessageBubble";
import { QuickReplyButtons } from "./QuickReplyButtons";

interface MessageListProps {
  messages: ChatMessage[];
  quickReplies: QuickReply[];
  isLoadingAI: boolean;
  onSendQuickReply: (text: string, payload: string) => void;
  hasMoreMessages?: boolean;
  onLoadMore?: () => void;
}

const LOAD_MORE_THRESHOLD = 100;

export const MessageList = forwardRef<HTMLDivElement, MessageListProps>(
  ({ messages, quickReplies, isLoadingAI, onSendQuickReply, hasMoreMessages = false, onLoadMore }, ref) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [previousScrollHeight, setPreviousScrollHeight] = useState(0);
    const lastMessageCountRef = useRef(messages.length);
    const { user } = useAuthStore(); 

    const virtualizer = useVirtualizer({
      count: messages.length,
      getScrollElement: () => scrollRef.current,
      estimateSize: () => 80,
      overscan: 5,
    });

    useEffect(() => {
        const scrollEl = scrollRef.current;
        if (!scrollEl || !hasMoreMessages || !onLoadMore) return;
        const handleScroll = () => {
            if (scrollEl.scrollTop < LOAD_MORE_THRESHOLD && !isLoadingMore) {
                setIsLoadingMore(true);
                setPreviousScrollHeight(scrollEl.scrollHeight);
                onLoadMore();
            }
        };
        scrollEl.addEventListener("scroll", handleScroll, { passive: true });
        return () => scrollEl.removeEventListener("scroll", handleScroll);
    }, [hasMoreMessages, onLoadMore, isLoadingMore]);

    useEffect(() => {
        const scrollEl = scrollRef.current;
        if (!scrollEl || !isLoadingMore) return;
        if (messages.length > lastMessageCountRef.current) {
            requestAnimationFrame(() => {
                if (!scrollEl) return;
                const newScrollHeight = scrollEl.scrollHeight;
                scrollEl.scrollTop = newScrollHeight - previousScrollHeight;
                setIsLoadingMore(false);
                lastMessageCountRef.current = messages.length;
            });
        }
    }, [messages.length, isLoadingMore, previousScrollHeight]);

    useEffect(() => {
        if (scrollRef.current && messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            const isNewMessage = messages.length > lastMessageCountRef.current;
            if (isNewMessage && !isLoadingMore) {
                const scrollEl = scrollRef.current;
                if (!scrollEl) return;
                const isNearBottom = scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight < 300;
                
                const senderType = lastMessage.senderType?.toLowerCase() || "";
                if (senderType === "user" || isNearBottom) {
                    requestAnimationFrame(() => { if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight; });
                }
                lastMessageCountRef.current = messages.length;
            }
        }
    }, [messages, isLoadingMore]);

    const handleQuickReplyClick = useCallback((text: string, payload: string) => {
      onSendQuickReply(text, payload);
    }, [onSendQuickReply]);

    return (
      <div
        ref={scrollRef}
        className={cn(
          "flex-1 overflow-y-auto p-4 space-y-4",
          "scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
        )}
      >
        {isLoadingMore && hasMoreMessages && (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
            <span className="text-sm text-gray-500 ml-2">Đang tải tin nhắn cũ...</span>
          </div>
        )}

        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const message = messages[virtualItem.index];
            
            // 🔥🔥🔥 FIX LOGIC NHẬN DIỆN USER (FINAL) 🔥🔥🔥
            
            // 1. Trích xuất Sender ID chính xác (xử lý cả String và Object)
            const msgSenderId = typeof message.sender === 'object' && message.sender !== null 
                ? message.sender._id 
                : message.sender;

            // 2. Chuẩn hóa senderType
            const typeLower = message.senderType?.toLowerCase() || "";
            
            // 3. Điều kiện User:
            // - Type là user
            // - Hoặc: ID người gửi trùng với User đang login
            // - Hoặc: Là tin nhắn ảo (Optimistic UI)
            // - Hoặc: Có role là user (fallback)
            const isUser = 
                typeLower === "user" || 
                (!!user?._id && msgSenderId === user._id) ||
                message._id.startsWith("temp_") ||
                !!message.clientSideId ||
                (message as any).role === "user";

            return (
              <div
                key={message._id}
                style={{
                  position: 'absolute',
                  top: 0, left: 0, width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <MessageBubble 
                    message={message} 
                    isUser={isUser}
                />
              </div>
            );
          })}
        </div>

        {quickReplies.length > 0 && !isLoadingAI && (
          <QuickReplyButtons
            quickReplies={quickReplies}
            onQuickReplyClick={handleQuickReplyClick}
          />
        )}

        {isLoadingAI && (
          <div className="flex items-center space-x-2 text-gray-500 pl-4">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600"></div>
            <span className="text-sm text-gray-500">AI đang suy nghĩ...</span>
          </div>
        )}
      </div>
    );
  }
);

MessageList.displayName = "MessageList";