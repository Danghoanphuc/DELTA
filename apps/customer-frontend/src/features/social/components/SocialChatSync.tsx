// apps/customer-frontend/src/features/social/components/SocialChatSync.tsx
// ✅ FIXED: Reset Active Conversation khi rời trang chat -> Badge nhảy số chuẩn

import { useEffect } from "react";
import { useLocation } from "react-router-dom"; // 🔥 Import mới
import { useSocket } from "@/contexts/SocketProvider";
import { useSocialChatStore } from "../hooks/useSocialChatStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useQueryClient } from "@tanstack/react-query";

export function SocialChatSync() {
  const { socket } = useSocket();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const location = useLocation(); // 🔥 Lấy thông tin URL
  
  const { handleSocketMessage, activeConversationId, setActiveConversation } = useSocialChatStore();

  // 1. LOGIC MỚI: Tự động reset trạng thái khi không ở trang tin nhắn
  useEffect(() => {
    const isChatPage = location.pathname.includes("/messages") || location.pathname.includes("/chat");
    
    // Nếu đang ở trang khác (Home, Shop...) mà Store vẫn nhớ ID cuộc trò chuyện -> Xóa ngay
    if (!isChatPage && activeConversationId) {
      console.log("👋 [Sync] Leaving chat page, resetting active conversation.");
      setActiveConversation(null);
    }
  }, [location.pathname, activeConversationId, setActiveConversation]);

  // 2. LOGIC CŨ: Lắng nghe tin nhắn
  useEffect(() => {
    if (!socket || !user) return;

    const onNewMessage = (message: any) => {
      if (message.sender === user._id || message.sender?._id === user._id) return;

      console.log("⚡ [Sync] New message received:", message._id);
      
      // Cập nhật Store
      handleSocketMessage(message);

      // Nếu đang mở đúng hội thoại này thì update UI ngầm
      if (activeConversationId === message.conversationId) {
         queryClient.invalidateQueries({ queryKey: ["socialMsg", message.conversationId] });
      }
    };

    socket.on("new_message", onNewMessage);

    return () => {
      socket.off("new_message", onNewMessage);
    };
  }, [socket, user, handleSocketMessage, activeConversationId, queryClient]);

  return null;
}