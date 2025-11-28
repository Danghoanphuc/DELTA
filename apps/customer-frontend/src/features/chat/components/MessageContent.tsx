// src/features/chat/components/MessageContent.tsx
import { memo } from "react";
import { ChatMessage } from "@/types/chat";
import { ChatProductCarousel } from "./ChatProductCarousel";
import { ChatOrderCarousel } from "./ChatOrderCarousel";
import { ChatPrinterCarousel } from "./ChatPrinterCarousel";
import { ChatPaymentCard } from "./ChatPaymentCard";
import { ProductMessageCard, OrderMessageCard } from "./messages";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { SmartLinkEmbed } from "./SmartLinkEmbed";
import { parseThinkingContent } from "../utils/textParser";
import { cn } from "@/shared/lib/utils";

const MemoizedMarkdown = memo(MarkdownRenderer);

interface MessageContentProps {
  message: ChatMessage;
}

export function MessageContent({ message }: MessageContentProps) {
  const isUserMessage = message.senderType === "User";

  // 1. TEXT MESSAGE & AI RESPONSE
  if (message.type === "text" || message.type === "ai_response") {
      if ((message as any)?._skipRender) return null;

      let rawText = "";
      if (typeof message.content === "string") {
        rawText = message.content;
      } else if ((message.content as any)?.text) {
        rawText = (message.content as any).text || "";
      }
      
      // Parse lấy content sạch và links (đã loại bỏ thẻ <think>)
      const { content, links } = parseThinkingContent(rawText);

      return (
        <div className="flex flex-col w-full min-w-0 gap-1">
          {/* Render Text Content */}
          {content && content.trim().length > 0 && (
            <div className={cn("animate-in fade-in duration-300")}>
              <MemoizedMarkdown
                content={content}
                isUserMessage={isUserMessage}
              />
            </div>
          )}

          {/* Render Smart Links */}
          {links && links.length > 0 && (
              <div className="flex flex-col gap-2 mt-1">
                  {links.map((link, idx) => (
                      <SmartLinkEmbed key={idx} url={link.url} type={link.type} />
                  ))}
              </div>
          )}
        </div>
      );
  }

  // 2. RICH MESSAGES (Giữ nguyên switch case cũ)
  switch (message.type) {
    case "product":
        if (message.metadata) return <ProductMessageCard metadata={message.metadata as any} isUserMessage={isUserMessage} />;
        return null;
    case "order":
        if (message.metadata) return <OrderMessageCard metadata={message.metadata as any} isUserMessage={isUserMessage} />;
        return null;
    case "product_selection":
       return <ChatProductCarousel products={(message.content as any)?.products || []} />;
    case "order_selection":
       return <ChatOrderCarousel orders={(message.content as any)?.orders || []} />;
    case "printer_selection":
       return <ChatPrinterCarousel printers={(message.content as any)?.printers || []} />;
    case "payment_request":
       return <ChatPaymentCard content={message.content as any} />;
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

// ... (Giữ nguyên các helper ImageContent, FileContent, ErrorContent ở cuối file)
function ImageContent({ content, metadata }: { content: any; metadata: any }) {
  const imageUrl = metadata?.imageUrl || content?.imageUrl || metadata?.url;
  if (!imageUrl) return null;
  return <div className="mt-1 group relative"><img src={imageUrl} alt="Attachment" className="rounded-lg max-w-xs w-full h-auto border bg-gray-100" loading="lazy" /></div>;
}
function FileContent({ content, metadata }: { content: any; metadata: any }) {
  const fileName = metadata?.fileName || content?.fileName || "File";
  const fileUrl = metadata?.fileUrl || content?.fileUrl;
  return <a href={fileUrl || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors group text-decoration-none"><div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xs">DOC</div><span className="text-sm font-medium text-gray-700 truncate max-w-[180px]">{fileName}</span></a>;
}
function ErrorContent({ content }: { content: any }) {
    const msg = typeof content === 'string' ? content : content?.message || "Lỗi";
    return <div className="text-red-500 text-sm bg-red-50 p-2 rounded border border-red-100">⚠️ {msg}</div>;
}