// src/components/ChatMessages.tsx (CẬP NHẬT)

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { ChatMessage, TextMessage } from "@/types/chat";
import { cn } from "@/shared/lib/utils";
import UserAvatarFallback from "@/components/UserAvatarFallback";
import { useAuthStore } from "@/stores/useAuthStore";
import zinAvatar from "@/assets/img/zin-avatar.png";
import { ChatProductCarousel } from "@/features/chat/components/ChatProductCarousel";

// (BotAvatar và UserAvatar giữ nguyên)
const BotAvatar = () => (
  <div className="w-7 h-7 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg">
    <img
      src={zinAvatar}
      alt="Zin AI Avatar"
      className="w-full h-full object-cover"
    />
  </div>
);
const UserAvatar = () => {
  const user = useAuthStore((s) => s.user);
  return (
    <UserAvatarFallback
      name={user?.displayName || user?.username || "U"}
      size={32}
      bgColor="bg-indigo-100"
      textColor="text-indigo-600"
      src={user?.avatarUrl}
    />
  );
};

// Component render nội dung tin nhắn
const MessageContent = ({ msg }: { msg: ChatMessage }) => {
  switch (msg.type) {
    // ✅ CẬP NHẬT: Thêm case cho "ai_response"
    case "ai_response":
    case "text":
      return (
        <div
          className={cn(
            "p-3 rounded-xl max-w-xs md:max-w-md",
            msg.senderType === "User"
              ? "bg-blue-600 text-white rounded-br-none"
              : // Cả "text" và "ai_response" đều là của AI
                "bg-gray-100 text-gray-800 rounded-bl-none"
          )}
        >
          {/* Dù là type "text" hay "ai_response",
            chúng ta đều chỉ hiển thị trường "text" bên trong content
          */}
          <p className="whitespace-pre-wrap">{msg.content.text}</p>
        </div>
      );

    // (Các case khác giữ nguyên)
    case "product_selection":
      return (
        <div className="p-3 rounded-xl bg-gray-100 rounded-bl-none">
          <p className="mb-3">{msg.content.text}</p>
          <ChatProductCarousel products={msg.content.products} />
        </div>
      );

    case "order_selection":
      return (
        <div className="p-3 rounded-xl bg-gray-100 rounded-bl-none">
          <p className="mb-3">{msg.content.text}</p>
          <p className="text-xs text-gray-500">(Render Order Carousel ở đây)</p>
        </div>
      );

    default:
      return null;
  }
};

// (Phần còn lại của file ChatMessages giữ nguyên)
export function ChatMessages({ messages, isLoadingAI }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isLoadingAI]);

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-4 p-4">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={cn(
              "flex items-start gap-3",
              msg.senderType === "User" && "justify-end"
            )}
          >
            {msg.senderType === "AI" && <BotAvatar />}
            <MessageContent msg={msg} />
            {msg.senderType === "User" && <UserAvatar />}
          </div>
        ))}
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
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}
