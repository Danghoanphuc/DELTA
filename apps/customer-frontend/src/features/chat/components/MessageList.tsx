// src/features/chat/components/MessageList.tsx
// Dumb component - chỉ render messages, không chứa logic
// ✅ INFINITE SCROLL: Added infinite scroll with scroll preservation

import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChatMessage, QuickReply } from "@/types/chat";
import { cn } from "@/shared/lib/utils";
import { Loader2 } from "lucide-react";

// Import dumb components
import { MessageBubble } from "./MessageBubble";
import { QuickReplyButtons } from "./QuickReplyButtons";

interface MessageListProps {
  messages: ChatMessage[];
  quickReplies: QuickReply[];
  isLoadingAI: boolean;
  onSendQuickReply: (text: string, payload: string) => void;
  // ✅ INFINITE SCROLL: New props
  hasMoreMessages?: boolean;
  onLoadMore?: () => void;
}

const LOAD_MORE_THRESHOLD = 100; // px from top to trigger load more

export const MessageList = forwardRef<HTMLDivElement, MessageListProps>(
  ({ messages, quickReplies, isLoadingAI, onSendQuickReply, hasMoreMessages = false, onLoadMore }, ref) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [previousScrollHeight, setPreviousScrollHeight] = useState(0);
    const lastMessageCountRef = useRef(messages.length);

    // Virtual scrolling for performance
    const virtualizer = useVirtualizer({
      count: messages.length,
      getScrollElement: () => scrollRef.current,
      estimateSize: () => 80,
      overscan: 5,
    });

    // ✅ INFINITE SCROLL: Handle scroll to top (load more messages)
    useEffect(() => {
      const scrollEl = scrollRef.current;
      if (!scrollEl || !hasMoreMessages || !onLoadMore) return;

      const handleScroll = () => {
        const { scrollTop } = scrollEl;
        
        // Trigger load more when scrolled near top
        if (scrollTop < LOAD_MORE_THRESHOLD && !isLoadingMore) {
          setIsLoadingMore(true);
          setPreviousScrollHeight(scrollEl.scrollHeight);
          onLoadMore();
        }
      };

      scrollEl.addEventListener("scroll", handleScroll, { passive: true });
      return () => scrollEl.removeEventListener("scroll", handleScroll);
    }, [hasMoreMessages, onLoadMore, isLoadingMore]);

    // ✅ SCROLL PRESERVATION: Restore scroll position after loading more messages
    useEffect(() => {
      const scrollEl = scrollRef.current;
      if (!scrollEl || !isLoadingMore) return;

      // Check if new messages were added at the beginning
      const messageCountIncreased = messages.length > lastMessageCountRef.current;
      
      if (messageCountIncreased) {
        // ✅ FIX: Use requestAnimationFrame to ensure DOM is updated before scrolling
        requestAnimationFrame(() => {
          if (!scrollEl) return;
          
          // Calculate new scroll position to maintain visual position
          const newScrollHeight = scrollEl.scrollHeight;
          const scrollHeightDiff = newScrollHeight - previousScrollHeight;
          
          // Restore scroll position
          scrollEl.scrollTop = scrollHeightDiff;
          
          // Reset loading state
          setIsLoadingMore(false);
          lastMessageCountRef.current = messages.length;
        });
      }
    }, [messages.length, isLoadingMore, previousScrollHeight]);

    // Auto scroll to bottom when new messages arrive (only if user sent message)
    useEffect(() => {
      if (scrollRef.current && messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        const isNewMessage = messages.length > lastMessageCountRef.current;
        
        // Only auto-scroll if:
        // 1. It's a new message (not from load more)
        // 2. User sent the message OR user is near bottom
        if (isNewMessage && !isLoadingMore) {
          const scrollEl = scrollRef.current;
          if (!scrollEl) return;
          
          const isNearBottom = 
            scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight < 200;
          
          if (lastMessage.senderType === "User" || isNearBottom) {
            // ✅ FIX: Use requestAnimationFrame for smooth scrolling
            requestAnimationFrame(() => {
              if (scrollEl) {
                scrollEl.scrollTop = scrollEl.scrollHeight;
              }
            });
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
        {/* ✅ INFINITE SCROLL: Loading more indicator at top */}
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
            return (
              <div
                key={message._id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <MessageBubble message={message} />
              </div>
            );
          })}
        </div>

        {/* Quick Replies */}
        {quickReplies.length > 0 && !isLoadingAI && (
          <QuickReplyButtons
            quickReplies={quickReplies}
            onQuickReplyClick={handleQuickReplyClick}
          />
        )}

        {/* Loading indicator */}
        {isLoadingAI && (
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600"></div>
            <span className="text-sm">AI đang trả lời...</span>
          </div>
        )}
      </div>
    );
  }
);

MessageList.displayName = "MessageList";
