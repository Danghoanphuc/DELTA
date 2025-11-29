// src/features/chat/pages/HeroSection.tsx
import { ChatInput } from "@/features/chat/components/ChatInput"; // ✅ Dùng component mới
import { ChatMessage, QuickReply } from "@/types/chat";
import ResponsiveH1 from "@/shared/components/ui/responsiveH1";
import { QuickReplyButtons } from "../components/QuickReplyButtons";

interface HeroSectionProps {
  messages: ChatMessage[];
  isLoadingAI: boolean;
  quickReplies: QuickReply[];
  onSendText: (text: string, latitude?: number, longitude?: number) => void;
  onSendQuickReply: (text: string, payload: string) => void;
  onFileUpload: (file: File) => void;
}

export function HeroSection({
  isLoadingAI,
  quickReplies,
  onSendText,
  onSendQuickReply,
  onFileUpload,
}: HeroSectionProps) {
  return (
    <div className="text-center px-4 md:px-0 lg:px-0 pt-6 pb-6 md:pt-10 md:pb-10">
      <div className="mb-4 md:mb-6">
        <ResponsiveH1 className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent inline-flex items-center gap-2 justify-center mb-2">
          Bạn muốn in gì hôm nay?
        </ResponsiveH1>
        <p className="text-gray-500 text-sm md:text-base max-w-lg mx-auto mt-2">
          Trợ lý AI của Printz sẽ giúp bạn thiết kế, báo giá và đặt in chỉ trong vài giây.
        </p>
      </div>

      <div className="w-full max-w-3xl mx-auto space-y-4">
        {/* ✅ Sử dụng ChatInput hiện đại */}
        <div className="bg-white p-2 rounded-[32px] shadow-xl shadow-blue-100/50 border border-blue-50">
           <ChatInput
              isLoading={isLoadingAI}
              onSendText={onSendText}
              onFileUpload={onFileUpload}
           />
        </div>

        {/* Quick Replies hiển thị bên ngoài cho thoáng */}
        {quickReplies.length > 0 && !isLoadingAI && (
           <div className="flex justify-center">
              <QuickReplyButtons 
                 quickReplies={quickReplies} 
                 onQuickReplyClick={onSendQuickReply} 
              />
           </div>
        )}
      </div>
    </div>
  );
}