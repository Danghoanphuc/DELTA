// hooks/useReplyMessage.ts - Hook for reply functionality
import { useState } from "react";
import type { ChatMessage } from "@/types/chat";

export function useReplyMessage() {
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);

  const startReply = (message: ChatMessage) => {
    setReplyingTo(message);
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const getReplyPreview = (message: ChatMessage) => {
    const content = message.content as any;
    const attachments = content?.attachments || [];

    // If has image, show image icon
    if (attachments.length > 0) {
      const hasImage = attachments.some(
        (att: any) =>
          att.type === "image" || att.url?.match(/\.(jpeg|jpg|png|webp|heic)$/i)
      );
      if (hasImage) {
        return "📷 Ảnh";
      }
      return `📎 ${attachments[0].originalName || "File"}`;
    }

    // If has text, show truncated text
    if (content?.text) {
      const div = document.createElement("div");
      div.innerHTML = content.text;
      const plainText = div.textContent || div.innerText || "";
      return plainText.length > 50
        ? plainText.substring(0, 50) + "..."
        : plainText;
    }

    return "Tin nhắn";
  };

  return {
    replyingTo,
    startReply,
    cancelReply,
    getReplyPreview,
  };
}
