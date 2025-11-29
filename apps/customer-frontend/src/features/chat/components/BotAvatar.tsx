import { cn } from "@/shared/lib/utils";
import { BotExpression } from "../utils/sentiment";
import { ZinNotionAvatar } from "@/features/zin-bot/ZinNotionAvatar";

interface BotAvatarProps {
  className?: string;
  expression?: BotExpression;
}

const THEME = {
  bg: "bg-white dark:bg-zinc-900",
  shadow: "shadow-[0_4px_12px_rgba(0,0,0,0.08)]",
  border: "border border-gray-100 dark:border-gray-800",
};

export function BotAvatar({
  className,
  expression = "neutral",
}: BotAvatarProps) {
  // Mapping expression sang emotion cho ZinNotionAvatar
  const mapEmotion = ():
    | "neutral"
    | "happy"
    | "sad"
    | "surprised"
    | "love"
    | "magic" => {
    if (expression === "happy" || expression === "wink") return "happy";
    if (expression === "love") return "love";
    if (expression === "sad") return "sad";
    if (expression === "confused") return "surprised";
    return "neutral";
  };

  const isThinking = expression === "thinking" || expression === "waiting";

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full overflow-hidden transition-all duration-300",
        THEME.bg,
        THEME.shadow,
        THEME.border,
        // Default size nếu không có class width/height
        !className?.match(/w-\d+/) && "w-10 h-10 sm:w-12 sm:h-12",
        className
      )}
    >
      {/* ZinNotionAvatar với padding để không bị cắt */}
      <div className="w-full h-full p-1">
        <ZinNotionAvatar
          isThinking={isThinking}
          emotion={mapEmotion()}
          className="w-full h-full"
        />
      </div>

      {/* Online indicator */}
      <span className="absolute bottom-[5%] right-[5%] w-[20%] h-[20%] bg-green-500 border-2 border-white dark:border-gray-800 rounded-full shadow-sm"></span>
    </div>
  );
}
