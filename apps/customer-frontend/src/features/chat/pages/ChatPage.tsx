import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Plus, Home, MessageSquarePlus, X, Search } from "lucide-react";

// Components
import { ChatInterface } from "@/features/chat/components/ChatInterface";
import { ChatProvider, useChatContext } from "../context/ChatProvider";
import { ChatBotSync } from "../components/ChatBotSync";
import { Button } from "@/shared/components/ui/button";
import { useIsMobile } from "@/shared/hooks/useMediaQuery";
import { useKeyboardShortcuts } from "@/shared/hooks/useKeyboardShortcuts";
import { FocusTrap } from "@/shared/components/ui/FocusTrap";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
import { SocialNavSidebar } from "@/features/social/components/SocialNavSidebar";
import { GlobalHeader } from "@/components/GlobalHeader";
import { DynamicIsland } from "@/shared/components/ui/DynamicIsland";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { ChatHistorySidebar } from "@/features/chat/components/ChatHistorySidebar";

const ChatLayout = () => {
  const {
    conversations,
    currentConversationId,
    handleSelectConversation,
    handleNewChat,
  } = useChatContext();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const { getCartItemCount } = useCartStore();
  const { accessToken } = useAuthStore();
  const cartItemCount = getCartItemCount(!!accessToken);

  const onSelectConversationWrapper = (id: string) => {
    handleSelectConversation(id);
    if (isMobile) setIsSidebarOpen(false);
  };

  const onNewChatWrapper = () => {
    handleNewChat();
    if (isMobile) setIsSidebarOpen(false);
  };

  useKeyboardShortcuts([
    {
      key: "k",
      meta: true,
      ctrl: true,
      callback: () => {
        setIsSidebarOpen(true);
        setTimeout(
          () => document.getElementById("chat-search-input")?.focus(),
          100
        );
      },
      description: "Mở tìm kiếm lịch sử",
    },
    {
      key: "n",
      meta: true,
      ctrl: true,
      callback: handleNewChat,
      description: "Tạo chat mới",
    },
  ]);

  const MobileHeader = () => (
    <header className="lg:hidden h-14 border-b border-gray-100 bg-white/95 dark:bg-gray-900/95 backdrop-blur flex items-center justify-between px-4 sticky top-0 z-30 shadow-sm transition-all">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="-ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu size={24} />
        </Button>
        <span className="font-bold text-lg text-gray-900 dark:text-gray-100 tracking-tight">
          Zin AI
        </span>
      </div>
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-gray-800 rounded-full"
          asChild
        >
          <Link to="/app">
            <Home size={24} strokeWidth={2} />
          </Link>
        </Button>
      </div>
    </header>
  );

  const DesktopHistorySidebar = () => (
    <aside className="hidden lg:flex w-72 xl:w-80 h-full border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-col flex-shrink-0">
      <div className="h-16 border-b border-gray-200 dark:border-gray-700 px-4 flex items-center justify-between bg-white dark:bg-gray-800">
        <h2 className="font-bold text-lg text-gray-800 dark:text-gray-100">
          Lịch sử Chat
        </h2>
        <Button
          onClick={onNewChatWrapper}
          size="icon"
          variant="ghost"
          className="text-blue-600 hover:bg-blue-50"
          title="Chat mới"
        >
          <MessageSquarePlus size={20} />
        </Button>
      </div>
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            id="chat-search-input"
            type="text"
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 border border-transparent focus:border-blue-200 rounded-lg transition-all outline-none"
          />
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        {/* ✅ Đã cập nhật props chuẩn cho ChatHistorySidebar */}
        <ChatHistorySidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={onSelectConversationWrapper}
          onNewChat={onNewChatWrapper}
          searchQuery={searchQuery}
          isVisible={true}
        />
      </div>
    </aside>
  );

  const MobileOverlaySidebar = () => (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
          />
          <FocusTrap active={isSidebarOpen}>
            <motion.aside
              role="dialog"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-[85%] max-w-[320px] bg-white dark:bg-gray-900 shadow-2xl lg:hidden flex flex-col"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h2 className="font-bold text-lg text-gray-800">
                  Lịch sử Chat
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSidebarOpen(false)}
                  className="h-8 w-8 rounded-full bg-gray-200/50"
                >
                  <X size={18} />
                </Button>
              </div>
              <div className="p-3 border-b border-gray-100">
                <Button
                  onClick={onNewChatWrapper}
                  className="w-full bg-blue-600 text-white shadow-md mb-2 hover:bg-blue-700"
                >
                  <Plus size={18} className="mr-2" />
                  Cuộc trò chuyện mới
                </Button>
              </div>
              <div className="flex-1 overflow-hidden">
                <ChatHistorySidebar
                  conversations={conversations}
                  currentConversationId={currentConversationId}
                  onSelectConversation={onSelectConversationWrapper}
                  onNewChat={onNewChatWrapper}
                  searchQuery={searchQuery}
                  isVisible={isSidebarOpen}
                />
              </div>
            </motion.aside>
          </FocusTrap>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <DynamicIsland />
      <GlobalHeader
        cartItemCount={cartItemCount}
        onCartClick={() => navigate("/cart")}
      />

      <div className="fixed inset-0 lg:top-16 h-[100dvh] lg:h-[calc(100dvh-4rem)] w-screen bg-white dark:bg-gray-950 flex overflow-hidden font-sans z-0">
        <div className="hidden lg:block h-full flex-shrink-0 z-10">
          <SocialNavSidebar />
        </div>

        <DesktopHistorySidebar />
        <MobileOverlaySidebar />

        <main className="flex-1 flex flex-col h-full min-w-0 relative bg-white dark:bg-gray-950">
          <MobileHeader />

          <ErrorBoundary>
            <ChatInterface
              scrollContainerRef={messagesScrollRef}
              className="h-full"
            />
          </ErrorBoundary>
        </main>
      </div>
    </>
  );
};

export default function ChatPage() {
  return (
    <ChatProvider>
      <ChatBotSync />
      <ChatLayout />
    </ChatProvider>
  );
}
