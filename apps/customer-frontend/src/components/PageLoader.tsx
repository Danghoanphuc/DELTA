import { useEffect, useState } from "react";
import { CreativeLogo } from "@/shared/components/ui/CreativeLogo";
import { useSplashStore } from "@/stores/useSplashStore";

interface PageLoaderProps {
  isLoading?: boolean;
  mode?: "splash" | "loading";
}

// 3 Câu thần chú Tiếng Việt "Ngầu & Lạ"
const LOADING_MESSAGES = [
  "KÍCH HOẠT LÕI AI...",         // Nghe nguy hiểm, công nghệ cao
  "ĐỒNG BỘ HÓA DỮ LIỆU...",      // Cảm giác hệ thống phức tạp đang xử lý
  "SẴN SÀNG SÁNG TẠO"            // Câu chốt, mời gọi hành động
];

const PageLoader = ({ isLoading = false, mode = "loading" }: PageLoaderProps) => {
  const { hasShownSplash, setHasShownSplash } = useSplashStore();
  const [showSplash, setShowSplash] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  
  // State quản lý text
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    useSplashStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (mode !== "splash") return;

    // Tăng tốc độ nhảy chữ lên một chút (800ms) cho cảm giác máy chạy nhanh
    const textInterval = setInterval(() => {
      setMessageIndex((prev) => (prev < LOADING_MESSAGES.length - 1 ? prev + 1 : prev));
    }, 800);

    if (useSplashStore.getState().hasShownSplash && !isLoading) {
      setShowSplash(false);
      clearInterval(textInterval);
      return;
    }

    if (!useSplashStore.getState().hasShownSplash) {
      const timer = setTimeout(() => {
        if (!isLoading) triggerExit();
      }, 3000); 
      return () => {
        clearTimeout(timer);
        clearInterval(textInterval);
      };
    }

    return () => clearInterval(textInterval);
  }, [mode, isLoading]);

  useEffect(() => {
    if (mode === "splash" && !isLoading && useSplashStore.getState().hasShownSplash) {
       triggerExit();
    }
  }, [isLoading]);

  const triggerExit = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      setShowSplash(false);
      setHasShownSplash(true);
    }, 600);
  };

  if (mode === "splash" && !showSplash) return null;
  if (mode === "loading" && !isLoading) return null;

  return (
    <div
      className={`
        fixed inset-0 z-[9999] flex items-center justify-center 
        bg-white/95 backdrop-blur-md transition-all duration-500 ease-in-out
        ${isExiting ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"}
      `}
    >
      <div className="relative flex flex-col items-center justify-center w-full max-w-xl px-4">
        
        {/* Logo to hơn một chút nữa để cân đối với chữ mới */}
        <div className={`w-36 h-36 md:w-48 md:h-48 transition-transform duration-700 ${isExiting ? "scale-125" : "scale-100"}`}>
          <CreativeLogo /> 
        </div>

        {/* PHẦN TEXT ĐÃ FIX */}
        {mode === "splash" && (
          // 1. Bỏ w-64, dùng w-full. 
          // 2. Tăng chiều cao h-10 để chứa font to hơn.
          <div className="mt-10 h-10 flex items-center justify-center overflow-hidden relative w-full">
             {LOADING_MESSAGES.map((msg, idx) => (
                <div
                  key={idx}
                  className={`
                    absolute w-full text-center 
                    /* Font: Mono để tạo cảm giác Tech/Code */
                    font-mono font-bold uppercase 
                    /* Size: To hơn hẳn (sm -> base/lg) */
                    text-sm md:text-lg 
                    /* Spacing: Giãn chữ rộng tạo sự sang trọng */
                    tracking-[0.25em] 
                    /* Màu: Slate đậm hơn cho rõ nét */
                    text-slate-600
                    /* Chống xuống dòng */
                    whitespace-nowrap
                    transition-all duration-500 ease-in-out
                    ${indexToClass(idx, messageIndex, isExiting)}
                  `}
                >
                  {msg}
                </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};

const indexToClass = (idx: number, current: number, isExiting: boolean) => {
    // Khi thoát: Chữ biến thành màu xanh Brand rồi bay xuống
    if (isExiting) return "opacity-0 translate-y-6 text-blue-600 tracking-[0.5em]"; 
    
    // Đang hiện: Rõ nét, đúng vị trí
    if (idx === current) return "opacity-100 translate-y-0 blur-none"; 
    
    // Chưa tới: Nằm dưới, mờ
    if (idx > current) return "opacity-0 translate-y-6 blur-md"; 
    
    // Đã qua: Bay lên trên, mờ
    return "opacity-0 -translate-y-6 blur-md";
}

export default PageLoader;