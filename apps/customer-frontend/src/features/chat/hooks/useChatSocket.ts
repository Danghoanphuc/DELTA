// apps/customer-frontend/src/features/chat/hooks/useChatSocket.ts
import { useEffect, useRef } from "react";
import { useSocket } from "@/contexts/SocketProvider";
import { useAuthStore } from "@/stores/useAuthStore";
import { ChatMessage } from "@/types/chat";

interface UseChatSocketProps {
  conversationId: string | null;
  onMessageUpdated?: (message: ChatMessage) => void;
  onConversationCreated?: (data: { conversationId: string; title?: string }) => void;
}

export const useChatSocket = ({
  conversationId,
  onMessageUpdated,
  onConversationCreated,
}: UseChatSocketProps) => {
  const { pusher } = useSocket();
  const { user } = useAuthStore();

  // ✅ TRICK CỦA SENIOR: Dùng useRef để "đóng băng" callback
  // Giúp useEffect bên dưới không bị phụ thuộc vào sự thay đổi của hàm onMessageUpdated
  const onMessageUpdatedRef = useRef(onMessageUpdated);
  const onConversationCreatedRef = useRef(onConversationCreated);

  // Cập nhật ref mỗi khi props thay đổi, nhưng KHÔNG kích hoạt re-subscribe
  useEffect(() => {
    onMessageUpdatedRef.current = onMessageUpdated;
    onConversationCreatedRef.current = onConversationCreated;
  }, [onMessageUpdated, onConversationCreated]);

  useEffect(() => {
    // Chỉ chạy khi có pusher, user và conversationId thay đổi thực sự
    if (!pusher || !user?._id) return;

    const channelName = `private-user-${user._id}`;
    let channel = pusher.channel(channelName);

    // Nếu chưa có thì subscribe
    if (!channel) {
      channel = pusher.subscribe(channelName);
      console.log(`[useChatSocket] 🔌 Subscribing to ${channelName}`);
    } else {
      console.log(`[useChatSocket] ♻️ Reusing existing channel ${channelName}`);
    }

    // Handler dùng Ref -> Không bao giờ gây ra re-render loop
    const handleMessageUpdate = (message: ChatMessage) => {
      // Logic lọc conversation
      const shouldProcess = !conversationId || message.conversationId === conversationId;
      if (shouldProcess && onMessageUpdatedRef.current) {
        onMessageUpdatedRef.current(message);
      }
    };

    const handleConversationCreated = (data: any) => {
      if (data.conversationId && onConversationCreatedRef.current) {
        onConversationCreatedRef.current(data);
      }
    };

    // Bind events
    // Lưu ý: unbind trước để tránh duplicate listener nếu effect chạy lại
    channel.unbind("chat:message:new", handleMessageUpdate);
    channel.unbind("chat:message:updated", handleMessageUpdate);
    channel.unbind("conversation_created", handleConversationCreated);

    channel.bind("chat:message:new", handleMessageUpdate);
    channel.bind("chat:message:updated", handleMessageUpdate);
    channel.bind("conversation_created", handleConversationCreated);

    // Cleanup: Chỉ unsubscribe khi component unmount hẳn hoặc user logout
    return () => {
      channel.unbind("chat:message:new", handleMessageUpdate);
      channel.unbind("chat:message:updated", handleMessageUpdate);
      channel.unbind("conversation_created", handleConversationCreated);
      // Không unsubscribe kênh ở đây nếu muốn giữ kết nối global, 
      // nhưng với chat page thì nên unsubscribe để tiết kiệm connection.
      console.log(`[useChatSocket] 🛑 Cleaning up listeners for ${channelName}`);
    };
  }, [pusher, user?._id, conversationId]); // ✅ Dependencies tối giản
};