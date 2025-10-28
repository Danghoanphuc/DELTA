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
    <div className=" text-center ">
      <ResponsiveH1 className="">Bạn muốn in gì hôm nay?</ResponsiveH1>
      <p className="text-gray-600 text-xl mb-7">
        PrintZ Assistant sẵn sàng giúp bạn tạo ra những ấn phẩm tuyệt vời
      </p>
      <ChatBar
        messages={messages}
        isLoadingAI={isLoadingAI}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        onAddUserMessage={onAddUserMessage}
        onGetAIResponse={onGetAIResponse}
      />
    </div>
  );
}