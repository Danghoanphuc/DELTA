import axios from "axios";
// Hoặc import instance axios đã cấu hình interceptor của bạn, ví dụ:
// import apiClient from '@/lib/apiClient';

// Định nghĩa URL gốc của API Chat (tùy chỉnh theo BE của bạn)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const chatService = {
  /**
   * Lấy lịch sử tin nhắn của một cuộc hội thoại
   */
  getMessages: async (conversationId: string) => {
    // Giả định đường dẫn API: GET /api/conversations/:id/messages
    const response = await axios.get(
      `${API_URL}/conversations/${conversationId}/messages`,
      {
        withCredentials: true, // Để gửi kèm cookie/token nếu cần
        headers: {
          // Nếu dùng Bearer Token thì thêm vào đây
          // Authorization: `Bearer ${localStorage.getItem('token')}`
        },
      }
    );
    return response.data; // Trả về mảng tin nhắn
  },

  /**
   * Gửi tin nhắn mới (dùng khi socket fail hoặc cần lưu chắc chắn)
   */
  sendMessage: async (data: {
    conversationId: string;
    content: string;
    type: string;
  }) => {
    const response = await axios.post(`${API_URL}/messages`, data, {
      withCredentials: true,
    });
    return response.data;
  },

  /**
   * Tạo cuộc hội thoại mới hoặc lấy cuộc hội thoại cũ với user khác
   */
  getOrCreateConversation: async (targetUserId: string) => {
    const response = await axios.post(`${API_URL}/conversations`, {
      targetUserId,
    });
    return response.data;
  },
};
