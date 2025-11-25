// src/features/chat/components/ChatMessages.tsx
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChatMessage } from "@/types/chat";
import { cn } from "@/shared/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { UserAvatar } from "@/components/UserAvatar";

// ✅ IMPORT CHUẨN: Dùng ZinNotionAvatar
import { ZinNotionAvatar } from "@/features/zin-bot/ZinNotionAvatar";
import { ZinEmotion } from "@/features/zin-bot/types";
import { analyzeSentiment } from "../utils/sentiment";
import { MessageContent } from "./MessageContent";

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
  const [isReady, setIsReady] = useState(false); // ✅ NEW: Track when ready to render
  const isInitialLoadRef = useRef(true);
  const lastMessagesLengthRef = useRef(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrolledMessageIdRef = useRef<string | null>(null);
  const previousMessagesRef = useRef<ChatMessage[]>([]);
  const newMessageIdsRef = useRef<Set<string>>(new Set());
  
  const totalItems = messages.length + (isLoadingAI ? 1 : 0);
  const lastMessage = messages[messages.length - 1];

  const getScrollElement = useCallback(() => {
    return scrollContainerRef?.current ?? fallbackScrollRef.current;
  }, [scrollContainerRef]);

  const estimateRowHeight = useCallback(() => 100, []);

  const virtualizer = useVirtualizer({
    count: totalItems,
    getScrollElement,
    estimateSize: estimateRowHeight,
    overscan: 5,
    getItemKey: (index) =>
      index < messages.length ? messages[index]._id : "ai-typing",
  });

  useEffect(() => {
    const scrollEl = getScrollElement();
    if (!scrollEl) return;
    
    const distanceFromBottom =
      scrollEl.scrollHeight - (scrollEl.scrollTop + scrollEl.clientHeight);
    setIsNearBottom(distanceFromBottom < AUTO_SCROLL_THRESHOLD_PX);
    
    const handleScroll = () => {
      const distanceFromBottom =
        scrollEl.scrollHeight - (scrollEl.scrollTop + scrollEl.clientHeight);
      setIsNearBottom(distanceFromBottom < AUTO_SCROLL_THRESHOLD_PX);
    };
    scrollEl.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollEl.removeEventListener("scroll", handleScroll);
  }, [getScrollElement]);

  const scrollToBottom = useCallback(
    (behavior: "auto" | "smooth" = "smooth") => {
      if (!getScrollElement()) return;
      const lastIndex = totalItems - 1;
      if (lastIndex >= 0) {
        virtualizer.scrollToIndex(lastIndex, { align: "end", behavior });
      }
    },
    [getScrollElement, totalItems, virtualizer]
  );

  // ✅ CRITICAL: Use virtualizer to scroll to bottom IMMEDIATELY before render
  useLayoutEffect(() => {
    if (messages.length === 0) {
      setIsReady(false);
      lastMessagesLengthRef.current = 0;
      previousMessagesRef.current = [];
      return;
    }

    // Detect initial load (messages jumping from 0 to many)
    const wasEmpty = lastMessagesLengthRef.current === 0;
    const isInitialLoad = wasEmpty && messages.length > 0;
    
    if (isInitialLoad) {
      setIsReady(false); // ✅ Don't render yet
      
      const scrollEl = getScrollElement();
      if (scrollEl) {
        // ✅ Step 1: Calculate and set estimated scroll position FIRST
        const estimatedHeight = messages.length * estimateRowHeight() + VERTICAL_PADDING * 2;
        scrollEl.scrollTop = estimatedHeight; // Set immediately
        
        // ✅ Step 2: Wait for browser to process, then use virtualizer
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // Step 3: Use virtualizer to scroll to exact bottom
            const lastIndex = totalItems - 1;
            if (lastIndex >= 0 && scrollEl) {
              virtualizer.scrollToIndex(lastIndex, { 
                align: "end", 
                behavior: "auto"
              });
              
              // ✅ Step 4: Verify scroll is at bottom before showing messages
              setTimeout(() => {
                if (scrollEl) {
                  // Final check: ensure scroll is at bottom
                  const maxScroll = scrollEl.scrollHeight - scrollEl.clientHeight;
                  scrollEl.scrollTop = maxScroll;
                  
                  // ✅ NOW safe to render - scroll is definitely at bottom
                  setIsReady(true);
                  lastMessagesLengthRef.current = messages.length;
                  previousMessagesRef.current = messages;
                }
              }, 50); // Small delay to ensure scroll is processed
            }
          });
        });
      } else {
        // No scroll element, render anyway
        setIsReady(true);
        lastMessagesLengthRef.current = messages.length;
        previousMessagesRef.current = messages;
      }
      return;
    }

    // For subsequent updates (not initial load)
    setIsReady(true);
    lastMessagesLengthRef.current = messages.length;
  }, [messages.length, totalItems, virtualizer, getScrollElement, estimateRowHeight]);

  // ✅ Track newly added messages for animation
  useEffect(() => {
    if (!isReady) return;
    
    const previousIds = new Set(previousMessagesRef.current.map(m => m._id));
    const newMessages = messages.filter(m => !previousIds.has(m._id));
    
    if (newMessages.length > 0) {
      newMessages.forEach(m => newMessageIdsRef.current.add(m._id));
      setTimeout(() => {
        newMessages.forEach(m => newMessageIdsRef.current.delete(m._id));
      }, 500);
    }

    previousMessagesRef.current = messages;
  }, [messages, isReady]);

  // ✅ Handle scroll for new messages (only after initial load)
  useEffect(() => {
    if (!isReady) return;
    if (messages.length === 0) return;
    
    const isNewMessage = messages.length > lastMessagesLengthRef.current;
    const shouldForceScroll = lastMessage?.senderType === "User";
    
    if (isNewMessage && lastMessage && !isInitialLoadRef.current) {
      const shouldScroll = (shouldForceScroll || isNearBottom) && 
                           lastScrolledMessageIdRef.current !== lastMessage._id;
      
      if (shouldScroll) {
        lastScrolledMessageIdRef.current = lastMessage._id;
        
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            scrollTimeoutRef.current = setTimeout(() => {
              scrollToBottom("smooth");
            }, 250);
          });
        });
      }
    }
    
    isInitialLoadRef.current = false;
    
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [messages.length, lastMessage?._id, isLoadingAI, scrollToBottom, isNearBottom, isReady]);

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div
      ref={!scrollContainerRef ? fallbackScrollRef : undefined}
      className={cn(
        "relative w-full",
        !scrollContainerRef && "h-full overflow-y-auto"
      )}
    >
      {/* ✅ Render messages but use display:none until scroll is ready to prevent any rendering */}
      <div
        className="relative w-full"
        style={{ 
          height: isReady ? virtualizer.getTotalSize() + VERTICAL_PADDING * 2 : 0,
          display: isReady ? "block" : "none" // ✅ Completely prevent rendering until ready
        }}
      >
          {virtualItems.map((virtualItem) => {
            const isMessageRow = virtualItem.index < messages.length;
            const message = messages[virtualItem.index];

            // ✅ LOGIC TỰ ĐỘNG PHÂN TÍCH CẢM XÚC
            let emotion: ZinEmotion = "neutral";
            let isThinking = false;

            if (isMessageRow && message?.senderType === "AI") {
              const textContent = message.type === 'text' || message.type === 'ai_response' 
                ? (message.content as any).text 
                : "";
              
              const sentiment = analyzeSentiment(textContent);
              
              if (sentiment === "thinking") isThinking = true;
              else if (sentiment === "waiting") isThinking = true;
              else if (sentiment === "confused") emotion = "surprised";
              else emotion = sentiment as ZinEmotion;
            }

            // ✅ Check if this is a newly added message for animation
            const isNewMessage = message && newMessageIdsRef.current.has(message._id);
            
            return (
              <div
                key={virtualItem.key}
                ref={virtualizer.measureElement}
                data-index={virtualItem.index}
                className="absolute left-0 right-0"
                style={{
                  transform: `translateY(${virtualItem.start + VERTICAL_PADDING}px)`,
                }}
              >
                <div 
                  className={cn(
                    "py-2",
                    isNewMessage && "animate-in fade-in slide-in-from-bottom-3 duration-300 ease-out"
                  )}
                  style={{
                    animationFillMode: isNewMessage ? "backwards" : undefined,
                  }}
                >
                  {isMessageRow && message ? (
                    <div className={cn(
                        "flex gap-3",
                        message.senderType === "User" && "flex-row-reverse"
                      )}>
                      
                      {/* AVATAR ZIN (NOTION STYLE) */}
                      <div className="flex-shrink-0 mt-1">
                        {message.senderType === "AI" && (
                          <div className="w-8 h-8 md:w-9 md:h-9"> 
                            <ZinNotionAvatar 
                              emotion={emotion} 
                              isThinking={isThinking}
                              className="w-full h-full text-slate-800 dark:text-slate-200"
                            />
                          </div>
                        )}
                        {message.senderType === "User" && <UserAvatarComponent />}
                      </div>
                      
                      {/* CONTENT */}
                      <div className={cn(
                        "rounded-2xl px-4 py-2.5 max-w-[85%] md:max-w-[75%] shadow-sm text-[15px] leading-relaxed",
                        message.senderType === "User" 
                          ? "bg-blue-600 text-white rounded-br-sm" 
                          : "bg-white border border-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100 rounded-bl-sm"
                      )}>
                        <MessageContent message={message} />
                      </div>

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

// ✅ Typing Indicator dùng Avatar mới
const TypingIndicator = () => (
  <div className="flex gap-3 py-2">
    <div className="w-8 h-8 md:w-9 md:h-9 flex-shrink-0 mt-1">
      <ZinNotionAvatar 
        isThinking={true} 
        className="w-full h-full text-slate-800 dark:text-slate-200"
      />
    </div>
    <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-2">
      <div className="flex gap-1 h-2 items-center">
        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
      </div>
    </div>
  </div>
);
