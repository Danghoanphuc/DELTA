// src/features/chat/components/ThinkingAccordion.tsx
// Component hiển thị quá trình suy nghĩ của AI (Chain of Thought) với hiệu ứng accordion

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface ThinkingAccordionProps {
  thought: string;
  isStreaming?: boolean; // Để hiển thị trạng thái đang suy nghĩ
}

export function ThinkingAccordion({ thought, isStreaming = false }: ThinkingAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!thought || thought.trim().length === 0) {
    return null;
  }

  return (
    <div className="mb-3 border-l-2 border-gray-200 dark:border-gray-700 pl-3 ml-1">
      {/* HEADER: Nút bấm mở suy nghĩ */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group select-none w-full text-left"
        type="button"
      >
        <div
          className={cn(
            "p-1 rounded bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors",
            isStreaming && "animate-pulse" // Nhấp nháy icon não khi đang stream
          )}
        >
          <BrainCircuit
            size={14}
            className={cn(
              isStreaming ? "text-blue-500 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
            )}
          />
        </div>

        <span className="flex-1">
          {isStreaming ? "Đang suy luận..." : "Quá trình tư duy"}
        </span>

        <ChevronDown
          size={14}
          className={cn(
            "transition-transform duration-300 text-gray-400",
            isOpen ? "rotate-180" : "rotate-0"
          )}
        />
      </button>

      {/* BODY: Nội dung suy nghĩ (Expandable) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-2 text-sm text-gray-500 dark:text-gray-400 font-mono bg-gray-50/50 dark:bg-gray-900/50 p-3 rounded-lg mt-1 border border-gray-100 dark:border-gray-800">
              {/* Dùng MarkdownRenderer để format code trong suy nghĩ nếu có */}
              <MarkdownRenderer
                content={thought}
                className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

