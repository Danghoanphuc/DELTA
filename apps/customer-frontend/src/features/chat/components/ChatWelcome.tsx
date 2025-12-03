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
  },
  {
    icon: Package,
    title: "Tra đơn hàng",
    prompt: "Kiểm tra tình trạng đơn hàng mới nhất",
  },
  {
    icon: PenTool,
    title: "Thiết kế",
    prompt: "Giúp tôi thiết kế logo cho quán cafe",
  },
  {
    icon: Sparkles,
    title: "Viết nội dung",
    prompt: "Viết lời chúc in lên thiệp sinh nhật",
  },
];

export const ChatWelcome = ({ onPromptClick }: ChatWelcomeProps) => {
  const [demoEmotion, setDemoEmotion] = useState<BotExpression>("neutral");
  const [isCustomizing, setIsCustomizing] = useState(false);

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
      <div className="flex flex-col items-center justify-center w-full h-full min-h-[400px] p-6 animate-in fade-in zoom-in duration-500 font-sans">
        <div className="flex flex-col items-center justify-center mb-10 relative group">
          {/* Avatar Area */}
          <div
            className="w-24 h-24 md:w-28 md:h-28 mb-6 relative cursor-pointer transition-transform duration-500 ease-out hover:scale-105"
            onClick={() => setIsCustomizing(true)}
          >
            <BotAvatar
              expression={demoEmotion}
              className="w-full h-full text-5xl shadow-xl shadow-stone-200 border-2 border-white ring-1 ring-stone-100"
            />
            {/* Active Action: Nút Edit màu Đỏ Son chủ đạo */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsCustomizing(true);
              }}
              className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full shadow-md flex items-center justify-center hover:bg-red-700 transition-all hover:scale-110 z-10 border-2 border-white ring-1 ring-stone-100"
              title="Tùy chỉnh Zin"
            >
              <Pencil size={12} strokeWidth={2.5} />
            </button>
          </div>

          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground text-center tracking-tight mb-3">
            Hôm nay in gì nào?
          </h2>
          <p className="text-[15px] text-muted-foreground text-center max-w-sm leading-relaxed">
            Tôi là Zin, trợ lý thiết kế & in ấn của bạn.
          </p>
        </div>

        {/* Prompt Grid - Interactive & High Contrast */}
        <div className="w-full max-w-3xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SUGGESTED_PROMPTS.map((item) => (
              <button
                key={item.title}
                onClick={() => onPromptClick(item.prompt)}
                className={cn(
                  "group flex items-start gap-4 p-5 text-left transition-all duration-300",
                  "bg-white hover:bg-stone-50", // Nền giấy
                  "border border-stone-200 rounded-xl", // Viền mảnh
                  // 🔥 ACTIVE STATE: Viền chuyển đỏ, Shadow nổi nhẹ
                  "hover:border-primary/30 hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] active:scale-[0.98]"
                )}
              >
                <div
                  className={cn(
                    "flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-300",
                    // 🔥 ICON: Mặc định xám nhạt -> Hover chuyển Đỏ Son nền trắng
                    "bg-stone-100 text-stone-500",
                    "group-hover:bg-primary group-hover:text-primary-foreground"
                  )}
                >
                  <item.icon size={18} strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-serif font-bold text-[16px] text-foreground mb-1 group-hover:text-primary transition-colors">
                    {item.title}
                  </div>
                  <div className="text-[13px] text-stone-500 font-sans font-medium leading-snug group-hover:text-stone-700">
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
