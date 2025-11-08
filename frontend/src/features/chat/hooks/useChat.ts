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
import { PrinterProduct } from "@/types/product";
import { Order } from "@/types/order"; // <-- Import kiểu Order
import { useAuthStore } from "@/stores/useAuthStore";
import * as chatApi from "../services/chat.api.service";
import api from "@/shared/lib/axios";

// Trạng thái "Chào mừng" (giữ nguyên)
const WELCOME_ID = "welcome_msg_001";
const WELCOME_MESSAGE: ChatMessage = {
  _id: WELCOME_ID,
  senderType: "AI",
  type: "text",
  conversationId: "welcome", // ID giả
  content: {
    text: "Xin chào! Tôi là PrintZ, trợ lý in ấn của bạn. Hôm nay tôi có thể giúp gì cho bạn?",
  },
};
const WELCOME_REPLIES: QuickReply[] = [
  { text: "Tìm card visit", payload: "/tim card visit" },
  { text: "Xem đơn hàng cũ", payload: "/datlai" },
  { text: "Tìm nhà in gần đây", payload: "/tim nha in gan day" },
];

export const useChat = () => {
  // State cũ
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [quickReplies, setQuickReplies] =
    useState<QuickReply[]>(WELCOME_REPLIES);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const accessToken = useAuthStore((s) => s.accessToken);

  // --- State cho "Quick View" Sản Phẩm ---
  const [quickViewProductId, setQuickViewProductId] = useState<string | null>(
    null
  );
  const [isQuickViewLoading, setIsQuickViewLoading] = useState(false);
  const [quickViewProductData, setQuickViewProductData] =
    useState<PrinterProduct | null>(null);

  // ✅ BƯỚC 1: THÊM STATE CHO "QUICK VIEW" ĐƠN HÀNG
  const [quickViewOrderId, setQuickViewOrderId] = useState<string | null>(null);
  const [isQuickViewOrderLoading, setIsQuickViewOrderLoading] = useState(false);
  const [quickViewOrderData, setQuickViewOrderData] = useState<Order | null>(
    null
  );

  // (useEffect, addAiMessageToState, addUserMessageToState, handleError giữ nguyên)
  useEffect(() => {
    if (!accessToken) {
      setConversations([]);
      handleNewChat(); // Reset về trạng thái chào mừng
      return;
    }
    chatApi.fetchChatConversations().then((convos) => {
      setConversations(convos.reverse()); // Mới nhất lên đầu
    });
    handleNewChat();
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

  // === CÁC HÀM PUBLIC (onSendText, onSendQuickReply, onFileUpload giữ nguyên) ===
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

  // === HANDLERS CHO "QUICK VIEW" SẢN PHẨM (giữ nguyên) ===
  const openQuickView = async (productId: string) => {
    if (!productId) return;
    flushSync(() => {
      setIsQuickViewLoading(true);
      setQuickViewProductId(productId);
      setQuickViewProductData(null);
    });
    try {
      const res = await api.get(`/products/${productId}`);
      if (res.data.success && res.data.data.product) {
        setQuickViewProductData(res.data.data.product);
      } else {
        throw new Error("Không tìm thấy sản phẩm");
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Không thể tải chi tiết sản phẩm."
      );
      setQuickViewProductId(null);
    } finally {
      setIsQuickViewLoading(false);
    }
  };
  const closeQuickView = () => {
    setQuickViewProductId(null);
    setQuickViewProductData(null);
  };

  // === ✅ BƯỚC 2: THÊM HANDLERS CHO "QUICK VIEW" ĐƠN HÀNG ===
  const openOrderQuickView = async (orderId: string) => {
    if (!orderId) return;

    flushSync(() => {
      setIsQuickViewOrderLoading(true);
      setQuickViewOrderId(orderId); // Mở Modal Order
      setQuickViewOrderData(null);
    });

    try {
      const order = await chatApi.fetchOrderDetails(orderId);
      setQuickViewOrderData(order);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Không thể tải chi tiết đơn hàng."
      );
      setQuickViewOrderId(null); // Đóng modal nếu lỗi
    } finally {
      setIsQuickViewOrderLoading(false);
    }
  };
  const closeOrderQuickView = () => {
    setQuickViewOrderId(null);
    setQuickViewOrderData(null);
  };

  // (handleNewChat, handleSelectConversation giữ nguyên)
  const handleNewChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setQuickReplies(WELCOME_REPLIES);
    setCurrentConversationId(null);
    setIsChatExpanded(false);
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

  // 4. Return state và các hàm handlers
  return {
    // State/handlers cũ
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

    // State/handlers Quick View Sản Phẩm
    quickViewProductId,
    isQuickViewLoading,
    quickViewProductData,
    openQuickView,
    closeQuickView,

    // ✅ BƯỚC 3: EXPORT STATE/HANDLERS MỚI
    quickViewOrderId,
    isQuickViewOrderLoading,
    quickViewOrderData,
    openOrderQuickView,
    closeOrderQuickView,
  };
};

export type UseChatReturn = ReturnType<typeof useChat>;
