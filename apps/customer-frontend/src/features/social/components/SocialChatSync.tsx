// apps/customer-frontend/src/features/social/components/SocialChatSync.tsx
// ✅ FIXED: Reset Active Conversation khi rời trang chat -> Badge nhảy số chuẩn

import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSocket } from "@/contexts/SocketProvider";
import { useSocialChatStore } from "../hooks/useSocialChatStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useQueryClient } from "@tanstack/react-query";
import { fetchConversationById } from "../../chat/services/chat.api.service";

export function SocialChatSync() {
  const { socket } = useSocket();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const location = useLocation(); // 🔥 Lấy thông tin URL
  
  const { 
    handleSocketMessage, 
    activeConversationId, 
    setActiveConversation,
    conversations,
    addConversation,
  } = useSocialChatStore();
  const navigate = useNavigate();

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

    const onNewMessage = async (message: any) => {
      if (message.sender === user._id || message.sender?._id === user._id) return;

      // ✅ FIXED: Chỉ xử lý messages từ social chat (không phải bot chat)
      // Bot chat không nên trigger unread counts hoặc notifications
      if (message.senderType === "AI") {
        return; // Bỏ qua messages từ AI bot
      }

      console.log("⚡ [Sync] New message received:", message._id);
      
      // ✅ FIXED: Kiểm tra nếu conversation chưa có trong list, fetch từ API
      const conversationExists = conversations.find(
        (c) => c._id === message.conversationId
      );
      
      if (!conversationExists) {
        try {
          const conv = await fetchConversationById(message.conversationId);
          if (conv) {
            addConversation(conv);
          }
        } catch (error) {
          console.warn("[Sync] Failed to fetch conversation:", error);
        }
      }
      
      // Cập nhật Store
      handleSocketMessage(message);

      // ✅ NEW: Nếu đang ở trang messages và conversation chưa được mở, có thể tự động mở
      const isMessagesPage = location.pathname.includes("/messages");
      if (isMessagesPage && activeConversationId !== message.conversationId) {
        // Không tự động mở, để user tự chọn
        // Nhưng có thể highlight conversation trong list
      }

      // Nếu đang mở đúng hội thoại này thì update UI ngầm
      if (activeConversationId === message.conversationId) {
         queryClient.invalidateQueries({ queryKey: ["socialMsg", message.conversationId] });
      }
    };

    socket.on("new_message", onNewMessage);

    return () => {
      socket.off("new_message", onNewMessage);
    };
  }, [socket, user, handleSocketMessage, activeConversationId, queryClient, conversations, addConversation, location.pathname]);

  return null;
}