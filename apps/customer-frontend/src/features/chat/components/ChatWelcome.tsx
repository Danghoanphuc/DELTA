// src/features/chat/components/ChatWelcome.tsx
import { useState, useEffect } from "react";
import { Package, Search, PenTool, Sparkles, Pencil } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { ZinNotionAvatar } from "@/features/zin-bot/ZinNotionAvatar";
import { ZinCustomizerModal } from "@/features/zin-bot/ZinCustomizerModal";
import { ZinEmotion } from "@/features/zin-bot/types";

interface ChatWelcomeProps {
  onPromptClick: (prompt: string) => void;
}

export const ChatWelcome = ({ onPromptClick }: ChatWelcomeProps) => {
  const [demoEmotion, setDemoEmotion] = useState<ZinEmotion>("neutral");
  const [isCustomizing, setIsCustomizing] = useState(false);

  // Loop cảm xúc cho sinh động
  useEffect(() => {
    const sequence = [
      { emotion: "neutral" as ZinEmotion, duration: 3000 },
      { emotion: "happy" as ZinEmotion, duration: 2000 },
      { emotion: "neutral" as ZinEmotion, duration: 4000 },
      { emotion: "wink" as ZinEmotion, duration: 1500 }, // Nháy mắt cái
    ];
    let currentIndex = 0;
    const playNext = () => {
      currentIndex = (currentIndex + 1) % sequence.length;
      setDemoEmotion(sequence[currentIndex].emotion);
      timeoutId = setTimeout(playNext, sequence[currentIndex].duration);
    };
    let timeoutId = setTimeout(playNext, sequence[0].duration);
    return () => clearTimeout(timeoutId);
  }, []);

  const suggestedPrompts = [
    { icon: Search, title: "Tìm ý tưởng", prompt: "Gợi ý mẫu in ấn độc đáo" },
    { icon: Package, title: "Tra đơn hàng", prompt: "Kiểm tra đơn hàng mới nhất" },
    { icon: PenTool, title: "Thiết kế", prompt: "Tạo logo tối giản" },
    { icon: Sparkles, title: "Viết nội dung", prompt: "Viết lời chúc sinh nhật" },
  ];

  return (
    <>
      <div className="flex flex-col items-center justify-center w-full h-full animate-in fade-in zoom-in duration-500">
        
        {/* AVATAR CONTAINER */}
        <div className="flex flex-col items-center justify-center mb-8 relative group">
            <div 
              className="w-36 h-36 mb-4 relative cursor-pointer transition-transform duration-300 hover:scale-105"
              onClick={() => setIsCustomizing(true)} // Click vào avatar là mở Modal luôn
            >
                <ZinNotionAvatar 
                    className="w-full h-full text-slate-800 dark:text-slate-100" 
                    emotion={demoEmotion} 
                />
                
                {/* ✏️ NÚT EDIT (Nổi bật hơn) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCustomizing(true);
                  }}
                  className="absolute bottom-0 right-0 w-9 h-9 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-all hover:scale-110 z-10"
                  title="Đổi giao diện Zin"
                >
                  <Pencil size={16} />
                </button>
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 text-center tracking-tight">
               Bạn muốn làm gì hôm nay?
            </h2>
        </div>

        {/* PROMPTS */}
        <div className="w-full max-w-2xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggestedPrompts.map((item) => (
              <button
                key={item.title}
                onClick={() => onPromptClick(item.prompt)}
                className={cn(
                  "group flex items-center gap-3 p-3.5 text-left transition-all",
                  "bg-white dark:bg-gray-800", 
                  "border border-gray-200 dark:border-gray-700 rounded-2xl",
                  "hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md hover:bg-blue-50/30 dark:hover:bg-gray-800"
                )}
              >
                <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                    <item.icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-0.5 group-hover:text-blue-700 dark:group-hover:text-blue-400">
                      {item.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {item.prompt}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL */}
      <ZinCustomizerModal 
        isOpen={isCustomizing} 
        onClose={() => setIsCustomizing(false)} 
      />
    </>
  );
};