// src/features/chat/components/MessageBubble.tsx
import React, { memo } from "react";
import { ChatMessage } from "@/types/chat";
import { cn } from "@/shared/lib/utils";
import { MessageContent } from "./MessageContent"; 
import { ThinkingBubble } from "./ThinkingBubble";
import { motion, AnimatePresence } from "framer-motion";

interface MessageBubbleProps {
  message: ChatMessage;
  isUser: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}

// ✅ Helper: Phát hiện nội dung có phải là Log kỹ thuật/URL thô không
const isTechnicalLog = (text: string) => {
  if (!text) return false;
  const trimmed = text.trim();
  // Nếu là URL trần -> Log
  if (trimmed.match(/^https?:\/\/[^\s]+$/)) return true;
  // Nếu bắt đầu bằng các từ khóa log và ngắn dưới 50 ký tự -> Log
  if (trimmed.length < 60 && /^(đang|navigating|checking|analyze|search|get|post)/i.test(trimmed)) return true;
  return false;
};

export const MessageBubble: React.FC<MessageBubbleProps> = memo(({ message, isUser, isFirst = true, isLast = true }) => {
  const metadata = message.metadata as any || {};
  const isAi = message.senderType === 'AI';
  const status = metadata.status;
  
  // Lấy content text an toàn
  const rawContent = message.content && 
    (typeof message.content === 'string' ? message.content : (message.content as any).text);
  const hasContent = rawContent && rawContent.trim().length > 0;

  // 🔥 FIX 1 & 3: Logic xác định trạng thái Thinking
  // - Nếu status là 'pending' (vừa gửi) -> Thinking ngay
  // - Nếu status là 'thinking' -> Thinking
  // - Nếu status là 'streaming' NHƯNG nội dung giống Log/URL -> Vẫn coi là Thinking (để giấu link thô đi)
  const isLogContent = isAi && hasContent && isTechnicalLog(rawContent);
  
  const isThinkingState = isAi && (
      status === 'pending' ||  // Fix lỗi xử lý nhanh
      status === 'thinking' || 
      (status === 'streaming' && (!hasContent || isLogContent)) // Fix lỗi hiện link thô
  );

  // Determine Thinking Text
  let thinkingText = metadata.thinkingText || "Zin đang phân tích...";
  
  // Fallback: Nếu nội dung là Log, dùng nó làm thinking text luôn
  if (isLogContent) {
      thinkingText = rawContent; 
  } else if (!metadata.thinkingText && hasContent) {
       // Fallback cũ: Tìm tag <think>
       const match = rawContent.match(/<think>([\s\S]*?)<\/think>/);
       if (match && match[1]) {
           const lines = match[1].split('\n').filter((l: string) => l.trim().length > 0);
           if (lines.length > 0) thinkingText = lines[lines.length - 1];
       }
  }

  // Styles bo góc
  const getBorderRadius = () => {
    if (isUser) {
      if (isFirst && isLast) return "rounded-2xl";
      if (isFirst) return "rounded-2xl rounded-br-sm";
      if (isLast) return "rounded-2xl rounded-tr-sm";
      return "rounded-2xl rounded-tr-sm rounded-br-sm";
    } else {
      if (isFirst && isLast) return "rounded-2xl";
      if (isFirst) return "rounded-2xl rounded-bl-sm";
      if (isLast) return "rounded-2xl rounded-tl-sm";
      return "rounded-2xl rounded-tl-sm rounded-bl-sm";
    }
  };

  // Case: Carousel (Full Width)
  if (message.type === 'product_selection' || message.type === 'order_selection') {
    return (
       <div className="w-full max-w-full animate-in fade-in slide-in-from-bottom-2">
          <MessageContent message={message} />
       </div>
    );
  }

  return (
    <div className={cn("flex flex-col w-full", isUser ? "items-end" : "items-start")}>
      
      {/* 1. THINKING BUBBLE LAYER */}
      <AnimatePresence mode="wait">
        {isThinkingState && (
          <motion.div 
            key="thinking"
            initial={{ opacity: 0, height: 0, scale: 0.9 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="w-full mb-1 origin-top-left"
          >
             <ThinkingBubble 
                customText={thinkingText} 
                variant="default" 
                className="shadow-sm border-blue-100 dark:border-gray-700"
             />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. CONTENT BUBBLE LAYER */}
      {/* 🔥 FIX QUAN TRỌNG: Chỉ hiện box trắng khi KHÔNG PHẢI thinking state */}
      {(!isThinkingState && hasContent) && (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "px-4 py-3 shadow-sm relative text-[15px] transition-all duration-200 group max-w-full break-words",
              getBorderRadius(),
              isUser 
                ? "bg-blue-600 text-white" 
                : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-100"
            )}
        >
            <MessageContent message={message} />
            
            {/* Timestamp */}
            {message.createdAt && (
              <div className={cn(
                "text-[10px] mt-1 text-right font-medium opacity-0 group-hover:opacity-70 transition-opacity select-none absolute bottom-1 right-3",
                isUser ? "text-blue-50" : "text-gray-400"
              )}>
                {new Date(message.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
        </motion.div>
      )}
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';