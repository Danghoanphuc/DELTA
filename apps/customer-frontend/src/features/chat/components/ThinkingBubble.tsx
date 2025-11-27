// src/features/chat/components/ThinkingBubble.tsx
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/shared/lib/utils";
import { Sparkles, BrainCircuit } from "lucide-react";

interface ThinkingBubbleProps {
  icon?: string;
  text?: string;
  customText?: string;
  fullLog?: string;
  className?: string;
}

export const ThinkingBubble = ({ 
  icon, 
  text, 
  customText,
  className 
}: ThinkingBubbleProps) => {
  // Ưu tiên text hiển thị
  const displayText = customText || text || "Zin đang suy nghĩ...";
  const displayIcon = icon || "✨";

  return (
    <div className={cn("relative group my-2 max-w-fit", className)}>
      {/* 1. HIỆU ỨNG GLOW NỀN (Ambient Light) */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-20 blur group-hover:opacity-40 transition duration-1000 animate-pulse"></div>
      
      {/* 2. MAIN CONTAINER (Viên thuốc - Pill Shape) */}
      <div className="relative flex items-center gap-3 px-4 py-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-full shadow-sm ring-1 ring-black/5">
        
        {/* ICON ANIMATION (Xoay nhẹ & Scale) */}
        <div className="relative flex items-center justify-center w-5 h-5">
           {displayIcon === "🧠" || displayIcon === "✨" ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="text-blue-500 dark:text-blue-400"
              >
                 {displayIcon === "🧠" ? <BrainCircuit size={18} /> : <Sparkles size={18} />}
              </motion.div>
           ) : (
              <span className="text-lg leading-none">{displayIcon}</span>
           )}
        </div>

        {/* TEXT ANIMATION (Typewriter effect ảo) */}
        <div className="flex items-center min-w-[120px]">
            <AnimatePresence mode="wait">
                <motion.span
                    key={displayText}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs font-semibold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent truncate max-w-[200px]"
                >
                    {displayText}
                </motion.span>
            </AnimatePresence>

            {/* DOTS ANIMATION (3 chấm nhảy múa tinh tế) */}
            <div className="flex space-x-0.5 ml-1">
                {[0, 1, 2].map((i) => (
                    <motion.span
                        key={i}
                        className="w-0.5 h-0.5 bg-gray-400 rounded-full"
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.2,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};