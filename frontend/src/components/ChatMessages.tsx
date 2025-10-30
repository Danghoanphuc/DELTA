// src/components/ChatMessages.tsx (Bản hoàn chỉnh)

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/shared/components/ui/scroll-area"; //
import { ChatMessage } from "@/types/chat"; //
import { cn } from "@/shared/lib/utils"; //
import UserAvatarFallback from "@/components/UserAvatarFallback"; // Import component tùy chỉnh
import { useAuthStore } from "@/stores/useAuthStore"; //
import zinAvatar from "@/assets/img/zin-avatar.png";
interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoadingAI: boolean;
}

// Icon Bot
const BotAvatar = () => (
  <div className="w-7 h-7 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg">
    <img
      src={zinAvatar}
      alt="Zin AI Avatar"
      className="w-full h-full object-cover"
    />
  </div>
);

// Component User Avatar sử dụng UserAvatarFallback tùy chỉnh
const UserAvatar = () => {
  const user = useAuthStore((s) => s.user); //
  return (
    // Sử dụng component UserAvatarFallback tùy chỉnh
    <UserAvatarFallback
      name={user?.displayName || user?.username || "U"}
      size={32}
      bgColor="bg-indigo-100"
      textColor="text-indigo-600"
      src={user?.avatarUrl}
    />
  );
};

export function ChatMessages({ messages, isLoadingAI }: ChatMessagesProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Tự động cuộn xuống khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end", // Đảm bảo cuộn xuống đáy
    });
  }, [messages, isLoadingAI]);

  return (
    // Sử dụng h-full để ScrollArea chiếm đúng chiều cao
    <ScrollArea className="h-full" ref={scrollAreaRef}>
      <div className="flex flex-col gap-4 p-4">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={cn(
              //
              "flex items-start gap-3",
              msg.senderType === "User" && "justify-end"
            )}
          >
            {/* Avatar Bot */}
            {msg.senderType === "AI" && <BotAvatar />}

            {/* Bong bóng chat */}
            <div
              className={cn(
                //
                "p-3 rounded-xl max-w-xs md:max-w-md",
                msg.senderType === "User"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-gray-100 text-gray-800 rounded-bl-none"
              )}
            >
              <p className="whitespace-pre-wrap">{msg.content.text}</p>
            </div>

            {/* Avatar User */}
            {msg.senderType === "User" && <UserAvatar />}
          </div>
        ))}

        {/* AI "Đang gõ..." */}
        {isLoadingAI && (
          <div className="flex items-start gap-3">
            <BotAvatar />
            <div className="p-3 rounded-xl bg-gray-100 text-gray-800 rounded-bl-none">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}

        {/* Thẻ div trống để cuộn tới */}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}
