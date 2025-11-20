// src/features/chat/components/ChatInterface.tsx
// Smart component - kết hợp các dumb components và logic

import { useChatContext } from "../context/ChatProvider";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { ChatHistorySidebar } from "./ChatHistorySidebar";
import { cn } from "@/shared/lib/utils";

interface ChatInterfaceProps {
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
  className?: string;
}

export function ChatInterface({
  isExpanded = true,
  onToggleExpanded,
  className
}: ChatInterfaceProps) {
  const {
    messages,
    quickReplies,
    isLoadingAI,
    conversations,
    currentConversationId,
    onSendText,
    onSendQuickReply,
    onFileUpload,
    handleNewChat,
    handleSelectConversation,
    // ✅ INFINITE SCROLL: Get pagination data and handler
    hasMoreMessages,
    handleLoadMoreMessages,
  } = useChatContext();

  return (
    <div className={cn("flex h-full", className)}>
      {/* Chat History Sidebar */}
      <ChatHistorySidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        isVisible={isExpanded}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Messages */}
        <MessageList
          messages={messages}
          quickReplies={quickReplies}
          isLoadingAI={isLoadingAI}
          onSendQuickReply={onSendQuickReply}
          hasMoreMessages={hasMoreMessages}
          onLoadMore={handleLoadMoreMessages}
        />

        {/* Input */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <ChatInput
            isLoading={isLoadingAI}
            onSendText={onSendText}
            onFileUpload={onFileUpload}
          />
        </div>
      </div>
    </div>
  );
}
