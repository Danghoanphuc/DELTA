// apps/customer-frontend/src/features/chat/hooks/useChatSafety.ts
import { useState, useRef, useCallback, useEffect } from "react";
import { useMessageState } from "./useMessageState";

const SAFETY_TIMEOUT_MS = 60000;

export const useChatSafety = () => {
  const [status, setStatus] = useState<
    "idle" | "sending" | "thinking" | "streaming" | "error"
  >("idle");
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageState = useMessageState();

  const clearSafetyTimeout = useCallback(() => {
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }
  }, []);

  const handleTimeout = useCallback(() => {
    console.log("[ChatSafety] ⏰ Timeout triggered");
    setStatus("error");
    const currentMessages = messageState.messages;
    const updatedMessages = currentMessages.map((m: any) => {
      const meta = m.metadata as any;
      // ✅ TỐI GIẢN HÓA: Chỉ cần check 'streaming'
      if (meta?.status === "streaming") {
        return {
          ...m,
          content: {
            text: "⚠️ Hệ thống phản hồi quá lâu. Vui lòng kiểm tra lại kết nối.",
          },
          type: "text",
          metadata: { ...meta, status: "error" },
        };
      }
      return m;
    });
    messageState.setMessages(updatedMessages as any);
  }, [messageState]);

  const startSafetyTimer = useCallback(() => {
    clearSafetyTimeout();
    safetyTimeoutRef.current = setTimeout(handleTimeout, SAFETY_TIMEOUT_MS);
  }, [clearSafetyTimeout, handleTimeout]);

  const forceIdle = useCallback(() => {
    setStatus("idle");
    clearSafetyTimeout();
  }, [clearSafetyTimeout]);

  // ✅ FIX: CLEANUP KHI UNMOUNT
  useEffect(() => {
    return () => {
      clearSafetyTimeout();
    };
  }, [clearSafetyTimeout]);

  return { status, setStatus, startSafetyTimer, clearSafetyTimeout, forceIdle };
};
