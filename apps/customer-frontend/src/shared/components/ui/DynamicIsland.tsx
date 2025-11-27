import { useStatusStore } from "@/stores/useStatusStore";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, Info, Sparkles } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const VARIANT_STYLES = {
  idle: "bg-black text-white",
  loading: "bg-black text-white pl-1 pr-4", // Loading gọn hơn
  success: "bg-emerald-500 text-white",
  error: "bg-red-500 text-white",
  info: "bg-blue-600 text-white",
};

const ICONS = {
  idle: <Sparkles size={18} className="text-yellow-300" />,
  loading: <Loader2 size={18} className="animate-spin text-blue-300" />,
  success: <CheckCircle2 size={20} className="text-white" />,
  error: <XCircle size={20} className="text-white" />,
  info: <Info size={20} className="text-white" />,
};

export function DynamicIsland() {
  const { status, message, isVisible, icon } = useStatusStore();

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex justify-center pointer-events-none">
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              width: "auto", // Auto width để morph theo nội dung
              height: "auto"
            }}
            exit={{ opacity: 0, y: -10, scale: 0.9, filter: "blur(10px)" }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 25 
            }}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-md border border-white/10",
              VARIANT_STYLES[status] || VARIANT_STYLES.idle
            )}
          >
            {/* Icon Area - Morphing */}
            <motion.div 
              layout 
              className="flex-shrink-0 flex items-center justify-center"
            >
              {icon || ICONS[status]}
            </motion.div>

            {/* Text Content */}
            <motion.span
              layout
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="text-sm font-medium whitespace-nowrap overflow-hidden"
            >
              {message}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

