// src/features/chat/components/MessageBubble.tsx
import { useMemo } from "react";
import { ChatMessage } from "@/types/chat";
import { cn } from "@/shared/lib/utils";
// ✅ Import BotAvatar (Style Notion)
import { BotAvatar } from "./BotAvatar";
import { UserAvatarComponent } from "./UserAvatarComponent";
import { MessageContent } from "./MessageContent";
// ✅ Import hàm phân tích vừa tạo
import { analyzeSentiment } from "../utils/sentiment";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUserMessage = message.senderType === "User";

  // ✅ Tự động phân tích cảm xúc nếu là tin nhắn của AI
  const botExpression = useMemo(() => {
    if (isUserMessage) return "neutral";
    
    // Lấy nội dung text an toàn
    const textContent = 
        message.type === 'text' || message.type === 'ai_response' 
        ? (message.content as any).text 
        : "";
        
    return analyzeSentiment(textContent);
  }, [message, isUserMessage]);

  return (
    <div className={cn(
      "flex gap-3 max-w-[85%] md:max-w-[80%] group items-end", // items-end để avatar nằm dưới cùng
      isUserMessage ? "ml-auto flex-row-reverse" : "mr-auto"
    )}>
      {/* Avatar Section */}
      <div className="flex-shrink-0 mb-1">
        {isUserMessage ? (
            <UserAvatarComponent />
        ) : (
            // ✅ BotAvatar tự đổi mặt theo botExpression
            <div className="w-8 h-8 md:w-10 md:h-10"> 
                <BotAvatar expression={botExpression} />
            </div>
        )}
      </div>

      {/* Message Content Section */}
      <div className={cn(
        "rounded-2xl px-4 py-3 max-w-full break-words shadow-sm text-[15px] leading-relaxed",
        isUserMessage
          ? "bg-blue-600 text-white rounded-br-none"
          : "bg-white border border-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100 rounded-bl-none shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
      )}>
        <MessageContent message={message} />
      </div>
    </div>
  );
}