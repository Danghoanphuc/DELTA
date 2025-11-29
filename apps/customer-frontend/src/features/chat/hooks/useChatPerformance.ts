// apps/customer-frontend/src/features/chat/hooks/useChatPerformance.ts
import { useCallback, useEffect, useRef } from "react";
import { ChatMessage } from "@/types/chat";
import { useMessageState } from "./useMessageState";

interface UseChatPerformanceProps {
  messages: ChatMessage[];
  maxMessagesInMemory?: number;
  cleanupInterval?: number;
}

export function useChatPerformance(props: UseChatPerformanceProps) {
  const {
    messages,
    maxMessagesInMemory = 100,
    cleanupInterval = 30000,
  } = props;
  const { setMessages } = useMessageState(); // Lấy hàm setMessages từ store

  const cleanupRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastCleanupRef = useRef<number>(Date.now());

  // ✅ ACTION: Thực sự cắt bỏ tin nhắn cũ
  const cleanupOldMessages = useCallback(() => {
    const now = Date.now();
    const timeSinceLastCleanup = now - lastCleanupRef.current;

    // Không chạy nếu chưa đến interval hoặc số lượng tin chưa vượt ngưỡng
    if (
      timeSinceLastCleanup < cleanupInterval ||
      messages.length <= maxMessagesInMemory
    ) {
      return;
    }

    // Giữ lại (maxMessagesInMemory) tin nhắn cuối cùng
    // Lưu ý: Cần giữ lại WELCOME_MESSAGE nếu nó quan trọng,
    // nhưng ở đây ta ưu tiên hiệu năng là cắt thẳng từ trên xuống.
    console.warn(
      `[ChatPerformance] Pruning messages. Count: ${messages.length} -> ${maxMessagesInMemory}`
    );

    const startIndex = messages.length - maxMessagesInMemory;
    const keptMessages = messages.slice(startIndex);

    setMessages(keptMessages);
    lastCleanupRef.current = now;
  }, [messages, maxMessagesInMemory, cleanupInterval, setMessages]);

  useEffect(() => {
    // Dùng interval để check định kỳ thay vì check mỗi lần render
    // Giúp UI mượt hơn, tránh block main thread liên tục
    cleanupRef.current = setInterval(cleanupOldMessages, 5000);

    return () => {
      if (cleanupRef.current) {
        clearInterval(cleanupRef.current);
      }
    };
  }, [cleanupOldMessages]);

  // Monitoring memory in Dev mode
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      const interval = setInterval(() => {
        if ("memory" in performance) {
          const memInfo = (performance as any).memory;
          // Chỉ log nếu bộ nhớ dùng > 50MB để đỡ rác console
          if (memInfo.usedJSHeapSize > 50 * 1024 * 1024) {
            console.debug(
              `[Memory] Used: ${(memInfo.usedJSHeapSize / 1024 / 1024).toFixed(
                2
              )}MB`
            );
          }
        }
      }, 30000);
      return () => clearInterval(interval);
    }
  }, []);

  return {
    cleanupOldMessages,
  };
}
