// apps/customer-frontend/src/features/chat/components/ThinkingBubble.tsx
import { useState, useEffect } from "react";

// Bộ từ điển "diễn sâu" - Client tự random
const FAKE_LOGS = [
  "Đang phân tích yêu cầu...",
  "Đang tìm kiếm dữ liệu...",
  "Đang tổng hợp thông tin...",
  "Đang soạn thảo câu trả lời...",
  "Đang kiểm tra kho hàng...",
  "Đang xử lý hình ảnh...",
  "Đang phân tích thiết kế...",
  "Đang tạo gợi ý cho bạn...",
];

export const ThinkingBubble = () => {
  const [logIndex, setLogIndex] = useState(0);

  useEffect(() => {
    // Tự động đổi câu mỗi 2.5 giây -> Tạo cảm giác AI đang làm việc
    const interval = setInterval(() => {
      setLogIndex((prev) => (prev + 1) % FAKE_LOGS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative p-[2px] rounded-2xl rounded-tl-none w-fit overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      {/* Animated Gradient Border */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-30 animate-pulse" />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "linear-gradient(90deg, #60a5fa, #a78bfa, #f472b6, #60a5fa)",
          backgroundSize: "200% 100%",
          animation: "gradient-shift 3s ease infinite",
        }}
      />

      <div className="relative flex items-center justify-center px-4 py-2.5 bg-white dark:bg-gray-900 rounded-[14px]">
        {/* Loading Dots with Gradient */}
        <div className="mr-3 flex space-x-1">
          <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-bounce [animation-delay:-0.3s] shadow-sm"></span>
          <span className="w-2 h-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full animate-bounce [animation-delay:-0.15s] shadow-sm"></span>
          <span className="w-2 h-2 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full animate-bounce shadow-sm"></span>
        </div>

        {/* Animated Text with Gradient */}
        <span
          key={logIndex}
          className="text-sm font-medium bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent min-w-[140px] animate-in fade-in slide-in-from-bottom-1 duration-300"
          style={{
            backgroundSize: "200% 100%",
            animation: "gradient-shift 4s ease infinite",
          }}
        >
          {FAKE_LOGS[logIndex]}
        </span>
      </div>

      <style>{`
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>

      {/* Shimmer Effect */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)",
          animation: "shimmer 2s infinite",
        }}
      />
    </div>
  );
};
