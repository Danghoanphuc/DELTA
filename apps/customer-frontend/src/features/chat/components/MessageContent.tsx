// apps/customer-frontend/src/features/chat/components/MessageContent.tsx
import { memo, useMemo } from "react";
import { ChatMessage } from "@/types/chat";
import { ExternalLink, AlertCircle } from "lucide-react";
import { cn } from "@/shared/lib/utils";

// ✅ CORE PARSER: Dùng lại logic parser tập trung
import { parseMessageDisplay } from "../utils/textParser";

// ✅ SMOOTH STREAMING: Hook làm mượt text
import { useSmoothStream } from "../hooks/useSmoothStream";

// ✅ RICH COMPONENTS: Import đầy đủ
import { ProductMessageCard } from "./messages/ProductMessageCard";
import { OrderMessageCard } from "./messages/OrderMessageCard";
import { ChatProductCarousel } from "./ChatProductCarousel";
import { ChatOrderCarousel } from "./ChatOrderCarousel";
import { ChatPrinterCarousel } from "./ChatPrinterCarousel";
import { ChatPaymentCard } from "./ChatPaymentCard";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { SmartLinkEmbed } from "./SmartLinkEmbed";

const MemoizedMarkdown = memo(MarkdownRenderer);

// --- Sub-components (Atomic UI) ---

// 1. Hiển thị Ảnh
function ImageContent({
  src,
  alt,
  className,
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  if (!src) return null;
  return (
    <div
      className={cn(
        "mt-1 mb-2 group relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50",
        className
      )}
    >
      <img
        src={src}
        alt={alt || "Attachment"}
        className="max-w-sm w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
        loading="lazy"
      />
    </div>
  );
}

// 2. Hiển thị File
function FileContent({
  url,
  name,
  type,
}: {
  url: string;
  name: string;
  type?: string;
}) {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3 mt-1 mb-2 bg-gray-50 rounded-xl border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-all group max-w-sm"
    >
      <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xs uppercase shrink-0">
        {type ? type.split("/").pop()?.slice(0, 4) : "DOC"}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-gray-700 truncate block group-hover:text-blue-700">
          {name}
        </span>
        <span className="text-[10px] text-gray-400 block">Nhấn để tải về</span>
      </div>
    </a>
  );
}

// 3. Hiển thị Lỗi
function ErrorContent({ content }: { content: any }) {
  const msg =
    typeof content === "string" ? content : content?.message || "Đã xảy ra lỗi";
  return (
    <div className="text-red-600 text-sm bg-red-50 p-3 rounded-xl border border-red-100 flex items-start gap-2 max-w-sm">
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <span>{msg}</span>
    </div>
  );
}

// --- Main Component ---

