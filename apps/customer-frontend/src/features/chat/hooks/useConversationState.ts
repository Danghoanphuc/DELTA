// apps/customer-frontend/src/features/chat/hooks/useConversationState.ts
import { create } from "zustand";
import { ChatConversation } from "@/types/chat";
import * as chatApi from "../services/chat.api.service";

interface ConversationStore {
  conversations: ChatConversation[];
  currentConversationId: string | null;
  isLoadingConversations: boolean;
  loadConversations: (filters?: {
    type?: string;
  }) => Promise<ChatConversation[]>;
  addConversation: (incomingConvo: Partial<ChatConversation>) => void;
  updateConversationTitle: (id: string, newTitle: string) => void;
  removeConversation: (id: string) => void;
  selectConversation: (id: string) => void;
  clearCurrentConversation: () => void;
}

// 🔥 FIX: Utility function để cắt ngắn và làm sạch tiêu đề
const sanitizeAndShortenTitle = (
  title?: string | null,
  maxLength = 80
): string => {
  if (!title) return "Đoạn chat mới";

  // 1. Loại bỏ các ký tự Markdown cơ bản (heading, list, hyphen/dash đầu dòng)
  let cleanTitle = title
    .replace(/^[#*-]\s*/gm, "") // Loại bỏ #, *, - ở đầu dòng
    .replace(/###\s*|\*\*|\*\s*/g, " ") // Loại bỏ ###, **, * giữa chừng
    .trim();

  // 2. Cắt ngắn nếu quá dài
  if (cleanTitle.length > maxLength) {
    cleanTitle = cleanTitle.substring(0, maxLength).trim() + "...";
  }

  // 3. Đảm bảo title không quá rỗng sau khi làm sạch
  if (!cleanTitle) return "Đoạn chat mới";

  return cleanTitle;
};

export const useConversationState = create<ConversationStore>((set, get) => ({
  conversations: [],
  currentConversationId: null,
  isLoadingConversations: false,

  loadConversations: async (filters) => {
    set({ isLoadingConversations: true });
    try {
      const convos = await chatApi.fetchChatConversations(filters);
      // Sort chuẩn xác
      const valid = convos
        .filter((c) => c && !c.deletedAt)
        .sort(
          (a, b) =>
            new Date(b.updatedAt || 0).getTime() -
            new Date(a.updatedAt || 0).getTime()
        );

      // ✅ Áp dụng làm sạch và cắt ngắn title khi tải lịch sử
      const sanitizedValid = valid.map((c) => ({
        ...c,
        title: sanitizeAndShortenTitle(c.title || c.lastMessage?.content?.text), // Thử dùng lastMessage nếu title rỗng
      })) as ChatConversation[];

      set({ conversations: sanitizedValid });
      return sanitizedValid;
    } catch (error) {
      console.error("Failed to load conversations:", error);
      return [];
    } finally {
      set({ isLoadingConversations: false });
    }
  },

  addConversation: (incomingConvo) => {
    set((state) => {
      // 🔥 FIX: Chuẩn hóa ID cực kỹ để tránh Sidebar không hiện
      const targetId =
        incomingConvo._id ||
        (incomingConvo as any).id ||
        (incomingConvo as any).conversationId;
      if (!targetId) return state;

      const prev = state.conversations;
      const index = prev.findIndex((c) => c._id === targetId);

      let newConvo: ChatConversation;

      // Tự động tìm title nếu backend quên gửi
      const inferredTitle = sanitizeAndShortenTitle(
        incomingConvo.title || (incomingConvo as any).lastMessage?.content?.text // Thử dùng lastMessage
      );

      if (index !== -1) {
        // Merge & Move to top
        newConvo = {
          ...prev[index],
          ...incomingConvo,
          _id: targetId,
          // Sử dụng inferredTitle nếu title của incomingConvo rỗng hoặc là lỗi
          title: inferredTitle,
        } as ChatConversation;
        const others = prev.filter((c) => c._id !== targetId);
        return { conversations: [newConvo, ...others] };
      } else {
        // Create New & Move to top
        newConvo = {
          title: inferredTitle,
          ...incomingConvo,
          _id: targetId,
          createdAt: incomingConvo.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(), // Force mới nhất
        } as ChatConversation;
        return { conversations: [newConvo, ...prev] };
      }
    });
  },

  updateConversationTitle: (id, newTitle) => {
    // Không cần cắt ngắn title khi user tự đổi tên
    get().addConversation({ _id: id, title: newTitle });
  },

  removeConversation: (id) => {
    set((state) => ({
      conversations: state.conversations.filter((c) => c._id !== id),
    }));
  },

  selectConversation: (id) => {
    set({ currentConversationId: id });
  },

  clearCurrentConversation: () => {
    set({ currentConversationId: null });
  },
}));
