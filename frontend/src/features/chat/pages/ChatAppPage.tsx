// src/features/chat/pages/ChatAppPage.tsx (CẬP NHẬT)
import { MobileUserAvatar } from "../../../components/MobileUserAvatar";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { QuickAccessWidget } from "@/components/QuickAccessWidget";
import { HeroSection } from "@/features/chat/pages/HeroSection";
import { CategoryCards } from "@/components/CategoryCards";
import { TextMessage } from "@/types/chat";

import { ChatProvider, useChatContext } from "../context/ChatProvider";
import { ProductQuickViewModal } from "@/components/ProductQuickViewModal";
// ✅ BƯỚC 1: IMPORT MODAL MỚI
import { OrderQuickViewModal } from "../components/OrderQuickViewModal";

/**
 * Component con, chứa logic render (ĐÃ SỬA)
 */
const ChatAppView = () => {
  // (Lấy state từ context - giữ nguyên)
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
    // ✅ LẤY STATE & HANDLERS MỚI
    conversations,
    currentConversationId,
    handleSelectConversation,
  } = useChatContext();

  const recentMessages = messages.filter(
    (msg) => msg.type === "text"
  ) as TextMessage[];

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <MobileNav />

      <div className="lg:ml-20 pt-0 -mt-0 md:-mt-3 relative">
        {/* (Tất cả logic render cũ giữ nguyên) */}
        <div className="hidden lg:block">
          <QuickAccessWidget
            recentMessages={recentMessages.slice(-3)}
            onNewChat={handleNewChat}
            conversations={conversations}
            currentConversationId={currentConversationId}
            onSelectConversation={handleSelectConversation}
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

      {/* ✅ BƯỚC 2: RENDER CẢ 2 MODAL TẠI ĐÂY */}
      <ProductQuickViewModal />
      <OrderQuickViewModal />
    </div>
  );
};

/**
 * Component cha (Không đổi)
 */
export default function ChatAppPage() {
  return (
    <ChatProvider>
      <ChatAppView />
    </ChatProvider>
  );
}
