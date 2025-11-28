// apps/customer-frontend/src/features/chat/hooks/useConversationState.ts
import { create } from 'zustand'; // ✅ Dùng Zustand để đồng bộ dữ liệu toàn app
import { ChatConversation } from "@/types/chat";
import * as chatApi from "../services/chat.api.service";

interface ConversationStore {
  conversations: ChatConversation[];
  currentConversationId: string | null;
  isLoadingConversations: boolean;
  
  // Actions
  loadConversations: (filters?: { type?: string }) => Promise<ChatConversation[]>;
  addConversation: (incomingConvo: Partial<ChatConversation>) => void;
  updateConversationTitle: (id: string, newTitle: string) => void;
  removeConversation: (id: string) => void;
  selectConversation: (id: string) => void;
  clearCurrentConversation: () => void;
}

// ✅ CHUYỂN THÀNH GLOBAL STORE (Không phải Hook thường nữa)
export const useConversationState = create<ConversationStore>((set, get) => ({
  conversations: [],
  currentConversationId: null,
  isLoadingConversations: false,

  loadConversations: async (filters) => {
    set({ isLoadingConversations: true });
    try {
      const convos = await chatApi.fetchChatConversations(filters);
      // Sort: Mới nhất lên đầu
      const valid = convos
        .filter(c => c && !c.deletedAt)
        .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
      
      set({ conversations: valid });
      return valid;
    } catch (error) {
      console.error("Failed to load conversations:", error);
      return [];
    } finally {
      set({ isLoadingConversations: false });
    }
  },

  addConversation: (incomingConvo) => {
    set((state) => {
      const prev = state.conversations;
      // Dùng _id hoặc id hoặc conversationId
      const targetId = incomingConvo._id || (incomingConvo as any).id || (incomingConvo as any).conversationId;
      
      const existingIndex = prev.findIndex((c) => c._id === targetId);
      
      let newConversation: ChatConversation;
      let otherConversations = [...prev];

      if (existingIndex !== -1) {
        // Merge data
        newConversation = { ...prev[existingIndex], ...incomingConvo, _id: targetId } as ChatConversation;
        otherConversations.splice(existingIndex, 1);
      } else {
        newConversation = { ...incomingConvo, _id: targetId } as ChatConversation;
      }

      // Move to Top
      return { conversations: [newConversation, ...otherConversations] };
    });
  },

  updateConversationTitle: (id, newTitle) => {
    get().addConversation({ _id: id, title: newTitle });
  },

  removeConversation: (id) => {
    set((state) => ({
      conversations: state.conversations.filter((c) => c._id !== id)
    }));
  },

  selectConversation: (id) => {
    set({ currentConversationId: id });
  },

  clearCurrentConversation: () => {
    set({ currentConversationId: null });
  },
}));