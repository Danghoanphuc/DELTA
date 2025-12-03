// apps/customer-frontend/src/features/chat/components/ChatInterface.tsx
import { useRef, useMemo } from "react";
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
  const fallbackScrollRef = useRef<HTMLDivElement>(null);
  const messagesScrollRef = scrollContainerRef || fallbackScrollRef;

  const {
    messages,
    quickReplies,
    isLoadingAI,
    onSendText,
    onSendQuickReply,
    onFileUpload,
    hasMoreMessages,
    loadMoreMessages,
  } = useChat();

  const hasVisibleMessages = useMemo(() => {
    if (!messages || messages.length === 0) return false;
    if (messages.length === 1 && messages[0]._id === WELCOME_ID) return false;
    return true;
  }, [messages]);

  const showWelcome = !isLoadingAI && !hasVisibleMessages;
  const showLoadingHistory = isLoadingAI && messages.length === 0;

  return (
    // 🔥 CLAUDE STYLE: Background màu giấy ấm (Warm Stone/Paper)
    <div
      className={cn(
        "flex flex-col h-full w-full relative bg-[#F9F9F8] dark:bg-zinc-950 overflow-hidden font-sans",
        className
      )}
    >
      <div className="flex-1 min-h-0 relative flex flex-col">
        {showLoadingHistory ? (
          <div className="h-full w-full flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 text-stone-400 animate-spin" />
            <p className="text-sm text-stone-500 font-medium font-serif italic">
              Đang khôi phục dữ liệu...
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

      {/* 🔥 CLAUDE STYLE: Input Area gradient fade-out instead of hard border */}
      <div className="flex-shrink-0 z-20 pointer-events-none sticky bottom-0">
        {/* Gradient fade tạo cảm giác nội dung trôi xuống dưới */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F9F9F8] dark:from-zinc-950 to-transparent" />

        <div className="max-w-3xl mx-auto w-full pb-6 px-4 relative pointer-events-auto">
          {/* Quick Replies */}
          {quickReplies.length > 0 && !isLoadingAI && (
            <div className="flex items-center justify-center gap-2 mb-3 overflow-x-auto no-scrollbar">
              {quickReplies.map((reply: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() =>
                    onSendQuickReply(reply.text, reply.payload || reply.text)
                  }
                  className="flex-shrink-0 px-4 py-1.5 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-zinc-300 text-xs font-medium rounded-full hover:border-stone-400 hover:text-stone-900 shadow-sm transition-all active:scale-95"
                >
                  {reply.text}
                </button>
              ))}
            </div>
          )}

          <ChatInput
            isLoading={isLoadingAI}
            onSendText={onSendText}
            onFileUpload={onFileUpload}
          />

          <div className="text-center pt-2 hidden md:block">
            <span className="text-[10px] text-stone-400 dark:text-zinc-600 font-medium">
              Zin AI có thể mắc lỗi. Hãy kiểm tra lại các thông tin quan trọng.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
