import { useState, useCallback } from "react";
import { useMessageState } from "./useMessageState";
import { useConversationState } from "./useConversationState";
import { useChatSender } from "./useChatSender";
import { useChatSync } from "./useChatSync";

const DEFAULT_QUICK_REPLIES = [
  { text: "Tìm sản phẩm", payload: "Tìm kiếm sản phẩm nào đó" },
  { text: "Báo giá nhanh", payload: "Báo giá sản phẩm" },
  { text: "Liên hệ hỗ trợ", payload: "Tôi cần nói chuyện với người thật" },
];

export const useChat = () => {
  const [isChatExpanded, setIsChatExpanded] = useState(false);

  const messageState = useMessageState();
  const conversationState = useConversationState();
  const chatSender = useChatSender();

  useChatSync();

  const onSendText = useCallback(
    async (text: string) => {
      await chatSender.onSendText(text);
    },
    [chatSender]
  );

  const onSendQuickReply = useCallback(
    (text: string, payload: string) => {
      onSendText(payload || text);
    },
    [onSendText]
  );

  const handleNewChat = useCallback(() => {
    const id = `temp_conv_${Date.now()}`;
    messageState.resetState();
    conversationState.selectConversation(id);
  }, [conversationState, messageState]);

  const handleSelectConversation = useCallback(
    async (id: string) => {
      if (!id || id.startsWith("temp")) {
        conversationState.selectConversation(id);
        messageState.resetState();
        return;
      }

      conversationState.selectConversation(id);
      messageState.setLoadingHistory(true);

      try {
        const { fetchChatMessages } = await import(
          "../services/chat.api.service"
        );
        const messages = await fetchChatMessages(id);
        messageState.setMessages(messages);
      } catch (error) {
        console.error("[useChat] Failed to load messages:", error);
      } finally {
        messageState.setLoadingHistory(false);
      }
    },
    [conversationState, messageState]
  );

  return {
    messages: messageState.messages,
    quickReplies:
      messageState.quickReplies.length > 0
        ? messageState.quickReplies
        : DEFAULT_QUICK_REPLIES,
    isLoadingAI: messageState.isGenerating || messageState.isLoadingHistory,
    isChatExpanded,
    setIsChatExpanded,
    onSendText,
    onSendQuickReply,
    onFileUpload: chatSender.onFileUpload,
    handleNewChat,
    handleSelectConversation,
    conversations: conversationState.conversations,
    currentConversationId: conversationState.currentConversationId,
    hasMoreMessages: false,
    loadMoreMessages: async () => {
      console.warn("loadMoreMessages not implemented yet");
    },
  };
};

export default useChat;
