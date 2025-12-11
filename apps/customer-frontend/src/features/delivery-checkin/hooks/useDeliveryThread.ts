// apps/customer-frontend/src/features/delivery-checkin/hooks/useDeliveryThread.ts
/**
 * Hook for managing delivery thread
 * Handles thread loading, message sending, and real-time updates
 */

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import {
  deliveryThreadService,
  type DeliveryThread,
  type CreateMessageData,
} from "../services/delivery-thread.service";
import { useThreadRealtime } from "./useThreadRealtime";

interface UseDeliveryThreadOptions {
  checkinId?: string;
  threadId?: string;
  autoFetch?: boolean;
}

interface UseDeliveryThreadReturn {
  // Data
  thread: DeliveryThread | null;

  // Loading states
  isLoading: boolean;
  isSending: boolean;

  // Error state
  error: string | null;

  // Actions
  fetchThread: () => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  updateMessage: (messageId: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  markAsRead: () => Promise<void>;
  refreshThread: () => Promise<void>;
}

export function useDeliveryThread(
  options: UseDeliveryThreadOptions = {}
): UseDeliveryThreadReturn {
  const { checkinId, threadId, autoFetch = true } = options;

  // State
  const [thread, setThread] = useState<DeliveryThread | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch thread by checkin ID or thread ID
   */
  const fetchThread = useCallback(async () => {
    if (!checkinId && !threadId) {
      setError("Cần checkinId hoặc threadId");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let data: DeliveryThread;
      if (checkinId) {
        data = await deliveryThreadService.getThreadByCheckin(checkinId);
      } else if (threadId) {
        data = await deliveryThreadService.getThread(threadId);
      } else {
        throw new Error("Invalid parameters");
      }

      setThread(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Không thể tải thread";
      setError(message);
      toast.error(message);
      console.error("Error fetching thread:", err);
    } finally {
      setIsLoading(false);
    }
  }, [checkinId, threadId]);

  /**
   * Send message to thread
   */
  const sendMessage = useCallback(
    async (content: string) => {
      if (!thread) {
        toast.error("Thread chưa được tải");
        return;
      }

      if (!content || content.trim().length === 0) {
        toast.error("Vui lòng nhập nội dung tin nhắn");
        return;
      }

      setIsSending(true);

      try {
        const messageData: CreateMessageData = {
          content: content.trim(),
          messageType: "text",
        };

        console.log(
          "[useDeliveryThread] Sending message:",
          content.substring(0, 50)
        );
        const updatedThread = await deliveryThreadService.addMessage(
          thread._id,
          messageData
        );
        console.log("[useDeliveryThread] Message sent, updating local state");
        setThread(updatedThread);
        toast.success("Đã gửi tin nhắn");
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Không thể gửi tin nhắn";
        toast.error(message);
        console.error("Error sending message:", err);
      } finally {
        setIsSending(false);
      }
    },
    [thread]
  );

  /**
   * Update message
   */
  const updateMessage = useCallback(
    async (messageId: string) => {
      // TODO: Implement update message
      console.log("Update message not implemented:", messageId);
      return;
    },
    [thread]
  );

  /**
   * Update message with content
   */
  const updateMessageWithContent = useCallback(
    async (messageId: string, content: string) => {
      if (!thread) {
        toast.error("Thread chưa được tải");
        return;
      }

      if (!content || content.trim().length === 0) {
        toast.error("Vui lòng nhập nội dung tin nhắn");
        return;
      }

      try {
        const updatedThread = await deliveryThreadService.updateMessage(
          thread._id,
          messageId,
          content.trim()
        );
        setThread(updatedThread);
        toast.success("Đã cập nhật tin nhắn");
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Không thể cập nhật tin nhắn";
        toast.error(message);
        console.error("Error updating message:", err);
      }
    },
    [thread]
  );

  /**
   * Delete message
   */
  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (!thread) {
        toast.error("Thread chưa được tải");
        return;
      }

      try {
        const updatedThread = await deliveryThreadService.deleteMessage(
          thread._id,
          messageId
        );
        setThread(updatedThread);
        toast.success("Đã xóa tin nhắn");
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Không thể xóa tin nhắn";
        toast.error(message);
        console.error("Error deleting message:", err);
      }
    },
    [thread]
  );

  /**
   * Mark thread as read
   */
  const markAsRead = useCallback(async () => {
    if (!thread) return;

    try {
      const updatedThread = await deliveryThreadService.markAsRead(thread._id);
      setThread(updatedThread);
    } catch (err: unknown) {
      console.error("Error marking thread as read:", err);
      // Don't show error toast for this action
    }
  }, [thread]);

  /**
   * Refresh thread (re-fetch)
   */
  const refreshThread = useCallback(async () => {
    await fetchThread();
  }, [fetchThread]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch && (checkinId || threadId)) {
      fetchThread();
    }
  }, [autoFetch, checkinId, threadId, fetchThread]);

  // Mark as read when thread is loaded
  useEffect(() => {
    if (thread && !isLoading) {
      markAsRead();
    }
  }, [thread?._id]); // Only run when thread ID changes

  // Real-time updates - use useCallback to prevent stale closure
  const handleMessageReceived = useCallback((newMessage: any) => {
    console.log("[useDeliveryThread] Real-time message received:", newMessage);
    if (newMessage) {
      setThread((prev) => {
        if (!prev) {
          console.log("[useDeliveryThread] No thread to update");
          return prev;
        }
        // Check if message already exists
        const exists = prev.messages.some((m) => m._id === newMessage._id);
        if (exists) {
          console.log("[useDeliveryThread] Message already exists, skipping");
          return prev;
        }

        console.log("[useDeliveryThread] Adding new message to thread");
        return {
          ...prev,
          messages: [...prev.messages, newMessage],
          messageCount: prev.messageCount + 1,
          lastMessageAt: newMessage.createdAt,
          lastMessagePreview: newMessage.content.substring(0, 100),
        };
      });
    }
  }, []);

  // Real-time updates
  useThreadRealtime({
    threadId: thread?._id || null,
    onMessageReceived: handleMessageReceived,
    enabled: !!thread?._id,
  });

  return {
    thread,
    isLoading,
    isSending,
    error,
    fetchThread,
    sendMessage,
    updateMessage,
    deleteMessage,
    markAsRead,
    refreshThread,
  };
}
