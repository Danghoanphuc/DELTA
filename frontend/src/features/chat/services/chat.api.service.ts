// src/features/chat/services/chat.api.service.ts (ĐÃ SỬA LỖI)
import api from "@/shared/lib/axios";

// ✅ SỬA LỖI Ở ĐÂY: Thêm 'ChatMessage' vào import
import { AiApiResponse, ChatMessage } from "@/types/chat";

/**
 * Lấy lịch sử chat
 */
export const fetchChatHistory = async (): Promise<ChatMessage[]> => {
  try {
    const res = await api.get("/chat/history");
    return Array.isArray(res.data?.data?.messages)
      ? res.data.data.messages
      : [];
  } catch (err) {
    console.error("Không thể tải lịch sử:", err);
    return [];
  }
};

/**
 * Gửi một tin nhắn văn bản (hoặc payload)
 */
export const postChatMessage = async (
  message: string,
  latitude?: number,
  longitude?: number
): Promise<AiApiResponse> => {
  const payload = { message, latitude, longitude };
  const res = await api.post("/chat/message", payload);
  const aiResponse: AiApiResponse = res.data?.data;

  if (!aiResponse || !aiResponse.type || !aiResponse.content) {
    throw new Error("Phản hồi không hợp lệ từ server");
  }
  return aiResponse;
};

/**
 * Tải lên một file
 */
export const uploadChatFile = async (file: File): Promise<AiApiResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/chat/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  const aiResponse: AiApiResponse = res.data?.data;
  if (!aiResponse || !aiResponse.type || !aiResponse.content) {
    throw new Error("Phản hồi file không hợp lệ từ server");
  }
  return aiResponse;
};
