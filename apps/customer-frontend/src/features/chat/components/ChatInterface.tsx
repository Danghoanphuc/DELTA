// apps/customer-frontend/src/features/chat/components/ChatInterface.tsx
import { useRef, useMemo } from "react";
// ✅ GIẢ ĐỊNH: Bạn có một hook useChat hoặc context provider chuẩn
// Nếu bạn dùng useChat trực tiếp: import { useChat } from "../hooks/useChat";
import { useChat } from "../hooks/useChat";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { ChatWelcome } from "./ChatWelcome";
import { WELCOME_ID } from "../hooks/useMessageState";
import { cn } from "@/shared/lib/utils";
import { Loader2 } from "lucide-react";

interface ChatInterfaceProps {
  className?: string;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}

export function ChatInterface({
  className,
  scrollContainerRef,
}: ChatInterfaceProps) {
  // Fallback ref nếu không được truyền từ ngoài
  const fallbackScrollRef = useRef<HTMLDivElement>(null);
  const messagesScrollRef = scrollContainerRef || fallbackScrollRef;

  // ✅ SỬ DỤNG HOOK ĐỒNG BỘ MỚI
  const {
    messages,
    quickReplies,
    isLoadingAI,
    onSendText,
    onSendQuickReply,
    onFileUpload, // Hàm này sẽ xử lý việc upload lên server
    hasMoreMessages,
    loadMoreMessages, // Đổi tên cho khớp với hook useChat
  } = useChat();

  // Logic kiểm tra xem đã có tin nhắn thực tế chưa (để ẩn Welcome)
  const hasVisibleMessages = useMemo(() => {
    if (!messages || messages.length === 0) return false;
    // Nếu chỉ có đúng 1 tin nhắn và nó là Welcome -> Chưa có tin thật
    if (messages.length === 1 && messages[0]._id === WELCOME_ID) return false;
    return true;
  }, [messages]);

  const showWelcome = !isLoadingAI && !hasVisibleMessages;
  const showLoadingHistory = isLoadingAI && messages.length === 0;

  return (
    <div
      className={cn(
        "flex flex-col h-full w-full relative bg-white dark:bg-gray-950 overflow-hidden",
        className
      )}
    >
      <div className="flex-1 min-h-0 relative flex flex-col">
        {showLoadingHistory ? (
          <div className="h-full w-full flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-sm text-gray-500 font-medium animate-pulse">
              Đang tải dữ liệu...
            </p>
          </div>
        ) : showWelcome ? (
          <div className="h-full w-full flex flex-col">
            <ChatWelcome onPromptClick={onSendText} />
          </div>
        ) : (
          <div className="h-full w-full">
            <MessageList
              messages={messages}
              quickReplies={quickReplies}
              isLoadingAI={isLoadingAI}
              onSendQuickReply={onSendQuickReply}
              hasMoreMessages={hasMoreMessages}
              onLoadMore={loadMoreMessages}
              scrollContainerRef={messagesScrollRef}
            />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div
        className={cn(
          "flex-shrink-0 bg-white dark:bg-gray-900 z-20",
          "shadow-[0_-4px_20px_rgba(0,0,0,0.05)] border-t border-gray-100 dark:border-gray-800",
          "pb-[env(safe-area-inset-bottom)] transition-all duration-300 ease-in-out"
        )}
      >
        <div className="max-w-3xl mx-auto w-full space-y-2">
          {/* Quick Replies (Chỉ hiện khi rảnh tay) */}
          {quickReplies.length > 0 && !isLoadingAI && (
            <div className="flex items-center gap-2 px-4 pt-2 overflow-x-auto no-scrollbar mask-image-scrim">
              {quickReplies.map((reply: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => onSendQuickReply(reply.text, reply.payload)}
                  className="flex-shrink-0 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-full hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all whitespace-nowrap active:scale-95"
                >
                  {reply.text}
                </button>
              ))}
            </div>
          )}

          <ChatInput
            isLoading={isLoadingAI}
            onSendText={onSendText}
            onFileUpload={onFileUpload} // Prop drilling chuẩn
          />

          <div className="text-center pb-2 hidden md:block">
            <span className="text-[10px] text-gray-400 dark:text-gray-500 select-none">
              Zin AI Assistant có thể mắc lỗi. Hãy kiểm tra lại thông tin quan
              trọng.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
