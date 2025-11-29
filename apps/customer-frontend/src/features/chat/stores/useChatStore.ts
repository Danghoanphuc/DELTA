// apps/customer-frontend/src/features/chat/stores/useChatStore.ts
import { create, type UseBoundStore, type StoreApi } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { ChatMessage } from '@/types/chat';

interface ChatState {
  messagesByConversation: Record<string, ChatMessage[]>;
  isTyping: Record<string, boolean>;
  
  // Actions cơ bản
  setMessages: (conversationId: string, messages: ChatMessage[]) => void;
  upsertMessage: (message: ChatMessage) => void;
  updateMessageMetadata: (messageId: string, conversationId: string, metadata: any, contentUpdate?: string) => void;
  removeMessage: (messageId: string, conversationId: string) => void;
  
  // ❌ ĐÃ XÓA: Toàn bộ logic DeepResearch, LogStep
}

export const useChatStore: UseBoundStore<StoreApi<ChatState>> = create<ChatState>()(
  immer<ChatState>((set) => ({
    messagesByConversation: {},
    isTyping: {},

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
  }))
);