// src/features/chat/components/ChatWelcome.tsx

import { Package, Search, PenTool } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { ZinAvatar } from "@/features/zin-bot/ZinAvatar";

interface ChatWelcomeProps {
  onPromptClick: (prompt: string) => void;
}

export const ChatWelcome = ({ onPromptClick }: ChatWelcomeProps) => {
  const suggestedPrompts = [
    {
      icon: Search,
      title: "Tìm ý tưởng",
      prompt: "Gợi ý mẫu",
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
      
      {/* 1. SÂN KHẤU CỦA ZIN */}
      {/* Tăng chiều rộng max-w lên để có chỗ đi lại */}
      <div className="w-full max-w-2xl mx-auto h-[280px] flex items-center justify-center relative overflow-hidden md:overflow-visible">
        
        {/* Zin AI tự do đi lại trong khung này */}
        <div className="w-full h-full flex items-center justify-center">
            {/* Kích thước Avatar lớn hơn: w-64 h-64 */}
            <div className="w-64 h-64 md:w-72 md:h-72">
                <ZinAvatar 
                    className="w-full h-full" 
                    emotion="happy" 
                />
            </div>
        </div>

        {/* KHÔNG CÒN TEXT "Xin chào..." NỮA */}
      </div>

      {/* 2. LIST THẺ (Giữ nguyên) */}
      <div className="w-full px-3 md:px-0 max-w-3xl mx-auto mt-4">
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          {suggestedPrompts.map((item) => (
            <button
              key={item.title}
              onClick={() => onPromptClick(item.prompt)}
              className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm active:scale-95 transition-all group hover:border-blue-200 hover:shadow-md h-full"
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 mb-2",
                item.color
              )}>
                  <item.icon size={18} strokeWidth={2.5} />
              </div>
              
              <div className="w-full text-center">
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