// frontend/src/components/HeroSection.tsx (RESPONSIVE)
import { ChatBar } from "@/components/Chatbar";
import { ChatMessage } from "@/types/chat";

interface HeroSectionProps {
  messages: ChatMessage[];
  isLoadingAI: boolean;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  onSendMessage: (
    text: string,
    latitude?: number,
    longitude?: number
  ) => Promise<void>;
}

export function HeroSection({
  messages,
  isLoadingAI,
  isExpanded,
  setIsExpanded,
  onSendMessage,
}: HeroSectionProps) {
  return (
    <div className="w-full pt-4 md:pt-5 pb-3 md:pb-4 px-4 md:px-8">
      {/* Hero Heading */}
      <div className="text-center mb-6 md:mb-8">
        <h1 className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent mb-3 md:mb-4 text-3xl md:text-5xl font-bold">
          Bạn muốn in gì hôm nay?
        </h1>
        <h2 className="mb-4 md:mb-6 text-gray-600 font-semibold text-sm md:text-lg px-4">
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            PrintZ
          </span>{" "}
          kết nối bạn với xưởng in phù hợp nhất
        </h2>
      </div>

      {/* Chat Bar */}
      <ChatBar
        messages={messages}
        isLoadingAI={isLoadingAI}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        onSendMessage={onSendMessage}
      />

      {/* Quick Action Tabs */}
      <div className="flex items-center justify-center gap-2 md:gap-4 mt-6 md:mt-8 flex-wrap">
        <button className="px-4 md:px-6 py-1.5 md:py-2 rounded-full border-2 border-purple-200 bg-purple-50 text-purple-700 transition-all hover:border-purple-300 hover:bg-purple-100 text-xs md:text-sm">
          Kho mẫu
        </button>
        <button className="px-4 md:px-6 py-1.5 md:py-2 rounded-full border-2 border-blue-200 bg-white text-blue-700 transition-all hover:border-blue-300 hover:bg-blue-50 text-xs md:text-sm">
          Xu hướng
        </button>
        <button className="px-4 md:px-6 py-1.5 md:py-2 rounded-full border-2 border-gray-200 bg-white text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 text-xs md:text-sm">
          Đơn hàng
        </button>
      </div>
    </div>
  );
}
