// apps/admin-frontend/src/hooks/useAdminDeliveryThread.ts
/**
 * Admin hook for delivery thread management
 */

import { useState, useEffect, useCallback } from "react";
import { useToast } from "./use-toast";
import {
  adminDeliveryThreadService,
  type DeliveryThread,
  type ThreadMessage,
} from "@/services/admin.delivery-thread.service";
import { useAdminThreadRealtime } from "./useAdminThreadRealtime";

export function useAdminDeliveryThread(checkinId: string | null) {
  const [thread, setThread] = useState<DeliveryThread | null>(null);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  // Fetch thread
  const fetchThread = useCallback(async () => {
    if (!checkinId) return;

    setIsLoading(true);
    try {
      const data = await adminDeliveryThreadService.getThreadByCheckin(
        checkinId
      );
      setThread(data);
      setMessages(data.messages || []);
    } catch (error: any) {
      console.error("Error fetching thread:", error);
      toast({
        title: "Lỗi",
        description:
          error.response?.data?.message || "Không thể tải thread discussion",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [checkinId, toast]);

  // Send message
  const sendMessage = async (content: string) => {
    if (!thread || !content.trim()) return;

    setIsSending(true);
    try {
      console.log(
        "[useAdminDeliveryThread] Sending message:",
        content.substring(0, 50)
      );
      const newMessage = await adminDeliveryThreadService.addMessage(
        thread._id,
        content
      );

      if (newMessage) {
        console.log(
          "[useAdminDeliveryThread] Message sent, updating local state"
        );
        setMessages((prev) => [...prev, newMessage]);
        toast({
          title: "Đã gửi",
          description: "Tin nhắn đã được gửi thành công",
        });
      } else {
        console.log(
          "[useAdminDeliveryThread] No message returned, refreshing thread"
        );
        // Fallback: refresh thread if message extraction failed
        await fetchThread();
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể gửi tin nhắn",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  // Add new message from real-time
  const addMessageFromRealtime = useCallback((message: ThreadMessage) => {
    console.log(
      "[useAdminDeliveryThread] Adding message from real-time:",
      message
    );
    setMessages((prev) => {
      // Check if message already exists
      if (prev.some((m) => m._id === message._id)) {
        console.log(
          "[useAdminDeliveryThread] Message already exists, skipping"
        );
        return prev;
      }
      console.log("[useAdminDeliveryThread] Adding new message");
      return [...prev, message];
    });
  }, []);

  // Handle real-time message
  const handleRealtimeMessage = useCallback(
    (newMessage: ThreadMessage | undefined) => {
      console.log(
        "[useAdminDeliveryThread] Real-time message received:",
        newMessage
      );
      if (newMessage) {
        addMessageFromRealtime(newMessage);
      }
    },
    [addMessageFromRealtime]
  );

  // Initial fetch
  useEffect(() => {
    if (checkinId) {
      fetchThread();
    }
  }, [checkinId, fetchThread]);

  // Real-time updates
  useAdminThreadRealtime({
    threadId: thread?._id || null,
    onMessageReceived: handleRealtimeMessage,
    enabled: !!thread?._id,
  });

  return {
    thread,
    messages,
    isLoading,
    isSending,
    sendMessage,
    refreshThread: fetchThread,
    addMessageFromRealtime,
  };
}
