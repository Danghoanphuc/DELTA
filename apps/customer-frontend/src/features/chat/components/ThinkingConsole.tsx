// src/features/chat/components/ThinkingConsole.tsx
// Live Terminal Console - Hiển thị real-time logs từ AI processing

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, CheckCircle2, Loader2, Cpu, Camera, Database, Globe, Sparkles, AlertCircle } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface LogStep {
  id: string;
  text: string;
  type: "info" | "process" | "success" | "network" | "camera" | "database" | "ai" | "error";
  timestamp: number;
}

interface ThinkingConsoleProps {
  logs: LogStep[];
}

export function ThinkingConsole({ logs }: ThinkingConsoleProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // ✅ SAFE CHECK: Đảm bảo logs là array
  const safeLogs = Array.isArray(logs) ? logs : [];

  // Auto-scroll xuống cuối khi có log mới
  useEffect(() => {
    if (scrollRef.current && safeLogs.length > 0) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [safeLogs]);

  const getIcon = (type: string) => {
    switch (type) {
      case "process":
        return <Cpu size={12} className="text-blue-400 animate-pulse" />;
      case "success":
        return <CheckCircle2 size={12} className="text-green-400" />;
      case "network":
        return <Globe size={12} className="text-yellow-400" />;
      case "camera":
        return <Camera size={12} className="text-purple-400" />;
      case "database":
        return <Database size={12} className="text-cyan-400" />;
      case "ai":
        return <Sparkles size={12} className="text-pink-400 animate-pulse" />;
      case "error":
        return <AlertCircle size={12} className="text-red-400" />;
      default:
        return <Terminal size={12} className="text-gray-400" />;
    }
  };

  const getTextColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-green-400";
      case "network":
        return "text-yellow-200";
      case "process":
        return "text-blue-300";
      case "camera":
        return "text-purple-300";
      case "database":
        return "text-cyan-300";
      case "ai":
        return "text-pink-300";
      case "error":
        return "text-red-400";
      default:
        return "text-gray-300";
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-4 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 bg-[#0d1117] shadow-xl font-mono text-xs">
      {/* Header giả lập Terminal */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#161b22] border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          </div>
          <span className="ml-2 text-gray-400 font-semibold select-none">printz-ai-engine — zsh</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gray-500">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Processing...</span>
        </div>
      </div>

      {/* Log Area */}
      <div
        ref={scrollRef}
        className="h-[180px] overflow-y-auto p-3 space-y-1.5 scroll-smooth custom-scrollbar-dark"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#30363d #0d1117",
        }}
      >
        <AnimatePresence initial={false}>
          {safeLogs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-start gap-2.5 text-gray-300"
            >
              <span className="flex-shrink-0 mt-0.5 text-gray-500 text-[10px]">
                {new Date(log.timestamp).toLocaleTimeString("vi-VN", {
                  hour12: false,
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
              <span className="flex-shrink-0 mt-0.5">{getIcon(log.type)}</span>
              <span className={cn("break-all leading-relaxed", getTextColor(log.type))}>
                <span className="opacity-50 mr-2">$</span>
                {log.text}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Blinking Cursor */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="flex items-center gap-2 text-blue-500 mt-2"
        >
          <span className="text-gray-500 text-[10px]">
            {new Date().toLocaleTimeString("vi-VN", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
          <span>➜</span>
          <span className="w-2 h-4 bg-blue-500 block" />
        </motion.div>
      </div>
    </div>
  );
}

