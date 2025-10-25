// src/types/chat.ts
export interface ChatMessage {
  _id: string; // Sẽ là ID từ DB, hoặc ID tạm (ví dụ: 'temp-123')
  senderType: "User" | "AI";
  content: {
    text: string;
  };
  createdAt?: string; // Dữ liệu từ lịch sử sẽ có trường này
}
