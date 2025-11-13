// src/features/chat/components/ChatWelcome.tsx (TẠO MỚI)
import { Sparkles, Package, Search } from "lucide-react";
import zinAvatar from "@/assets/img/zin-avatar.png";

interface ChatWelcomeProps {
  onPromptClick: (prompt: string) => void;
}

export const ChatWelcome = ({ onPromptClick }: ChatWelcomeProps) => {
  const suggestedPrompts = [
    {
      icon: Search,
      title: "Tìm ý tưởng thiết kế",
      prompt: "Gợi ý cho tôi vài mẫu card visit cho quán cafe",
    },
    {
      icon: Package,
      title: "Theo dõi đơn hàng",
      prompt: "Đơn hàng #DH12345 của tôi đang ở đâu?",
    },
    {
      icon: Sparkles,
      title: "Tạo thiết kế mới",
      prompt: "Tạo giúp tôi logo cho một tiệm bánh tên 'Sweet Bliss'",
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 h-full">
      <div className="text-center max-w-lg">
        <img
          src={zinAvatar}
          alt="Zin AI Avatar"
          className="w-24 h-24 mx-auto rounded-3xl shadow-lg mb-4"
        />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Tôi có thể giúp gì cho bạn hôm nay?
        </h1>
        <p className="text-gray-500 mb-8">
          Tôi là trợ lý AI của Printz, sẵn sàng hỗ trợ bạn từ khâu thiết kế đến
          theo dõi đơn hàng.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suggestedPrompts.map((item) => (
            <button
              key={item.title}
              onClick={() => onPromptClick(item.prompt)}
              className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border text-left transition-all hover:shadow-md"
            >
              <item.icon size={20} className="mb-2 text-blue-600" />
              <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
              <p className="text-xs text-gray-500">{item.prompt}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
