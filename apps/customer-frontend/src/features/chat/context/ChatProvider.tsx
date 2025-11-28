// apps/customer-frontend/src/features/chat/context/ChatProvider.tsx
import React, { createContext, useContext, useCallback, useState, useEffect } from "react";
import { useStableChat } from "../hooks/useStableChat";
import { useConversationState } from "../hooks/useConversationState";
import { WELCOME_MESSAGE } from "../hooks/useMessageState";
import * as chatApi from "../services/chat.api.service";
import { useStatusStore } from "@/stores/useStatusStore";
import { toast } from "@/shared/utils/toast";
import { useAuthStore } from "@/stores/useAuthStore";

interface ChatContextType {
  messages: any[];
  quickReplies: any[];
  isLoadingAI: boolean;
  conversations: any[];
  currentConversationId: string | null;
  // Cho phép truyền thêm lat/lng trong tương lai, nhưng không bắt buộc
  onSendText: (text: string, lat?: number, lng?: number) => void;
  onSendQuickReply: (text: string, payload: string) => void;
  onFileUpload: (file: File) => void;
  handleNewChat: () => void;
  handleSelectConversation: (id: string) => void;
  handleRenameConversation: (id: string, newTitle: string) => Promise<void>;
  handleDeleteConversation: (id: string) => Promise<void>;
  hasMoreMessages: boolean;
  handleLoadMoreMessages: () => void;
  input: string;
  handleInputChange: (e: any) => void;
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

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const conversationState = useConversationState();
  const stableChat = useStableChat();
  const { showStatus } = useStatusStore();
  const { accessToken } = useAuthStore();
  const [isChatExpanded, setIsChatExpanded] = useState(true);

  // 🔥 FIX: Tải danh sách chat khi App mount hoặc User login
  useEffect(() => {
    if (accessToken) {
      conversationState.loadConversations({ type: 'customer-bot' })
        .catch(err => console.error("Failed to load conversations:", err));
    }
  }, [accessToken]);

  // Handle rename conversation
  const handleRenameConversation = useCallback(async (id: string, newTitle: string) => {
    conversationState.updateConversationTitle(id, newTitle);
    try {
      const success = await chatApi.renameConversation(id, newTitle);
      if (!success) await conversationState.loadConversations({ type: 'customer-bot' });
    } catch (error) {
      await conversationState.loadConversations({ type: 'customer-bot' });
    }
  }, [conversationState]);

  // Handle delete conversation
  const handleDeleteConversation = useCallback(async (id: string) => {
    conversationState.removeConversation(id);
    if (conversationState.currentConversationId === id) conversationState.clearCurrentConversation();
    try {
      const success = await chatApi.deleteConversation(id);
      if (success) showStatus('success', 'Đã xóa cuộc trò chuyện');
      else {
          showStatus('error', 'Không thể xóa');
          await conversationState.loadConversations({ type: 'customer-bot' });
      }
    } catch (error) {
      showStatus('error', 'Lỗi khi xóa');
      await conversationState.loadConversations({ type: 'customer-bot' });
    }
  }, [conversationState, showStatus]);

  const contextValue: ChatContextType = {
    messages: stableChat.messages.length > 0 ? stableChat.messages : [WELCOME_MESSAGE],
    quickReplies: [],
    isLoadingAI: stableChat.isLoading,
    conversations: conversationState.conversations,
    currentConversationId: conversationState.currentConversationId,
    onSendText: stableChat.onSendText,
    onSendQuickReply: (text: string, payload: string) => stableChat.onSendText(payload),
    onFileUpload: () => toast.info("Tính năng gửi file đang được nâng cấp"),
    handleNewChat: conversationState.clearCurrentConversation,
    handleSelectConversation: conversationState.selectConversation,
    handleRenameConversation,
    handleDeleteConversation,
    hasMoreMessages: false,
    handleLoadMoreMessages: () => {},
    input: stableChat.input,
    handleInputChange: stableChat.handleInputChange,
    isChatExpanded,
    setIsChatExpanded,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};