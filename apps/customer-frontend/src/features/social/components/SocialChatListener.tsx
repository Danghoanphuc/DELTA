// apps/customer-frontend/src/features/social/components/SocialChatListener.tsx
// ✅ GLOBAL LISTENER: Tai mắt của ứng dụng - Luôn lắng nghe tin nhắn

import { useEffect } from "react";
import { useSocket } from "@/contexts/SocketProvider";
import { useSocialChatStore } from "../hooks/useSocialChatStore";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ChatMessage } from "@/types/chat";
import { useAuthStore } from "@/stores/useAuthStore";
import { useLocation, useNavigate } from "react-router-dom";

export function SocialChatListener() {
  const { socket } = useSocket();
  const { handleSocketMessage, conversations } = useSocialChatStore();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket || !currentUser) return;

    const handleNewMessage = (message: ChatMessage) => {
      console.log("[Listener] New message received:", message);

      // 1. Cập nhật Store (Quan trọng nhất)
      handleSocketMessage(message);

      // 2. Invalidate Cache để lần tới fetch sẽ có dữ liệu mới
      queryClient.invalidateQueries({ queryKey: ["socialConversations"] });
      queryClient.invalidateQueries({
        queryKey: ["socialMessages", message.conversationId],
      });

      // 3. Check xem user có đang ở trong cuộc chat đó không
      // Lấy conversationId từ URL hiện tại
      const params = new URLSearchParams(location.search);
      const currentConversationId = params.get("conversationId");
      const isChattingWithSender =
        currentConversationId === message.conversationId;

      // 4. Nếu KHÔNG đang chat với người đó -> Hiện thông báo
      // ChatMessage không có sender property, chỉ có senderType
      // Nếu senderType là "User" và không phải currentUser thì hiện thông báo
      const isFromOtherUser = message.senderType === "User" && message.conversationId;

      if (!isChattingWithSender && isFromOtherUser) {
        // Play sound (tùy chọn)
        // new Audio('/assets/sounds/notification.mp3').play().catch(() => {});

        const messageText = message.type === "text" && "text" in message.content
          ? message.content.text
          : message.type === "image" 
          ? "Đã gửi một ảnh"
          : message.type === "file"
          ? "Đã gửi một file"
          : "Tin nhắn mới";

        toast.info(
          `Tin nhắn mới: ${messageText}`,
          {
            description: "Nhấn để xem ngay",
            duration: 5000,
            action: {
              label: "Xem",
              onClick: () => {
                navigate(`/messages?conversationId=${message.conversationId}`);
              },
            },
          }
        );
      }
    };

    socket.on("new_message", handleNewMessage);
    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [
    socket,
    currentUser,
    handleSocketMessage,
    queryClient,
    location.search,
    navigate,
  ]);

  return null;
}
