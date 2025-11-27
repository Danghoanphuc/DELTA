// src/features/chat/components/BotAvatar.tsx
import { cn } from "@/shared/lib/utils";
import { BotExpression } from "../utils/sentiment";
import { ZinEmotion } from "@/features/zin-bot/types";
import { ZinNotionAvatar } from "@/features/zin-bot/ZinNotionAvatar";

interface BotAvatarProps {
  className?: string;
  isThinking?: boolean;
  expression?: BotExpression;
}

// Giữ lại cấu hình style Notion container
const THEME = {
  bg: "bg-white dark:bg-zinc-900", 
  shadow: "shadow-[0_4px_12px_rgba(0,0,0,0.08)]",
  border: "border border-gray-100 dark:border-gray-800"
};

export function BotAvatar({ 
  className, 
  isThinking = false, 
  expression = "neutral" 
}: BotAvatarProps) {
  
  // 1. Logic Map: Chuyển đổi trạng thái Chat (BotExpression) sang trạng thái Zin (ZinEmotion)
  // Trong chat, "thinking" là một expression, nhưng với Zin nó là prop boolean isThinking
  const actualIsThinking = isThinking || expression === "thinking" || expression === "waiting";

  // Lọc ra emotion hợp lệ cho Zin (loại bỏ các status kỹ thuật như thinking/waiting)
  let targetEmotion: ZinEmotion = "neutral";
  
  if (expression !== "thinking" && expression !== "waiting" && expression !== "confused") {
    // Ép kiểu vì ta biết chắc các giá trị còn lại (happy, sad, love...) khớp với ZinEmotion
    targetEmotion = expression as ZinEmotion;
  } 
  
  // Xử lý riêng case "confused" (bối rối) -> Có thể map sang "surprised" hoặc để neutral tùy ý
  if (expression === "confused") targetEmotion = "surprised";

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full overflow-hidden transition-all duration-300",
        THEME.bg,
        THEME.shadow,
        THEME.border,
        // Responsive size mặc định
        !className?.includes("w-") && "w-10 h-10 sm:w-12 sm:h-12", 
        className
      )}
    >
      {/* ✅ Render ZinNotionAvatar 
        - Nó sẽ tự động lấy phụ kiện từ Global Store (useZinStore)
        - Nó sẽ tự động blink mắt (useZinBehavior)
      */}
      <div className="w-[75%] h-[75%] mt-1"> {/* mt-1 để căn chỉnh mặt vào giữa khung tròn */}
        <ZinNotionAvatar 
          isThinking={actualIsThinking}
          emotion={targetEmotion}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}