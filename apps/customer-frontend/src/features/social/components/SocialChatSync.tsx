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
import { toast } from "@/shared/utils/toast"; // Thêm toast để báo user

export function SocialChatSync() {
  const { pusher } = useSocket(); // ✅ FIX: Dùng pusher thay vì socket
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

  // 2. LOGIC LẮNG NGHE PUSHER (ĐÃ NÂNG CẤP)
  useEffect(() => {
    if (!pusher || !user) {
      // ✅ Chỉ log ở dev mode và không làm phiền user
      if (import.meta.env.DEV) {
        console.debug("[SocialChatSync] Pusher or user not available - waiting for auth", { pusher: !!pusher, user: !!user });
      }
      return;
    }

    // ✅ FIX: Subscribe vào private channel của user
    const channelName = `private-user-${user._id}`;
    console.log(`[SocialChatSync] Subscribing to channel: ${channelName}`);
    
    const channel = pusher.subscribe(channelName);

    // ✅ Handle subscription events
    channel.bind("pusher:subscription_succeeded", () => {
      console.log(`✅ [SocialChatSync] Successfully subscribed to ${channelName}`);
    });

    channel.bind("pusher:subscription_error", (err: any) => {
      console.error(`❌ [SocialChatSync] Subscription error for ${channelName}:`, err);
      // JWT expired - có thể cần refresh token hoặc đăng nhập lại
      if (err.status === 403 || err.status === 401) {
        console.warn("[SocialChatSync] Auth failed - token may be expired. Please refresh page or login again.");
      }
    });

    // --- A. Xử lý tin nhắn mới (Giữ nguyên) ---
    const onNewMessage = async (message: any) => {
      // ✅ LOG: Chỉ log thông tin quan trọng
      console.log(`[SocialChatSync] 📨 Received: msgId=${message._id}, type=${message.type}, attachments=${message.content?.attachments?.length || 0}`);
      
      // ✅ Bỏ qua messages từ chính mình (đã có optimistic update)
      if (message.sender === user._id || message.sender?._id === user._id) {
        console.log("[SocialChatSync] ⏭️ Ignoring own message");
        return;
      }
      
      if (message.senderType === "AI") {
        console.log("[SocialChatSync] ⏭️ Ignoring AI message");
        return;
      }

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

    // ✅ FIX: Bind Pusher events thay vì socket.on()
    channel.bind("new_message", onNewMessage);
    channel.bind("conversation_updated", onConversationUpdated);
    channel.bind("conversation_removed", onConversationRemoved);

    return () => {
      // ✅ FIX: Unbind và unsubscribe khi cleanup
      channel.unbind("new_message", onNewMessage);
      channel.unbind("conversation_updated", onConversationUpdated);
      channel.unbind("conversation_removed", onConversationRemoved);
      pusher.unsubscribe(channelName);
    };
  }, [
    pusher, // ✅ FIX: Dùng pusher thay vì socket
    user, 
    handleSocketMessage, 
    activeConversationId, 
    queryClient, 
    conversations, 
    addConversation, 
    removeConversation,
    location.pathname,
    navigate, 
    setActiveConversation
  ]);

  return null;
}