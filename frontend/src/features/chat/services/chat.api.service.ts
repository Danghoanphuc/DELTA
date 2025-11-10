// src/features/chat/services/chat.api.service.ts (CẬP NHẬT)
import api from "@/shared/lib/axios";
import { AiApiResponse, ChatMessage, ChatConversation } from "@/types/chat";
import { Order } from "@/types/order"; // <-- Import Order type

/**
 * (fetchChatConversations, fetchChatHistory, postChatMessage, uploadChatFile giữ nguyên)
 */
export const fetchChatConversations = async (): Promise<ChatConversation[]> => {
  try {
    // ✅ FIX: Đổi endpoint từ '/chat/conversations/my-conversations'
    // thành '/chat/conversations' cho khớp với backend (chat.routes.js)
    const res = await api.get("/chat/conversations");
    return Array.isArray(res.data?.data?.conversations)
      ? res.data.data.conversations
      : [];
  } catch (err) {
    console.error("Không thể tải danh sách cuộc trò chuyện:", err);
    return [];
  }
};

export const fetchChatHistory = async (
  conversationId: string
): Promise<ChatMessage[]> => {
  try {
    const res = await api.get(`/chat/history/${conversationId}`);
    return Array.isArray(res.data?.data?.messages)
      ? res.data.data.messages
      : [];
  } catch (err) {
    console.error("Không thể tải lịch sử:", err);
    return [];
  }
};

export const postChatMessage = async (
  message: string,
  conversationId: string | null,
  latitude?: number,
  longitude?: number
): Promise<AiApiResponse> => {
  const payload = { message, conversationId, latitude, longitude };
  const res = await api.post("/chat/message", payload);
  const aiResponse: AiApiResponse = res.data?.data;
  if (!aiResponse || !aiResponse.type || !aiResponse.content) {
    throw new Error("Phản hồi không hợp lệ từ server");
  }
  return aiResponse;
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
  const aiResponse: AiApiResponse = res.data?.data;
  if (!aiResponse || !aiResponse.type || !aiResponse.content) {
    throw new Error("Phản hồi file không hợp lệ từ server");
  }
  return aiResponse;
};

/**
 * ✅ MỚI: Lấy chi tiết MỘT đơn hàng (yêu cầu auth)
 */
export const fetchOrderDetails = async (orderId: string): Promise<Order> => {
  try {
    // API này đã tồn tại ở backend (modules/orders/order.routes.js)
    const res = await api.get(`/orders/${orderId}`);
    if (res.data.success && res.data.data.order) {
      return res.data.data.order;
    } else {
      throw new Error("Dữ liệu đơn hàng không hợp lệ");
    }
  } catch (err) {
    console.error(`Không thể tải chi tiết đơn hàng ${orderId}:`, err);
    throw err; // Ném lỗi để useChat xử lý
  }
};
