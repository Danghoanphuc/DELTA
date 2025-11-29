import React, { memo } from "react";
import { ChatMessage } from "@/types/chat";
import { cn } from "@/shared/lib/utils";
import { MessageContent } from "./MessageContent";
import { motion } from "framer-motion";
import { Sparkles, AlertCircle } from "lucide-react";

interface MessageBubbleProps {
  message: ChatMessage;
  isUser: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = memo(
  ({ message, isUser }) => {
    const metadata = (message.metadata as any) || {};
    const status = metadata.status;
    const isStreaming = status === "streaming";
    const isError = status === "error";

    return (
      <div
        className={cn(
          "flex flex-col w-full",
          isUser ? "items-end" : "items-start"
        )}
      >
        <motion.div
          layout // Giúp animation khi chiều cao thay đổi mượt hơn
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "relative text-[15px] max-w-full break-words transition-all duration-200 px-4 py-3 shadow-sm",
            isUser
              ? "rounded-2xl rounded-tr-sm bg-blue-600 text-white"
              : "rounded-2xl rounded-tl-sm bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700",
            isError && "border-red-200 bg-red-50 dark:bg-red-900/10"
          )}
        >
          <MessageContent message={message} />

          {/* Chỉ báo Streaming nằm ngay trong bong bóng */}
          {isStreaming && (
            <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-blue-600/80 animate-pulse">
              <Sparkles size={12} />
              <span>Zin đang viết...</span>
            </div>
          )}

          {isError && (
            <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600">
              <AlertCircle size={12} />
              <span>Gửi thất bại</span>
            </div>
          )}
        </motion.div>
      </div>
    );
  }
);

MessageBubble.displayName = "MessageBubble";
