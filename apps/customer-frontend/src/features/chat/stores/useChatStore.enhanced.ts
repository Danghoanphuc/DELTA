// apps/customer-frontend/src/features/chat/stores/useChatStore.enhanced.ts
/**
 * 🔥 ENHANCED CHAT STORE - WITH ERROR HANDLING & RETRY
 * Store mới với đầy đủ tính năng enterprise
 */

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { ChatMessage } from "@/types/chat";

interface EnhancedChatState {
  // Messages by conversation
  messagesByConversation: Record<string, ChatMessage[]>;

  // Failed messages (để hiển thị retry UI)
  failedMessages: Record<string, ChatMessage[]>;

  // Optimistic messages (đang gửi)
  optimisticMessages: Record<string, ChatMessage[]>;

  // Typing indicators
  isTyping: Record<string, boolean>;
  typingUsers: Record<string, string[]>; // conversationId -> userIds[]

  // Unread counts
  unreadCounts: Record<string, number>;

  // ===== BASIC ACTIONS =====
  setMessages: (conversationId: string, messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  updateMessage: (
    messageId: string,
    conversationId: string,
    updates: Partial<ChatMessage>
  ) => void;
  removeMessage: (messageId: string, conversationId: string) => void;

  // ===== OPTIMISTIC UI =====
  addOptimisticMessage: (conversationId: string, message: ChatMessage) => void;
  confirmOptimisticMessage: (
    conversationId: string,
    tempId: string,
    realMessage: ChatMessage
  ) => void;

  // ===== ERROR HANDLING =====
  markMessageAsFailed: (
    conversationId: string,
    messageId: string,
    error: string,
    errorCode?: string
  ) => void;
  retryFailedMessage: (conversationId: string, messageId: string) => void;
  removeFailedMessage: (conversationId: string, messageId: string) => void;
  clearFailedMessages: (conversationId: string) => void;

  // ===== TYPING INDICATORS =====
  setTyping: (conversationId: string, isTyping: boolean) => void;
  addTypingUser: (
    conversationId: string,
    userId: string,
    userName?: string
  ) => void;
  removeTypingUser: (conversationId: string, userId: string) => void;

  // ===== UNREAD COUNTS =====
  incrementUnread: (conversationId: string) => void;
  markAsRead: (conversationId: string) => void;
  setUnreadCount: (conversationId: string, count: number) => void;

  // ===== UTILITIES =====
  getMessageById: (
    conversationId: string,
    messageId: string
  ) => ChatMessage | undefined;
  getAllMessages: (conversationId: string) => ChatMessage[]; // Bao gồm cả optimistic & failed
  clearConversation: (conversationId: string) => void;
}

export const useEnhancedChatStore: any = create<EnhancedChatState>()(
  immer((set, get) => ({
    messagesByConversation: {},
    failedMessages: {},
    optimisticMessages: {},
    isTyping: {},
    typingUsers: {},
    unreadCounts: {},

    // ===== BASIC ACTIONS =====
    setMessages: (conversationId, messages) =>
      set((state) => {
        const uniqueMessages = Array.from(
          new Map(messages.map((m) => [m._id, m])).values()
        );
        uniqueMessages.sort(
          (a, b) =>
            new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime()
        );
        state.messagesByConversation[conversationId] = uniqueMessages;
      }),

    addMessage: (message) =>
      set((state) => {
        const conversationId = message.conversationId;
        if (!conversationId) return;

        if (!state.messagesByConversation[conversationId]) {
          state.messagesByConversation[conversationId] = [];
        }

        const currentMessages = state.messagesByConversation[conversationId];
        const existingIndex = currentMessages.findIndex(
          (m) =>
            m._id === message._id ||
            (message.clientSideId && m.clientSideId === message.clientSideId)
        );

        if (existingIndex !== -1) {
          // Update existing
          const existingMsg = currentMessages[existingIndex];
          state.messagesByConversation[conversationId][existingIndex] = {
            ...existingMsg,
            ...message,
            content: message.content || existingMsg.content,
            metadata: {
              ...existingMsg.metadata,
              ...(message.metadata || {}),
            },
          } as ChatMessage;
        } else {
          // Add new
          state.messagesByConversation[conversationId].push(message);
        }
      }),

    updateMessage: (messageId, conversationId, updates) =>
      set((state) => {
        const messages = state.messagesByConversation[conversationId];
        if (!messages) return;

        const index = messages.findIndex(
          (m) => m._id === messageId || m.clientSideId === messageId
        );
        if (index !== -1) {
          messages[index] = { ...messages[index], ...updates } as any;
        }
      }),

    removeMessage: (messageId, conversationId) =>
      set((state) => {
        const messages = state.messagesByConversation[conversationId];
        if (messages) {
          state.messagesByConversation[conversationId] = messages.filter(
            (m) => m._id !== messageId && m.clientSideId !== messageId
          );
        }
      }),

    // ===== OPTIMISTIC UI =====
    addOptimisticMessage: (conversationId, message) =>
      set((state) => {
        if (!state.optimisticMessages[conversationId]) {
          state.optimisticMessages[conversationId] = [];
        }
        state.optimisticMessages[conversationId].push({
          ...message,
          status: "sending",
        });
      }),

    confirmOptimisticMessage: (conversationId, tempId, realMessage) =>
      set((state) => {
        // Remove from optimistic
        if (state.optimisticMessages[conversationId]) {
          state.optimisticMessages[conversationId] = state.optimisticMessages[
            conversationId
          ].filter((m) => m._id !== tempId && m.clientSideId !== tempId);
        }

        // Add to real messages
        if (!state.messagesByConversation[conversationId]) {
          state.messagesByConversation[conversationId] = [];
        }
        state.messagesByConversation[conversationId].push({
          ...realMessage,
          status: "sent",
        });
      }),

    // ===== ERROR HANDLING =====
    markMessageAsFailed: (conversationId, messageId, error, errorCode) =>
      set((state) => {
        // Remove from optimistic
        if (state.optimisticMessages[conversationId]) {
          const failedMsg = state.optimisticMessages[conversationId].find(
            (m) => m._id === messageId || m.clientSideId === messageId
          );

          if (failedMsg) {
            // Move to failed messages
            if (!state.failedMessages[conversationId]) {
              state.failedMessages[conversationId] = [];
            }
            state.failedMessages[conversationId].push({
              ...failedMsg,
              status: "failed",
              error,
              errorCode,
            });

            // Remove from optimistic
            state.optimisticMessages[conversationId] = state.optimisticMessages[
              conversationId
            ].filter(
              (m) => m._id !== messageId && m.clientSideId !== messageId
            );
          }
        }

        // Also check in regular messages
        const messages = state.messagesByConversation[conversationId];
        if (messages) {
          const index = messages.findIndex(
            (m) => m._id === messageId || m.clientSideId === messageId
          );
          if (index !== -1) {
            messages[index] = {
              ...messages[index],
              status: "failed",
              error,
              errorCode,
            };
          }
        }
      }),

    retryFailedMessage: (conversationId, messageId) =>
      set((state) => {
        const failedMsgs = state.failedMessages[conversationId];
        if (!failedMsgs) return;

        const index = failedMsgs.findIndex(
          (m) => m._id === messageId || m.clientSideId === messageId
        );
        if (index !== -1) {
          const msg = failedMsgs[index];
          // Move back to optimistic
          if (!state.optimisticMessages[conversationId]) {
            state.optimisticMessages[conversationId] = [];
          }
          state.optimisticMessages[conversationId].push({
            ...msg,
            status: "retrying",
            retryCount: (msg.retryCount || 0) + 1,
            lastRetryAt: new Date().toISOString(),
          });

          // Remove from failed
          failedMsgs.splice(index, 1);
        }
      }),

    removeFailedMessage: (conversationId, messageId) =>
      set((state) => {
        const failedMsgs = state.failedMessages[conversationId];
        if (failedMsgs) {
          state.failedMessages[conversationId] = failedMsgs.filter(
            (m) => m._id !== messageId && m.clientSideId !== messageId
          );
        }
      }),

    clearFailedMessages: (conversationId) =>
      set((state) => {
        state.failedMessages[conversationId] = [];
      }),

    // ===== TYPING INDICATORS =====
    setTyping: (conversationId, isTyping) =>
      set((state) => {
        state.isTyping[conversationId] = isTyping;
      }),

    addTypingUser: (conversationId, userId, userName) =>
      set((state) => {
        if (!state.typingUsers[conversationId]) {
          state.typingUsers[conversationId] = [];
        }
        if (!state.typingUsers[conversationId].includes(userId)) {
          state.typingUsers[conversationId].push(userId);
        }
      }),

    removeTypingUser: (conversationId, userId) =>
      set((state) => {
        if (state.typingUsers[conversationId]) {
          state.typingUsers[conversationId] = state.typingUsers[
            conversationId
          ].filter((id) => id !== userId);
        }
      }),

    // ===== UNREAD COUNTS =====
    incrementUnread: (conversationId) =>
      set((state) => {
        state.unreadCounts[conversationId] =
          (state.unreadCounts[conversationId] || 0) + 1;
      }),

    markAsRead: (conversationId) =>
      set((state) => {
        state.unreadCounts[conversationId] = 0;
      }),

    setUnreadCount: (conversationId, count) =>
      set((state) => {
        state.unreadCounts[conversationId] = count;
      }),

    // ===== UTILITIES =====
    getMessageById: (conversationId, messageId) => {
      const state = get();
      const messages = state.messagesByConversation[conversationId] || [];
      return messages.find(
        (m) => m._id === messageId || m.clientSideId === messageId
      );
    },

    getAllMessages: (conversationId) => {
      const state = get();
      const regular = state.messagesByConversation[conversationId] || [];
      const optimistic = state.optimisticMessages[conversationId] || [];
      const failed = state.failedMessages[conversationId] || [];
      return [...regular, ...optimistic, ...failed];
    },

    clearConversation: (conversationId) =>
      set((state) => {
        delete state.messagesByConversation[conversationId];
        delete state.optimisticMessages[conversationId];
        delete state.failedMessages[conversationId];
        delete state.isTyping[conversationId];
        delete state.typingUsers[conversationId];
        delete state.unreadCounts[conversationId];
      }),
  }))
);
