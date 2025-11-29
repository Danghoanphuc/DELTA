import { useState, useEffect } from "react";
import { Package, Search, PenTool, Sparkles, Pencil } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { BotAvatar } from "./BotAvatar";
import { ZinCustomizerModal } from "@/features/zin-bot/ZinCustomizerModal";
import { BotExpression } from "../utils/sentiment";

interface ChatWelcomeProps {
  onPromptClick: (prompt: string) => void;
}

const SUGGESTED_PROMPTS = [
  {
    icon: Search,
    title: "Tìm ý tưởng",
    prompt: "Gợi ý mẫu card visit tối giản, sang trọng",
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
  },
  {
    icon: Package,
    title: "Tra đơn hàng",
    prompt: "Kiểm tra tình trạng đơn hàng mới nhất",
    color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20",
  },
  {
    icon: PenTool,
    title: "Thiết kế",
    prompt: "Giúp tôi thiết kế logo cho quán cafe",
    color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20",
  },
  {
    icon: Sparkles,
    title: "Viết nội dung",
    prompt: "Viết lời chúc in lên thiệp sinh nhật",
    color: "text-pink-600 bg-pink-50 dark:bg-pink-900/20",
  },
];

export const ChatWelcome = ({ onPromptClick }: ChatWelcomeProps) => {
  const [demoEmotion, setDemoEmotion] = useState<BotExpression>("neutral");
  const [isCustomizing, setIsCustomizing] = useState(false);

  // Hiệu ứng cảm xúc tự động cho sinh động
  useEffect(() => {
    const sequence: { emotion: BotExpression; duration: number }[] = [
      { emotion: "neutral", duration: 3000 },
      { emotion: "happy", duration: 2000 },
      { emotion: "neutral", duration: 4000 },
      { emotion: "wink", duration: 1500 },
    ];
    let currentIndex = 0;
    let timeoutId: NodeJS.Timeout;
    const playNext = () => {
      currentIndex = (currentIndex + 1) % sequence.length;
      setDemoEmotion(sequence[currentIndex].emotion);
      timeoutId = setTimeout(playNext, sequence[currentIndex].duration);
    };
    timeoutId = setTimeout(playNext, sequence[0].duration);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <>
      <div className="flex flex-col items-center justify-center w-full h-full min-h-[400px] p-6 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center justify-center mb-10 relative group">
          {/* Avatar Clickable */}
          <div
            className="w-32 h-32 md:w-40 md:h-40 mb-6 relative cursor-pointer transition-transform duration-300 hover:scale-105"
            onClick={() => setIsCustomizing(true)}
          >
            <BotAvatar
              expression={demoEmotion}
              className="w-full h-full text-5xl"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsCustomizing(true);
              }}
              className="absolute bottom-1 right-1 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-all hover:scale-110 z-10"
              title="Tùy chỉnh Zin"
            >
              <Pencil size={14} />
            </button>
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 text-center tracking-tight mb-2">
            Chào bạn, hôm nay in gì nào?
          </h2>
          <p className="text-sm text-gray-500 text-center max-w-xs leading-relaxed">
            Zin là trợ lý AI của Printz. Zin có thể giúp bạn tìm sản phẩm, tra
            cứu đơn hàng hoặc sáng tạo nội dung.
          </p>
        </div>

        {/* Prompt Grid */}
        <div className="w-full max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SUGGESTED_PROMPTS.map((item) => (
              <button
                key={item.title}
                onClick={() => onPromptClick(item.prompt)}
                className={cn(
                  "group flex items-center gap-3 p-4 text-left transition-all",
                  "bg-white dark:bg-gray-800",
                  "border border-gray-200 dark:border-gray-700 rounded-2xl",
                  "hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md hover:-translate-y-0.5 active:scale-95"
                )}
              >
                <div
                  className={cn(
                    "flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-300",
                    item.color
                  )}
                >
                  <item.icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-0.5 group-hover:text-blue-700 dark:group-hover:text-blue-400">
                    {item.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate group-hover:text-gray-600">
                    {item.prompt}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <ZinCustomizerModal
        isOpen={isCustomizing}
        onClose={() => setIsCustomizing(false)}
      />
    </>
  );
};
