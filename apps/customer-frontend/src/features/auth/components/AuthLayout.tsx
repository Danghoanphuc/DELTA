// apps/customer-frontend/src/features/auth/components/AuthLayout.tsx
import React, { useState, useEffect } from "react";
import { cn } from "@/shared/lib/utils";

interface AuthLayoutProps {
  children: React.ReactNode;
  className?: string;
  mode?: "customer" | "printer";
}

// 📢 BỘ SƯU TẬP THÔNG ĐIỆP "CHẤT NHƯ NƯỚC CẤT"
const INSPIRATIONAL_QUOTES = [
  "HIỆN THỰC HÓA MỌI Ý TƯỞNG.", // Promise
  "SÁNG TẠO LÀ KHÔNG GIỚI HẠN.", // Inspiration
  "ĐẬM CHẤT RIÊNG. CHUẨN GU BẠN.", // Personalization (Web2Print)
  "CÔNG NGHỆ ĐỈNH. IN CỰC NÉT.", // Quality & Tech
  "PRINTZ: KHỞI TẠO TƯƠNG LAI.", // Vision
];

export function AuthLayout({
  children,
  className,
  mode = "customer",
}: AuthLayoutProps) {
  // --- LOGIC GÕ PHÍM (Giữ nguyên tốc độ "Hacker") ---
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(100);

  useEffect(() => {
    const i = loopNum % INSPIRATIONAL_QUOTES.length;
    const fullText = INSPIRATIONAL_QUOTES[i];

    const handleTyping = () => {
      setText(
        isDeleting
          ? fullText.substring(0, text.length - 1)
          : fullText.substring(0, text.length + 1)
      );

      // Tốc độ: Xóa siêu nhanh (30ms) - Gõ nhanh (50-100ms)
      setTypingSpeed(isDeleting ? 30 : 50 + Math.random() * 50);

      if (!isDeleting && text === fullText) {
        // Dừng lại 1.5s để người dùng kịp đọc và "thấm"
        setTimeout(() => setIsDeleting(true), 1500); 
      } else if (isDeleting && text === "") {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, typingSpeed]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white selection:bg-indigo-500 selection:text-white">
      
      {/* 1. BACKGROUND GRID (Giữ nguyên độ ngầu) */}
      <div className="absolute inset-0 z-0 opacity-[0.5]"
        style={{
          backgroundImage: `linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(to right, #e5e7eb 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* 2. AMBIENT LIGHT (Màu sắc thương hiệu) */}
      <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-purple-500/10 blur-[120px] animate-pulse delay-1000" />

      {/* 3. MAIN CONTENT */}
      <div className={cn(
        "relative z-10 flex min-h-screen w-full flex-col items-center justify-center p-4 md:p-8",
        "animate-in fade-in zoom-in-95 duration-500",
        className
      )}>
        
        {/* 🔥 TYPOGRAPHY AREA (TIẾNG VIỆT) 🔥 */}
        <div className="mb-12 flex flex-col items-center justify-center h-24 md:h-20 px-4">
           {/* Thêm min-h để tránh chữ nhảy dòng làm vỡ layout trên mobile */}
           <h1 className="font-mono text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter text-slate-900 text-center uppercase leading-tight">
             {text}
             {/* Con trỏ tím hình khối */}
             <span className="ml-2 inline-block h-[0.8em] w-[0.6em] bg-indigo-600 animate-pulse align-baseline shadow-lg shadow-indigo-500/50" />
           </h1>
           
           <p className="mt-3 text-[10px] md:text-xs font-mono text-slate-500 tracking-[0.3em] uppercase opacity-70">
             /// HỆ SINH THÁI IN ẤN PRINTZ ///
           </p>
        </div>

        {/* 4. FORM CONTAINER */}
        <div className="w-full max-w-sm">
             {children}
        </div>

        {/* FOOTER */}
        <div className="mt-12 text-center">
          <p className="font-mono text-xs text-slate-400">
            [ VIETNAM • GLOBAL ]
          </p>
        </div>
      </div>
    </div>
  );
}