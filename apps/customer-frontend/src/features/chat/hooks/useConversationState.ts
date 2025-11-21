// src/features/chat/hooks/useConversationState.ts
// Tách logic quản lý conversations thành custom hook

import { useState, useCallback } from "react";
import { ChatConversation } from "@/types/chat";
import * as chatApi from "../services/chat.api.service";

export const useConversationState = () => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    try {
      const convos = await chatApi.fetchChatConversations();
      // ✅ FIXED: Chỉ lấy conversations của chat bot (customer-bot)
      const botConversations = convos.filter(
        (c) => c.type === "customer-bot" || !c.type // Fallback cho conversations cũ chưa có type
      );
      setConversations(botConversations.reverse());
      return botConversations;
    } catch (error) {
      console.error("Failed to load conversations:", error);
      return [];
    }
  }, []);

  const addConversation = useCallback((conversation: ChatConversation) => {
    setConversations((prev) => [conversation, ...prev]);
  }, []);

  const updateConversationTitle = useCallback((id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c._id === id ? { ...c, title: newTitle } : c))
    );
  }, []);

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
    loadConversations,
    addConversation,
    updateConversationTitle,
    removeConversation,
    selectConversation,
    clearCurrentConversation,
  };
};
