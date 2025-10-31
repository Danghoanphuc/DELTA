// src/features/chat/pages/HeroSection.tsx (CẬP NHẬT)

import { ChatBar } from "@/features/chat/components/Chatbar";
import { ChatMessage, QuickReply } from "@/types/chat"; // ✅ THAY ĐỔI
import ResponsiveH1 from "@/shared/components/ui/responsiveH1";

interface HeroSectionProps {
  messages: ChatMessage[];
  isLoadingAI: boolean;
  isExpanded: boolean;
  quickReplies: QuickReply[]; // ✅ MỚI
  setIsExpanded: (expanded: boolean) => void;
  // ✅ THAY ĐỔI CÁC HANDLER
  onSendText: (text: string, latitude?: number, longitude?: number) => void;
  onSendQuickReply: (text: string, payload: string) => void;
  onFileUpload: (file: File) => void;
}

export function HeroSection({
  messages,
  isLoadingAI,
  isExpanded,
  quickReplies, // ✅ MỚI
  setIsExpanded,
  onSendText, // ✅ THAY ĐỔI
  onSendQuickReply, // ✅ MỚI
  onFileUpload, // ✅ MỚI
}: HeroSectionProps) {
  return (
    <div className="text-center px-4 md:px-0 lg:px-0 pt-0 pb-6 md:pt-8 md:pb-8 lg:pt-6 lg:pb-6">
      {/* (Heading giữ nguyên) */}
      <div className="mb-4 md:mb-6">
        <ResponsiveH1 className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent inline-flex items-center gap-2 md:gap-3 flex-wrap justify-center mb-2 md:mb-3">
          Bạn muốn in gì hôm nay?
        </ResponsiveH1>
        <p className="text-gray-600 text-sm md:text-base lg:text-lg px-2 md:px-4">
          PrintZ Assistant sẵn sàng giúp bạn tạo ra những ấn phẩm tuyệt vời
        </p>
      </div>

      {/* ✅ TRUYỀN PROPS MỚI XUỐNG CHATBAR */}
      <div className="w-full max-w-4xl mx-auto">
        <ChatBar
          messages={messages}
          isLoadingAI={isLoadingAI}
          isExpanded={isExpanded}
          quickReplies={quickReplies}
          setIsExpanded={setIsExpanded}
          onSendText={onSendText}
          onSendQuickReply={onSendQuickReply}
          onFileUpload={onFileUpload}
        />
      </div>
    </div>
  );
}
