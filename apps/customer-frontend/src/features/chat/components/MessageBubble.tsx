// src/features/chat/components/MessageBubble.tsx
import { useMemo } from "react";
import { ChatMessage } from "@/types/chat";
import { cn } from "@/shared/lib/utils";
import { BotAvatar } from "./BotAvatar";
import { UserAvatarComponent } from "./UserAvatarComponent";
import { MessageContent } from "./MessageContent";
import { analyzeSentiment } from "../utils/sentiment";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUserMessage = message.senderType === "User";

  // Bot Sentiment Analysis
  const botExpression = useMemo(() => {
    if (isUserMessage) return "neutral";
    const textContent = 
        message.type === 'text' || message.type === 'ai_response' 
        ? (message.content as any).text 
        : "";
    return analyzeSentiment(textContent);
  }, [message, isUserMessage]);

  return (
    <div className={cn(
      "flex gap-3 max-w-[90%] md:max-w-[80%] group items-end", 
      isUserMessage ? "ml-auto flex-row-reverse" : "mr-auto"
    )}>
      {/* Avatar */}
      <div className="flex-shrink-0 mb-1">
        {isUserMessage ? (
            <UserAvatarComponent />
        ) : (
            <div className="w-8 h-8 md:w-10 md:h-10"> 
                <BotAvatar expression={botExpression} />
            </div>
        )}
      </div>

      {/* Bubble Content */}
      <div className={cn(
        "rounded-2xl px-4 py-3 max-w-full break-words shadow-sm text-[15px] leading-relaxed",
        isUserMessage
          // ✅ FIX CONTRAST: Dùng màu xanh đậm hơn và shadow màu xanh để tạo chiều sâu
          ? "bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-600/10 dark:bg-blue-700"
          : "bg-white border border-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 rounded-bl-none shadow-sm"
      )}>
        <MessageContent message={message} />
      </div>
    </div>
  );
}