// apps/customer-frontend/src/features/social/hooks/useSocialChatStore.ts
// ✅ FIXED: Frontend Zustand Store (Không chứa code Backend)

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChatConversation, ChatMessage } from "@/types/chat";

interface SocialChatState {
  conversations: ChatConversation[];
  activeConversationId: string | null;
  messagesByConversation: Record<string, ChatMessage[]>;
  unreadCounts: Record<string, number>;
  totalUnread: number;
  typingUsers: Record<string, { userId: string; userName: string }[]>;

  setConversations: (conversations: ChatConversation[]) => void;
  setActiveConversation: (conversationId: string | null) => void;

  setMessages: (conversationId: string, messages: ChatMessage[]) => void;
  addMessage: (conversationId: string, message: ChatMessage) => void;
  updateMessageId: (
    conversationId: string,
    tempId: string,
    realMessage: ChatMessage
  ) => void; // 🔥 Logic thay thế tin nhắn tạm

  markAsRead: (conversationId: string) => void;
  handleSocketMessage: (message: ChatMessage) => void;
  clearAll: () => void;
}

export const useSocialChatStore = create<SocialChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      messagesByConversation: {},
      unreadCounts: {},
      totalUnread: 0,
      typingUsers: {},

      setConversations: (conversations) => set({ conversations }),

      setActiveConversation: (conversationId) => {
        set({ activeConversationId: conversationId });
        if (conversationId) {
          get().markAsRead(conversationId);
        }
      },

      setMessages: (conversationId, apiMessages) =>
        set((state) => {
          // Logic: Merge tin nhắn API với tin đang gửi (status='sending') để không mất tin lạc quan
          const currentMessages =
            state.messagesByConversation[conversationId] || [];
          const sendingMessages = currentMessages.filter(
            (m) => m.status === "sending"
          );

          const msgMap = new Map();
          apiMessages.forEach((m) => msgMap.set(m._id, m));

          // Giữ lại tin đang gửi nếu chưa có trong list API
          sendingMessages.forEach((m) => {
            if (!msgMap.has(m._id)) msgMap.set(m._id, m);
          });

          const mergedMessages = Array.from(msgMap.values()).sort(
            (a, b) =>
              new Date(a.createdAt || 0).getTime() -
              new Date(b.createdAt || 0).getTime()
          );

          return {
            messagesByConversation: {
              ...state.messagesByConversation,
              [conversationId]: mergedMessages,
            },
          };
        }),

      addMessage: (conversationId, message) =>
        set((state) => {
          const existing = state.messagesByConversation[conversationId] || [];
          // Chống trùng lặp ID
          if (existing.some((m) => m._id === message._id)) return state;

          return {
            messagesByConversation: {
              ...state.messagesByConversation,
              [conversationId]: [...existing, message],
            },
          };
        }),

      // 🔥 Hàm thay thế ID tạm bằng tin thật từ Server (Fix Double Send)
      updateMessageId: (conversationId, tempId, realMessage) =>
        set((state) => {
          const currentMsgs =
            state.messagesByConversation[conversationId] || [];
          const updatedMsgs = currentMsgs.map((msg) =>
            msg._id === tempId ? { ...realMessage } : msg
          );

          return {
            messagesByConversation: {
              ...state.messagesByConversation,
              [conversationId]: updatedMsgs,
            },
          };
        }),

      markAsRead: (conversationId) =>
        set((state) => {
          const newCounts = { ...state.unreadCounts };
          delete newCounts[conversationId];
          return {
            unreadCounts: newCounts,
            totalUnread: Object.values(newCounts).reduce((a, b) => a + b, 0),
          };
        }),

      handleSocketMessage: (message: ChatMessage) =>
        set((state) => {
          const { conversationId } = message;

          // 1. Update Messages List
          let newMessagesMap = state.messagesByConversation;
          if (state.messagesByConversation[conversationId]) {
            const currentMsgs = state.messagesByConversation[conversationId];
            if (!currentMsgs.some((m) => m._id === message._id)) {
              newMessagesMap = {
                ...state.messagesByConversation,
                [conversationId]: [...currentMsgs, message],
              };
            }
          }

          // 2. Re-order Conversation List (Đưa lên đầu)
          let newConversations = [...state.conversations];
          const convIndex = newConversations.findIndex(
            (c) => c._id === conversationId
          );

          if (convIndex !== -1) {
            const conv = newConversations[convIndex];
            newConversations.splice(convIndex, 1);
            newConversations.unshift({
              ...conv,
              lastMessageAt: message.createdAt,
            });
          }

          // 3. Update Unread Count
          let newUnreadCounts = state.unreadCounts;
          if (state.activeConversationId !== conversationId) {
            const currentCount = state.unreadCounts[conversationId] || 0;
            newUnreadCounts = {
              ...state.unreadCounts,
              [conversationId]: currentCount + 1,
            };
          }

          return {
            messagesByConversation: newMessagesMap,
            conversations: newConversations,
            unreadCounts: newUnreadCounts,
            totalUnread: Object.values(newUnreadCounts).reduce(
              (a, b) => a + b,
              0
            ),
          };
        }),

      clearAll: () =>
        set({
          conversations: [],
          activeConversationId: null,
          messagesByConversation: {},
          unreadCounts: {},
          totalUnread: 0,
          typingUsers: {},
        }),
    }),
    {
      name: "printz-social-chat",
      partialize: (state) => ({
        conversations: state.conversations,
        unreadCounts: state.unreadCounts,
        totalUnread: state.totalUnread,
        activeConversationId: state.activeConversationId,
      }),
    }
  )
);
