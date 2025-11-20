// apps/customer-frontend/src/features/social/hooks/useSocialChatStore.ts
// ✅ FIXED: Persist activeConversationId (Lưu trạng thái chat khi F5/Hard Refresh)

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
  addConversation: (conversation: ChatConversation) => void;
  setActiveConversation: (conversationId: string | null) => void;
  setMessages: (conversationId: string, messages: ChatMessage[]) => void;
  addMessage: (conversationId: string, message: ChatMessage) => void;
  markAsRead: (conversationId: string) => void;
  setTyping: (
    conversationId: string,
    userId: string,
    userName: string,
    isTyping: boolean
  ) => void;
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

      addConversation: (conversation) =>
        set((state) => {
          if (state.conversations.some((c) => c._id === conversation._id))
            return state;
          return { conversations: [conversation, ...state.conversations] };
        }),

      setActiveConversation: (conversationId) => {
        set({ activeConversationId: conversationId });
        if (conversationId) {
          get().markAsRead(conversationId);
        }
      },

      setMessages: (conversationId, apiMessages) =>
        set((state) => {
          const currentMessages =
            state.messagesByConversation[conversationId] || [];
          const msgMap = new Map(currentMessages.map((m) => [m._id, m]));
          apiMessages.forEach((m) => msgMap.set(m._id, m));
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
          if (existing.some((m) => m._id === message._id)) return state;
          return {
            messagesByConversation: {
              ...state.messagesByConversation,
              [conversationId]: [...existing, message],
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

      setTyping: (conversationId, userId, userName, isTyping) =>
        set((state) => {
          const current = state.typingUsers[conversationId] || [];
          let updated = isTyping
            ? current.some((u) => u.userId === userId)
              ? current
              : [...current, { userId, userName }]
            : current.filter((u) => u.userId !== userId);
          return {
            typingUsers: { ...state.typingUsers, [conversationId]: updated },
          };
        }),

      handleSocketMessage: (message: ChatMessage) =>
        set((state) => {
          const { conversationId } = message;

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
        activeConversationId: state.activeConversationId, // ✅ ĐÃ THÊM DÒNG NÀY
      }),
    }
  )
);
