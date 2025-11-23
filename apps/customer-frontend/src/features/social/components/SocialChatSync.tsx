// apps/customer-frontend/src/features/social/components/SocialChatSync.tsx
// ✅ FIXED: Đã thêm lắng nghe realtime cho Update/Delete Group
// ✅ UPDATE: Tự động đá user ra khỏi màn hình chat nếu nhóm bị xóa

import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSocket } from "@/contexts/SocketProvider";
import { useSocialChatStore } from "../hooks/useSocialChatStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useQueryClient } from "@tanstack/react-query";
import { fetchConversationById } from "../../chat/services/chat.api.service";
import { toast } from "sonner"; // Thêm toast để báo user

export function SocialChatSync() {
  const { socket } = useSocket();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  
  const { 
    handleSocketMessage, 
    activeConversationId, 
    setActiveConversation,
    conversations,
    addConversation,     // Dùng để cập nhật/thêm mới (Upsert)
    removeConversation,  // Dùng để xóa khỏi list
  } = useSocialChatStore();

  // 1. LOGIC RESET ACTIVE (Giữ nguyên)
  useEffect(() => {
    const isChatPage = location.pathname.includes("/messages") || location.pathname.includes("/chat");
    if (!isChatPage && activeConversationId) {
      setActiveConversation(null);
    }
  }, [location.pathname, activeConversationId, setActiveConversation]);

  // 2. LOGIC LẮNG NGHE SOCKET (ĐÃ NÂNG CẤP)
  useEffect(() => {
    if (!socket || !user) return;

    // --- A. Xử lý tin nhắn mới (Giữ nguyên) ---
    const onNewMessage = async (message: any) => {
      if (message.sender === user._id || message.sender?._id === user._id) return;
      if (message.senderType === "AI") return;

      // Nếu chưa có hội thoại trong Store thì fetch về
      const conversationExists = conversations.find(
        (c) => c._id === message.conversationId
      );
      
      if (!conversationExists) {
        try {
          const conv = await fetchConversationById(message.conversationId);
          if (conv) addConversation(conv);
        } catch (error) {
          console.warn("[Sync] Failed to fetch conversation:", error);
        }
      }
      
      handleSocketMessage(message);

      if (activeConversationId === message.conversationId) {
         queryClient.invalidateQueries({ queryKey: ["socialMsg", message.conversationId] });
      }
    };

    // --- B. ✅ NEW: Xử lý khi Nhóm được Cập nhật (Tên, Avatar, Thành viên) ---
    const onConversationUpdated = (updatedConversation: any) => {
      console.log("♻️ [Sync] Conversation Updated:", updatedConversation._id);
      // Hàm addConversation trong Store đã có logic: Nếu tồn tại thì update, chưa thì thêm mới
      // Nhờ vậy Avatar/Tên nhóm ở sidebar sẽ đổi ngay lập tức
      addConversation(updatedConversation);
      
      // Nếu đang mở đúng nhóm này, refresh lại query để đảm bảo data tươi mới nhất
      if (activeConversationId === updatedConversation._id) {
         queryClient.invalidateQueries({ queryKey: ["socialMsg", updatedConversation._id] });
         queryClient.invalidateQueries({ queryKey: ["conversationMedia", updatedConversation._id] });
      }
    };

    // --- C. ✅ NEW: Xử lý khi Nhóm bị Xóa (hoặc bị kick) ---
    const onConversationRemoved = ({ conversationId }: { conversationId: string }) => {
      console.log("❌ [Sync] Conversation Removed:", conversationId);
      
      // 1. Xóa khỏi Store (Sidebar sẽ tự biến mất item này)
      removeConversation(conversationId);

      // 2. Nếu đang xem đúng nhóm này -> Đá ra ngoài & Thông báo
      if (activeConversationId === conversationId) {
        toast.error("Cuộc trò chuyện này không còn khả dụng.");
        setActiveConversation(null);
        // Nếu đang ở trang messages cụ thể, quay về root messages
        if (location.pathname.includes("/messages")) {
            navigate("/messages");
        }
      }
    };

    // Đăng ký sự kiện
    socket.on("new_message", onNewMessage);
    socket.on("conversation_updated", onConversationUpdated); // 🔥 Mới
    socket.on("conversation_removed", onConversationRemoved); // 🔥 Mới

    return () => {
      socket.off("new_message", onNewMessage);
      socket.off("conversation_updated", onConversationUpdated);
      socket.off("conversation_removed", onConversationRemoved);
    };
  }, [
    socket, 
    user, 
    handleSocketMessage, 
    activeConversationId, 
    queryClient, 
    conversations, 
    addConversation, 
    removeConversation, // Nhớ đảm bảo Store có hàm này (đã check ở bước trước)
    location.pathname,
    navigate, 
    setActiveConversation
  ]);

  return null;
}