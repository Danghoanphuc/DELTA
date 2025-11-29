import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquarePlus } from "lucide-react";
import { ChatHistorySidebar } from "../components/ChatHistorySidebar";
import { ChatProvider, useChatContext } from "../context/ChatProvider";
import { Button } from "@/shared/components/ui/button";
import { ChatBotSync } from "../components/ChatBotSync"; // ✅ Thêm Sync

const ChatHistoryView = () => {
  const navigate = useNavigate();
  const {
    conversations,
    currentConversationId,
    handleSelectConversation,
    handleNewChat,
  } = useChatContext();

  const handleConversationSelect = (id: string) => {
    // 1. Select conversation
    handleSelectConversation(id);
    // 2. Navigate to chat page (state đã được set trong store toàn cục)
    navigate("/chat");
  };

  const handleNewChatClick = () => {
    handleNewChat();
    navigate("/chat");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/chat")}
          className="p-2 -ml-2 rounded-full"
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-lg font-semibold text-gray-900">Lịch sử chat</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 py-4 pb-24">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
          <ChatHistorySidebar
            conversations={conversations}
            currentConversationId={currentConversationId}
            onSelectConversation={handleConversationSelect}
            onNewChat={handleNewChatClick}
            isVisible={true}
          />
        </div>
      </div>

      {/* Mobile Bottom Action (Floating) */}
      <div className="lg:hidden fixed bottom-6 left-4 right-4 z-20">
        <Button
          onClick={handleNewChatClick}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-2xl shadow-lg text-base font-bold active:scale-95 transition-transform"
        >
          <MessageSquarePlus size={20} className="mr-2" />
          Bắt đầu chat mới
        </Button>
      </div>
    </div>
  );
};

export default function ChatHistoryPage() {
  return (
    <ChatProvider>
      <ChatBotSync /> {/* ✅ Sync để cập nhật danh sách real-time */}
      <ChatHistoryView />
    </ChatProvider>
  );
}
