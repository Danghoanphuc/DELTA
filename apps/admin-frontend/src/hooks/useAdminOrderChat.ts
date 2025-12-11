// apps/admin-frontend/src/hooks/useAdminOrderChat.ts
// ✅ Hook for order-level chat (not checkin-specific)

import { useState, useEffect, useCallback } from "react";
import { useToast } from "./use-toast";
import api from "@/lib/axios";
import { useAdminThreadRealtime } from "./useAdminThreadRealtime";

interface OrderMessage {
  _id: string;
  senderId: string;
  senderName: string;
  senderRole: "admin" | "customer" | "shipper";
  content: string;
  createdAt: string;
}

interface OrderThread {
  _id: string;
  orderId: string;
  orderNumber: string;
  messages: OrderMessage[];
}

export function useAdminOrderChat(orderId: string) {
  const [thread, setThread] = useState<OrderThread | null>(null);
  const [messages, setMessages] = useState<OrderMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  // Fetch or create thread for order
  const fetchThread = useCallback(async () => {
    if (!orderId) {
      console.error("[useAdminOrderChat] No orderId provided");
      return;
    }

    console.log("[useAdminOrderChat] Fetching thread for order:", orderId);
    setIsLoading(true);
    try {
      const res = await api.get(`/admin/order-threads/${orderId}`);
      const threadData = res.data?.data?.thread;
      console.log("[useAdminOrderChat] Thread fetched:", {
        threadId: threadData?._id,
        messageCount: threadData?.messages?.length,
      });
      setThread(threadData);
      setMessages(threadData?.messages || []);
      setUnreadCount(0);
    } catch (error: any) {
      console.error("[useAdminOrderChat] Error fetching thread:", {
        status: error.response?.status,
        data: error.response?.data,
      });
      // If thread doesn't exist, create it
      if (error.response?.status === 404) {
        console.log("[useAdminOrderChat] Thread not found, creating new one");
        try {
          const createRes = await api.post(`/admin/order-threads`, { orderId });
          const newThread = createRes.data?.data?.thread;
          console.log("[useAdminOrderChat] Thread created:", {
            threadId: newThread?._id,
          });
          setThread(newThread);
          setMessages([]);
        } catch (createError: any) {
          console.error("[useAdminOrderChat] Error creating thread:", {
            status: createError.response?.status,
            data: createError.response?.data,
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  // Send message
  const sendMessage = async (content: string) => {
    if (!thread) {
      console.error("[useAdminOrderChat] No thread available");
      toast({
        title: "Lỗi",
        description: "Chưa có thread, vui lòng thử lại",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) {
      console.error("[useAdminOrderChat] Empty content");
      return;
    }

    setIsSending(true);
    try {
      const url = `/admin/order-threads/${thread._id}/messages`;
      console.log("[useAdminOrderChat] Sending POST to:", url);

      const res = await api.post(url, { content });

      console.log("[useAdminOrderChat] Response:", res.data);

      const newMessage = res.data?.data?.message;
      console.log("[useAdminOrderChat] New message from response:", newMessage);

      if (newMessage) {
        console.log("[useAdminOrderChat] Adding message to state");
        setMessages((prev) => {
          console.log("[useAdminOrderChat] Previous messages:", prev.length);
          const updated = [...prev, newMessage];
          console.log("[useAdminOrderChat] Updated messages:", updated.length);
          return updated;
        });
        toast({
          title: "Đã gửi",
          description: "Tin nhắn đã được gửi thành công",
        });
      } else {
        console.error("[useAdminOrderChat] No message in response!");
      }
    } catch (error: any) {
      console.error("[useAdminOrderChat] Error sending message:", {
        error,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      toast({
        title: "Lỗi",
        description:
          error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Không thể gửi tin nhắn",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  // Add message from real-time
  const addMessageFromRealtime = useCallback((message: OrderMessage) => {
    console.log("[useAdminOrderChat] Adding message from real-time:", message);
    setMessages((prev) => {
      if (prev.some((m) => m._id === message._id)) {
        return prev;
      }
      return [...prev, message];
    });
    setUnreadCount((prev) => prev + 1);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchThread();
  }, [fetchThread]);

  // Real-time updates
  useAdminThreadRealtime({
    threadId: thread?._id || null,
    onMessageReceived: addMessageFromRealtime,
    enabled: !!thread?._id,
  });

  return {
    thread,
    messages,
    isLoading,
    isSending,
    sendMessage,
    unreadCount,
    refreshThread: fetchThread,
  };
}
