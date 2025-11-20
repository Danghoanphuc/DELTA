// src/features/chat/components/ChatMessages.tsx (CẬP NHẬT)
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChatMessage } from "@/types/chat";
import { cn } from "@/shared/lib/utils";
// ❌ GỠ BỎ: UserAvatarFallback
import { UserAvatar } from "@/components/UserAvatar"; // ✅ THAY THẾ
import { useAuthStore } from "@/stores/useAuthStore";
import zinAvatar from "@/assets/img/zin-avatar.svg";
import { ChatProductCarousel } from "@/features/chat/components/ChatProductCarousel";
import { ChatOrderCarousel } from "@/features/chat/components/ChatOrderCarousel";

// Bot Avatar - Clean like Grok
const BotAvatar = () => {
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
      <img
        src={zinAvatar}
        alt="Zin AI Avatar"
        className="w-full h-full object-cover"
      />
    </div>
  );
};

// User Avatar - Clean like Grok
const UserAvatarComponent = () => {
  const user = useAuthStore((s) => s.user);
  return (
    <UserAvatar
      name={user?.displayName || user?.username || "U"}
      src={user?.avatarUrl}
      size={32}
      fallbackClassName="bg-gray-400 text-white"
    />
  );
};

// Message Content - Clean like Grok
const MessageContent = ({ msg }: { msg: ChatMessage }) => {
  switch (msg.type) {
    case "ai_response":
    case "text":
      return (
        <div className="max-w-2xl">
          <p className="text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
            {msg.content.text}
          </p>
        </div>
      );
    case "product_selection":
      return (
        <div className="max-w-2xl">
          <p className="text-gray-900 dark:text-gray-100 mb-4 leading-relaxed">{msg.content.text}</p>
          <ChatProductCarousel products={msg.content.products} />
        </div>
      );
    case "order_selection":
      return (
        <div className="max-w-2xl">
          <p className="text-gray-900 dark:text-gray-100 mb-4 leading-relaxed">{msg.content.text}</p>
          <ChatOrderCarousel orders={msg.content.orders} />
        </div>
      );
    default:
      return null;
  }
};

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoadingAI: boolean;
  scrollContainerRef?: RefObject<HTMLDivElement | null>;
}

const VERTICAL_PADDING = 24;
const AUTO_SCROLL_THRESHOLD_PX = 200;

export function ChatMessages({
  messages,
  isLoadingAI,
  scrollContainerRef,
}: ChatMessagesProps) {
  const fallbackScrollRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const totalItems = messages.length + (isLoadingAI ? 1 : 0);
  const lastMessage = messages[messages.length - 1];

  const getScrollElement = useCallback(() => {
    return scrollContainerRef?.current ?? fallbackScrollRef.current;
  }, [scrollContainerRef]);

  const estimateRowHeight = useCallback(() => 200, []);

  const virtualizer = useVirtualizer({
    count: totalItems,
    getScrollElement,
    estimateSize: estimateRowHeight,
    overscan: 8,
    getItemKey: (index) =>
      index < messages.length ? messages[index]._id : "ai-typing",
  });

  useEffect(() => {
    const scrollEl = getScrollElement();
    if (!scrollEl) return;

    const handleScroll = () => {
      const distanceFromBottom =
        scrollEl.scrollHeight - (scrollEl.scrollTop + scrollEl.clientHeight);
      setIsNearBottom(distanceFromBottom < AUTO_SCROLL_THRESHOLD_PX);
    };

    handleScroll();
    scrollEl.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      scrollEl.removeEventListener("scroll", handleScroll);
    };
  }, [getScrollElement]);

  // ✅ FIX: Use "auto" instead of "smooth" to avoid warning with dynamic virtualizer
  const scrollToBottom = useCallback(
    (behavior: "auto" | "smooth" = "auto") => {
      if (!getScrollElement()) return;
      const lastIndex = totalItems - 1;
      if (lastIndex < 0) return;
      virtualizer.scrollToIndex(lastIndex, { align: "end", behavior: "auto" });
    },
    [getScrollElement, totalItems, virtualizer]
  );

  useEffect(() => {
    if (messages.length === 0 && isLoadingAI) {
      scrollToBottom();
      return;
    }

    if (messages.length === 0) return;

    const shouldForceScroll = lastMessage?.senderType === "User";

    if (shouldForceScroll || isNearBottom) {
      scrollToBottom();
    }
  }, [
    isLoadingAI,
    isNearBottom,
    lastMessage?._id,
    lastMessage?.senderType,
    messages.length,
    scrollToBottom,
  ]);

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div
      ref={!scrollContainerRef ? fallbackScrollRef : undefined}
      className={cn(
        "relative w-full",
        !scrollContainerRef && "h-full overflow-y-auto"
      )}
    >
      <div
        className="relative w-full"
        style={{
          height: virtualizer.getTotalSize() + VERTICAL_PADDING * 2,
        }}
      >
        {virtualItems.map((virtualItem) => {
          const isMessageRow = virtualItem.index < messages.length;
          const message = messages[virtualItem.index];

          return (
            <div
              key={virtualItem.key}
              ref={virtualizer.measureElement}
              data-index={virtualItem.index}
              className="absolute left-0 right-0 will-change-transform"
              style={{
                transform: `translateY(${
                  virtualItem.start + VERTICAL_PADDING
                }px)`,
              }}
            >
              <div className="py-3">
                {isMessageRow && message ? (
                  <div
                    className={cn(
                      "flex gap-4",
                      message.senderType === "User" && "flex-row-reverse"
                    )}
                  >
                    <div className="flex-shrink-0">
                      {message.senderType === "AI" && <BotAvatar />}
                      {message.senderType === "User" && <UserAvatarComponent />}
                    </div>
                    <MessageContent msg={message} />
                  </div>
                ) : (
                  <TypingIndicator />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const TypingIndicator = () => (
  <div className="flex gap-4">
    <div className="flex-shrink-0">
      <BotAvatar />
    </div>
    <div className="max-w-2xl">
      <div className="flex items-center gap-2">
        <span className="text-gray-500 dark:text-gray-400 text-sm italic">
          Zin đang suy nghĩ
        </span>
        <div className="flex gap-1">
          <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
          <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
          <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
        </div>
      </div>
    </div>
  </div>
);
