// src/features/chat/pages/ChatHistoryPage.tsx

import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquarePlus } from "lucide-react";
import { ChatHistorySidebar } from "../components/ChatHistorySidebar";
import { ChatProvider, useChatContext } from "../context/ChatProvider";
import { Button } from "@/shared/components/ui/button";

const ChatHistoryView = () => {
  const navigate = useNavigate();
  const {
    conversations,
    currentConversationId,
    handleSelectConversation,
    handleNewChat,
  } = useChatContext();

  const handleConversationSelect = (id: string) => {
    handleSelectConversation(id);
    // Navigate back to chat after selecting conversation
    navigate("/chat");
  };

  const handleNewChatClick = () => {
    handleNewChat();
    navigate("/chat");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/chat")}
          className="p-2"
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-lg font-semibold text-gray-900">Lịch sử chat</h1>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/chat")}
              className="p-2"
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">Lịch sử chat</h1>
          </div>
          <Button
            onClick={handleNewChatClick}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <MessageSquarePlus size={18} className="mr-2" />
            Chat mới
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 py-6 lg:px-6 lg:py-8">
        <div className="max-w-md mx-auto">
          <ChatHistorySidebar
            conversations={conversations}
            currentConversationId={currentConversationId}
            onSelectConversation={handleConversationSelect}
            onNewChat={handleNewChatClick}
            isVisible={true}
          />
        </div>
      </div>

      {/* Mobile Bottom Action */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 p-4 safe-area-bottom">
        <Button
          onClick={handleNewChatClick}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-base font-medium active:scale-95 transition-transform touch-manipulation"
        >
          <MessageSquarePlus size={20} className="mr-2" />
          Bắt đầu chat mới
        </Button>
      </div>

      {/* Add bottom padding for mobile */}
      <div className="lg:hidden h-20" />
    </div>
  );
};

export default function ChatHistoryPage() {
  return (
    <ChatProvider>
      <ChatHistoryView />
    </ChatProvider>
  );
}
