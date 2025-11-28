// src/features/chat/examples/ChatExample.tsx
// Example demonstrating how to use the refactored chat system

import React from "react";
import { ChatContainer } from "../components/ChatContainer";
import { useChatContext } from "../context/ChatProvider";
import { Button } from "@/shared/components/ui/button";

// Example 1: Using the full container (recommended)
export function FullChatExample() {
  return (
    <div className="h-screen w-full">
      <ChatContainer />
    </div>
  );
}

// Example 2: Custom chat with additional features
function CustomChatHeader() {
  const { conversations, handleNewChat } = useChatContext();

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <h2 className="text-xl font-bold">AI Assistant</h2>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">
          {conversations.length} conversations
        </span>
        <Button onClick={handleNewChat} size="sm">
          New Chat
        </Button>
      </div>
    </div>
  );
}

export function CustomChatExample() {
  return (
    <div className="h-screen flex flex-col">
      <CustomChatHeader />
      <div className="flex-1">
        <ChatContainer />
      </div>
    </div>
  );
}

// Example 3: Minimal chat integration
export function MinimalChatExample() {
  const { onSendText, messages, isLoadingAI } = useChatContext();

  const handleQuickSend = () => {
    // onSendText hiện tại chỉ nhận 1 tham số text, nên bỏ toạ độ mẫu đi để khớp type
    onSendText("Hello AI!");
  };

  return (
    <div className="p-4 space-y-4">
      <Button onClick={handleQuickSend} disabled={isLoadingAI}>
        {isLoadingAI ? "Sending..." : "Send Hello"}
      </Button>

      <div className="space-y-2">
        {messages.slice(-3).map((msg) => ( // Show last 3 messages
          <div key={msg._id} className="p-2 bg-gray-100 rounded">
            <strong>{msg.senderType}:</strong> { (msg.content && 'text' in msg.content && msg.content.text) ? msg.content.text : 'Media'}
          </div>
        ))}
      </div>
    </div>
  );
}

// Example 4: Chat widget/popover
export function ChatWidgetExample() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
      >
        💬
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Chat with AI</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="h-full">
              <ChatContainer />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
