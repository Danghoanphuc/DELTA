// src/features/chat/services/chat.api.service.ts (CẬP NHẬT)
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

export const fetchOrderDetails = async (orderId: string): Promise<Order> => {
  try {
    const res = await api.get(`/orders/${orderId}`);
    if (res.data.success && res.data.data.order) {
      return res.data.data.order;
    } else {
      throw new Error("Dữ liệu đơn hàng không hợp lệ");
    }
  } catch (err) {
    console.error(`Không thể tải chi tiết đơn hàng ${orderId}:`, err);
    throw err; 
  }
};

// ✅ MỚI: Đổi tên cuộc trò chuyện
export const renameConversation = async (conversationId: string, newTitle: string): Promise<boolean> => {
    try {
        await api.patch(`/chat/conversations/${conversationId}`, { title: newTitle });
        return true;
    } catch (err) {
        console.error("Lỗi đổi tên cuộc trò chuyện:", err);
        return false;
    }
};

// ✅ MỚI: Xóa cuộc trò chuyện
export const deleteConversation = async (conversationId: string): Promise<boolean> => {
    try {
        await api.delete(`/chat/conversations/${conversationId}`);
        return true;
    } catch (err) {
        console.error("Lỗi xóa cuộc trò chuyện:", err);
        return false;
    }
};