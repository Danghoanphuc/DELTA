import { useEffect } from "react";
import { useSocket } from "@/contexts/SocketProvider";
import { useAuthStore } from "@/stores/useAuthStore";
import { useConversationState } from "../hooks/useConversationState";

export const ChatBotSync = () => {
  const { pusher } = useSocket();
  const { user } = useAuthStore();

  // Dùng trực tiếp actions từ store
  const { addConversation, updateConversationTitle, loadConversations } =
    useConversationState();

  useEffect(() => {
    if (!pusher || !user?._id) return;

    const channelName = `private-user-${user._id}`;
    let channel = pusher.channel(channelName);

    if (!channel) {
      channel = pusher.subscribe(channelName);
    }

    // 1. Khi có hội thoại mới được tạo (từ tab khác hoặc từ server)
    const handleConversationCreated = (data: any) => {
      // Chỉ add vào list, không select (để tránh nhảy trang đột ngột)
      if (data && (data._id || data.conversationId)) {
        addConversation({
          _id: data._id || data.conversationId,
          title: data.title || "Đoạn chat mới",
          updatedAt: new Date().toISOString(),
        });
      } else {
        // Fallback: Reload lại list
        loadConversations({ type: "customer-bot" });
      }
    };

    // 2. Khi hội thoại đổi tên
    const handleConversationUpdated = (data: any) => {
      const id = data._id || data.conversationId;
      if (id && data.title) {
        updateConversationTitle(id, data.title);
      }
    };

    channel.bind("conversation_created", handleConversationCreated);
    channel.bind("conversation_updated", handleConversationUpdated);

    return () => {
      if (channel) {
        channel.unbind("conversation_created", handleConversationCreated);
        channel.unbind("conversation_updated", handleConversationUpdated);
      }
    };
  }, [
    pusher,
    user?._id,
    addConversation,
    updateConversationTitle,
    loadConversations,
  ]);

  return null;
};
