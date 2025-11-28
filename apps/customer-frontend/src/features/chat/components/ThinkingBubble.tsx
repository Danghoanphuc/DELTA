// src/features/chat/components/ThinkingBubble.tsx
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/shared/lib/utils";
import { Sparkles, BrainCircuit, Loader2, Search, Database, Globe, Zap, CheckCircle2 } from "lucide-react";

interface ThinkingBubbleProps {
  icon?: string;
  text?: string;
  customText?: string;
  className?: string;
  onClick?: () => void;
  variant?: "default" | "inline"; // ✅ Thêm variant: default (có khung) vs inline (trong suốt)
}

export const ThinkingBubble = ({ 
  icon, 
  text, 
  customText,
  className,
  onClick,
  variant = "default" 
}: ThinkingBubbleProps) => {
  const displayText = customText || text || "Zin đang phân tích...";
  const isInline = variant === "inline";
  
  // Logic chọn icon sinh động
  const getIcon = () => {
     const lowerText = displayText.toLowerCase();
     if (lowerText.includes("hoàn tất") || lowerText.includes("xong")) return <CheckCircle2 size={14} className="text-green-500" />;
     if (lowerText.includes("tìm")) return <Search size={14} className="text-blue-500" />;
     if (lowerText.includes("dữ liệu") || lowerText.includes("kho")) return <Database size={14} className="text-cyan-500" />;
     if (lowerText.includes("kết nối") || lowerText.includes("web")) return <Globe size={14} className="text-green-500" />;
     if (lowerText.includes("tính") || lowerText.includes("giá")) return <Zap size={14} className="text-yellow-500" />;
     if (icon === "sparkles") return <Sparkles size={14} className="text-purple-500 animate-pulse" />;
     if (icon === "loader") return <Loader2 size={14} className="text-gray-500 animate-spin" />;
     return <BrainCircuit size={14} className="text-indigo-500 animate-pulse" />;
  };

  const Wrapper = onClick ? motion.button : motion.div;

  return (
    <div className={cn("relative group max-w-full", className)}>
      
      {/* Glow Effect chỉ hiện ở chế độ default (stand-alone) */}
      {!isInline && (
        <div className="pointer-events-none absolute -inset-1 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
      )}
      
      <Wrapper
        onClick={onClick}
        className={cn(
          "relative z-10 flex items-center gap-2.5 transition-all",
          // ✅ Style Variant: "inline" sẽ nhẹ nhàng hơn, không có border cứng
          isInline 
            ? "px-0 py-1 bg-transparent border-none shadow-none" 
            : "px-3 py-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl border border-blue-100/50 dark:border-gray-700 shadow-sm",
          onClick && !isInline && "cursor-pointer hover:bg-white hover:border-blue-200 active:scale-95"
        )}
      >
        {/* Icon Container */}
        <div className={cn(
            "relative flex items-center justify-center rounded-full shrink-0 transition-colors",
            isInline ? "w-6 h-6 bg-blue-50/80 dark:bg-gray-800" : "w-5 h-5 bg-blue-50 dark:bg-gray-800"
        )}>
           <AnimatePresence mode="wait">
             <motion.div
                key={displayText.split(" ")[0]} 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.2 }}
             >
               {getIcon()}
             </motion.div>
           </AnimatePresence>
        </div>

        {/* Text Container - Hiệu ứng Ticker chạy chữ */}
        <div className="flex flex-col justify-center min-w-0 overflow-hidden flex-1">
            <AnimatePresence mode="popLayout">
                <motion.span
                    key={displayText}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className={cn(
                        "font-medium truncate",
                        isInline ? "text-[13px] text-gray-500 dark:text-gray-400" : "text-xs text-gray-600 dark:text-gray-300"
                    )}
                >
                    {displayText}
                </motion.span>
            </AnimatePresence>
        </div>
        
        {/* Chỉ thị click (chỉ hiện ở default mode) */}
        {onClick && !isInline && (
            <div className="w-1 h-1 bg-blue-400 rounded-full ml-1 opacity-50" />
        )}
      </Wrapper>
    </div>
  );
};