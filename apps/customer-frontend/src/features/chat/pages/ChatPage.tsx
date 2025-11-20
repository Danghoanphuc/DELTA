// src/features/chat/pages/ChatPage.tsx (HEADER UPDATED)

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Menu,
    Plus, // ✅ FIX: Import Plus icon
    Home,
    MessageSquarePlus,
    X,
    Search,
    Settings // ✅ Thêm icon bánh răng cho cài đặt
} from "lucide-react";

// Components
import { ChatHistorySidebar } from "@/features/chat/components/ChatHistorySidebar";
import { ChatMessages } from "@/features/chat/components/ChatMessages";
import { ChatInput } from "@/features/chat/components/ChatInput";
import { ChatWelcome } from "../components/ChatWelcome";
import { ChatProvider, useChatContext } from "../context/ChatProvider";
import { Button } from "@/shared/components/ui/button";
import { WELCOME_ID } from "../hooks/useChat";
import { cn } from "@/shared/lib/utils";
import { useIsMobile } from "@/shared/hooks/useMediaQuery";
import { useKeyboardShortcuts } from "@/shared/hooks/useKeyboardShortcuts";
import { FocusTrap } from "@/shared/components/ui/FocusTrap";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";

const ChatLayout = () => {
  const {
    messages,
    quickReplies,
    isLoadingAI,
    onSendText,
    onSendQuickReply,
    onFileUpload,
    conversations,
    currentConversationId,
    handleSelectConversation,
    handleNewChat,
  } = useChatContext();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [searchQuery, setSearchQuery] = useState("");
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile(); 

  const showWelcome = messages.length === 0 ||
    (messages.length === 1 && messages[0]._id === WELCOME_ID);

  const onSelectConversationWrapper = (id: string) => {
    handleSelectConversation(id);
    if (isMobile) setIsSidebarOpen(false);
  };

  const onNewChatWrapper = () => {
      handleNewChat();
      if (isMobile) setIsSidebarOpen(false);
  }

  useKeyboardShortcuts([
    {
      key: 'k',
      meta: true,
      ctrl: true,
      callback: () => {
        setIsSidebarOpen(true);
        setTimeout(() => {
          document.getElementById('chat-search-input')?.focus();
        }, 100);
      },
      description: 'Mở tìm kiếm lịch sử'
    },
    {
      key: 'n',
      meta: true,
      ctrl: true,
      callback: handleNewChat,
      description: 'Tạo chat mới'
    }
  ]);

  // ✅ HEADER MOBILE ĐÃ ĐƯỢC CẢI TẠO
  const MobileHeader = () => (
    <header className="lg:hidden h-14 border-b border-gray-100 bg-white/95 dark:bg-gray-900/95 backdrop-blur flex items-center justify-between px-4 sticky top-0 z-30 shadow-sm transition-all">
        {/* Trái: Menu Toggle & Logo */}
        <div className="flex items-center gap-3">
            <Button 
                variant="ghost" 
                size="icon" 
                className="-ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Mở menu lịch sử chat"
            >
                <Menu size={24} />
            </Button>
            <span className="font-bold text-lg text-gray-900 dark:text-gray-100 tracking-tight">Zin AI Chat</span>
        </div>

        {/* Phải: Home Button (Thay thế cho Back & Plus) */}
        <div className="flex items-center">
            <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-500 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-gray-800 rounded-full" 
                asChild
                aria-label="Quay về trang chủ"
            >
                <Link to="/app">
                    <Home size={24} strokeWidth={2} />
                </Link>
            </Button>
            
            {/* ❌ Đã gỡ bỏ nút Plus (+), người dùng tạo chat mới bằng Sidebar */}
        </div>
    </header>
  );

  const DesktopSidebar = () => (
    <aside className="hidden lg:flex w-80 h-full border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-col flex-shrink-0">
         <div className="h-16 border-b border-gray-200 dark:border-gray-700 px-4 flex items-center justify-between bg-white dark:bg-gray-800">
            <Link to="/app" className="flex items-center gap-2 font-bold text-xl text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors" aria-label="Về trang chủ">
                <Home size={24} />
            </Link>
            <Button 
                onClick={handleNewChat} 
                size="sm" 
                variant="outline"
                className="gap-2 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-500 transition-all"
                aria-label="Tạo cuộc trò chuyện mới"
            >
                <MessageSquarePlus size={16} />
                Chat mới
            </Button>
         </div>
         
         <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
             <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                 <input
                     id="chat-search-input"
                     type="text"
                     placeholder="Tìm kiếm lịch sử..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="w-full pl-9 pr-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 border border-transparent focus:border-blue-200 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 rounded-lg transition-all outline-none text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                     aria-label="Tìm kiếm trong lịch sử chat"
                 />
             </div>
         </div>
         
         <div className="flex-1 overflow-hidden">
             <ChatHistorySidebar
                 conversations={conversations}
                 currentConversationId={currentConversationId}
                 onSelectConversation={onSelectConversationWrapper}
                 onNewChat={onNewChatWrapper}
                 searchQuery={searchQuery}
                 isVisible={true}
             />
         </div>
         
         <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
             <button className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors font-medium">
                 <Settings size={18} />
                 Cài đặt và trợ giúp
             </button>
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
                    aria-hidden="true"
                />
                <FocusTrap active={isSidebarOpen}>
                    <motion.aside
                        role="dialog"
                        aria-modal="true"
                        aria-label="Menu lịch sử chat"
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 left-0 z-50 w-[85%] max-w-[320px] bg-white dark:bg-gray-900 shadow-2xl lg:hidden flex flex-col"
                    >
                         <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                            <h2 className="font-bold text-lg text-gray-800 dark:text-gray-100">Lịch sử Chat</h2>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setIsSidebarOpen(false)}
                                className="h-8 w-8 rounded-full bg-gray-200/50 dark:bg-gray-700/50 hover:bg-gray-300 dark:hover:bg-gray-600"
                                aria-label="Đóng menu"
                            >
                                <X size={18} />
                            </Button>
                        </div>

                        <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                             <Button 
                                onClick={onNewChatWrapper} 
                                className="w-full bg-blue-600 dark:bg-blue-500 text-white shadow-md mb-2 hover:bg-blue-700"
                                aria-label="Tạo cuộc trò chuyện mới"
                            >
                                <Plus size={18} className="mr-2" />
                                Cuộc trò chuyện mới
                            </Button>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-blue-200 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 rounded-lg transition-all outline-none text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    aria-label="Tìm kiếm trong lịch sử chat"
                                />
                            </div>
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
    <div className="fixed inset-0 h-[100dvh] w-screen bg-white dark:bg-gray-950 flex overflow-hidden font-sans z-[100]">
        
        <DesktopSidebar />
        <MobileOverlaySidebar />

        <main className="flex-1 flex flex-col h-full min-w-0 relative bg-white dark:bg-gray-950">
            
            <MobileHeader />

            {/* Messages Area - Sử dụng custom-scrollbar */}
            <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar px-0 relative" ref={messagesScrollRef}>
                {showWelcome ? (
                    <div className="h-full w-full flex flex-col justify-center items-center pb-10"> 
                        <ChatWelcome onPromptClick={onSendText} />
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto w-full py-6 px-4">
                        <ErrorBoundary>
                            <ChatMessages
                                messages={messages}
                                isLoadingAI={isLoadingAI}
                                scrollContainerRef={messagesScrollRef}
                            />
                        </ErrorBoundary>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className={cn(
                "flex-shrink-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 z-20",
                "pb-[env(safe-area-inset-bottom)] transition-all duration-300 ease-in-out" 
            )}>
                <div className="max-w-3xl mx-auto w-full px-3 py-2 md:px-4 md:py-4 space-y-2">
                    
                    {/* Flex Horizontal Scroll */}
                    {quickReplies.length > 0 && !isLoadingAI && (
                       <div className="flex items-center gap-2 pb-2 px-1 overflow-x-auto no-scrollbar mask-image-scrim">
                       {quickReplies.map((reply, idx) => (
                           <button 
                               key={idx}
                               onClick={() => onSendQuickReply(reply.text, reply.payload)}
                                    className="flex-shrink-0 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all whitespace-nowrap shadow-sm active:scale-95"
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
                    
                    <div className="text-center hidden md:block">
                         <span className="text-[10px] text-gray-400 dark:text-gray-500">
                             Zin AI có thể mắc lỗi. Hãy kiểm tra thông tin quan trọng.
                         </span>
                    </div>
                </div>
            </div>
        </main>
    </div>
  );
};

export default function ChatPage() {
  return (
    <ChatProvider>
      <ChatLayout />
    </ChatProvider>
  );
}