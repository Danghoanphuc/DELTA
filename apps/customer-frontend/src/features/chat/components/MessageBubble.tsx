import React, { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, X, Copy } from "lucide-react";
import { ChatMessage } from "@/types/chat";
import { cn } from "@/shared/lib/utils";
import { MessageContent } from "./MessageContent";
import { MessageStatusIndicator } from "./message-status";
import { useEnhancedChatSender } from "../hooks/useChatSender.enhanced";
import { Button } from "@/shared/components/ui/button";

interface MessageBubbleProps {
  message: ChatMessage;
  isUser: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = memo(
  ({ message, isUser }) => {
    const { retryMessage, cancelFailedMessage } = useEnhancedChatSender();

    const { status, isStreaming, isError, isFailed } = useMemo(() => {
      const meta = (message.metadata as any) || {};
      const s = message.status || meta.status;
      return {
        status: s,
        isStreaming: s === "streaming",
        isError: s === "error" || message.type === "error",
        isFailed: s === "failed",
      };
    }, [message]);

    return (
      <div
        className={cn(
          "flex flex-col w-full mb-6", // Khoảng cách giữa các tin
          isUser ? "items-end" : "items-start"
        )}
      >
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "relative max-w-[90%] md:max-w-[85%]",

            // 🔥 FIX: USER BUBBLE
            // - Màu nền: #E9ECEF (Xám chuẩn messenger) giúp tách nền tốt hơn
            // - Text: Màu đen #000000
            // - Font: Sans
            isUser
              ? "bg-[#E9ECEF] dark:bg-zinc-800 text-black dark:text-zinc-100 rounded-2xl px-5 py-3.5 shadow-sm"
              : "bg-transparent text-stone-900 dark:text-zinc-100 pl-0 pr-0",

            isError &&
              !isFailed &&
              "bg-red-50 border border-red-100 text-red-900 rounded-xl px-4 py-3",
            isFailed &&
              "bg-red-50 border border-red-200 opacity-80 rounded-xl px-4 py-3"
          )}
        >
          {/* AI Label */}
          {!isUser && (
            <div className="flex items-center gap-2 mb-1.5 select-none">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-widest">
                Zin Assistant
              </span>
            </div>
          )}

          <MessageContent message={message} />

          {/* Error State */}
          {isError && !isFailed && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600 font-medium">
              <AlertCircle size={12} />
              <span>Đã xảy ra lỗi xử lý</span>
            </div>
          )}
        </motion.div>

        {/* Status & Actions */}
        <div className="mt-1 flex items-center gap-2 px-1 h-5">
          {isUser && !isFailed && status && (
            <MessageStatusIndicator
              status={status}
              retryCount={message.retryCount}
              className="text-stone-400 font-sans text-xs"
            />
          )}

          {isUser && isFailed && (
            <div className="flex items-center gap-2 animate-in fade-in">
              <span className="text-xs text-red-500 font-medium font-sans">
                Gửi thất bại
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() =>
                  retryMessage(message._id, message.conversationId)
                }
              >
                <RefreshCw size={10} className="mr-1" /> Thử lại
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 px-2 text-xs text-gray-400 hover:text-gray-600"
                onClick={() =>
                  cancelFailedMessage(message._id, message.conversationId)
                }
              >
                <X size={10} />
              </Button>
            </div>
          )}

          {/* Copy Button cho AI */}
          {!isUser && !isStreaming && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-stone-400 hover:text-stone-900 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Sao chép"
            >
              <Copy size={13} />
            </Button>
          )}
        </div>
      </div>
    );
  }
);

MessageBubble.displayName = "MessageBubble";
