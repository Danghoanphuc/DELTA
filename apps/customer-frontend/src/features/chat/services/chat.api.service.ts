// apps/customer-frontend/src/features/chat/services/chat.api.service.ts
import api from "@/shared/lib/axios";
import { AiApiResponse, ChatMessage, ChatConversation } from "@/types/chat";
import { Order } from "@/types/order";

export const fetchChatConversations = async (): Promise<ChatConversation[]> => {
  try {
    const res = await api.get("/chat/conversations");
    return Array.isArray(res.data?.data?.conversations)
      ? res.data.data.conversations
      : [];
  } catch (err) {
    console.error("Error fetching conversations:", err);
    return [];
  }
};

// ✅ HÀM MỚI: Lấy chi tiết 1 hội thoại theo ID
export const fetchConversationById = async (
  conversationId: string
): Promise<ChatConversation | null> => {
  try {
    const res = await api.get(`/chat/conversations/${conversationId}`);
    return res.data?.data?.conversation || null;
  } catch (err) {
    console.error(`Error fetching conversation ${conversationId}:`, err);
    return null;
  }
};

// ✅ REFACTOR: Fetch chat history với pagination
export const fetchChatHistory = async (
  conversationId: string,
  page: number = 1,
  limit: number = 30
) => {
  try {
    const res = await api.get(`/chat/history/${conversationId}`, {
      params: { page, limit },
    });

    const data = res.data?.data;
    let rawMessages: any[] = [];
    let totalMessages = 0;
    let currentPage = page;
    let totalPages = 1;

    if (data && typeof data === "object") {
      if (Array.isArray(data.messages)) {
        rawMessages = data.messages;
        totalMessages = data.totalMessages || rawMessages.length;
        currentPage = data.currentPage || page;
        totalPages = data.totalPages || 1;
      } else if (Array.isArray(data)) {
        rawMessages = data;
        totalMessages = rawMessages.length;
      }
    }

    const transformedMessages: ChatMessage[] = rawMessages.map((msg) => {
      if (msg.type) return msg as ChatMessage;
      // Fallback logic
      let type: ChatMessage["type"] = "text";
      if (msg.senderType === "AI") {
        if (msg.content.products) type = "product_selection";
        else if (msg.content.orders) type = "order_selection";
        else if (msg.content.qrCode) type = "payment_request";
        else type = "ai_response";
      }
      return { ...msg, type } as ChatMessage;
    });

    return {
      messages: transformedMessages,
      totalMessages,
      currentPage,
      totalPages,
    };
  } catch (err) {
    console.error("Error fetching history:", err);
    return { messages: [], totalMessages: 0, currentPage: 1, totalPages: 1 };
  }
};

export const postChatMessage = async (
  message: string,
  conversationId: string | null,
  latitude?: number,
  longitude?: number,
  type?: ChatMessage["type"],
  metadata?: any
): Promise<AiApiResponse> => {
  const payload = { message, conversationId, latitude, longitude, type, metadata };
  const res = await api.post("/chat/message", payload);
  return res.data?.data;
};

export const uploadChatFile = async (
  file: File,
  conversationId: string | null
): Promise<AiApiResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  if (conversationId) {
    formData.append("conversationId", conversationId);
  }
  const res = await api.post("/chat/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data?.data;
};

export const fetchOrderDetails = async (orderId: string): Promise<Order> => {
  const res = await api.get(`/orders/${orderId}`);
  return res.data.data.order;
};

export const renameConversation = async (
  conversationId: string,
  newTitle: string
): Promise<boolean> => {
  try {
    await api.patch(`/chat/conversations/${conversationId}`, {
      title: newTitle,
    });
    return true;
  } catch (err) {
    return false;
  }
};

export const deleteConversation = async (
  conversationId: string
): Promise<boolean> => {
  try {
    await api.delete(`/chat/conversations/${conversationId}`);
    return true;
  } catch (err) {
    return false;
  }
};

// Social APIs
export const createPrinterConversation = async (printerId: string) => {
  const res = await api.post(`/chat/conversations/printer/${printerId}`);
  return res.data;
};

export const createPeerConversation = async (userId: string) => {
  const res = await api.post(`/chat/conversations/peer/${userId}`);
  return res.data;
};
