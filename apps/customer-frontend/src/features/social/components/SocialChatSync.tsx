// apps/customer-frontend/src/features/social/components/SocialChatSync.tsx
// ✅ FIXED: Global Socket Handler - Xử lý tin nhắn đến tập trung

import { useEffect } from "react";
import { useSocket } from "@/contexts/SocketProvider";
import { useSocialChatStore } from "../hooks/useSocialChatStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useQueryClient } from "@tanstack/react-query";

export function SocialChatSync() {
  const { socket } = useSocket();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const { handleSocketMessage, activeConversationId } = useSocialChatStore();

  useEffect(() => {
    if (!socket || !user) return;

    const onNewMessage = (message: any) => {
      // 1. Bỏ qua tin nhắn của chính mình (trừ khi nó đến từ thiết bị khác, nhưng ở đây ta tạm bỏ qua để tránh double)
      if (message.sender === user._id || message.sender?._id === user._id)
        return;

      console.log("⚡ [Sync] New message received:", message._id);

      // 2. Cập nhật vào Store
      handleSocketMessage(message);

      // 3. Nếu đang ở trong cuộc trò chuyện này -> Invalidate query để sync ngầm (để chắc chắn)
      // Nhưng KHÔNG được refetch ngay lập tức để tránh nháy UI, Store đã lo phần hiển thị rồi
      if (activeConversationId === message.conversationId) {
        queryClient.invalidateQueries({
          queryKey: ["socialMsg", message.conversationId],
        });
      }
    };

    socket.on("new_message", onNewMessage);

    return () => {
      socket.off("new_message", onNewMessage);
    };
  }, [socket, user, handleSocketMessage, activeConversationId, queryClient]);

  return null;
}
