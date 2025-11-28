// src/features/chat/hooks/useChat.enterprise.ts
import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { ChatMessage } from "@/types/chat";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSocket } from "@/contexts/SocketProvider";
import * as chatApi from "../services/chat.api.service";
import { useMessageState, WELCOME_ID } from "./useMessageState";
import { useConversationState } from "./useConversationState";
import { useChatStore } from "../stores/useChatStore";

export { WELCOME_ID };

export const useChat = () => {
  const messageState = useMessageState();
  const conversationState = useConversationState();
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(true);
  const { user } = useAuthStore();
  const { pusher } = useSocket();
  
  // Trạng thái suy nghĩ hiển thị (Sticky Bubble nếu cần)
  const [currentThought, setCurrentThought] = useState<{icon: string, text: string} | null>(null);
  
  // Lấy store actions từ ChatStore (cho Sidebar Deep Research)
  const { 
      addResearchStep, 
      updateCurrentStep, 
      completeResearch, 
      resetResearch 
  } = useChatStore();

  const handleCompletion = useCallback(() => {
      const currentStore = useChatStore.getState();
      if (currentStore.isDeepResearchOpen) {
          currentStore.updateCurrentStep("Hoàn tất xử lý.", 'completed', 'success');
          currentStore.completeResearch();
      }
      setCurrentThought(null);
      setIsLoadingAI(false);
  }, []);

  // Helper: Xử lý text suy nghĩ để tạo step trong Sidebar
  const processThinkingStep = useCallback((text: string) => {
      const keywords = [
          { key: "tìm", title: "Tìm kiếm thông tin & Sản phẩm" },
          { key: "search", title: "Tìm kiếm thông tin & Sản phẩm" },
          { key: "phân tích", title: "Phân tích yêu cầu kỹ thuật" },
          { key: "analyze", title: "Phân tích yêu cầu kỹ thuật" },
          { key: "giá", title: "Tính toán chi phí & Báo giá" },
          { key: "thiết kế", title: "Khởi tạo môi trường thiết kế" },
      ];

      const match = keywords.find(k => text.toLowerCase().includes(k.key));
      if (match) {
          addResearchStep(match.title);
      }
      updateCurrentStep(text, undefined, 'process');
  }, [addResearchStep, updateCurrentStep]);

  // ===================================
  // SOCKET HANDLERS
  // ===================================
  useEffect(() => {
    if (!pusher || !user) return;
    const channelName = `private-user-${user._id}`;
    const channel = pusher.subscribe(channelName);

    // 🔥 HÀM CHUẨN HÓA DỮ LIỆU SOCKET
    const normalizeSocketData = (msg: any): ChatMessage => {
        let finalSenderType = msg.senderType;
        if (!finalSenderType) {
            if (msg.role === 'assistant' || msg.role === 'system') finalSenderType = 'AI';
            else if (msg.role === 'user') finalSenderType = 'User';
            else if (msg.isBot === true) finalSenderType = 'AI';
            else if (msg.isBot === false) finalSenderType = 'User';
        }
        if (finalSenderType?.toUpperCase() === 'AI') finalSenderType = 'AI';
        if (finalSenderType?.toLowerCase() === 'user') finalSenderType = 'User';
        return { ...msg, senderType: finalSenderType };
    };

    // 1. AI Thinking Update
    const handleThinkingUpdate = (data: { icon: string; text: string; type?: string }) => {
        // --- A. Logic Sidebar ---
        if (data.type === 'thinking_done') {
             completeResearch();
             // Không set currentThought = null vội để tránh mất chữ đột ngột
        } else {
             const store = useChatStore.getState();
             if (store.researchSteps.length === 0) {
                 addResearchStep("Khởi tạo tác vụ..."); 
             }
             processThinkingStep(data.text);
             setIsLoadingAI(true);
             setCurrentThought({ icon: data.icon, text: data.text });
        }

        // --- B. 🔥 UPDATE MESSAGE METADATA TRONG LIST (QUAN TRỌNG) ---
        // Cập nhật text suy nghĩ trực tiếp vào tin nhắn đang pending/thinking
        messageState.setMessages((prev) => {
            const lastAiIndex = prev.findLastIndex(m => 
                m.senderType === 'AI' && 
                ((m.metadata as any)?.status === 'thinking' || (m.metadata as any)?.status === 'pending')
            );

            if (lastAiIndex !== -1) {
                const msg = prev[lastAiIndex];
                // Chỉ update nếu text thay đổi để tránh re-render
                if ((msg.metadata as any)?.thinkingText !== data.text) {
                    const updated = [...prev];
                    updated[lastAiIndex] = {
                        ...msg,
                        metadata: {
                            ...(msg.metadata as any),
                            status: 'thinking',
                            thinkingText: data.text, // <--- Key fix: Sync text vào message bubble
                            icon: data.icon
                        }
                    };
                    return updated;
                }
            }
            return prev;
        });
    };

    // 2. Stream Chunk
    const handleStreamChunk = (data: { conversationId: string; text: string }) => {
        if (data.conversationId !== conversationState.currentConversationId) return;
        
        // Nếu đang có research chạy thì hoàn tất nó
        const steps = useChatStore.getState().researchSteps;
        if (steps.some(s => s.status === 'running')) {
            handleCompletion();
        }
        
        setCurrentThought(null);
        setIsLoadingAI(false);

        messageState.setMessages(prev => {
            const lastAiMsgIndex = prev.findLastIndex((msg) => {
              if (msg.senderType !== "AI") return false;
              if (msg.conversationId !== data.conversationId) return false;
              const meta = msg.metadata as any;
              // Chấp nhận cả status thinking chuyển sang streaming
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

    // 3. New Message
    const handleNewMessage = (rawMsg: any) => {
        const socketMessage = normalizeSocketData(rawMsg);
        if (socketMessage.conversationId !== conversationState.currentConversationId) return;
        
        if (socketMessage.senderType === 'AI') {
            handleCompletion();
        }
        
        messageState.setMessages((prev) => {
            const idx = prev.findIndex(m => m._id === socketMessage._id);
            if (idx !== -1) {
                const updated = [...prev];
                updated[idx] = socketMessage;
                return updated;
            }
            return [...prev, socketMessage];
        });
    };

    // 4. Message Updated (Xử lý đồng bộ 2 chiều Sidebar <-> List)
    const handleMessageUpdated = (rawMsg: any) => {
         const updatedMsg = normalizeSocketData(rawMsg); 
         const meta = updatedMsg.metadata as any || {};

         // --- A. LOGIC SIDEBAR & BUBBLE ---
         let computedThinkingText = meta.thinkingText;

         if (updatedMsg.senderType === 'AI' && (meta.status === 'thinking' || meta.thinkingText)) {
             const store = useChatStore.getState();
             
             // Init Sidebar nếu chưa có
             if (store.researchSteps.length === 0) {
                  addResearchStep("Phân tích dữ liệu...");
             }

             // Fallback text nếu null
             if (!computedThinkingText) {
                 const lastStep = store.researchSteps[store.researchSteps.length - 1];
                 computedThinkingText = lastStep ? lastStep.title : "Đang xử lý...";
             }

             // Update Log Sidebar
             const lastStep = store.researchSteps[store.researchSteps.length - 1];
             const lastLog = lastStep?.logs[lastStep.logs.length - 1];
             if (!lastLog || lastLog.text !== computedThinkingText) {
                 updateCurrentStep(computedThinkingText, 'running', 'process');
             }

             setCurrentThought({ icon: meta.icon || "⚡", text: computedThinkingText });
         }

         // --- B. CẬP NHẬT VÀO LIST ---
         messageState.setMessages((prev) => {
            const idx = prev.findIndex(m => m._id === updatedMsg._id);
            if (idx !== -1) {
                const updated = [...prev];
                // Merge metadata cũ + mới + thinkingText tính toán được
                const newMetadata = { 
                    ...(updated[idx].metadata || {}), 
                    ...meta,
                    thinkingText: computedThinkingText 
                };

                updated[idx] = { 
                    ...updated[idx], 
                    ...updatedMsg,
                    metadata: newMetadata
                };
                return updated;
            }
            return prev;
         });
         
         if (updatedMsg.senderType === 'AI' && meta.status === 'sent') {
             handleCompletion();
         }
    };

    channel.bind("ai:thinking:update", handleThinkingUpdate);
    channel.bind("ai:stream:chunk", handleStreamChunk);
    channel.bind("chat:message:new", handleNewMessage);
    channel.bind("ai:message", handleNewMessage);
    channel.bind("chat:message:updated", handleMessageUpdated);

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
    };
  }, [pusher, user, conversationState.currentConversationId, messageState, processThinkingStep, addResearchStep, updateCurrentStep, completeResearch, handleCompletion]);

  // Chỉ update phần onSendText ở cuối file

  // ===================================
  // ACTION: SEND TEXT
  // ===================================
  const onSendText = useCallback(async (text: string, latitude?: number, longitude?: number, type?: any, metadata?: any) => {
    const tempId = uuidv4();
    resetResearch();

    // 1. Optimistic Update (Tạo tin nhắn User)
    messageState.addUserMessage(text, conversationState.currentConversationId, {
      tempId, status: "pending", type, metadata
    });

    // 2. 🔥 FIX: Bật trạng thái loading ngay lập tức
    setIsLoadingAI(true); 
    setCurrentThought({ icon: "⚡", text: "Đang kết nối..." }); 

    try {
      messageState.updateMessageStatus(tempId, "sending");
      const aiResponse = await chatApi.postChatMessage(text, conversationState.currentConversationId, latitude, longitude, type, metadata);
      
      const realId = aiResponse?.newConversation?._id || conversationState.currentConversationId || uuidv4();
      messageState.updateMessageStatus(tempId, "sent", { realId });

      if (aiResponse && !(aiResponse as any)?._id) { 
           handleCompletion();
      }
    } catch (error) {
      messageState.updateMessageStatus(tempId, "error", { error: "Gửi thất bại" });
      handleCompletion();
    }
}, [messageState, conversationState, resetResearch, handleCompletion]);



  return {
    messages: messageState.messages,
    quickReplies: messageState.quickReplies,
    hasMoreMessages: messageState.hasMoreMessages,
    conversations: conversationState.conversations,
    currentConversationId: conversationState.currentConversationId,
    isLoadingAI,
    isChatExpanded,
    setIsChatExpanded,
    currentThought, 
    onSendText,
    onSendQuickReply: async (text: string, payload: string) => onSendText(payload, undefined, undefined, undefined, undefined),
    handleNewChat: conversationState.clearCurrentConversation,
    handleSelectConversation: conversationState.selectConversation,
  };
};