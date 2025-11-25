// src/features/chat/components/BotAvatar.tsx
// ✅ CẬP NHẬT: Notion-style Minimalist (Tối giản & Tinh tế)
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/shared/lib/utils";
import { BotExpression } from "../utils/sentiment";
import { ZinEmotion } from "@/features/zin-bot/types";
import { useZinBehavior } from "@/logic/useZinBehavior";

interface BotAvatarProps {
  className?: string;
  isThinking?: boolean;
  expression?: BotExpression;
}

// Cấu hình màu sắc theo style Notion/Printz
const THEME = {
  bg: "bg-white dark:bg-zinc-900", // Nền sticker
  stroke: "stroke-slate-700 dark:stroke-slate-200", // Màu nét vẽ chính
  highlight: "stroke-blue-600 dark:stroke-blue-400", // Màu điểm nhấn (Printz Blue)
  shadow: "shadow-[0_4px_12px_rgba(0,0,0,0.08)]", // Đổ bóng nhẹ kiểu Notion
};

export function BotAvatar({ 
  className, 
  isThinking = false, 
  expression = "neutral" 
}: BotAvatarProps) {
  // Map BotExpression sang ZinEmotion để dùng hook cũ
  const emotion: ZinEmotion = expression === "thinking" || expression === "waiting" || expression === "confused" 
    ? "neutral" 
    : (expression === "happy" || expression === "sad" || expression === "surprised" || expression === "love" || expression === "cool" || expression === "wink" || expression === "magic" 
      ? expression as ZinEmotion 
      : "neutral");
  
  // Lấy hành động tự động từ hook behavior (vẫn giữ logic thông minh cũ)
  const { idleAction: autoAction } = useZinBehavior(isThinking, emotion);
  const currentAction = autoAction;

  // Xác định Icon hiển thị dựa trên trạng thái (Logic Notion Style)
  const getIconState = () => {
    if (isThinking) return "thinking"; // Vòng xoay hoặc tia sét
    if (currentAction === "cleaning") return "pencil"; // Đang soạn thảo/viết
    if (currentAction === "dance" || emotion === "happy") return "magic"; // Vui vẻ/Phép thuật
    if (currentAction === "panic" || emotion === "surprised" || expression === "confused") return "alert"; // Cảnh báo/Bối rối
    if (currentAction === "sleeping") return "sleep"; // Ngủ
    return "face"; // Mặc định là mặt Zin
  };

  const activeState = getIconState();

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full transition-all duration-300",
        THEME.bg,
        THEME.shadow,
        // Kích thước mặc định xử lý responsive tốt hơn
        !className?.includes("w-") && "w-10 h-10 sm:w-12 sm:h-12", 
        className
      )}
    >
      {/* Vòng tròn loading xoay quanh khi đang suy nghĩ (Loading Ring) */}
      <AnimatePresence>
        {isThinking && (
          <motion.div
            className="absolute inset-0 rounded-full border-[2.5px] border-transparent border-t-blue-500 border-r-blue-400"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
      </AnimatePresence>

      {/* SVG Container - Canvas vẽ chính */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="1.8" // Nét dày hơn một chút cho rõ ràng ở size nhỏ
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("w-[60%] h-[60%] transition-colors", THEME.stroke)}
      >
        <AnimatePresence mode="wait">
          {/* === STATE 1: FACE (Mặt Zin mặc định) === */}
          {activeState === "face" && (
            <motion.g
              key="face"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {/* Đầu bo tròn */}
              <rect x="3" y="3" width="18" height="18" rx="5" />
              {/* Mắt (dùng fill currentColor để ăn theo màu stroke) */}
              <circle cx="8.5" cy="10.5" r="1.5" fill="currentColor" className="stroke-none" />
              <circle cx="15.5" cy="10.5" r="1.5" fill="currentColor" className="stroke-none" />
              {/* Miệng (cười nhẹ hoặc ngang tuỳ cảm xúc) */}
              {emotion === "sad" ? (
                <path d="M9 16c1.5-1 4.5-1 6 0" /> // Miệng buồn
              ) : (
                <path d="M9 15c1.5 1 4.5 1 6 0" /> // Miệng cười
              )}
            </motion.g>
          )}

          {/* === STATE 2: PENCIL (Đang viết/Soạn thảo) === */}
          {activeState === "pencil" && (
            <motion.g
              key="pencil"
              initial={{ rotate: -45, scale: 0.8, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              <path d="m15 5 4 4" />
            </motion.g>
          )}

          {/* === STATE 3: MAGIC (Happy/Dance - Sparkles) === */}
          {activeState === "magic" && (
            <motion.g
              key="magic"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
            >
              {/* Ngôi sao chính màu xanh Printz */}
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" className={THEME.highlight} />
              {/* Sparkles nhỏ nhấp nháy */}
              <motion.path 
                d="M5 3v4" 
                animate={{ opacity: [0, 1, 0] }} 
                transition={{ repeat: Infinity, duration: 1.5 }} 
              />
              <motion.path 
                d="M19 17v4" 
                animate={{ opacity: [0, 1, 0] }} 
                transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }} 
              />
            </motion.g>
          )}

          {/* === STATE 4: THINKING (Kết nối/Mạng lưới) === */}
          {activeState === "thinking" && (
            <motion.g
              key="thinking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <circle cx="12" cy="12" r="3" />
              <motion.g animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} style={{ originX: "12px", originY: "12px" }}>
                 <circle cx="12" cy="4" r="1.5" fill="currentColor" className="stroke-none opacity-60"/>
                 <circle cx="20" cy="12" r="1.5" fill="currentColor" className="stroke-none opacity-60"/>
                 <circle cx="12" cy="20" r="1.5" fill="currentColor" className="stroke-none opacity-60"/>
                 <circle cx="4" cy="12" r="1.5" fill="currentColor" className="stroke-none opacity-60"/>
              </motion.g>
            </motion.g>
          )}

          {/* === STATE 5: ALERT (Cảnh báo/Lỗi) === */}
          {activeState === "alert" && (
            <motion.g
              key="alert"
              initial={{ scale: 0.8 }}
              animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="stroke-red-500 dark:stroke-red-400"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </motion.g>
          )}
          
          {/* === STATE 6: SLEEP (Ngủ) === */}
          {activeState === "sleep" && (
            <motion.g
               key="sleep"
               initial={{ opacity: 0, y: 5 }}
               animate={{ opacity: 1, y: 0 }}
            >
               <path d="M10 12h4" /> {/* Mắt nhắm */}
               <motion.path 
                 d="M16 6h4l-4 6h4" // Chữ Z
                 strokeWidth="1.2"
                 animate={{ opacity: [0, 1, 0], y: -3, x: 3 }}
                 transition={{ repeat: Infinity, duration: 2 }}
               />
            </motion.g>
          )}
        </AnimatePresence>
      </svg>
      
      {/* Hiệu ứng toả sáng nền (Glow) khi vui */}
      {emotion === "happy" && (
          <motion.div
            className="absolute inset-0 rounded-full bg-blue-100 dark:bg-blue-500/20 -z-10"
            animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
      )}
    </div>
  );
}