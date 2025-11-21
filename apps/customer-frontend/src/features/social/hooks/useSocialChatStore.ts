// apps/customer-frontend/src/features/social/hooks/useSocialChatStore.ts
// ✅ FIXED: Frontend Zustand Store + Info Sidebar State

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

  // ✅ NEW: State cho Info Sidebar (Cột thứ 3)
  isInfoSidebarOpen: boolean;
  toggleInfoSidebar: () => void;
  setInfoSidebarOpen: (isOpen: boolean) => void;

  // ✅ NEW: State cho scroll đến message (dùng cho search)
  scrollToMessageId: string | null;
  setScrollToMessageId: (messageId: string | null) => void;

  setConversations: (conversations: ChatConversation[]) => void;
  syncConversations: (apiConversations: ChatConversation[]) => void; // ✅ NEW: Merge thông minh với API data
  addConversation: (conversation: ChatConversation) => void; // ✅ NEW: Thêm conversation mới
  setActiveConversation: (conversationId: string | null) => void;

  setMessages: (conversationId: string, messages: ChatMessage[]) => void;
  addMessage: (conversationId: string, message: ChatMessage) => void;
  updateMessageId: (
    conversationId: string,
    tempId: string,
    realMessage: ChatMessage
  ) => void;

  markAsRead: (conversationId: string) => void;
  markAllAsRead: () => void; // ✅ NEW: Đánh dấu tất cả là đã đọc
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
      
      // ✅ Init State Sidebar
      isInfoSidebarOpen: true, // Mặc định mở trên Desktop
      toggleInfoSidebar: () => set((state) => ({ isInfoSidebarOpen: !state.isInfoSidebarOpen })),
      setInfoSidebarOpen: (isOpen) => set({ isInfoSidebarOpen: isOpen }),

      // ✅ NEW: State cho scroll đến message
      scrollToMessageId: null,
      setScrollToMessageId: (messageId) => set({ scrollToMessageId: messageId }),

      setConversations: (conversations) => {
        console.debug("[Store] setConversations: Hard overwrite", {
          count: conversations.length,
          ids: conversations.map((c) => c._id),
        });
        set({ conversations });
      },

      // ✅ NEW: Merge thông minh với API data - Giữ lại local-only conversations
      syncConversations: (apiConversations: ChatConversation[]) =>
        set((state) => {
          // ✅ QUAN TRỌNG: Giữ lại activeConversationId để không bị mất
          const preservedActiveId = state.activeConversationId;
          
          const apiIds = new Set(apiConversations.map((c) => c._id));
          const currentIds = new Set(state.conversations.map((c) => c._id));

          // 1. Tìm các conversations "Local Only" (có trong store nhưng không có trong API)
          // Đây có thể là conversations mới tạo chưa được sync với server
          const localOnlyConversations = state.conversations.filter((localConv) => {
            const isLocalOnly = !apiIds.has(localConv._id);
            // Chỉ giữ lại nếu là social chat type
            const isValidType = ["peer-to-peer", "customer-printer", "group"].includes(
              localConv.type || ""
            );
            
            if (isLocalOnly && isValidType) {
              console.debug("[Store] syncConversations: Preserving local-only conversation", {
                id: localConv._id,
                title: localConv.title,
                hasLastMessage: !!localConv.lastMessageAt,
                createdAt: localConv.createdAt,
                isActive: localConv._id === preservedActiveId,
              });
            }
            
            return isLocalOnly && isValidType;
          });

          // 2. Merge: API data + Local-only conversations
          // Ưu tiên API data cho conversations có trong cả hai
          const mergedMap = new Map<string, ChatConversation>();
          
          // Thêm API conversations (source of truth từ server)
          apiConversations.forEach((apiConv) => {
            mergedMap.set(apiConv._id, apiConv);
          });

          // Thêm local-only conversations (chưa có trong API)
          localOnlyConversations.forEach((localConv) => {
            if (!mergedMap.has(localConv._id)) {
              mergedMap.set(localConv._id, localConv);
            }
          });

          const merged = Array.from(mergedMap.values());

          // 3. Sắp xếp theo lastMessageAt (mới nhất trước)
          merged.sort((a, b) => {
            const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
            const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
            if (bTime !== aTime) return bTime - aTime;
            // Nếu không có lastMessageAt, sắp xếp theo createdAt
            return (
              new Date(b.createdAt || 0).getTime() -
              new Date(a.createdAt || 0).getTime()
            );
          });

          // ✅ Đảm bảo activeConversationId không bị mất
          const hasActiveConversation = preservedActiveId 
            ? merged.some((c) => c._id === preservedActiveId)
            : true;

          if (preservedActiveId && !hasActiveConversation) {
            console.warn("[Store] syncConversations: Active conversation not found after merge", {
              activeId: preservedActiveId,
              mergedIds: merged.map((c) => c._id),
            });
          }

          console.debug("[Store] syncConversations: Merge completed", {
            apiCount: apiConversations.length,
            localOnlyCount: localOnlyConversations.length,
            mergedCount: merged.length,
            localOnlyIds: localOnlyConversations.map((c) => c._id),
            activeConversationId: preservedActiveId,
            activeConversationPreserved: hasActiveConversation,
          });

          return { 
            conversations: merged,
            // ✅ Đảm bảo activeConversationId không bị mất
            activeConversationId: preservedActiveId,
          };
        }),

      // ✅ NEW: Thêm conversation mới vào đầu list (nếu chưa có)
      addConversation: (conversation) =>
        set((state) => {
          const exists = state.conversations.find((c) => c._id === conversation._id);
          if (exists) {
            // Update existing conversation
            console.debug("[Store] addConversation: Updating existing", {
              id: conversation._id,
              title: conversation.title,
            });
            return {
              conversations: state.conversations.map((c) =>
                c._id === conversation._id ? conversation : c
              ),
            };
          }
          // Add new conversation to the top
          console.debug("[Store] addConversation: Adding new", {
            id: conversation._id,
            title: conversation.title,
          });
          return {
            conversations: [conversation, ...state.conversations],
          };
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
          if (existing.some((m) => m._id === message._id)) return state;

          return {
            messagesByConversation: {
              ...state.messagesByConversation,
              [conversationId]: [...existing, message],
            },
          };
        }),

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

      // ✅ NEW: Đánh dấu tất cả conversations là đã đọc
      markAllAsRead: () =>
        set({
          unreadCounts: {},
          totalUnread: 0,
        }),

      handleSocketMessage: (message: ChatMessage) =>
        set((state) => {
          const { conversationId } = message;

          // ✅ FIXED: Update messages
          let newMessagesMap = state.messagesByConversation;
          if (state.messagesByConversation[conversationId]) {
            const currentMsgs = state.messagesByConversation[conversationId];
            if (!currentMsgs.some((m) => m._id === message._id)) {
              newMessagesMap = {
                ...state.messagesByConversation,
                [conversationId]: [...currentMsgs, message],
              };
            }
          } else {
            // ✅ NEW: Nếu conversation chưa có messages, tạo mới
            newMessagesMap = {
              ...state.messagesByConversation,
              [conversationId]: [message],
            };
          }

          // ✅ FIXED: Update conversations list
          let newConversations = [...state.conversations];
          const convIndex = newConversations.findIndex(
            (c) => c._id === conversationId
          );

          if (convIndex !== -1) {
            // Conversation đã có, move to top và update lastMessageAt
            const conv = newConversations[convIndex];
            newConversations.splice(convIndex, 1);
            newConversations.unshift({
              ...conv,
              lastMessageAt: message.createdAt,
            });
          } else {
            // ✅ NEW: Conversation chưa có trong list, cần fetch từ API
            // Tạm thời tạo placeholder conversation để hiển thị
            // Component sẽ fetch đầy đủ sau
            const placeholderConv: ChatConversation = {
              _id: conversationId,
              title: "Cuộc trò chuyện mới",
              type: "peer-to-peer", // Default, sẽ được update khi fetch
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              lastMessageAt: message.createdAt,
              participants: [],
            };
            newConversations.unshift(placeholderConv);
          }

          // ✅ FIXED: Update unread counts
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
          isInfoSidebarOpen: true,
        }),
    }),
    {
      name: "printz-social-chat",
      partialize: (state) => ({
        conversations: state.conversations,
        unreadCounts: state.unreadCounts,
        totalUnread: state.totalUnread,
        activeConversationId: state.activeConversationId,
        isInfoSidebarOpen: state.isInfoSidebarOpen,
      }),
    }
  )
);