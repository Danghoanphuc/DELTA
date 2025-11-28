// apps/customer-frontend/src/features/chat/components/ChatBotSync.tsx
import { useEffect, useRef } from "react";
import { useSocket } from "@/contexts/SocketProvider";
import { useAuthStore } from "@/stores/useAuthStore";
import { useConversationState } from "../hooks/useConversationState";
import { Logger } from "@/shared/utils/logger.util"; 

export const ChatBotSync = () => {
  const { pusher } = useSocket();
  const { user } = useAuthStore();
  
  // Lấy các hàm từ Store
  const { 
    addConversation, 
    updateConversationTitle, 
    loadConversations 
  } = useConversationState();

  // Ref luôn giữ phiên bản mới nhất của các hàm trong Store
  const storeActionsRef = useRef({
    addConversation,
    updateConversationTitle,
    loadConversations
  });

  useEffect(() => {
    storeActionsRef.current = {
      addConversation,
      updateConversationTitle,
      loadConversations
    };
  }, [addConversation, updateConversationTitle, loadConversations]);

  useEffect(() => {
    if (!pusher || !user?._id) return;

    const channelName = `private-user-${user._id}`;
    let channel = pusher.channel(channelName);

    if (!channel) {
      Logger.info(`[ChatBotSync] 🔌 Subscribing to ${channelName}`);
      channel = pusher.subscribe(channelName);
    }

    // --- Handler: Khi có hội thoại mới ---
    const handleConversationCreated = (data: any) => {
      Logger.info(`[ChatBotSync] 🆕 Conversation Created Data:`, data);
      
      const actions = storeActionsRef.current;
      if (actions.addConversation && typeof actions.addConversation === 'function') {
        
        // 🔥 FIX QUAN TRỌNG: Backend trả về _id, không phải conversationId
        // Data từ backend: { _id: "...", title: "...", ... }
        // Ta cần map đúng trường để Sidebar hiển thị được
        const conversationData = {
          ...data,
          // Ưu tiên lấy _id, nếu không có thì fallback sang conversationId hoặc id
          _id: data._id || data.conversationId || data.id, 
          title: data.title || "Đoạn chat mới",
          updatedAt: data.updatedAt || new Date().toISOString(),
          lastMessageAt: data.lastMessageAt || new Date().toISOString(),
        };

        if (conversationData._id) {
            actions.addConversation(conversationData as any);
        } else {
            Logger.warn("[ChatBotSync] Received conversation without ID", data);
        }

      } else {
        Logger.warn(`[ChatBotSync] addConversation not ready, reloading list...`);
        actions.loadConversations?.({ type: 'customer-bot' });
      }
    };

    // --- Handler: Khi hội thoại update (đổi tên, tin nhắn mới) ---
    const handleConversationUpdated = (data: any) => {
      // Logger.info(`[ChatBotSync] ♻️ Conversation Updated:`, data);
      
      const actions = storeActionsRef.current;
      const conversationId = data._id || data.conversationId; // Handle cả 2 trường hợp

      if (conversationId) {
          // Case 1: Update title (quan trọng nhất)
          if (data.title && actions.updateConversationTitle) {
            actions.updateConversationTitle(conversationId, data.title);
          }
          
          // Case 2: Nếu có lastMessageAt mới -> Cần update để nó nhảy lên đầu
          // (addConversation có logic merge và sort nên gọi nó cũng an toàn)
          if (data.lastMessageAt && actions.addConversation) {
             actions.addConversation({
                 ...data,
                 _id: conversationId
             } as any);
          }
      }
    };

    // Bind events
    channel.bind("conversation_created", handleConversationCreated);
    channel.bind("conversation_updated", handleConversationUpdated);

    // Cleanup
    return () => {
      if (channel) {
        channel.unbind("conversation_created", handleConversationCreated);
        channel.unbind("conversation_updated", handleConversationUpdated);
      }
    };
  }, [pusher, user?._id]);

  return null;
};