// src/features/chat/hooks/useConversationState.ts
import { useState, useCallback } from "react";
import { ChatConversation } from "@/types/chat";
import * as chatApi from "../services/chat.api.service";

export const useConversationState = () => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);

  // ✅ LOAD WITH FILTERS (Giữ logic Bot/Social)
  const loadConversations = useCallback(async (filters?: { type?: string }) => {
    setIsLoadingConversations(true);
    try {
      const convos = await chatApi.fetchChatConversations(filters);
      const valid = convos
        .filter(c => c && !c.deletedAt)
        .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
      
      setConversations(valid);
      return valid;
    } catch (error) {
      console.error("Failed to load conversations:", error);
      return [];
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  // ✅ SAFE UPSERT & MERGE
  const addConversation = useCallback((incomingConvo: Partial<ChatConversation>) => {
    setConversations((prev) => {
      const existingIndex = prev.findIndex((c) => c._id === incomingConvo._id);
      
      let newConversation: ChatConversation;
      let otherConversations = [...prev];

      if (existingIndex !== -1) {
        // Merge: Giữ lại dữ liệu gốc (quan trọng nhất là createdAt)
        newConversation = { ...prev[existingIndex], ...incomingConvo } as ChatConversation;
        otherConversations.splice(existingIndex, 1);
      } else {
        newConversation = incomingConvo as ChatConversation;
      }

      // Move to Top
      return [newConversation, ...otherConversations];
    });
  }, []);

  const updateConversationTitle = useCallback((id: string, newTitle: string) => {
    addConversation({ _id: id, title: newTitle });
  }, [addConversation]);

  const removeConversation = useCallback((id: string) => {
    setConversations((prev) => prev.filter((c) => c._id !== id));
  }, []);

  const selectConversation = useCallback((id: string) => {
    setCurrentConversationId(id);
  }, []);

  const clearCurrentConversation = useCallback(() => {
    setCurrentConversationId(null);
  }, []);

  return {
    conversations,
    currentConversationId,
    isLoadingConversations,
    loadConversations,
    addConversation,
    updateConversationTitle,
    removeConversation,
    selectConversation,
    clearCurrentConversation,
  };
};