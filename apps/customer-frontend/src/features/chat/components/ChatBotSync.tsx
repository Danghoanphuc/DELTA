// src/features/chat/components/ChatBotSync.tsx
import { useEffect, useRef } from "react";
import { useSocket } from "@/contexts/SocketProvider";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatContext } from "../context/ChatProvider";
import * as chatApi from "../services/chat.api.service";

export function ChatBotSync() {
  const { pusher } = useSocket();
  const user = useAuthStore((state) => state.user);
  const chatContext = useChatContext();
  const contextRef = useRef(chatContext);

  useEffect(() => {
    contextRef.current = chatContext;
  }, [chatContext]);

  useEffect(() => {
    if (!pusher || !user?._id) return;

    const channelName = `private-user-${user._id}`;
    const channel = pusher.subscribe(channelName);
    console.log(`[ChatBotSync] 📡 Connected: ${channelName}`);

    const normalizePayload = (data: any) => {
        if (!data) return null;
        return data.conversation || data.data || data;
    };

    // Lấy dữ liệu tươi từ API để đảm bảo tên chuẩn
    const fetchFreshData = async (id: string) => {
        try {
            const freshConvo = await chatApi.fetchConversationById(id);
            if (freshConvo) {
                console.log(`[ChatBotSync] 🔄 Synced Title: "${freshConvo.title}"`);
                // Update vào State
                contextRef.current?.addConversation(freshConvo);
            }
        } catch (err) {
            console.error("[ChatBotSync] Failed to sync", err);
        }
    };

    const handleUpsert = (rawPayload: any, source: string) => {
      const data = normalizePayload(rawPayload);
      
      if (data && data._id) {
          // 1. Update ngay lập tức (Optimistic)
          contextRef.current?.addConversation(data);
          
          // 2. Nếu là UPDATE (Đổi tên) -> Gọi API xác thực
          if (source === "UPDATED") {
             fetchFreshData(data._id);
          }
      }
    };

    channel.bind("conversation_created", (d: any) => handleUpsert(d, "CREATED"));
    channel.bind("conversation_updated", (d: any) => handleUpsert(d, "UPDATED"));
    channel.bind("conversation_removed", (d: any) => {
       const data = normalizePayload(d);
       if (data?.conversationId || data?._id) {
           contextRef.current?.removeConversation(data.conversationId || data._id);
       }
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
    };
  }, [pusher, user?._id]);

  return null;
}