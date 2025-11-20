// src/features/chat/hooks/useMessageState.ts
// Tách logic quản lý state messages thành custom hook

import { useState, useCallback } from "react";
import { flushSync } from "react-dom";
import { v4 as uuidv4 } from "uuid";
import {
  ChatMessage,
  QuickReply,
  AiApiResponse,
  TextMessage,
  MessageStatus,
  TextMessageContent,
  AiResponseContent,
  ProductSelectionContent,
  OrderSelectionContent,
  PaymentRequestContent,
  ImageMessage,
  FileMessage,
  MessageMetadata,
  ProductMessage,
  OrderMessage,
  ProductMetadata,
  OrderMetadata,
} from "@/types/chat";

export const WELCOME_ID = "welcome_msg_001";
export const WELCOME_MESSAGE: ChatMessage = {
  _id: WELCOME_ID,
  senderType: "AI",
  type: "text",
  conversationId: "welcome",
  content: {
    text: "Tìm nhà in gần, in ấn nhanh chóng, xem đơn hàng,... Printz AI lo hết!",
  },
};

const WELCOME_REPLIES: QuickReply[] = [
  { text: "In background", payload: "/in background" },
  { text: "Xem đơn hàng cũ", payload: "/datlai" },
  { text: "Tìm nhà in gần", payload: "/tim nha in gan day" },
];

