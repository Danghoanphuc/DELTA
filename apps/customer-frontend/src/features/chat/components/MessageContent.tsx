// src/features/chat/components/MessageContent.tsx
// ✅ FULL VERSION: Render đầy đủ mọi loại tin nhắn + Tối ưu hiệu năng

import { useMemo, memo } from "react";
import { ChatMessage } from "@/types/chat";
import { ChatProductCarousel } from "./ChatProductCarousel";
import { ChatOrderCarousel } from "./ChatOrderCarousel";
import { ChatPrinterCarousel } from "./ChatPrinterCarousel";
import { ChatPaymentCard } from "./ChatPaymentCard";
import { ProductMessageCard } from "./messages/ProductMessageCard";
import { OrderMessageCard } from "./messages/OrderMessageCard";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { ThinkingAccordion } from "./ThinkingAccordion";
import { ThinkingBubble } from "./ThinkingBubble";
import { parseThinkingContent } from "../utils/textParser";
import { cn } from "@/shared/lib/utils";

// ✅ MEMOIZED: Chỉ render lại khi nội dung thực sự thay đổi (giúp chat mượt hơn)
const MemoizedMarkdown = memo(MarkdownRenderer);

interface MessageContentProps {
  message: ChatMessage;
}

export function MessageContent({ message }: MessageContentProps) {
  const isUserMessage = message.senderType === "User";

  // 1. Xử lý logic hiển thị Text & Suy luận (Chain of Thought)
  if (message.type === "text" || message.type === "ai_response") {
      if ((message as any)?._skipRender) return null;

      // Safe parse content
      let rawText = "";
      if (typeof message.content === "string") {
        rawText = message.content;
      } else if ((message.content as any)?.text) {
        rawText = (message.content as any).text || "";
      }
      
      const { thought, content } = parseThinkingContent(rawText);

      // Metadata Checks
      const metadata = message.metadata as any;
      const isStatusThinking = metadata?.status === "thinking";
      const isCompleted = metadata?.status === "completed" || metadata?.status === "sent";
      
      // ✅ LOGIC QUAN TRỌNG: Khi nào hiện Bong bóng đang nghĩ?
      // 1. Metadata báo đang thinking
      // 2. HOẶC Có suy luận (thought) nhưng chưa có nội dung trả lời (content) và chưa xong
      const showThinkingBubble = isStatusThinking || (!isCompleted && thought && (!content || content.trim().length === 0));

      if (showThinkingBubble) {
        // Trích xuất dòng log cuối cùng để hiển thị cho sinh động
        let lastLog = "Zin đang suy nghĩ...";
        if (thought) {
            const lines = thought.split('\n').filter(l => l.trim().length > 0);
            if (lines.length > 0) {
                let lastLine = lines[lines.length - 1];
                lastLine = lastLine.replace(/^[➜\-*•]\s*/, '').replace(/^Bước \d+:\s*/i, '').trim();
                if (lastLine.length > 50) lastLine = lastLine.substring(0, 47) + "...";
                if (lastLine) lastLog = lastLine;
            }
        }
        
        return (
          <ThinkingBubble 
            customText={lastLog}
            fullLog={thought || undefined}
          />
        );
      }

      return (
        <div className="flex flex-col w-full min-w-0 gap-2">
          {/* Phần Accordion: Hiển thị quy trình suy luận đã qua */}
          {thought && thought.length > 0 && (
            <ThinkingAccordion thought={thought} />
          )}
          
          {/* Phần Nội dung chính: Markdown */}
          {content && content.trim().length > 0 && (
            <div className={cn("animate-in fade-in duration-200", isUserMessage ? "text-white" : "text-gray-800 dark:text-gray-100")}>
              <MemoizedMarkdown
                content={content}
                isUserMessage={isUserMessage}
              />
            </div>
          )}
        </div>
      );
  }

  // 2. Các loại tin nhắn khác (Rich Messages)
  switch (message.type) {
    case "product":
        if (message.metadata) return <ProductMessageCard metadata={message.metadata} isUserMessage={isUserMessage} />;
        return null;

    case "order":
        if (message.metadata) return <OrderMessageCard metadata={message.metadata} isUserMessage={isUserMessage} />;
        return null;

    case "product_selection":
       return <ChatProductCarousel products={message.content.products || []} />;

    case "order_selection":
       return <ChatOrderCarousel orders={message.content.orders || []} />;

    case "printer_selection":
       return <ChatPrinterCarousel printers={message.content.printers || []} />;

    case "payment_request":
       return <ChatPaymentCard content={message.content} />;

    case "image":
       return <ImageContent content={message.content} metadata={message.metadata} />;

    case "file":
       return <FileContent content={message.content} metadata={message.metadata} />;
    
    case "error":
       return <ErrorContent content={message.content} />;

    default:
       return null;
  }
}

// --- Helper Components ---

function ImageContent({ content, metadata }: { content: any; metadata: any }) {
  const imageUrl = metadata?.imageUrl || content?.imageUrl || metadata?.url;
  const alt = metadata?.description || "Ảnh đính kèm";
  
  if (!imageUrl) return null;
  return (
    <div className="mt-1">
        <img 
            src={imageUrl} 
            alt={alt} 
            className="rounded-lg max-w-xs w-full h-auto border border-gray-200 dark:border-gray-700" 
            loading="lazy" 
        />
    </div>
  );
}

function FileContent({ content, metadata }: { content: any; metadata: any }) {
  const fileName = metadata?.fileName || content?.fileName || "Tệp đính kèm";
  const fileSize = metadata?.fileSize || content?.fileSize;
  const fileUrl = metadata?.fileUrl || content?.fileUrl;

  return (
    <a 
        href={fileUrl || "#"} 
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-100 transition-colors group text-decoration-none"
    >
        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm group-hover:scale-105 transition-transform">
            DOC
        </div>
        <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate max-w-[180px]">
                {fileName}
            </span>
            {fileSize && (
                <span className="text-[10px] text-gray-400">
                    {(fileSize / 1024).toFixed(1)} KB
                </span>
            )}
        </div>
    </a>
  );
}

function ErrorContent({ content }: { content: any }) {
    const msg = typeof content === 'string' ? content : content?.message || "Có lỗi xảy ra";
    return (
        <div className="text-red-500 text-sm bg-red-50 p-2 rounded border border-red-100">
            ⚠️ {msg}
        </div>
    );
}