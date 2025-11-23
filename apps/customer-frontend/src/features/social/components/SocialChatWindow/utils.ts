// apps/customer-frontend/src/features/social/components/SocialChatWindow/utils.ts
// ✅ Utility functions cho chat components

import type { ChatMessage } from "@/types/chat";

/**
 * Lấy sender ID từ message (hỗ trợ cả string và object)
 */
export function getSenderId(message: ChatMessage): string | undefined {
  if (!message.sender) return undefined;
  return typeof message.sender === "string" ? message.sender : message.sender._id;
}

/**
 * Kiểm tra xem message có phải của current user không
 */
export function isMyMessage(message: ChatMessage, currentUserId?: string): boolean {
  if (!currentUserId) return false;
  const senderId = getSenderId(message);
  return senderId === currentUserId;
}

/**
 * Kiểm tra xem 2 messages có cùng sender không
 */
export function isSameSender(
  message1: ChatMessage | null,
  message2: ChatMessage
): boolean {
  if (!message1) return false;
  const sender1 = getSenderId(message1);
  const sender2 = getSenderId(message2);
  return !!sender1 && !!sender2 && sender1 === sender2;
}

/**
 * Lấy partner info từ conversation (người không phải current user)
 */
export function getPartnerInfo(conversation: any, currentUserId?: string) {
  if (conversation.type === "group") return null;

  const partner = conversation.participants?.find((p: any) => {
    const pId = typeof p.userId === "string" ? p.userId : p.userId?._id;
    return pId !== currentUserId;
  });

  return partner?.userId || {};
}

