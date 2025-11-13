// src/features/chat/hooks/useChat.ts (CẬP NHẬT)
import { useState, useEffect } from "react";
import { flushSync } from "react-dom";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import {
  ChatMessage,
  QuickReply,
  AiApiResponse,
  TextMessage,
  ChatConversation,
} from "@/types/chat";
// ❌ GỠ BỎ: import { PrinterProduct } from "@/types/product";
// ❌ GỠ BỎ: import { Order } from "@/types/order";
import { useAuthStore } from "@/stores/useAuthStore";
import * as chatApi from "../services/chat.api.service";
// ❌ GỠ BỎ: import api from "@/shared/lib/axios";

export const WELCOME_ID = "welcome_msg_001"; // Export để ChatPage có thể dùng
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

export const useChat = () => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [quickReplies, setQuickReplies] =
    useState<QuickReply[]>(WELCOME_REPLIES);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(true); // Mặc định là true
  const accessToken = useAuthStore((s) => s.accessToken);

  // ❌ GỠ BỎ: Toàn bộ state cho "Quick View" Sản Phẩm
  // ❌ GỠ BỎ: Toàn bộ state cho "Quick View" Đơn Hàng

  // (useEffect, addAiMessageToState, addUserMessageToState, handleError giữ nguyên)
  useEffect(() => {
    if (!accessToken) {
      setConversations([]);
      handleNewChat();
      return;
    }
    chatApi.fetchChatConversations().then((convos) => {
      setConversations(convos.reverse());
    });
    // Không gọi handleNewChat() nữa, để giữ conversationId nếu có
  }, [accessToken]);

  const addAiMessageToState = (response: AiApiResponse) => {
    const aiMessage: ChatMessage = {
      _id: uuidv4(),
      senderType: "AI",
      type: response.type,
      conversationId:
        response.newConversation?._id || currentConversationId || "error",
      content: response.content as any,
    };
    flushSync(() => {
      setMessages((prev) => [...prev, aiMessage]);
      setQuickReplies(response.quickReplies || []);
      setIsLoadingAI(false);
      if (response.newConversation) {
        setConversations((prevConvos) => [
          response.newConversation!,
          ...prevConvos,
        ]);
        setCurrentConversationId(response.newConversation._id);
      }
    });
  };

  const addUserMessageToState = (text: string): TextMessage => {
    const userMessage: TextMessage = {
      _id: uuidv4(),
      senderType: "User",
      type: "text",
      conversationId: currentConversationId || "temp_new_chat",
      content: { text: text },
    };
    flushSync(() => {
      setMessages((prev) => {
        const isPristine = prev.length === 1 && prev[0]._id === WELCOME_ID;
        return isPristine ? [userMessage] : [...prev, userMessage];
      });
      setQuickReplies([]);
      setIsLoadingAI(true);
      setIsChatExpanded(true);
    });
    return userMessage;
  };

  const handleError = (
    userMessageId: string,
    error: any,
    defaultToast: string
  ) => {
    toast.error(
      error?.response?.data?.message || error?.message || defaultToast
    );
    flushSync(() => {
      setMessages((prev) => prev.filter((msg) => msg._id !== userMessageId));
      setIsLoadingAI(false);
      if (
        !currentConversationId &&
        messages.length === 1 &&
        messages[0]._id === userMessageId
      ) {
        setMessages([WELCOME_MESSAGE]);
        setQuickReplies(WELCOME_REPLIES);
      }
    });
  };

  // (onSendText, onSendQuickReply, onFileUpload giữ nguyên)
  const onSendText = async (
    text: string,
    latitude?: number,
    longitude?: number
  ) => {
    const userMessage = addUserMessageToState(text);
    try {
      const aiResponse = await chatApi.postChatMessage(
        text,
        currentConversationId,
        latitude,
        longitude
      );
      addAiMessageToState(aiResponse);
    } catch (err) {
      handleError(userMessage._id, err, "Gửi tin nhắn thất bại.");
    }
  };

  const onSendQuickReply = async (text: string, payload: string) => {
    const userMessage = addUserMessageToState(text);
    try {
      const aiResponse = await chatApi.postChatMessage(
        payload,
        currentConversationId
      );
      addAiMessageToState(aiResponse);
    } catch (err) {
      handleError(userMessage._id, err, "Gửi tin nhắn thất bại.");
    }
  };

  const onFileUpload = async (file: File) => {
    const userMessage = addUserMessageToState(`Đã tải lên file: ${file.name}`);
    try {
      const aiResponse = await chatApi.uploadChatFile(
        file,
        currentConversationId
      );
      addAiMessageToState(aiResponse);
    } catch (err) {
      handleError(userMessage._id, err, "Upload file thất bại.");
    }
  };

  // ❌ GỠ BỎ: Toàn bộ Handlers cho "Quick View" Sản Phẩm
  // ❌ GỠ BỎ: Toàn bộ Handlers cho "Quick View" Đơn Hàng

  // (handleNewChat, handleSelectConversation giữ nguyên)
  const handleNewChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setQuickReplies(WELCOME_REPLIES);
    setCurrentConversationId(null);
    setIsChatExpanded(true); // Trang chat luôn expanded
  };

  const handleSelectConversation = async (conversationId: string) => {
    if (conversationId === currentConversationId) return;
    setIsLoadingAI(true);
    setMessages([]);
    setQuickReplies([]);
    setCurrentConversationId(conversationId);
    setIsChatExpanded(true);
    try {
      const historyMessages = await chatApi.fetchChatHistory(conversationId);
      setMessages(historyMessages);
    } catch (err) {
      toast.error("Không thể tải lịch sử cuộc trò chuyện này.");
      handleNewChat();
    } finally {
      setIsLoadingAI(false);
    }
  };

  // 4. Cập nhật return
  return {
    messages,
    quickReplies,
    isLoadingAI,
    isChatExpanded,
    setIsChatExpanded,
    onSendText,
    onSendQuickReply,
    onFileUpload,
    handleNewChat,
    conversations,
    currentConversationId,
    handleSelectConversation,
    // ❌ GỠ BỎ: Toàn bộ state/handlers cho Quick View
  };
};

export type UseChatReturn = ReturnType<typeof useChat>;
