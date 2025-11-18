// src/features/chat/components/ChatWelcome.tsx (FIX GRID MOBILE)

import { Package, Search, PenTool } from "lucide-react";
import zinAvatar from "@/assets/img/zin-avatar.png";
import { cn } from "@/shared/lib/utils";

interface ChatWelcomeProps {
  onPromptClick: (prompt: string) => void;
}

export const ChatWelcome = ({ onPromptClick }: ChatWelcomeProps) => {
  const suggestedPrompts = [
    {
      icon: Search,
      title: "Tìm ý tưởng",
      prompt: "Gợi ý mẫu", // Rút ngắn text tối đa
      color: "text-blue-600 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white",
    },
    {
      icon: Package,
      title: "Tra vận đơn",
      prompt: "Kiểm tra đơn",
      color: "text-purple-600 bg-purple-50 group-hover:bg-purple-600 group-hover:text-white",
    },
    {
      icon: PenTool,
      title: "Thiết kế",
      prompt: "Tạo logo",
      color: "text-pink-600 bg-pink-50 group-hover:bg-pink-600 group-hover:text-white",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center w-full h-full py-4 animate-in fade-in zoom-in duration-500">
      
      {/* 1. LOGO & INTRO */}
      <div className="text-center space-y-3 px-4 mb-6 w-full max-w-lg mx-auto">
        <div className="relative inline-block group cursor-pointer">
          <div className="absolute inset-0 bg-blue-500 dark:bg-blue-400 blur-3xl opacity-20 rounded-full"></div>
          <img
            src={zinAvatar}
            alt="Zin AI Avatar"
            className="relative w-16 h-16 md:w-20 md:h-20 mx-auto rounded-2xl shadow-2xl object-cover border-4 border-white dark:border-gray-800"
          />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-1 md:mb-2">
            Xin chào, tôi là <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Zin AI</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed px-2">
            Trợ lý in ấn thông minh của bạn.
          </p>
        </div>
      </div>

      {/* 2. LIST THẺ (DẠNG GRID 3 CỘT) */}
      <div className="w-full px-3 md:px-0 max-w-3xl mx-auto">
        {/* ✅ FIX QUAN TRỌNG: grid-cols-3 để chia đều 3 cột trên mọi màn hình */}
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          {suggestedPrompts.map((item) => (
            <button
              key={item.title}
              onClick={() => onPromptClick(item.prompt)}
              // Flex-col + items-center để căn giữa nội dung trong từng ô nhỏ
              className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm active:scale-95 transition-all group hover:border-blue-200 hover:shadow-md h-full"
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 mb-2",
                item.color
              )}>
                  <item.icon size={18} strokeWidth={2.5} />
              </div>
              
              <div className="w-full text-center">
                {/* Text nhỏ lại (text-xs) để vừa ô */}
                <h4 className="font-bold text-xs md:text-sm text-gray-800 dark:text-gray-100 mb-0.5 truncate w-full">
                    {item.title}
                </h4>
                <p className="text-[10px] md:text-xs text-gray-400 dark:text-gray-500 line-clamp-1">
                    {item.prompt}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};