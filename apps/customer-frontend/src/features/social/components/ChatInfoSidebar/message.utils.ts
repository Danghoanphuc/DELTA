// apps/customer-frontend/src/features/social/components/ChatInfoSidebar/message.utils.ts
// ✅ Helper utilities cho message content

import type { ChatMessage } from "@/types/chat";

/**
 * Lấy text từ message content (hỗ trợ nhiều loại message)
 */
export const getMessageText = (msg: ChatMessage): string => {
  const content = msg.content as any;
  if (content?.text) return content.text;
  if (msg.type === "payment_request" && content?.description) {
    return content.description;
  }
  if (msg.type === "image" && content?.text) {
    return content.text;
  }
  return "Tin nhắn không có nội dung";
};

