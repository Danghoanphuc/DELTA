import { forwardRef, useEffect, useRef, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChatMessage, QuickReply } from "@/types/chat";
import { cn } from "@/shared/lib/utils";
import { Loader2 } from "lucide-react";

import { MessageBubble } from "./MessageBubble";
import { BotAvatar } from "./BotAvatar";
import { UserAvatarComponent } from "./UserAvatarComponent";
import { ThinkingBubble } from "./ThinkingBubble"; // Import ThinkingBubble
import { parseMessageDisplay } from "../utils/textParser";
import { WELCOME_ID } from "../hooks/useMessageState";

interface MessageListProps {
  messages: ChatMessage[];
  quickReplies: QuickReply[];
  isLoadingAI: boolean;
  onSendQuickReply: (text: string, payload: string) => void;
  hasMoreMessages?: boolean;
  onLoadMore?: () => void;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}

const LOAD_MORE_THRESHOLD = 50;

export const MessageList = forwardRef<HTMLDivElement, MessageListProps>(
  (
    { messages, hasMoreMessages = false, onLoadMore, scrollContainerRef },
    ref
  ) => {
    const fallbackScrollRef = useRef<HTMLDivElement>(null);
    const scrollRef = scrollContainerRef || fallbackScrollRef;

    // Lọc bỏ tin nhắn Welcome
    const displayMessages = useMemo(
      () => messages.filter((m) => m._id !== WELCOME_ID),
      [messages]
    );

    // ✅ TƯ DUY MỚI: Không cộng thêm item ảo. Danh sách là sự thật duy nhất.
    const itemCount = displayMessages.length;

    // Virtualizer
    const virtualizer = useVirtualizer({
      count: itemCount,
      getScrollElement: () => scrollRef.current,
      estimateSize: () => 100, // Ước lượng
      overscan: 5,
      getItemKey: (index) => displayMessages[index]?._id || index,
    });

    const lastMsgRef = useRef<ChatMessage | null>(null);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
      const scrollEl = scrollRef.current;
      if (!scrollEl || itemCount === 0) return;

      const lastMsg = displayMessages[itemCount - 1];
      const isNewMessage = lastMsg?._id !== lastMsgRef.current?._id;
      const isStreaming = (lastMsg?.metadata as any)?.status === "streaming";
      const isPending = (lastMsg?.metadata as any)?.status === "pending";

      if (isNewMessage || isStreaming || isPending) {
        const { scrollTop, scrollHeight, clientHeight } = scrollEl;
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

        if (isNewMessage || distanceFromBottom < 500) {
          if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
          }

          scrollTimeoutRef.current = setTimeout(
            () => {
              requestAnimationFrame(() => {
                virtualizer.scrollToIndex(itemCount - 1, {
                  align: "end",
                  behavior: "auto",
                });
              });
            },
            isStreaming ? 50 : 0
          );
        }
      }

      lastMsgRef.current = lastMsg;

      return () => {
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }, [itemCount, displayMessages, virtualizer]);

    // Load More Logic (Giữ nguyên)
    const handleScroll = () => {
      if (!scrollRef.current || !onLoadMore || !hasMoreMessages) return;
      if (scrollRef.current.scrollTop < LOAD_MORE_THRESHOLD) {
        onLoadMore();
      }
    };

    useEffect(() => {
      const el = scrollRef.current;
      if (el) el.addEventListener("scroll", handleScroll, { passive: true });
      return () => el?.removeEventListener("scroll", handleScroll);
    }, [hasMoreMessages, onLoadMore]);

    return (
      <div
        ref={scrollRef}
        className="relative w-full px-2 md:px-4 pb-4 h-full overflow-y-auto custom-scrollbar scroll-smooth will-change-scroll"
      >
        {/* Loading Indicator for History */}
        {hasMoreMessages && (
          <div className="absolute top-0 left-0 w-full flex justify-center py-2 z-10 pointer-events-none">
            {/* Chỉ hiện spinner nếu đang scroll sát đỉnh, xử lý ở UI cha hoặc thêm state local nếu cần thiết */}
          </div>
        )}

        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const message = displayMessages[virtualItem.index];
            if (!message) return null;

            // ✅ Check isThinking từ cả content VÀ metadata
            const isThinking =
              (message.content as any)?.isThinking === true ||
              (message.metadata as any)?.isThinking === true;

            const { hasVisibleContent } = parseMessageDisplay(message.content);
            const isRichContent = [
              "product",
              "order",
              "image",
              "file",
              "quote",
              "product_selection",
              "order_selection",
              "payment_request",
            ].includes(message.type);

            const isStreaming =
              (message.metadata as any)?.status === "streaming";
            const isPending = (message.metadata as any)?.status === "pending";

            if (
              !isThinking &&
              !hasVisibleContent &&
              !isRichContent &&
              !isStreaming &&
              !isPending
            ) {
              return null;
            }

            const isUser = message.senderType === "User";

            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                className="absolute top-0 left-0 w-full px-1 pt-4"
                style={{ transform: `translateY(${virtualItem.start}px)` }}
              >
                {isThinking ? (
                  // --- CASE: THINKING BUBBLE (Render trực tiếp như 1 message) ---
                  <div className="flex gap-3 max-w-3xl mx-auto items-end flex-row animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex-shrink-0 w-8 md:w-10 flex flex-col justify-end min-h-[40px]">
                      <BotAvatar expression="thinking" />
                    </div>
                    <ThinkingBubble />
                  </div>
                ) : (
                  <div
                    className={cn(
                      "flex gap-3 max-w-3xl mx-auto items-end",
                      isUser ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <div className="flex-shrink-0 w-8 md:w-10 flex flex-col justify-end min-h-[40px]">
                      {!isUser && (
                        <BotAvatar
                          expression={
                            isStreaming || isPending ? "thinking" : "neutral"
                          }
                        />
                      )}
                      {isUser && (
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden shadow-sm ring-1 ring-gray-100">
                          <UserAvatarComponent />
                        </div>
                      )}
                    </div>

                    <div
                      className={cn(
                        "flex flex-col min-w-0 max-w-[85%] md:max-w-[80%]",
                        isUser ? "items-end" : "items-start"
                      )}
                    >
                      {isPending && !isUser ? (
                        <ThinkingBubble />
                      ) : (
                        <MessageBubble message={message} isUser={isUser} />
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="h-4 w-full"></div>
      </div>
    );
  }
);

MessageList.displayName = "MessageList";
