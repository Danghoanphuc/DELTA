// src/features/chat/components/DeepResearchSidebar.tsx
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, CheckCircle2, X, 
  BrainCircuit 
} from "lucide-react";
import { useChatStore } from "../stores/useChatStore";
import { cn } from "@/shared/lib/utils";

export function DeepResearchSidebar() {
  const { isDeepResearchOpen, researchSteps, toggleDeepResearch } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [researchSteps]);

  if (!isDeepResearchOpen) return null;

  return (
    <>
      {/* 1. MÀN ĐEN MỜ (BACKDROP) - Để user tập trung và dễ đóng sidebar trên mobile */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => toggleDeepResearch(false)}
        className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-[9998]"
      />

      {/* 2. SIDEBAR CHÍNH - Dùng FIXED thay vì ABSOLUTE */}
      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={cn(
          // ✅ FIX: Dùng 'fixed' để nổi lên trên cùng, bất chấp layout cha
          "fixed right-0 top-0 bottom-0",
          "w-[320px] sm:w-[380px]", // Responsive width
          "border-l border-gray-100 dark:border-gray-800",
          "bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl",
          "flex flex-col shadow-2xl",
          "z-[9999]" // 🔥 Tăng max để đè lên tất cả Header/Modal khác
        )}
      >
      {/* 1. CLEAN HEADER */}
      <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
             <BrainCircuit size={18} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-800 dark:text-gray-100">Tiến trình xử lý</h3>
            <p className="text-[10px] text-gray-400 font-medium">AI đang thực hiện tác vụ</p>
          </div>
        </div>
        <button 
          onClick={() => toggleDeepResearch(false)}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* 2. PROCESS LIST (CHECKLIST STYLE) */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
         {researchSteps.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-3 opacity-60">
                <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                    <Loader2 className="animate-spin text-gray-300 dark:text-gray-500" />
                </div>
                <p className="text-xs font-medium">Đang chờ tín hiệu...</p>
            </div>
         )}

         <AnimatePresence mode="popLayout">
           {researchSteps.map((step, index) => {
               const isActive = step.status === 'running';
               const isCompleted = step.status === 'completed';
               const isFailed = step.status === 'failed';

               return (
                   <motion.div 
                      key={step.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="relative pl-8 group"
                   >
                       {/* Timeline Line */}
                       {index !== researchSteps.length - 1 && (
                           <div className="absolute left-[11px] top-6 bottom-[-24px] w-[2px] bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors" />
                       )}

                       {/* Status Icon */}
                       <div className={cn(
                           "absolute left-0 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 bg-white dark:bg-gray-900 transition-all duration-300 z-10",
                           isActive ? "border-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.1)]" : 
                           isCompleted ? "border-green-500 bg-green-500" : 
                           isFailed ? "border-red-500 bg-red-500" : "border-gray-200 dark:border-gray-700"
                       )}>
                          {isActive ? (
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                          ) : isCompleted ? (
                              <CheckCircle2 size={14} className="text-white" />
                          ) : isFailed ? (
                              <X size={14} className="text-white" />
                          ) : (
                              <div className="w-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full" />
                          )}
                       </div>

                       {/* Content */}
                       <div className="flex flex-col gap-1">
                           <span className={cn(
                               "text-sm font-semibold transition-colors",
                               isActive ? "text-blue-700 dark:text-blue-400" : isCompleted ? "text-gray-800 dark:text-gray-200" : "text-gray-500"
                           )}>
                               {step.title}
                           </span>
                           
                           {/* Log mới nhất (Chỉ hiện 1 dòng log cuối cùng thay vì cả terminal) */}
                           {step.logs.length > 0 && (
                               <span className="text-xs text-gray-400 font-mono truncate bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded border border-gray-100 dark:border-gray-700 w-fit max-w-full">
                                  {"> " + step.logs[step.logs.length - 1].text}
                               </span>
                           )}
                       </div>
                   </motion.div>
               );
           })}
         </AnimatePresence>
         <div ref={bottomRef} />
      </div>
    </motion.div>
    </>
  );
}