export function MessageContent({ message }: { message: ChatMessage }) {
  const isUserMessage = message.senderType === "User";
  const metadata = (message.metadata as any) || {};

  // ✅ ALWAYS CALL HOOKS FIRST (before any conditional returns)
  // Parse message content for text/links
  const { cleanContent, links } = useMemo(
    () => parseMessageDisplay(message.content),
    [message.content]
  );

  // Smooth streaming for bot messages
  const isStreaming = metadata.status === "streaming";
  const smoothContent = useSmoothStream(
    cleanContent,
    isStreaming && !isUserMessage
  );

  // ✅ UNIFIED MEDIA LOGIC: Gom tất cả nguồn ảnh/file vào một mảng chuẩn
  const attachments = useMemo(() => {
    const items: Array<{
      type: "image" | "file";
      url: string;
      name?: string;
      mimeType?: string;
    }> = [];
    const content = message.content as any;

    // 1. Ưu tiên: Mảng attachments từ Backend mới (SocialChatService)
    if (content?.attachments && Array.isArray(content.attachments)) {
      content.attachments.forEach((att: any) => {
        items.push({
          type:
            att.type === "image" || att.fileType?.startsWith("image/")
              ? "image"
              : "file",
          url: att.url || att.fileUrl,
          name: att.originalName || att.fileName || "File đính kèm",
          mimeType: att.fileType,
        });
      });
      return items;
    }

    // 2. Fallback: Single fileUrl từ UrlWorker hoặc Legacy Upload
    const singleFileUrl =
      content?.fileUrl ||
      metadata?.fileUrl ||
      metadata?.imageUrl ||
      metadata?.urlPreview;
    if (singleFileUrl) {
      // Đoán type nếu không có sẵn
      const isImage =
        metadata.fileType?.startsWith("image/") ||
        singleFileUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) ||
        message.type === "image";

      items.push({
        type: isImage ? "image" : "file",
        url: singleFileUrl,
        name: content?.fileName || metadata?.fileName || "Tệp đính kèm",
        mimeType: metadata?.fileType,
      });
    }

    return items;
  }, [message]);

  // --- CASE 1: Text & AI Response (Bao gồm cả text có ảnh đính kèm) ---
  if (
    message.type === "text" ||
    message.type === "ai_response" ||
    message.type === "image" ||
    message.type === "file"
  ) {
    if ((message as any)?._skipRender) return null;

    // Nếu lọc xong mà không còn gì để hiện (Text rỗng, không ảnh, không link) -> Ẩn
    if (!cleanContent && attachments.length === 0 && links.length === 0) {
      // Ngoại lệ: Nếu user gửi mà rỗng -> hiện placeholder
      if (isUserMessage) {
        return (
          <div className="italic opacity-80 text-sm flex items-center gap-1">
            <ExternalLink size={12} /> Đã gửi nội dung
          </div>
        );
      }
      return null;
    }

    return (
      <div className="flex flex-col w-full min-w-0 gap-2 animate-in fade-in duration-300">
        {/* A. Render Attachments (Ảnh/File) */}
        {attachments.map((att, idx) =>
          att.type === "image" ? (
            <ImageContent key={idx} src={att.url} alt={att.name} />
          ) : (
            <FileContent
              key={idx}
              url={att.url}
              name={att.name || "File"}
              type={att.mimeType}
            />
          )
        )}

        {/* B. Render Text (Markdown) với Smooth Streaming */}
        {cleanContent && (
          <MemoizedMarkdown
            content={smoothContent}
            isUserMessage={isUserMessage}
            isStreaming={isStreaming}
          />
        )}

        {/* C. Render Parsed Links (Smart Embed) */}
        {/* ❌ KHÔNG render link preview nếu đang thinking */}
        {links.length > 0 && !(message.content as any)?.isThinking && (
          <div className="flex flex-col gap-2 mt-1">
            {links.map((link, idx) => (
              <SmartLinkEmbed
                key={idx}
                url={link.url}
                type={link.type}
                title={link.title}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- CASE 2: Rich Content Types (Backend Specific) ---
  switch (message.type) {
    case "product":
      return message.metadata ? (
        <ProductMessageCard
          metadata={message.metadata as any}
          isUserMessage={isUserMessage}
        />
      ) : null;

    case "order":
      return message.metadata ? (
        <OrderMessageCard
          metadata={message.metadata as any}
          isUserMessage={isUserMessage}
        />
      ) : null;

    case "product_selection":
      return (
        <div className="space-y-2">
          {/* Hiển thị câu dẫn (summary text) nếu có */}
          {message.content &&
            typeof message.content !== "string" &&
            (message.content as any).text && (
              <MemoizedMarkdown
                content={(message.content as any).text}
                isUserMessage={false}
              />
            )}
          <ChatProductCarousel
            products={(message.content as any)?.products || []}
          />
        </div>
      );

    case "order_selection":
      try {
        const orders = (message.content as any)?.orders || [];
        console.log("[MessageContent] order_selection:", {
          messageId: message._id,
          hasContent: !!message.content,
          ordersCount: orders.length,
          orders: orders,
        });
        return (
          <div className="space-y-2">
            {message.content &&
              typeof message.content !== "string" &&
              (message.content as any).text && (
                <MemoizedMarkdown
                  content={(message.content as any).text}
                  isUserMessage={false}
                />
              )}
            <ChatOrderCarousel orders={orders} />
          </div>
        );
      } catch (error) {
        console.error("[MessageContent] order_selection error:", error);
        return <ErrorContent content="Không thể hiển thị đơn hàng" />;
      }

    case "printer_selection":
      return (
        <div className="space-y-2">
          {message.content &&
            typeof message.content !== "string" &&
            (message.content as any).text && (
              <MemoizedMarkdown
                content={(message.content as any).text}
                isUserMessage={false}
              />
            )}
          <ChatPrinterCarousel
            printers={(message.content as any)?.printers || []}
          />
        </div>
      );

    case "payment_request":
      return <ChatPaymentCard content={message.content as any} />;

    case "error":
      return <ErrorContent content={message.content} />;

    default:
      // Handle legacy "quote" type or unknown types
      if ((message as any).type === "quote") {
        return (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="font-bold text-yellow-800 text-sm mb-1">
              Yêu cầu báo giá
            </div>
            <p className="text-gray-700 text-sm">
              {(message.content as any)?.text?.replace("Quote: ", "")}
            </p>
          </div>
        );
      }
      return null;
  }
}
