// src/features/chat/pages/ChatAppPage.tsx (CẬP NHẬT - SIÊU SẠCH)
import { MobileUserAvatar } from "../../../components/MobileUserAvatar";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { QuickAccessWidget } from "@/components/QuickAccessWidget";
import { HeroSection } from "@/features/chat/pages/HeroSection";
import { CategoryCards } from "@/components/CategoryCards";
import { TextMessage } from "@/types/chat";

// 1. Import Provider và hook "consumer"
import { ChatProvider, useChatContext } from "../context/ChatProvider";

/**
 * Component con, chứa logic render
 */
const ChatAppView = () => {
  // 2. "Inject" (tiêm) tất cả state và logic từ Context
  const {
    messages,
    quickReplies,
    isLoadingAI,
    isChatExpanded,
    setIsChatExpanded,
    onSendText,
    onSendQuickReply,
    onFileUpload,
    handleNewChat,
  } = useChatContext();

  // ⛔ TẤT CẢ LOGIC (useState, useEffect, handle...) ĐÃ BIẾN MẤT ⛔

  const recentMessages = messages.filter(
    (msg) => msg.type === "text"
  ) as TextMessage[];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-100 ">
      <Sidebar />
      <MobileNav />
      <div className="lg:ml-20 pt-0 -mt-0 md:-mt-3 relative">
        <div className="hidden lg:block">
          <QuickAccessWidget
            recentMessages={recentMessages.slice(-3)}
            onNewChat={handleNewChat}
          />
        </div>
        <MobileUserAvatar />

        <HeroSection
          messages={messages}
          isLoadingAI={isLoadingAI}
          isExpanded={isChatExpanded}
          quickReplies={quickReplies}
          setIsExpanded={setIsChatExpanded}
          onSendText={onSendText}
          onSendQuickReply={onSendQuickReply}
          onFileUpload={onFileUpload}
        />

        <CategoryCards />
      </div>
    </div>
  );
};

/**
 * Component cha, chịu trách nhiệm "cung cấp" Context
 */
export default function ChatAppPage() {
  return (
    <ChatProvider>
      <ChatAppView />
    </ChatProvider>
  );
}
