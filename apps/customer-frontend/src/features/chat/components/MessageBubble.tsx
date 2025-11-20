// src/features/chat/components/MessageBubble.tsx
// Dumb component - chỉ render một message

import { ChatMessage } from "@/types/chat";
import { cn } from "@/shared/lib/utils";
import { BotAvatar } from "./BotAvatar";
import { UserAvatarComponent } from "./UserAvatarComponent";
import { MessageContent } from "./MessageContent";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUserMessage = message.senderType === "User";

  return (
    <div className={cn(
      "flex gap-3 max-w-[80%]",
      isUserMessage ? "ml-auto flex-row-reverse" : "mr-auto"
    )}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isUserMessage ? <UserAvatarComponent /> : <BotAvatar />}
      </div>

      {/* Message Content */}
      <div className={cn(
        "rounded-lg px-4 py-2 max-w-full break-words",
        isUserMessage
          ? "bg-blue-500 text-white"
          : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
      )}>
        <MessageContent message={message} />
      </div>
    </div>
  );
}
