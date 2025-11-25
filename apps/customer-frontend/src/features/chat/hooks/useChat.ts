// src/features/chat/hooks/useChat.ts (REFACTORED - Clean Architecture)
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { AiApiResponse, ChatMessage, TextMessage } from "@/types/chat";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSocket } from "@/contexts/SocketProvider";
import * as chatApi from "../services/chat.api.service";

// Import custom hooks
import { useMessageState, WELCOME_ID } from "./useMessageState";
import { useConversationState } from "./useConversationState";

export { WELCOME_ID };

export const useChat = () => {
  // State management hooks
  const messageState = useMessageState();
  const conversationState = useConversationState();

  // UI state
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(true);
  const accessToken = useAuthStore((s) => s.accessToken);
  const socket = useSocket();

  // Load conversations on auth change
  const { loadConversations, clearCurrentConversation, currentConversationId } = conversationState;
  const { resetToWelcome, messages } = messageState;

  // Effect 1: Reset state when user logs out
  // ✅ FIX: Removed 'messages' from dependencies to prevent infinite loop
  // We only need to check message count/type, not react to every message change
  useEffect(() => {
    if (!accessToken) {
      const isWelcome = messages.length === 1 && messages[0]._id === WELCOME_ID;
      const hasConversation = !!currentConversationId;
      
      if (!isWelcome || hasConversation) {
        if (hasConversation) clearCurrentConversation();
        if (!isWelcome) resetToWelcome();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, currentConversationId]);

  // Effect 2: Load conversations when user logs in
  useEffect(() => {
    if (accessToken) {
      loadConversations();
    }
  }, [accessToken, loadConversations]);

  // Effect 3: Socket listener for real-time messages (URL preview, AI responses, etc.)
  useEffect(() => {
    if (!socket?.socket || !socket.isConnected) return;

    console.log("[useChat] ✅ Setting up socket listeners for real-time messages");

    // Handler for new messages from socket (URL preview worker, AI responses, etc.)
    const handleNewMessage = (socketMessage: any) => {
      try {
        console.log("[useChat] 🔔 Received socket message:", {
          messageId: socketMessage._id,
          conversationId: socketMessage.conversationId,
          senderType: socketMessage.senderType,
          type: socketMessage.type,
        });

        // ✅ Chỉ nhận messages cho conversation hiện tại
        if (
          socketMessage.conversationId &&
          conversationState.currentConversationId &&
          socketMessage.conversationId !== conversationState.currentConversationId
        ) {
          console.log(
            `[useChat] ⏭️ Skipping message - different conversation. Current: ${conversationState.currentConversationId}, Message: ${socketMessage.conversationId}`
          );
          return;
        }

        // ✅ Kiểm tra message đã tồn tại chưa (tránh duplicate)
        const exists = messageState.messages.some((msg) => msg._id === socketMessage._id);
        if (exists) {
          console.log(`[useChat] ⏭️ Message ${socketMessage._id} already exists, skipping...`);
          return;
        }

        // ✅ Convert socket message format sang ChatMessage format
        let chatMessage: ChatMessage;

        if (socketMessage.type === "text") {
          // ✅ Text message (có thể có fileUrl từ URL preview)
          chatMessage = {
            _id: socketMessage._id,
            senderType: socketMessage.senderType || "AI",
            sender: socketMessage.sender || null,
            type: "text",
            conversationId: socketMessage.conversationId?.toString() || conversationState.currentConversationId || "",
            content: socketMessage.content || { text: "" },
            metadata: socketMessage.metadata || null,
            createdAt: socketMessage.createdAt || new Date().toISOString(),
            updatedAt: socketMessage.updatedAt || new Date().toISOString(),
          } as TextMessage;
        } else {
          // ✅ Fallback cho các loại message khác
          console.warn(`[useChat] ⚠️ Unknown message type: ${socketMessage.type}, using text type`);
          chatMessage = {
            _id: socketMessage._id,
            senderType: socketMessage.senderType || "AI",
            sender: socketMessage.sender || null,
            type: "text",
            conversationId: socketMessage.conversationId?.toString() || conversationState.currentConversationId || "",
            content: socketMessage.content || { text: "" },
            metadata: socketMessage.metadata || null,
            createdAt: socketMessage.createdAt || new Date().toISOString(),
            updatedAt: socketMessage.updatedAt || new Date().toISOString(),
          } as TextMessage;
        }

        // ✅ Thêm message vào state
        console.log(`[useChat] ✅ Adding message ${chatMessage._id} to conversation ${chatMessage.conversationId}`);
        messageState.setMessages((prev: ChatMessage[]) => {
          // Kiểm tra lại tránh duplicate trong cùng một render cycle
          const alreadyExists = prev.some((msg) => msg._id === chatMessage._id);
          if (alreadyExists) {
            console.log(`[useChat] ⏭️ Message ${chatMessage._id} already in state, skipping...`);
            return prev;
          }
          return [...prev, chatMessage];
        });

        // ✅ Tắt loading khi nhận được message (có thể đang chờ AI response)
        setIsLoadingAI(false);

        console.log(`[useChat] ✅ Message ${chatMessage._id} added successfully`);
      } catch (error: any) {
        console.error("[useChat] ❌ Error processing socket message:", error);
        console.error("[useChat] Error details:", {
          message: error?.message,
          stack: error?.stack,
          socketMessage,
        });
      }
    };

    // ✅ Listen cho cả 2 event names (backend emit cả 2 để đảm bảo)
    socket.socket.on("chat:message:new", handleNewMessage);
    socket.socket.on("new_message", handleNewMessage);

    return () => {
      if (socket?.socket) {
        socket.socket.off("chat:message:new", handleNewMessage);
        socket.socket.off("new_message", handleNewMessage);
        console.log("[useChat] 🧹 Cleaned up socket listeners");
      }
    };
  }, [socket, conversationState.currentConversationId, messageState]);

  // Error handler
  const handleError = useCallback((
    userMessageId: string,
    error: any,
    defaultToast: string
  ) => {
    toast.error(
      error?.response?.data?.message || error?.message || defaultToast
    );

    messageState.removeMessage(userMessageId);
    setIsLoadingAI(false);

    // Reset to welcome if this was the only message
    if (
      !conversationState.currentConversationId &&
      messageState.messages.length === 1 &&
      messageState.messages[0]._id === userMessageId
    ) {
      messageState.resetToWelcome();
    }
  }, [conversationState, messageState]);

  // Message actions
  const onSendText = useCallback(async (
    text: string,
    latitude?: number,
    longitude?: number
  ) => {
    const userMessage = messageState.addUserMessage(text, conversationState.currentConversationId);
    setIsLoadingAI(true);
    setIsChatExpanded(true);

    try {
      const aiResponse = await chatApi.postChatMessage(
        text,
        conversationState.currentConversationId,
        latitude,
        longitude
      );
      const aiMessage = messageState.addAiMessage(aiResponse, conversationState.currentConversationId);

      // Handle new conversation
      if (aiResponse.newConversation) {
        conversationState.addConversation(aiResponse.newConversation);
        conversationState.selectConversation(aiResponse.newConversation._id);
      }
    } catch (err) {
      handleError(userMessage._id, err, "Gửi tin nhắn thất bại.");
    } finally {
      setIsLoadingAI(false);
    }
  }, [messageState, conversationState, handleError]);

  const onSendQuickReply = useCallback(async (text: string, payload: string) => {
    const userMessage = messageState.addUserMessage(text, conversationState.currentConversationId);
    setIsLoadingAI(true);
    setIsChatExpanded(true);

    try {
      const aiResponse = await chatApi.postChatMessage(
        payload,
        conversationState.currentConversationId
      );
      const aiMessage = messageState.addAiMessage(aiResponse, conversationState.currentConversationId);

      // Handle new conversation
      if (aiResponse.newConversation) {
        conversationState.addConversation(aiResponse.newConversation);
        conversationState.selectConversation(aiResponse.newConversation._id);
      }
    } catch (err) {
      handleError(userMessage._id, err, "Gửi tin nhắn thất bại.");
    } finally {
      setIsLoadingAI(false);
    }
  }, [messageState, conversationState, handleError]);

  const onFileUpload = useCallback(async (file: File) => {
    // Tạo tin nhắn giả (Optimistic UI)
    const userMessage = messageState.addUserMessage(
      `Đang tải lên: ${file.name}...`,
      conversationState.currentConversationId
    );
    setIsLoadingAI(true);

    try {
      let aiResponse;
      const isImage = file.type.startsWith("image/");

      if (isImage) {
        // --- LOGIC CŨ (CLOUDINARY) CHO ẢNH ---
        aiResponse = await chatApi.uploadChatFile(
          file,
          conversationState.currentConversationId
        );
      } else {
        // --- LOGIC MỚI (R2) CHO FILE TÀI LIỆU ---

        // 1. Xin fileKey từ backend
        const { fileKey } = await chatApi.getR2UploadUrl(
          file.name,
          file.type
        );

        // 2. Upload file lên R2 qua proxy (tránh CORS)
        await chatApi.uploadToR2(fileKey, file);

        // 3. Gửi tin nhắn báo server đã upload xong (kèm metadata R2)
        aiResponse = await chatApi.postChatMessage(
          `Đã gửi file: ${file.name}`,
          conversationState.currentConversationId,
          undefined,
          undefined,
          "file", // Type message
          {
            // Metadata
            fileName: file.name,
            fileSize: file.size,
            fileKey: fileKey, // Key R2 quan trọng để download sau này
            storage: "r2", // Đánh dấu là R2
          }
        );
      }

      const aiMessage = messageState.addAiMessage(
        aiResponse,
        conversationState.currentConversationId
      );

      // Handle new conversation
      if (aiResponse.newConversation) {
        conversationState.addConversation(aiResponse.newConversation);
        conversationState.selectConversation(aiResponse.newConversation._id);
      }
    } catch (err) {
      handleError(userMessage._id, err, "Upload file thất bại.");
    } finally {
      setIsLoadingAI(false);
    }
  }, [messageState, conversationState, handleError]);

  // Navigation actions
  const handleNewChat = useCallback(() => {
    messageState.resetToWelcome();
    conversationState.clearCurrentConversation();
    setIsChatExpanded(true);
  }, [messageState, conversationState]);

  /**
   * ✅ PAGINATION: Handle conversation selection với pagination support
   */
  const handleSelectConversation = useCallback(async (conversationId: string) => {
    if (conversationId === conversationState.currentConversationId) return;

    setIsLoadingAI(true);
    messageState.clearMessages();
    conversationState.selectConversation(conversationId);
    setIsChatExpanded(true);

    try {
      // ✅ PAGINATION: Fetch first page (30 messages gần nhất)
      const result = await chatApi.fetchChatHistory(conversationId, 1, 30);
      messageState.setMessagesFromHistory(result.messages, {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
      });
    } catch (err) {
      toast.error("Không thể tải lịch sử cuộc trò chuyện này.");
      handleNewChat();
    } finally {
      setIsLoadingAI(false);
    }
  }, [conversationState, messageState, handleNewChat]);

  /**
   * ✅ PAGINATION: Load more messages (older messages)
   */
  const handleLoadMoreMessages = useCallback(async () => {
    if (!conversationState.currentConversationId) return;

    const success = await messageState.loadMoreMessages(
      conversationState.currentConversationId,
      chatApi.fetchChatHistory
    );

    if (!success) {
      console.log("No more messages to load");
    }
  }, [conversationState.currentConversationId, messageState]);

  // Conversation management
  const handleRenameConversation = useCallback(async (id: string, newTitle: string) => {
    conversationState.updateConversationTitle(id, newTitle);
    const success = await chatApi.renameConversation(id, newTitle);
    if (!success) {
      toast.error("Không thể đổi tên, vui lòng thử lại.");
      const convos = await chatApi.fetchChatConversations();
      // Note: This would need to be updated to work with the new hook structure
    }
  }, [conversationState]);

  const handleDeleteConversation = useCallback(async (id: string) => {
    const prevConvos = [...conversationState.conversations];

    conversationState.removeConversation(id);

    // Reset to new chat if deleting current conversation
    if (conversationState.currentConversationId === id) {
      handleNewChat();
    }

    const success = await chatApi.deleteConversation(id);
    if (!success) {
      toast.error("Xóa thất bại.");
      // Revert conversations
      // Note: This would need to be updated to work with the new hook structure
    } else {
      toast.success("Đã xóa cuộc trò chuyện.");
    }
  }, [conversationState, handleNewChat]);

  return {
    // Messages
    messages: messageState.messages,
    quickReplies: messageState.quickReplies,

    // Conversations
    conversations: conversationState.conversations,
    currentConversationId: conversationState.currentConversationId,

    // UI State
    isLoadingAI,
    isChatExpanded,
    setIsChatExpanded,

    // Actions
    onSendText,
    onSendQuickReply,
    onFileUpload,
    handleNewChat,
    handleSelectConversation,
    handleRenameConversation,
    handleDeleteConversation,

    // ✅ PAGINATION: New exports
    handleLoadMoreMessages,
    currentPage: messageState.currentPage,
    totalPages: messageState.totalPages,
    hasMoreMessages: messageState.hasMoreMessages,
    isLoadingMore: messageState.isLoadingMore,
  };
};

export type UseChatReturn = ReturnType<typeof useChat>;