export const useMessageState = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>(WELCOME_REPLIES);
  
  // ✅ PAGINATION: Track pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  const addAiMessage = useCallback((response: AiApiResponse, currentConversationId: string | null) => {
    let aiMessage: ChatMessage;

    const baseMessage = {
      _id: uuidv4(),
      senderType: "AI" as const,
      conversationId: response.newConversation?._id || currentConversationId || "error",
    };

    switch (response.type) {
      case "text":
        aiMessage = { ...baseMessage, type: "text", content: response.content as TextMessageContent };
        break;
      case "ai_response":
        aiMessage = { ...baseMessage, type: "ai_response", content: response.content as AiResponseContent };
        break;
      case "product_selection":
        aiMessage = { ...baseMessage, type: "product_selection", content: response.content as ProductSelectionContent };
        break;
      case "order_selection":
        aiMessage = { ...baseMessage, type: "order_selection", content: response.content as OrderSelectionContent };
        break;
      case "payment_request":
        aiMessage = { ...baseMessage, type: "payment_request", content: response.content as PaymentRequestContent };
        break;
      case "image":
        aiMessage = { ...baseMessage, type: "image", content: response.content as ImageMessage["content"] };
        break;
      case "file":
        aiMessage = { 
          ...baseMessage, 
          type: "file", 
          content: response.content as unknown as FileMessage["content"] 
        } as FileMessage;
        break;
      case "product":
        aiMessage = { 
          ...baseMessage, 
          type: "product", 
          content: response.content as TextMessageContent, 
          metadata: response.metadata as ProductMetadata 
        } as ProductMessage;
        break;
      case "order":
        aiMessage = { 
          ...baseMessage, 
          type: "order", 
          content: response.content as TextMessageContent, 
          metadata: response.metadata as OrderMetadata 
        } as OrderMessage;
        break;
      case "system":
        aiMessage = { ...baseMessage, type: "system", content: response.content as TextMessageContent };
        break;
      case "error":
        aiMessage = { ...baseMessage, type: "error", content: response.content as TextMessageContent };
        break;
      default:
        // Fallback for unknown types, or throw an error
        aiMessage = { ...baseMessage, type: "text", content: { text: "Unknown message type" } };
        break;
    }

    flushSync(() => {
      setMessages((prev) => [...prev, aiMessage as ChatMessage]);
      setQuickReplies(response.quickReplies || []);
    });

    return aiMessage;
  }, []);

  // ✅ ENTERPRISE: Add user message with Optimistic UI
  const addUserMessage = useCallback((
    text: string,
    currentConversationId: string | null,
    options?: {
      tempId?: string;
      status?: MessageStatus;
      type?: ChatMessage["type"];
      metadata?: any;
    }
  ): TextMessage => {
    const tempId = options?.tempId || uuidv4();
    
    const userMessage: TextMessage = {
      _id: tempId,
      senderType: "User",
      type: (options?.type as "text") || "text",
      conversationId: currentConversationId || "temp_new_chat",
      content: { text },
      // ✅ ENTERPRISE: Add status tracking
      status: options?.status || "sending",
      tempId: tempId,
      retryCount: 0,
      metadata: options?.metadata,
    };

    flushSync(() => {
      setMessages((prev) => {
        const isPristine = prev.length === 1 && prev[0]._id === WELCOME_ID;
        return isPristine ? [userMessage] : [...prev, userMessage];
      });
      setQuickReplies([]);
    });

    return userMessage;
  }, []);

  const removeMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
  }, []);

  // ✅ ENTERPRISE: Update message status (for Optimistic UI & Retry)
  const updateMessageStatus = useCallback((
    messageId: string,
    status: MessageStatus,
    options?: {
      error?: string;
      retryCount?: number;
      realId?: string; // Real ID from server after successful send
    }
  ) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg._id === messageId || msg.tempId === messageId) {
          return {
            ...msg,
            status,
            _id: options?.realId || msg._id, // Replace tempId with real ID
            error: options?.error,
            retryCount: options?.retryCount ?? msg.retryCount,
          };
        }
        return msg;
      })
    );
  }, []);

  // ✅ ENTERPRISE: Mark message as read
  const markMessageAsRead = useCallback((messageId: string, userId: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg._id === messageId) {
          const readBy = msg.readBy || [];
          if (!readBy.includes(userId)) {
            return {
              ...msg,
              status: "read" as MessageStatus,
              readBy: [...readBy, userId],
              readAt: new Date().toISOString(),
            };
          }
        }
        return msg;
      })
    );
  }, []);

  /**
   * ✅ REFACTOR: Set messages từ history với pagination metadata
   */
  const setMessagesFromHistory = useCallback((
    historyMessages: ChatMessage[],
    paginationData?: { currentPage: number; totalPages: number }
  ) => {
    setMessages(historyMessages);
    if (paginationData) {
      setCurrentPage(paginationData.currentPage);
      setTotalPages(paginationData.totalPages);
    }
  }, []);

  /**
   * ✅ PAGINATION: Load more messages (older messages)
   * Prepend older messages to the beginning of array
   */
  const loadMoreMessages = useCallback(async (
    conversationId: string,
    fetchHistoryFn: (convId: string, page: number, limit: number) => Promise<{
      messages: ChatMessage[];
      currentPage: number;
      totalPages: number;
    }>
  ) => {
    if (isLoadingMore || currentPage >= totalPages) {
      return false; // Already loading or no more pages
    }

    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const result = await fetchHistoryFn(conversationId, nextPage, 30);
      
      if (result.messages.length > 0) {
        // ✅ PREPEND older messages to the beginning
        setMessages((prev) => [...result.messages, ...prev]);
        setCurrentPage(result.currentPage);
        setTotalPages(result.totalPages);
        return true; // Successfully loaded more
      }
      return false; // No more messages
    } catch (error) {
      console.error("Failed to load more messages:", error);
      return false;
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, totalPages, isLoadingMore]);

  const resetToWelcome = useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
    setQuickReplies(WELCOME_REPLIES);
    setCurrentPage(1);
    setTotalPages(1);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setQuickReplies([]);
    setCurrentPage(1);
    setTotalPages(1);
  }, []);

  return {
    messages,
    quickReplies,
    addAiMessage,
    addUserMessage,
    removeMessage,
    setMessagesFromHistory,
    loadMoreMessages,
    resetToWelcome,
    clearMessages,
    // ✅ ENTERPRISE: New functions
    updateMessageStatus,
    markMessageAsRead,
    setMessages, // ✅ Expose for Cross-Tab Sync
    // ✅ PAGINATION: Expose pagination state
    currentPage,
    totalPages,
    isLoadingMore,
    hasMoreMessages: currentPage < totalPages,
  };
};
