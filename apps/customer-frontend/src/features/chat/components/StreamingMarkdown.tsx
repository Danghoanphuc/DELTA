// src/features/chat/components/StreamingMarkdown.tsx

import { useEffect, useRef } from "react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { useTypewriter } from "@/shared/hooks/useTypewriter";
import { cn } from "@/shared/lib/utils";

interface StreamingMarkdownProps {
  content: string;
  className?: string;
  onComplete?: () => void;
  messageId?: string; // Để track message đã stream chưa
  isUserMessage?: boolean; // ✅ Thêm prop này để style chính xác
}

export function StreamingMarkdown({ 
  content, 
  className,
  onComplete,
  messageId,
  isUserMessage = false
}: StreamingMarkdownProps) {
  const { displayedText, isTyping } = useTypewriter(content, 15); // Tốc độ 15ms
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasStreamedRef = useRef<Set<string>>(new Set());

  // Auto-scroll nhẹ khi nội dung dài ra
  useEffect(() => {
    if (bottomRef.current && isTyping) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [displayedText, isTyping]);

  useEffect(() => {
    if (!isTyping && onComplete) {
      onComplete();
      // Đánh dấu message đã stream xong
      if (messageId) {
        hasStreamedRef.current.add(messageId);
      }
    }
  }, [isTyping, onComplete, messageId]);

  return (
    <div className="relative">
      <MarkdownRenderer 
        content={displayedText} 
        className={cn("text-gray-800 dark:text-gray-100", className)}
        isUserMessage={isUserMessage}
      />
      
      {/* Hiệu ứng con trỏ nhấp nháy (WOW factor) */}
      {isTyping && (
        <span 
          className={cn(
            "inline-block w-2 h-4 ml-1 align-middle bg-blue-500 rounded-sm",
            "animate-pulse"
          )} 
        />
      )}
      
      {/* Invisible anchor for scrolling */}
      <div ref={bottomRef} className="h-0 w-0" />
    </div>
  );
}

