// apps/customer-frontend/src/features/social/components/SocialChatWindow/hooks/useChatScroll.ts
// ✅ Custom hook để quản lý scroll behavior
// ✅ FIXED: Prevent scroll jump khi messages render

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSocialChatStore } from "@/features/social/hooks/useSocialChatStore";

export function useChatScroll(conversationId: string, messagesLength: number) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [isReadyState, setIsReadyState] = useState(false);
  const { scrollToMessageId, setScrollToMessageId, markAsRead } = useSocialChatStore();
  const lastConversationIdRef = useRef<string | null>(null);
  const lastMessagesLengthRef = useRef<number>(0);
  const isInitialLoadRef = useRef<boolean>(false);

  // ✅ FIXED: Set scroll position TRƯỚC KHI messages render (useLayoutEffect chạy trước paint)
  // Đây là cách các app chat phổ biến làm: scroll xuống dưới trước, rồi mới show messages
  useLayoutEffect(() => {
    const isConversationChanged = lastConversationIdRef.current !== conversationId;
    
    if (isConversationChanged) {
      lastConversationIdRef.current = conversationId;
      lastMessagesLengthRef.current = 0;
      isInitialLoadRef.current = true;
      setIsReadyState(false);
    }

    // ✅ CRITICAL: Set scroll position TRƯỚC KHI messages render
    if (isInitialLoadRef.current && messagesLength > 0 && containerRef.current) {
      // ✅ Step 1: Tắt scroll-smooth tạm thời để tránh animation
      const originalScrollBehavior = containerRef.current.style.scrollBehavior;
      containerRef.current.style.scrollBehavior = "auto";
      
      // ✅ Step 2: Tính toán và set scroll position NGAY LẬP TỨC
      // Ước tính mỗi message ~100px (bao gồm padding, spacing)
      const estimatedHeight = messagesLength * 100 + 200; // +200 cho padding top/bottom
      
      // ✅ Step 3: Set scroll position TRƯỚC KHI browser paint messages
      containerRef.current.scrollTop = estimatedHeight;
      
      // ✅ Step 4: Đợi messages render xong, rồi scroll đến đúng vị trí cuối cùng
      // Dùng nhiều RAF để đảm bảo DOM đã render hoàn toàn
      Promise.resolve().then(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // ✅ Show messages trước (isReady = true) để DOM có scrollHeight
            setIsReadyState(true);
            
            // ✅ Sau đó scroll xuống đáy
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                if (containerRef.current && scrollRef.current) {
                  // ✅ Scroll đến đúng vị trí cuối cùng (scrollHeight)
                  // Đảm bảo scroll xuống tận đáy
                  const scrollHeight = containerRef.current.scrollHeight;
                  const clientHeight = containerRef.current.clientHeight;
                  
                  // Scroll đến đúng đáy
                  containerRef.current.scrollTop = scrollHeight;
                  
                  // ✅ Double check: Đảm bảo đã scroll xuống đáy
                  requestAnimationFrame(() => {
                    if (containerRef.current) {
                      const finalScrollTop = containerRef.current.scrollTop;
                      const finalScrollHeight = containerRef.current.scrollHeight;
                      const finalClientHeight = containerRef.current.clientHeight;
                      
                      // Nếu chưa xuống đáy, scroll lại
                      const distanceFromBottom = finalScrollHeight - (finalScrollTop + finalClientHeight);
                      if (distanceFromBottom > 5) {
                        containerRef.current.scrollTop = finalScrollHeight - finalClientHeight;
                      }
                      
                      // ✅ Restore scroll behavior
                      containerRef.current.style.scrollBehavior = originalScrollBehavior;
                      // ✅ Reset isInitialLoadRef sau khi đã scroll xong
                      isInitialLoadRef.current = false;
                    }
                  });
                }
              });
            });
          });
        });
      });
    } else if (!isInitialLoadRef.current && messagesLength > 0) {
      // Nếu không phải initial load, set ready ngay
      setIsReadyState(true);
    }
  }, [conversationId, messagesLength]);

  // ✅ CRITICAL: Luôn scroll xuống đáy khi có messages mới hoặc khi đã ready
  // Đảm bảo người dùng luôn thấy tin nhắn mới nhất (gần nhất)
  useEffect(() => {
    if (!isReadyState || messagesLength === 0 || !containerRef.current) {
      if (messagesLength > 0) {
        lastMessagesLengthRef.current = messagesLength;
      }
      return;
    }

    const isNewMessage = messagesLength > lastMessagesLengthRef.current;
    const shouldScroll = isNewMessage || isInitialLoadRef.current;
    
    if (shouldScroll) {
      lastMessagesLengthRef.current = messagesLength;
      
      // ✅ Function để scroll xuống đáy - đảm bảo luôn thấy tin nhắn mới nhất
      const scrollToBottom = () => {
        if (!containerRef.current) return;
        
        const scrollHeight = containerRef.current.scrollHeight;
        const clientHeight = containerRef.current.clientHeight;
        const maxScrollTop = Math.max(0, scrollHeight - clientHeight);
        
        // ✅ Scroll xuống đáy (không smooth cho initial load để nhanh hơn)
        containerRef.current.scrollTop = maxScrollTop;
        
        // ✅ Triple check để đảm bảo đã scroll xuống đáy
        // Check 1: Ngay lập tức
        requestAnimationFrame(() => {
          if (!containerRef.current) return;
          
          const currentScrollTop = containerRef.current.scrollTop;
          const currentScrollHeight = containerRef.current.scrollHeight;
          const currentClientHeight = containerRef.current.clientHeight;
          const distanceFromBottom = currentScrollHeight - (currentScrollTop + currentClientHeight);
          
          // Nếu chưa xuống đáy, scroll lại
          if (distanceFromBottom > 5) {
            containerRef.current.scrollTop = currentScrollHeight - currentClientHeight;
          }
          
          // Check 2: Sau 50ms
          setTimeout(() => {
            if (!containerRef.current) return;
            
            const finalScrollTop = containerRef.current.scrollTop;
            const finalScrollHeight = containerRef.current.scrollHeight;
            const finalClientHeight = containerRef.current.clientHeight;
            const finalDistanceFromBottom = finalScrollHeight - (finalScrollTop + finalClientHeight);
            
            // Nếu vẫn chưa xuống đáy, scroll lại lần cuối
            if (finalDistanceFromBottom > 5) {
              containerRef.current.scrollTop = finalScrollHeight - finalClientHeight;
            }
          }, 50);
        });
      };
      
      // ✅ Đợi DOM update xong rồi scroll
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollToBottom();
        });
      });
      
      // ✅ Reset isInitialLoadRef sau khi đã xử lý
      if (isInitialLoadRef.current) {
        setTimeout(() => {
          isInitialLoadRef.current = false;
        }, 200);
      }
    } else if (messagesLength > 0) {
      lastMessagesLengthRef.current = messagesLength;
    }
    
    markAsRead(conversationId);
  }, [messagesLength, conversationId, markAsRead, isReadyState, containerRef]);

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

