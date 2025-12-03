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
    addConversation, // Dùng để cập nhật/thêm mới (Upsert)
    removeConversation, // Dùng để xóa khỏi list
  } = useSocialChatStore();

  // 1. LOGIC RESET ACTIVE (Giữ nguyên)
  useEffect(() => {
    const isChatPage =
      location.pathname.includes("/messages") ||
      location.pathname.includes("/chat");
    if (!isChatPage && activeConversationId) {
      setActiveConversation(null);
    }
  }, [location.pathname, activeConversationId, setActiveConversation]);

  // 2. LOGIC LẮNG NGHE PUSHER (ĐÃ NÂNG CẤP)
  useEffect(() => {
    if (!pusher || !user) {
      // ✅ Chỉ log ở dev mode và không làm phiền user
      if (import.meta.env.DEV) {
        console.debug(
          "[SocialChatSync] Pusher or user not available - waiting for auth",
          { pusher: !!pusher, user: !!user }
        );
      }
      return;
    }

    // ✅ FIX: Subscribe vào private channel của user
    const channelName = `private-user-${user._id}`;
    console.log(`[SocialChatSync] Subscribing to channel: ${channelName}`);

    const channel = pusher.subscribe(channelName);

    // ✅ Handle subscription events
    channel.bind("pusher:subscription_succeeded", () => {
      console.log(
        `✅ [SocialChatSync] Successfully subscribed to ${channelName}`
      );
    });

    channel.bind("pusher:subscription_error", (err: any) => {
      console.error(
        `❌ [SocialChatSync] Subscription error for ${channelName}:`,
        err
      );
      // JWT expired - có thể cần refresh token hoặc đăng nhập lại
      if (err.status === 403 || err.status === 401) {
        console.warn(
          "[SocialChatSync] Auth failed - token may be expired. Please refresh page or login again."
        );
      }
    });

    // --- A. Xử lý tin nhắn mới (Giữ nguyên) ---
    const onNewMessage = async (message: any) => {
      // ✅ LOG: Chỉ log thông tin quan trọng
      console.log(
        `[SocialChatSync] 📨 Received: msgId=${message._id}, type=${
          message.type
        }, attachments=${message.content?.attachments?.length || 0}`
      );

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
        queryClient.invalidateQueries({
          queryKey: ["socialMsg", message.conversationId],
        });

        // Invalidate media/files queries if message has attachments
        if (
          message.type === "image" ||
          message.type === "file" ||
          message.content?.attachments?.length > 0
        ) {
          queryClient.invalidateQueries({
            queryKey: ["conversationMedia", message.conversationId],
          });
          queryClient.invalidateQueries({
            queryKey: ["conversationFiles", message.conversationId],
          });
        }
      }
    };

    // --- B. ✅ NEW: Xử lý khi Nhóm được Cập nhật (Tên, Avatar, Thành viên) ---
    const onConversationUpdated = async (updatedConversation: any) => {
      console.log("♻️ [Sync] Conversation Updated:", updatedConversation._id);

      // Check if user is still a participant
      const isStillParticipant = updatedConversation.participants?.some(
        (p: any) => {
          const pId = p.userId?._id || p.userId;
          return pId === user._id;
        }
      );

      if (!isStillParticipant) {
        // User was removed from group
        console.log(
          "❌ [Sync] User removed from group:",
          updatedConversation._id
        );
        removeConversation(updatedConversation._id);

        // If currently viewing this conversation, kick out
        if (activeConversationId === updatedConversation._id) {
          toast.error("Bạn đã bị xóa khỏi nhóm này");
          setActiveConversation(null);
          if (location.pathname.includes("/messages")) {
            navigate("/messages");
          }
        }
        return;
      }

      // Check if this is a new conversation for the user (just added to group)
      const existingConv = conversations.find(
        (c) => c._id === updatedConversation._id
      );
      if (!existingConv) {
        // This is a new group that user was just added to
        console.log(
          "✨ [Sync] New group conversation added:",
          updatedConversation._id
        );

        // Show notification
        toast.success(
          `Bạn đã được thêm vào nhóm "${updatedConversation.title}"`,
          { duration: 5000 }
        );
      }

      // Update conversation in store (will add if new, update if exists)
      addConversation(updatedConversation);

      // Refresh queries if viewing this conversation
      if (activeConversationId === updatedConversation._id) {
        queryClient.invalidateQueries({
          queryKey: ["socialMsg", updatedConversation._id],
        });
        queryClient.invalidateQueries({
          queryKey: ["conversationMedia", updatedConversation._id],
        });
      }

      // Always refresh conversation list to ensure sync
      queryClient.invalidateQueries({ queryKey: ["socialConversations"] });
    };

    // --- C. ✅ NEW: Xử lý khi Nhóm bị Xóa (hoặc bị kick) ---
    const onConversationRemoved = async ({
      conversationId,
    }: {
      conversationId: string;
    }) => {
      // ✅ FIX: Chỉ xử lý SOCIAL conversations (group, peer-to-peer)
      // Bỏ qua chatbot conversations (customer-bot) vì chúng được xử lý bởi ChatBotSync

      // Check trong store trước (nhanh nhất)
      const existingConv = conversations.find((c) => c._id === conversationId);
      if (existingConv) {
        if (existingConv.type === "customer-bot") {
          // Không log để tránh noise
          return;
        }
        // Nếu là social conversation, tiếp tục xử lý
      } else {
        // Nếu không có trong store, fetch từ API để check type
        try {
          const conversation = await fetchConversationById(conversationId);
          if (conversation && conversation.type === "customer-bot") {
            // Không log để tránh noise
            return;
          }
        } catch (error) {
          // Nếu fetch fail (có thể conversation đã bị xóa),
          // Vì chatbot conversations thường không có trong SocialChatStore,
          // nên ta giả định là chatbot conversation và bỏ qua
          // Điều này an toàn hơn vì chatbot conversations được xử lý bởi ChatBotSync
          return;
        }
      }

      // Chỉ log khi đã confirm là social conversation
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

    // --- D. ✅ NEW: Xử lý khi Message bị xóa ---
    const onMessageDeleted = ({
      messageId,
      conversationId,
      deleteForEveryone,
    }: {
      messageId: string;
      conversationId: string;
      deleteForEveryone: boolean;
    }) => {
      console.log(
        "🗑️ [Sync] Message Deleted:",
        messageId,
        "deleteForEveryone:",
        deleteForEveryone,
        "conversationId:",
        conversationId
      );

      // ✅ Optimistically remove from cache NGAY LẬP TỨC
      queryClient.setQueryData(
        ["conversationFiles", conversationId],
        (old: any) => {
          if (!Array.isArray(old)) return [];
          const filtered = old.filter(
            (file: any) => file.messageId !== messageId
          );
          console.log(
            `[Sync] Removed file from cache: ${old.length} -> ${filtered.length}`
          );
          return filtered;
        }
      );

      queryClient.setQueryData(
        ["conversationMedia", conversationId],
        (old: any) => {
          if (!Array.isArray(old)) return [];
          return old.filter((media: any) => media.messageId !== messageId);
        }
      );

      // ✅ Invalidate messages query
      queryClient.invalidateQueries({
        queryKey: ["socialMsg", conversationId],
      });
    };

    // ✅ FIX: Bind Pusher events thay vì socket.on()
    channel.bind("new_message", onNewMessage);
    channel.bind("conversation_updated", onConversationUpdated);
    channel.bind("conversation_removed", onConversationRemoved);
    channel.bind("message_deleted", onMessageDeleted);

    return () => {
      // ✅ FIX: Unbind và unsubscribe khi cleanup
      channel.unbind("new_message", onNewMessage);
      channel.unbind("conversation_updated", onConversationUpdated);
      channel.unbind("conversation_removed", onConversationRemoved);
      channel.unbind("message_deleted", onMessageDeleted);
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
    setActiveConversation,
  ]);

  return null;
}
