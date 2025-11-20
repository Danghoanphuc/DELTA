// src/features/chat/components/MessageContent.tsx
// Dumb component - render nội dung message theo type

import { ChatMessage } from "@/types/chat";
import { ChatProductCarousel } from "./ChatProductCarousel";
import { ChatOrderCarousel } from "./ChatOrderCarousel";
// ✅ ZERO-EXIT PAYMENT: Import ChatPaymentCard
import { ChatPaymentCard } from "./ChatPaymentCard";
// ✅ RICH MESSAGES: Import Rich Message Cards
import { ProductMessageCard } from "./messages/ProductMessageCard";
import { OrderMessageCard } from "./messages/OrderMessageCard";

interface MessageContentProps {
  message: ChatMessage;
}

export function MessageContent({ message }: MessageContentProps) {
  const isUserMessage = message.senderType === "User";

  switch (message.type) {
    case "text":
      return <TextContent content={message.content} />;

    case "ai_response":
      return <TextContent content={message.content} />;

    // ✅ RICH MESSAGES: Render single product card (from backend rich messages)
    case "product":
      if (message.metadata) {
        return <ProductMessageCard metadata={message.metadata} isUserMessage={isUserMessage} />;
      }
      return <TextContent content={message.content} />;

    // ✅ RICH MESSAGES: Render single order card (from backend rich messages)
    case "order":
      if (message.metadata) {
        return <OrderMessageCard metadata={message.metadata} isUserMessage={isUserMessage} />;
      }
      return <TextContent content={message.content} />;

    // Legacy: Product carousel (AI tool response)
    case "product_selection":
      return <ChatProductCarousel products={message.content.products || []} />;

    // Legacy: Order carousel (AI tool response)
    case "order_selection":
      return <ChatOrderCarousel orders={message.content.orders || []} />;

    // ✅ ZERO-EXIT PAYMENT: Render payment request card
    case "payment_request":
      return <ChatPaymentCard content={message.content} />;

    // ✅ RICH MESSAGES: Handle image messages
    case "image":
      return <ImageContent content={message.content} metadata={message.metadata} />;

    // ✅ RICH MESSAGES: Handle file messages
    case "file":
      return <FileContent content={message.content} metadata={message.metadata} />;

    case "error":
      return <ErrorContent content={message.content} />;

    default:
      return <TextContent content={message.content} />;
  }
}

function TextContent({ content }: { content: any }) {
  if (typeof content === "string") {
    return <span>{content}</span>;
  }

  if (content?.text) {
    return <span>{content.text}</span>;
  }

  return <span>Unsupported content type</span>;
}

function ErrorContent({ content }: { content: any }) {
  return (
    <div className="text-red-600 dark:text-red-400">
      <strong>Lỗi:</strong> {content?.message || "Đã xảy ra lỗi không xác định"}
    </div>
  );
}

// ✅ RICH MESSAGES: Image content component
function ImageContent({ content, metadata }: { content: any; metadata: any }) {
  const imageUrl = metadata?.imageUrl || metadata?.url || content?.imageUrl;
  const description = metadata?.description || content?.text;

  if (!imageUrl) {
    return <TextContent content={content} />;
  }

  return (
    <div className="max-w-xs">
      <img
        src={imageUrl}
        alt={description || "Image"}
        className="rounded-lg w-full h-auto"
        loading="lazy"
      />
      {description && (
        <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
          {description}
        </p>
      )}
    </div>
  );
}

// ✅ RICH MESSAGES: File content component
function FileContent({ content, metadata }: { content: any; metadata: any }) {
  const fileName = metadata?.fileName || metadata?.name || content?.fileName || "File";
  const fileUrl = metadata?.fileUrl || metadata?.url || content?.fileUrl;
  const fileSize = metadata?.fileSize || metadata?.size;

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center">
        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{fileName}</p>
        {fileSize && (
          <p className="text-xs text-gray-500">
            {(fileSize / 1024).toFixed(2)} KB
          </p>
        )}
      </div>
      {fileUrl && (
        <a
          href={fileUrl}
          download={fileName}
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </a>
      )}
    </div>
  );
}
