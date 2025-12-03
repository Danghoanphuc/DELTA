// apps/customer-frontend/src/features/social/hooks/useSocialChatStore.ts
// ✅ FIXED: Logic syncConversations (bỏ việc giữ lại chat đã xóa) & thêm removeConversation

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

  isInfoSidebarOpen: boolean;
  toggleInfoSidebar: () => void;
  setInfoSidebarOpen: (isOpen: boolean) => void;

  scrollToMessageId: string | null;
  setScrollToMessageId: (messageId: string | null) => void;

  setConversations: (conversations: ChatConversation[]) => void;
  syncConversations: (apiConversations: ChatConversation[]) => void;
  addConversation: (conversation: ChatConversation) => void;

  // ✅ NEW: Action xóa cuộc trò chuyện khỏi Store
  removeConversation: (conversationId: string) => void;

  // ✅ NEW: Cập nhật trạng thái Online/Offline cho user trong list chat
  updateParticipantStatus: (userId: string, isOnline: boolean) => void;

  setActiveConversation: (conversationId: string | null) => void;

  setMessages: (conversationId: string, messages: ChatMessage[]) => void;
  addMessage: (conversationId: string, message: ChatMessage) => void;
  updateMessageId: (
    conversationId: string,
    tempId: string,
    realMessage: ChatMessage
  ) => void;

  markAsRead: (conversationId: string) => void;
  markAllAsRead: () => void;
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

      isInfoSidebarOpen: true,
      toggleInfoSidebar: () =>
        set((state) => ({ isInfoSidebarOpen: !state.isInfoSidebarOpen })),
      setInfoSidebarOpen: (isOpen) => set({ isInfoSidebarOpen: isOpen }),

      scrollToMessageId: null,
      setScrollToMessageId: (messageId) =>
        set({ scrollToMessageId: messageId }),

      setConversations: (conversations) => {
        set({ conversations });
      },

      // ✅ FIXED: Sync logic - Trust API as Source of Truth
      // Đã loại bỏ logic "giữ lại localOnly" vì nó gây ra lỗi không thể xóa cuộc trò chuyện
      // ✅ FIXED: Giữ lại lastMessage và lastMessagePreview từ store nếu có (real-time updates)
      syncConversations: (apiConversations: ChatConversation[]) =>
        set((state) => {
          const preservedActiveId = state.activeConversationId;

          // Merge với store để giữ lại lastMessage và lastMessagePreview (real-time từ socket)
          const merged = apiConversations.map((apiConv) => {
            const storeConv = state.conversations.find(
              (c) => c._id === apiConv._id
            );
            if (storeConv) {
              const storeLastMessageAt = storeConv.lastMessageAt
                ? new Date(storeConv.lastMessageAt).getTime()
                : 0;
              const apiLastMessageAt = apiConv.lastMessageAt
                ? new Date(apiConv.lastMessageAt).getTime()
                : 0;

              // Nếu store có lastMessage mới hơn hoặc bằng API, giữ lại lastMessage và lastMessagePreview
              if (
                storeLastMessageAt >= apiLastMessageAt &&
                (storeConv as any).lastMessage
              ) {
                return {
                  ...apiConv,
                  lastMessageAt: storeConv.lastMessageAt,
                  lastMessagePreview: (storeConv as any).lastMessagePreview,
                  lastMessage: (storeConv as any).lastMessage,
                };
              }
            }
            return apiConv;
          });

          // Sắp xếp theo lastMessageAt
          merged.sort((a, b) => {
            const aTime = a.lastMessageAt
              ? new Date(a.lastMessageAt).getTime()
              : 0;
            const bTime = b.lastMessageAt
              ? new Date(b.lastMessageAt).getTime()
              : 0;
            if (bTime !== aTime) return bTime - aTime;
            return (
              new Date(b.createdAt || 0).getTime() -
              new Date(a.createdAt || 0).getTime()
            );
          });

          // Kiểm tra xem active conversation còn tồn tại trong list mới không
          const hasActiveConversation = preservedActiveId
            ? merged.some((c) => c._id === preservedActiveId)
            : false;

          return {
            conversations: merged,
            // Nếu cuộc trò chuyện đang mở bị xóa (không còn trong list API), thì reset activeId
            activeConversationId: hasActiveConversation
              ? preservedActiveId
              : null,
          };
        }),

      addConversation: (conversation) =>
        set((state) => {
          const exists = state.conversations.find(
            (c) => c._id === conversation._id
          );
          if (exists) {
            // Update existing conversation and move to top
            const filtered = state.conversations.filter(
              (c) => c._id !== conversation._id
            );
            return {
              conversations: [conversation, ...filtered],
            };
          }
          // Add new conversation at the top
          return {
            conversations: [conversation, ...state.conversations],
          };
        }),

      // ✅ NEW: Implement removeConversation
      removeConversation: (conversationId) =>
        set((state) => ({
          conversations: state.conversations.filter(
            (c) => c._id !== conversationId
          ),
          // Nếu đang mở cuộc trò chuyện này thì đóng lại
          activeConversationId:
            state.activeConversationId === conversationId
              ? null
              : state.activeConversationId,
        })),

      // ✅ NEW: Cập nhật trạng thái Online/Offline cho participant trong conversations
      updateParticipantStatus: (userId, isOnline) =>
        set((state) => {
          const updatedConversations = state.conversations.map(
            (conversation) => {
              // Kiểm tra xem user này có trong cuộc trò chuyện không
              const hasParticipant = conversation.participants?.some(
                (p: any) => {
                  const pId =
                    typeof p.userId === "string" ? p.userId : p.userId?._id;
                  return pId === userId;
                }
              );

              if (!hasParticipant) return conversation;

              // Cập nhật participant
              const newParticipants = conversation.participants?.map(
                (p: any) => {
                  const pId =
                    typeof p.userId === "string" ? p.userId : p.userId?._id;

                  if (pId === userId) {
                    // Update nested object userId
                    if (typeof p.userId === "string") {
                      // Nếu userId là string, không thể update isOnline trực tiếp
                      // Giữ nguyên hoặc convert sang object (tùy logic của bạn)
                      return p;
                    } else {
                      // userId là object, update isOnline
                      return {
                        ...p,
                        userId: {
                          ...p.userId,
                          isOnline: isOnline,
                        },
                      };
                    }
                  }
                  return p;
                }
              );

              return { ...conversation, participants: newParticipants };
            }
          );

          return { conversations: updatedConversations };
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

      markAllAsRead: () =>
        set({
          unreadCounts: {},
          totalUnread: 0,
        }),

      handleSocketMessage: (message: ChatMessage) =>
        set((state) => {
          const { conversationId } = message;

          // Update messages
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
            newMessagesMap = {
              ...state.messagesByConversation,
              [conversationId]: [message],
            };
          }

          // Update conversations list (Move to top)
          let newConversations = [...state.conversations];
          const convIndex = newConversations.findIndex(
            (c) => c._id === conversationId
          );

          if (convIndex !== -1) {
            const conv = newConversations[convIndex];
            newConversations.splice(convIndex, 1);

            // Tạo preview text từ message
            let previewText = "";
            if (message.type === "system") {
              previewText =
                message.content?.text || "Đã cập nhật thông tin nhóm";
            } else if (
              message.type === "image" ||
              (message.content as any)?.attachments?.some(
                (a: any) => a.type === "image"
              )
            ) {
              previewText = "📷 Đã gửi ảnh";
            } else if (
              message.type === "file" ||
              (message.content as any)?.attachments?.length > 0
            ) {
              const attachments = (message.content as any)?.attachments || [];
              const fileCount = attachments.length;
              previewText =
                fileCount > 1
                  ? `📎 ${fileCount} tệp đính kèm`
                  : `📎 ${attachments[0]?.originalName || "Tệp đính kèm"}`;
            } else if (
              message.content &&
              "text" in message.content &&
              typeof message.content.text === "string"
            ) {
              previewText = message.content.text;
              if (previewText.length > 50) {
                previewText = previewText.substring(0, 50) + "...";
              }
            } else {
              previewText = "Tin nhắn";
            }

            newConversations.unshift({
              ...conv,
              lastMessageAt: message.createdAt,
              lastMessagePreview: previewText,
              lastMessage: message, // Lưu cả message object để dùng sau
            });
          } else {
            // Nếu chưa có conversation (có thể do sync chậm), tạm thời fetch sau
            // (Logic fetch thực tế nằm ở Component Listener)
          }

          // Update unread counts
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
