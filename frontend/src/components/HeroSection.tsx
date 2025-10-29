// frontend/src/components/HeroSection.tsx (RESPONSIVE)
import { ChatBar } from "@/components/Chatbar";
import { ChatMessage } from "@/types/chat";
import ResponsiveH1 from "@/components/ui/responsiveH1";

interface HeroSectionProps {
  messages: ChatMessage[];
  isLoadingAI: boolean;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  onAddUserMessage: (text: string) => ChatMessage;
  onGetAIResponse: (
    userMessage: ChatMessage,
    latitude?: number,
    longitude?: number
  ) => Promise<void>;
}

export function HeroSection({
  messages,
  isLoadingAI,
  isExpanded,
  setIsExpanded,
  onAddUserMessage,
  onGetAIResponse,
}: HeroSectionProps) {
  return (
    <div className="text-center px-4 md:px-6 lg:px-8 pt-0 pb-6 md:pt-8 md:pb-8 lg:pt-6 lg:pb-6">
      {/* Heading */}
      <div className="mb-4 md:mb-6">
        <ResponsiveH1 className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent inline-flex items-center gap-2 md:gap-3 flex-wrap justify-center mb-2 md:mb-3">
          Bạn muốn in gì hôm nay?
        </ResponsiveH1>

        <p className="text-gray-600 text-sm md:text-base lg:text-lg px-2 md:px-4">
          PrintZ Assistant sẵn sàng giúp bạn tạo ra những ấn phẩm tuyệt vời
        </p>
      </div>

      {/* ChatBar */}
      <div className="w-full max-w-4xl mx-auto">
        <ChatBar
          messages={messages}
          isLoadingAI={isLoadingAI}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          onAddUserMessage={onAddUserMessage}
          onGetAIResponse={onGetAIResponse}
        />
      </div>
    </div>
  );
}
