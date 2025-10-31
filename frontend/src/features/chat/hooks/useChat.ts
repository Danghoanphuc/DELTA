// src/features/chat/hooks/useChat.ts (TẠO MỚI)
import { useState, useEffect } from "react";
import { flushSync } from "react-dom";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import {
  ChatMessage,
  QuickReply,
  AiApiResponse,
  TextMessage,
} from "@/types/chat";
import { useAuthStore } from "@/stores/useAuthStore";
// Import service API mới
import * as chatApi from "../services/chat.api.service";

/**
 * Đây là "ChatService" của Frontend
 */
export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const accessToken = useAuthStore((s) => s.accessToken);

  // 1. Logic tải lịch sử (dùng service)
  useEffect(() => {
    if (!accessToken) return;
    chatApi.fetchChatHistory().then(setMessages);
  }, [accessToken]);

  // 2. Các hàm helper nội bộ (private)
  const addAiMessageToState = (response: AiApiResponse) => {
    const aiMessage: ChatMessage = {
      _id: uuidv4(),
      senderType: "AI",
      type: response.type,
      content: response.content as any,
    };
    flushSync(() => {
      setMessages((prev) => [...prev, aiMessage]);
      setQuickReplies(response.quickReplies || []);
      setIsLoadingAI(false);
    });
  };

  const addUserMessageToState = (text: string): TextMessage => {
    const userMessage: TextMessage = {
      _id: uuidv4(),
      senderType: "User",
      type: "text",
      content: { text: text },
    };
    flushSync(() => {
      setMessages((prev) => [...prev, userMessage]);
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
    console.error("Lỗi xử lý chat:", error);
    toast.error(
      error?.response?.data?.message || error?.message || defaultToast
    );
    flushSync(() => {
      setMessages((prev) => prev.filter((msg) => msg._id !== userMessageId));
      setIsLoadingAI(false);
    });
  };

  // 3. Các hàm "public" (handlers) sẽ được return
  const onSendText = async (
    text: string,
    latitude?: number,
    longitude?: number
  ) => {
    const userMessage = addUserMessageToState(text);
    try {
      const aiResponse = await chatApi.postChatMessage(
        text,
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
      // Gửi payload, không phải text
      const aiResponse = await chatApi.postChatMessage(payload);
      addAiMessageToState(aiResponse);
    } catch (err) {
      handleError(userMessage._id, err, "Gửi tin nhắn thất bại.");
    }
  };

  const onFileUpload = async (file: File) => {
    const userMessage = addUserMessageToState(`Đã tải lên file: ${file.name}`);
    try {
      const aiResponse = await chatApi.uploadChatFile(file);
      addAiMessageToState(aiResponse);
    } catch (err) {
      handleError(userMessage._id, err, "Upload file thất bại.");
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setQuickReplies([]);
    setIsChatExpanded(false);
  };

  // 4. Return state và các hàm handlers
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
  };
};

export type UseChatReturn = ReturnType<typeof useChat>;
