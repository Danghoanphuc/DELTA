import React, { createContext, useContext, useEffect } from "react";
import { useChat } from "../hooks/useChat";
import * as chatApi from "../services/chat.api.service";
import { useStatusStore } from "@/stores/useStatusStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useConversationState } from "../hooks/useConversationState";

interface ChatContextType {
  messages: any[];
  quickReplies: any[];
  isLoadingAI: boolean;
  conversations: any[];
  currentConversationId: string | null;
  onSendText: (text: string) => void;
  onSendQuickReply: (qr: { text: string; payload?: string }) => void;
  onFileUpload: (file: File) => void;
  handleNewChat: () => void;
  handleSelectConversation: (id: string) => void;
  handleRenameConversation: (id: string, newTitle: string) => Promise<void>;
  handleDeleteConversation: (id: string) => Promise<void>;
  hasMoreMessages: boolean;
  handleLoadMoreMessages: () => void;
  isChatExpanded: boolean;
  setIsChatExpanded: (expanded: boolean) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within ChatProvider");
  }
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const chatLogic = useChat();
  const conversationState = useConversationState();
  const { showStatus } = useStatusStore();
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (accessToken) {
      conversationState
        .loadConversations({ type: "customer-bot" })
        .catch((err) => console.error("Failed to load conversations:", err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const handleRenameConversation = async (id: string, newTitle: string) => {
    conversationState.updateConversationTitle(id, newTitle);
    try {
      await chatApi.renameConversation(id, newTitle);
      showStatus("success", "Đã đổi tên cuộc trò chuyện");
    } catch (error) {
      showStatus("error", "Không thể đổi tên");
      conversationState.loadConversations({ type: "customer-bot" });
    }
  };

  const handleDeleteConversation = async (id: string) => {
    conversationState.removeConversation(id);
    if (conversationState.currentConversationId === id) {
      chatLogic.handleNewChat();
    }
    try {
      const success = await chatApi.deleteConversation(id);
      if (success) {
        showStatus("success", "Đã xóa cuộc trò chuyện");
      } else {
        showStatus("error", "Không thể xóa");
        conversationState.loadConversations({ type: "customer-bot" });
      }
    } catch (error) {
      showStatus("error", "Lỗi khi xóa");
      conversationState.loadConversations({ type: "customer-bot" });
    }
  };

  const contextValue: ChatContextType = {
    ...chatLogic,
    handleRenameConversation,
    handleDeleteConversation,
    handleLoadMoreMessages: chatLogic.loadMoreMessages,
  };

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  );
};
