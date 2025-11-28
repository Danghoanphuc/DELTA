// apps/customer-frontend/src/features/chat/hooks/useStableChat.ts
import { useCallback, useEffect, useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useChatStore } from '../stores/useChatStore';
import { useConversationState } from './useConversationState';
import { useAuthStore } from '@/stores/useAuthStore';
import * as chatApi from '../services/chat.api.service';
import { useSocket } from '@/contexts/SocketProvider';
import { ChatMessage } from '@/types/chat';

const EMPTY_MESSAGES: ChatMessage[] = [];

export const useStableChat = () => {
  const { user } = useAuthStore();
  const { currentConversationId, selectConversation } = useConversationState();
  const { pusher } = useSocket();
  
  // --- STORE SELECTORS ---
  const messagesSelector = useCallback((s: ReturnType<typeof useChatStore.getState>) => {
    if (!currentConversationId) return EMPTY_MESSAGES;
    return s.messagesByConversation[currentConversationId] || EMPTY_MESSAGES;
  }, [currentConversationId]);
  
  const messages = useChatStore(messagesSelector);
  
  // Lấy các actions từ Store (Bao gồm cả bộ Deep Research)
  const { 
    upsertMessage, 
    updateMessageMetadata, 
    setMessages,
    addResearchStep,      // ✅ Mới
    updateCurrentStep,    // ✅ Mới
    completeResearch,     // ✅ Mới
    toggleDeepResearch,   // ✅ Mới
    resetResearch         // ✅ Mới
  } = useChatStore();

  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const pendingSwitchId = useRef<string | null>(null);
  
  // Ref quản lý auto-close Sidebar
  const autoCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- HELPER FUNCTIONS ---
  const triggerAutoClose = useCallback(() => {
      if (autoCloseTimeoutRef.current) clearTimeout(autoCloseTimeoutRef.current);
      autoCloseTimeoutRef.current = setTimeout(() => {
          toggleDeepResearch(false);
      }, 4000);
  }, [toggleDeepResearch]);

  const handleCompletion = useCallback(() => {
      const currentStore = useChatStore.getState();
      if (currentStore.isDeepResearchOpen) {
          currentStore.updateCurrentStep("Hoàn tất xử lý.", 'completed', 'success');
          currentStore.completeResearch();
          triggerAutoClose();
      }
      setIsLoading(false);
  }, [triggerAutoClose]);

  // 🔥 HÀM CHUẨN HÓA DỮ LIỆU SOCKET (Copy từ Enterprise qua)
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

  // --- LOAD HISTORY ---
  useEffect(() => {
    if (!currentConversationId) return;
    pendingSwitchId.current = null;
    const loadHistory = async () => {
      const hasMessages = useChatStore.getState().messagesByConversation[currentConversationId]?.length > 0;
      if (!hasMessages) setIsLoading(true);
      try {
        const history = await chatApi.fetchChatHistory(currentConversationId, 1, 50);
        if (history && history.messages) setMessages(currentConversationId, history.messages);
      } catch (e) { console.error("Failed to load history", e); } 
      finally { setIsLoading(false); }
    };
    loadHistory();
  }, [currentConversationId, setMessages]);

  // --- SOCKET LISTENERS (MERGED LOGIC) ---
  useEffect(() => {
    if (!pusher || !user?._id) return;
    const channelName = `private-user-${user._id}`;
    let channel = pusher.channel(channelName);
    if (!channel) channel = pusher.subscribe(channelName);

    // 1. New Message
    const handleNewMessage = (rawMsg: any) => {
        const msg = normalizeSocketData(rawMsg);
        setIsLoading(false);
        const targetId = msg.conversationId;
        if (targetId === currentConversationId || targetId === pendingSwitchId.current) {
            upsertMessage(msg);
        }
        if (msg.senderType === 'AI') handleCompletion(); // ✅ Kết thúc flow nếu tin nhắn về
    };

    // 2. Updated Message (Quan trọng nhất cho Sidebar)
    const handleUpdateMessage = (rawMsg: any) => {
        const msg = normalizeSocketData(rawMsg);
        const targetId = msg.conversationId;
        
        // 2.1 Update tin nhắn gốc
        if (targetId === currentConversationId || targetId === pendingSwitchId.current) {
            upsertMessage(msg);
        }

        // 2.2 Trigger Sidebar Logic (Copy từ Enterprise)
        const meta = msg.metadata as any;
        if (msg.senderType === 'AI' && (meta?.status === 'thinking' || meta?.thinkingText)) {
             const store = useChatStore.getState();
             
             // Lazy Init: Sidebar rỗng -> Tạo bước ngay
             if (store.researchSteps.length === 0) {
                  if (!store.isDeepResearchOpen) toggleDeepResearch(true);
                  addResearchStep("Phân tích dữ liệu...");
             }

             // Update Log
             const newText = meta.thinkingText || meta.stepTitle || "Đang xử lý...";
             const lastStep = store.researchSteps[store.researchSteps.length - 1];
             const lastLog = lastStep?.logs[lastStep.logs.length - 1];
             
             if (!lastLog || lastLog.text !== newText) {
                 updateCurrentStep(newText, 'running', 'process');
             }
        }

        // 2.3 Completion Check
        if (msg.senderType === 'AI' && meta?.status === 'sent') {
            handleCompletion();
        }
    };

    // 3. Stream Chunk
    const handleStreamChunk = (data: any) => {
        setIsLoading(false);
        const targetId = data.conversationId;
        
        // Nếu có stream chữ -> Tắt research (với điều kiện research đang chạy)
        const steps = useChatStore.getState().researchSteps;
        if (steps.some(s => s.status === 'running')) {
            handleCompletion();
        }

        if (targetId === currentConversationId || targetId === pendingSwitchId.current) {
            updateMessageMetadata(data.messageId, targetId, { status: 'streaming' }, data.text);
        }
    };

    // 4. Thinking Update (Direct event)
    const handleThinking = (data: any) => {
       const targetId = data.conversationId;
       if (targetId === currentConversationId || targetId === pendingSwitchId.current) {
         updateMessageMetadata(data.messageId, targetId, { status: 'thinking', icon: data.icon, thinkingText: data.text });
         
         // ✅ Trigger Sidebar từ event này luôn cho chắc
         const store = useChatStore.getState();
         if (store.researchSteps.length === 0) {
              if (!store.isDeepResearchOpen) toggleDeepResearch(true);
              addResearchStep("Khởi tạo tác vụ...");
         }
         updateCurrentStep(data.text, 'running', 'process');
       }
    };

    channel.bind('chat:message:new', handleNewMessage);
    channel.bind('chat:message:updated', handleUpdateMessage);
    channel.bind('ai:stream:chunk', handleStreamChunk);
    channel.bind('ai:thinking:update', handleThinking);

    return () => {
       channel.unbind('chat:message:new', handleNewMessage);
       channel.unbind('chat:message:updated', handleUpdateMessage);
       channel.unbind('ai:stream:chunk', handleStreamChunk);
       channel.unbind('ai:thinking:update', handleThinking);
    };
  }, [pusher, user?._id, currentConversationId, upsertMessage, updateMessageMetadata, handleCompletion, addResearchStep, toggleDeepResearch, updateCurrentStep]);

  // --- SEND MESSAGE ---
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    // ✅ Reset Research khi gửi tin mới
    resetResearch();
    if (autoCloseTimeoutRef.current) clearTimeout(autoCloseTimeoutRef.current);

    const clientSideId = uuidv4(); 
    const tempId = clientSideId;
    const now = new Date().toISOString();
    const effectiveConversationId = currentConversationId; 

    // 1. Optimistic UI: Tạo tin nhắn USER (Giữ lại cái này)
    if (effectiveConversationId) {
      upsertMessage({
        _id: tempId,
        conversationId: effectiveConversationId,
        senderType: 'User',
        sender: user?._id,
        content: { text: content },
        type: 'text',
        createdAt: now,
        metadata: { status: 'pending' },
        clientSideId: clientSideId
      });
    }

    // 2. Set trạng thái Loading & Sticky Bubble
    setIsLoading(true); 
    setInput('');
    
    // 🔥 FIX DOUBLE BUBBLE: XÓA ĐOẠN CODE NÀY ĐI
    // (Chúng ta không add tin nhắn AI giả vào list nữa, mà để Sticky Bubble lo việc hiển thị)

    try {
      const res = await chatApi.postChatMessage(
        content, 
        currentConversationId, 
        undefined, undefined, 'text', {}, undefined, clientSideId
      );

      if (!currentConversationId && res && (res as any).conversationId) {
          const newId = (res as any).conversationId;
          pendingSwitchId.current = newId; 
          if ((res as any).userMessage) upsertMessage((res as any).userMessage);
          selectConversation(newId);
      }
    } catch (error) {
      console.error("Send failed", error);
      if (currentConversationId) updateMessageMetadata(tempId, currentConversationId, { status: 'error' });
      setIsLoading(false);
    }
  }, [currentConversationId, user?._id, upsertMessage, updateMessageMetadata, selectConversation, resetResearch]);

  return {
    messages,
    input,
    setInput,
    sendMessage,
    isLoading,
    handleInputChange: (e: any) => setInput(e.target.value),
    onSendText: sendMessage
  };
};