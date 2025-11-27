import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "@/shared/utils/toast";
import { v4 as uuidv4 } from "uuid";
import { ChatMessage, TypingState, QueuedMessage } from "@/types/chat";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSocket } from "@/contexts/SocketProvider";
import * as chatApi from "../services/chat.api.service";
import { messageQueue } from "../utils/messageQueue";
import { crossTabSync } from "../utils/crossTabSync";
import { useMessageState, WELCOME_ID } from "./useMessageState";
import { useConversationState } from "./useConversationState";

export { WELCOME_ID };

function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current !== undefined) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay]
  );
}

export const useChat = () => {
  const messageState = useMessageState();
  const conversationState = useConversationState();
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(true);
  const { user } = useAuthStore();
  const { pusher } = useSocket();

  const [typingState, setTypingState] = useState<TypingState | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  
  // ✅ STATE MỚI: Trạng thái suy nghĩ (Thought Process)
  const [currentThought, setCurrentThought] = useState<{icon: string, text: string} | null>(null);

  // ... (Giữ nguyên phần sendQueuedMessage và useEffect online/offline)
  const sendQueuedMessage = useCallback(async (queuedMessage: QueuedMessage): Promise<boolean> => {
      // (Code cũ giữ nguyên)
      return true; 
  }, []); 

  useEffect(() => { /* (Code cũ giữ nguyên) */ }, []);

  // ===================================
  // EFFECT 2: Pusher Event Listeners
  // ===================================
  useEffect(() => {
    if (!pusher || !user) return;

    // Subscribe vào kênh riêng của user (private channel - cần auth)
    const channelName = `private-user-${user._id}`;
    const channel = pusher.subscribe(channelName);

    // ✅ HANDLER: Nhận trạng thái suy nghĩ từ Backend
    const handleThinkingUpdate = (data: { icon: string; text: string; type?: string }) => {
        // Nếu type là 'thinking_done', có thể tắt luôn hoặc chờ text stream
        if (data.type === 'thinking_done') {
             // Optional: Giữ hiện thị 'Đã xong' một chút
             setCurrentThought({ icon: data.icon, text: data.text });
        } else {
             setIsLoadingAI(true);
             setCurrentThought({ icon: data.icon, text: data.text });
        }
    };

    // ✅ HANDLER: Nhận Chunk Text -> Tắt bong bóng suy nghĩ
    const handleStreamChunk = (data: { conversationId: string; text: string }) => {
        // Chỉ xử lý nếu là conversation hiện tại
        if (data.conversationId !== conversationState.currentConversationId) return;
        
        // Khi chữ bắt đầu chạy ra, tắt bong bóng suy nghĩ ngay lập tức
        setCurrentThought(null);
        setIsLoadingAI(false); // Tắt loading spinner nếu có

        // Update message content (Logic nối chuỗi)
        messageState.setMessages(prev => {
            // Tìm tin nhắn AI cuối cùng đang stream hoặc thinking
            const lastAiMsgIndex = prev.findLastIndex((msg) => {
              if (msg.senderType !== "AI") return false;
              if (msg.conversationId !== data.conversationId) return false;
              const meta = msg.metadata as any;
              return meta?.status === "streaming" || meta?.status === "thinking";
            });

            if (lastAiMsgIndex !== -1) {
              const updated = [...prev];
              const msg = updated[lastAiMsgIndex];
              const currentText = (msg.content as any)?.text || "";
              
              updated[lastAiMsgIndex] = {
                ...msg,
                content: { ...msg.content, text: currentText + data.text } as any,
                metadata: { ...(msg.metadata as any), status: "streaming" }
              };
              
              return updated;
            }
            
            return prev;
        });
    };

    // Handler nhận Message hoàn chỉnh (Kết thúc turn)
    const handleNewMessage = (socketMessage: any) => {
        if (socketMessage.conversationId !== conversationState.currentConversationId) return;
        
        // Đảm bảo tắt suy nghĩ khi nhận tin nhắn cuối
        setCurrentThought(null);
        setIsLoadingAI(false);

        messageState.setMessages((prev) => {
            // Logic merge/update tin nhắn cũ
            const idx = prev.findIndex(m => m._id === socketMessage._id);
            if (idx !== -1) {
                const updated = [...prev];
                updated[idx] = socketMessage;
                return updated;
            }
            return [...prev, socketMessage];
        });
    };

    // Đăng ký events với Pusher
    channel.bind("ai:thinking:update", handleThinkingUpdate);
    channel.bind("ai:stream:chunk", handleStreamChunk);
    channel.bind("chat:message:new", handleNewMessage);
    channel.bind("ai:message", handleNewMessage);

    return () => {
      // Unbind tất cả events và unsubscribe channel
      channel.unbind_all();
      pusher.unsubscribe(channelName);
    };
  }, [pusher, user, conversationState.currentConversationId, messageState]);

  // ... (Các phần còn lại: Typing emit, Cross-tab sync giữ nguyên)

  // Action: Send Text
  const onSendText = useCallback(async (text: string, latitude?: number, longitude?: number, type?: any, metadata?: any) => {
      const tempId = uuidv4();
      const userMessage = messageState.addUserMessage(text, conversationState.currentConversationId, {
        tempId, status: "pending", type, metadata
      });

      // Reset trạng thái UI
      setIsLoadingAI(true); 
      setCurrentThought({ icon: "⚡", text: "Đang gửi..." }); // Feedback tức thì

      try {
        messageState.updateMessageStatus(tempId, "sending");
        const aiResponse = await chatApi.postChatMessage(text, conversationState.currentConversationId, latitude, longitude, type, metadata);
        
        // Xử lý response sơ bộ (nếu có)
        const realId = aiResponse?.newConversation?._id || conversationState.currentConversationId || uuidv4();
        messageState.updateMessageStatus(tempId, "sent", { realId });

        // Nếu AI trả lời ngay lập tức (không stream), tắt loading
        if (aiResponse && !(aiResponse as any)?._id) { 
             setCurrentThought(null);
             setIsLoadingAI(false);
        }
      } catch (error) {
        // Error handling
        messageState.updateMessageStatus(tempId, "error", { error: "Gửi thất bại" });
        setCurrentThought(null);
        setIsLoadingAI(false);
      }
  }, [messageState, conversationState]);

  return {
    // State từ hooks
    messages: messageState.messages,
    quickReplies: messageState.quickReplies,
    hasMoreMessages: messageState.hasMoreMessages,
    conversations: conversationState.conversations,
    currentConversationId: conversationState.currentConversationId,
    isLoadingAI,
    isChatExpanded,
    setIsChatExpanded,
    
    // ✅ EXPORT STATE MỚI
    currentThought, 

    // Actions
    onSendText,
    onSendQuickReply: async (text: string, payload: string) => { 
      // Logic tương tự onSendText
      return onSendText(payload, undefined, undefined, undefined, undefined);
    },
    handleNewChat: conversationState.clearCurrentConversation,
    handleSelectConversation: conversationState.selectConversation,
  };
};