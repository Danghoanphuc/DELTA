// apps/customer-frontend/src/features/chat/stores/useChatStore.ts
import { create, type UseBoundStore, type StoreApi } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { ChatMessage } from '@/types/chat';

// ✅ Định nghĩa lại LogStep thay cho import từ ThinkingConsole (đã xoá)
export interface LogStep {
  id: string;
  text: string;
  // Cho phép một số type phổ biến và fallback string cho tương thích ngược
  type: 'info' | 'process' | 'error' | 'success' | string;
  timestamp: number;
}

export interface ResearchStep {
  id: string;
  title: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  logs: LogStep[];
  timestamp: number;
}

interface ChatState {
  // ... (Giữ nguyên state cũ)
  messagesByConversation: Record<string, ChatMessage[]>;
  isTyping: Record<string, boolean>;
  isDeepResearchOpen: boolean;
  researchSteps: ResearchStep[];
  
  // Actions
  setMessages: (conversationId: string, messages: ChatMessage[]) => void;
  upsertMessage: (message: ChatMessage) => void;
  updateMessageMetadata: (messageId: string, conversationId: string, metadata: any, contentUpdate?: string) => void;
  removeMessage: (messageId: string, conversationId: string) => void;
  
  toggleDeepResearch: (isOpen?: boolean) => void;
  addResearchStep: (title: string) => void;
  updateCurrentStep: (text: string, status?: ResearchStep['status'], type?: string) => void;
  completeResearch: () => void;
  
  // ✅ MỚI: Hàm reset sạch sẽ
  resetResearch: () => void;
}

export const useChatStore: UseBoundStore<StoreApi<ChatState>> = create<ChatState>()(
  immer<ChatState>((set) => ({
    messagesByConversation: {},
    isTyping: {},
    isDeepResearchOpen: false,
    researchSteps: [],

    // ... (Giữ nguyên các hàm setMessages, upsertMessage...)
    setMessages: (conversationId, messages) => 
      set((state) => {
        const uniqueMessages = Array.from(new Map(messages.map(m => [m._id, m])).values());
        uniqueMessages.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
        state.messagesByConversation[conversationId] = uniqueMessages;
      }),

    upsertMessage: (message) => 
      set((state) => {
        const conversationId = message.conversationId;
        if (!conversationId) return;
        if (!state.messagesByConversation[conversationId]) {
            state.messagesByConversation[conversationId] = [];
        }
        const currentMessages = state.messagesByConversation[conversationId];
        const existingIndex = currentMessages.findIndex(m => 
          m._id === message._id || (message.clientSideId && m.clientSideId === message.clientSideId)
        );
        if (existingIndex !== -1) {
          const existingMsg = currentMessages[existingIndex];
          let newContent = existingMsg.content;
          if (message.content) newContent = message.content;
          state.messagesByConversation[conversationId][existingIndex] = {
            ...existingMsg, ...message, content: newContent,
            metadata: { ...existingMsg.metadata, ...(message.metadata || {}) }
          } as ChatMessage;
        } else {
          state.messagesByConversation[conversationId].push(message);
        }
      }),

    updateMessageMetadata: (messageId, conversationId, metadata, contentUpdate) =>
      set((state) => {
        const messages = state.messagesByConversation[conversationId];
        if (!messages) return;
        const msg = messages.find(m => m._id === messageId);
        if (msg) {
          msg.metadata = { ...msg.metadata, ...metadata };
          if (contentUpdate !== undefined) {
             if (typeof msg.content === 'object' && 'text' in msg.content) {
                (msg.content as any).text = contentUpdate;
             }
          }
        }
      }),

    removeMessage: (messageId, conversationId) =>
      set((state) => {
        const messages = state.messagesByConversation[conversationId];
        if (messages) {
          state.messagesByConversation[conversationId] = messages.filter(m => m._id !== messageId);
        }
      }),

    toggleDeepResearch: (isOpen) => 
      set((state) => {
        state.isDeepResearchOpen = isOpen ?? !state.isDeepResearchOpen;
      }),

    // ✅ CẬP NHẬT LOGIC: Reset sạch sẽ nhưng giữ lại cờ nếu cần thiết
    resetResearch: () =>
      set((state) => {
        state.researchSteps = [];
        // Không set isDeepResearchOpen = false ở đây để tránh giật cục
        // Nếu muốn đóng thì gọi toggleDeepResearch(false) riêng
      }),

    // ✅ CẬP NHẬT LOGIC: Cứ thêm step là PHẢI HIỆN (FAIL-SAFE)
    addResearchStep: (title) =>
      set((state) => {
        // 1. Mark previous running steps as completed
        const lastStep = state.researchSteps[state.researchSteps.length - 1];
        if (lastStep && lastStep.status === 'running') {
            lastStep.status = 'completed';
        }
        
        // 2. Add new step
        state.researchSteps.push({
          id: crypto.randomUUID(),
          title,
          status: 'running',
          logs: [],
          timestamp: Date.now(),
        });
        
        // 3. FAIL-SAFE: Luôn bật sidebar khi có step mới
        state.isDeepResearchOpen = true; 
      }),

    updateCurrentStep: (text, status, type = 'info') =>
      set((state) => {
        const currentStep = state.researchSteps[state.researchSteps.length - 1];
        if (currentStep) {
            currentStep.logs.push({
                id: crypto.randomUUID(),
                text,
                type: type as any,
                timestamp: Date.now()
            });
            if (status) currentStep.status = status;
        }
      }),

    completeResearch: () =>
       set((state) => {
         state.researchSteps.forEach(s => {
           if (s.status === 'running') s.status = 'completed';
         });
       }),
  }))
);