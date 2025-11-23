// apps/customer-frontend/src/features/social/components/SocialChatWindow/hooks/useChatScroll.ts
// ✅ Custom hook để quản lý scroll behavior

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSocialChatStore } from "@/features/social/hooks/useSocialChatStore";

export function useChatScroll(conversationId: string, messagesLength: number) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [isReadyState, setIsReadyState] = useState(false);
  const { scrollToMessageId, setScrollToMessageId, markAsRead } = useSocialChatStore();

  // Reset scroll khi conversation thay đổi
  useLayoutEffect(() => {
    setIsReadyState(false);
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "auto" });
    }
    const timer = setTimeout(() => setIsReadyState(true), 50);
    return () => clearTimeout(timer);
  }, [conversationId]);

  // Auto scroll khi có messages mới
  useEffect(() => {
    if (isReadyState && messagesLength > 0) {
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
    markAsRead(conversationId);
  }, [messagesLength, conversationId, markAsRead, isReadyState]);

  // Scroll to specific message (từ search hoặc mention)
  useEffect(() => {
    if (scrollToMessageId && messageRefs.current[scrollToMessageId]) {
      const messageElement = messageRefs.current[scrollToMessageId];
      if (messageElement) {
        setTimeout(() => {
          messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
          messageElement.classList.add("ring-2", "ring-blue-500", "ring-offset-2");
          setTimeout(
            () => messageElement.classList.remove("ring-2", "ring-blue-500", "ring-offset-2"),
            2000
          );
        }, 100);
        setScrollToMessageId(null);
      }
    }
  }, [scrollToMessageId, setScrollToMessageId]);

  return {
    scrollRef,
    containerRef,
    messageRefs,
    isReady: isReadyState,
  };
}

