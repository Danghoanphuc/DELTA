// src/components/HeroSection.tsx (HOÀN CHỈNH - Khôi Phục 3 Nút)

import { ChatBar } from "@/components/Chatbar"; //
import { ChatMessage } from "@/types/chat"; //

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
    <div className="w-full pt-5 pb-4 px-8">
      {" "}
      {/* Padding gốc */}
      {/* Hero Heading (Giữ nguyên) */}
      <div className="text-center mb-8">
        <h1
          className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent mb-4"
          style={{ fontSize: "48px" }}
        >
          Bạn muốn in gì hôm nay?
        </h1>
        <h2 className="mb-6 text-gray-600 font-semibold text-lg ">
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            PrintZ
          </span>{" "}
          kết nối bạn với xưởng in phù hợp nhất. Báo giá ngay, giao hàng tận
          nơi.
        </h2>
      </div>
      {/* Chat Bar (Truyền props xuống) */}
      <ChatBar
        messages={messages}
        isLoadingAI={isLoadingAI}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        onSendMessage={onSendMessage}
      />
      {/* Quick Action Tabs (Khôi phục) */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button className="px-6 py-2 rounded-full border-2 border-purple-200 bg-purple-50 text-purple-700 transition-all hover:border-purple-300 hover:bg-purple-100">
          Kho mẫu
        </button>
        <button className="px-6 py-2 rounded-full border-2 border-blue-200 bg-white text-blue-700 transition-all hover:border-blue-300 hover:bg-blue-50">
          Xu hướng
        </button>
        <button className="px-6 py-2 rounded-full border-2 border-gray-200 bg-white text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50">
          Đơn hàng
        </button>
      </div>
    </div>
  );
}
