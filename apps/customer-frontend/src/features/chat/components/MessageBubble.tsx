// src/features/chat/components/MessageBubble.tsx
import { ChatMessage } from "@/types/chat";
import { cn } from "@/shared/lib/utils";
import { BotAvatar } from "./BotAvatar";
import { UserAvatarComponent } from "./UserAvatarComponent";
import { MessageContent } from "./MessageContent";
// ✅ Import hàm phân tích
import { analyzeSentiment } from "../utils/sentiment";
import { useMemo } from "react";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUserMessage = message.senderType === "User";

  // ✅ Phân tích cảm xúc (chỉ cho AI message)
  // Sử dụng useMemo để không phải tính toán lại mỗi lần render
  const botExpression = useMemo(() => {
    if (isUserMessage) return "neutral";
    // Lấy text từ content để phân tích
    const textContent = 
        message.type === 'text' || message.type === 'ai_response' 
        ? (message.content as any).text 
        : "";
    return analyzeSentiment(textContent);
  }, [message, isUserMessage]);

  return (
    <div className={cn(
      "flex gap-3 max-w-[85%] md:max-w-[80%] group", // Thêm group để hover effect nếu cần
      isUserMessage ? "ml-auto flex-row-reverse" : "mr-auto"
    )}>
      {/* Avatar */}
      <div className="flex-shrink-0 flex flex-col justify-end">
    {isUserMessage ? (
        <UserAvatarComponent />
    ) : (
        // ✅ Khóa cứng kích thước ở đây
        <div className="w-8 h-8 md:w-10 md:h-10"> 
            <BotAvatar expression={botExpression} />
        </div>
    )}
</div>

      {/* Message Content */}
      <div className={cn(
        "rounded-2xl px-4 py-2.5 max-w-full break-words shadow-sm",
        isUserMessage
          ? "bg-blue-600 text-white rounded-br-none"
          : "bg-white border border-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100 rounded-bl-none"
      )}>
        <MessageContent message={message} />
      </div>
    </div>
  );
}