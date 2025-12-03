// apps/customer-frontend/src/features/auth/components/AuthLayout.tsx
import React from "react";
import { cn } from "@/shared/lib/utils";
import { Link } from "react-router-dom";
import { ImageWithFallback } from "@/features/figma/ImageWithFallback";

interface AuthLayoutProps {
  children: React.ReactNode;
  className?: string;
  mode?: "customer" | "printer";
}

export function AuthLayout({
  children,
  className,
  mode = "customer",
}: AuthLayoutProps) {
  return (
    // MASTER CONTAINER: Fixed inset-0 để khóa cứng màn hình, không cho body cuộn
    <div className="fixed inset-0 w-full h-[100dvh] bg-[#F5F5F0] font-sans grid lg:grid-cols-2 overflow-hidden">
      {/* --- LEFT PANEL (Giữ nguyên) --- */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-stone-900 text-white h-full overflow-hidden">
        {/* Background & Overlay */}
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src={
              mode === "printer"
                ? "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2000&auto=format&fit=crop"
                : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop"
            }
            className="w-full h-full object-cover opacity-60 mix-blend-normal"
            alt="Auth Background"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Brand Header */}
        <div className="relative z-10">
          <Link to="/" className="inline-block group">
            <span className="font-mono text-xs font-bold tracking-[0.2em] uppercase border border-white/30 px-3 py-1.5 text-white group-hover:bg-white group-hover:text-stone-900 transition-colors backdrop-blur-sm">
              Printz {mode === "printer" ? "Partners" : "Corporate"}
            </span>
          </Link>
        </div>

        {/* Typography */}
        <div className="relative z-10 space-y-6 mt-auto mb-12">
          <h1 className="font-serif text-6xl xl:text-7xl leading-[0.95] text-white drop-shadow-md">
            {mode === "printer" ? (
              <>
                Powering <br /> the{" "}
                <span className="italic font-light text-emerald-400">
                  Press.
                </span>
              </>
            ) : (
              <>
                Crafting <br /> the{" "}
                <span className="italic font-light text-emerald-400">
                  Tangible.
                </span>
              </>
            )}
          </h1>
          <p className="max-w-md font-light text-stone-200 text-lg leading-relaxed border-l-2 border-emerald-500 pl-4 drop-shadow">
            {mode === "printer"
              ? "Hệ thống vận hành in ấn chuẩn công nghiệp."
              : "Nền tảng định danh và quản trị thương hiệu vật lý."}
          </p>
        </div>

        {/* Footer Info */}
        <div className="relative z-10 flex justify-between items-end border-t border-white/20 pt-6">
          <div className="flex gap-8 font-mono text-xs text-stone-400 uppercase tracking-widest">
            <span>Est. 2025</span>
            <span>HCMC • VN</span>
          </div>
          <span className="font-mono text-xs text-emerald-400 animate-pulse">
            ● SYSTEM_ONLINE
          </span>
        </div>
      </div>

      {/* --- RIGHT PANEL (NO SCROLL VERSION) --- */}
      {/* Sử dụng Flex Center + Relative để căn giữa Form. Header/Footer dùng Absolute để không ảnh hưởng layout */}
      <div className="relative w-full h-full flex items-center justify-center bg-[#F5F5F0] overflow-hidden">
        {/* Noise Texture */}
        <div className="absolute inset-0 opacity-[0.4] mix-blend-multiply pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-0"></div>

        {/* 1. Header (Absolute Top) */}
        <div className="absolute top-0 left-0 w-full p-6 lg:p-12 z-20 pointer-events-none">
          <div className="lg:hidden pointer-events-auto inline-block">
            <Link
              to="/"
              className="font-mono text-xs font-bold tracking-[0.2em] uppercase text-stone-900"
            >
              Printz.vn
            </Link>
          </div>
        </div>

        {/* 2. Main Form (Centered) */}
        <div className="w-full px-6 flex justify-center z-30">
          <div
            className={cn(
              "w-full max-w-[400px] bg-white p-8 md:p-10 shadow-2xl shadow-stone-200/50 border border-stone-200",
              "animate-in fade-in zoom-in-95 duration-500", // Hiệu ứng zoom nhẹ khi xuất hiện
              className
            )}
          >
            {children}
          </div>
        </div>

        {/* 3. Footer (Absolute Bottom) - Toggle Sign In/Sign Up */}
        <div className="absolute bottom-0 left-0 w-full p-6 text-center z-20 space-y-3">
          {/* Toggle Link */}
          <div className="font-mono text-xs text-stone-500">
            {mode === "customer" && (
              <>
                {window.location.pathname === "/signin" ? (
                  <span>
                    Chưa có tài khoản?{" "}
                    <Link
                      to="/signup"
                      className="text-stone-900 font-bold hover:text-emerald-700 transition-colors underline"
                    >
                      Đăng ký ngay
                    </Link>
                  </span>
                ) : (
                  <span>
                    Đã có tài khoản?{" "}
                    <Link
                      to="/signin"
                      className="text-stone-900 font-bold hover:text-emerald-700 transition-colors underline"
                    >
                      Đăng nhập
                    </Link>
                  </span>
                )}
              </>
            )}
          </div>

          {/* Protected Badge */}
          <p className="font-mono text-[10px] text-stone-400 uppercase tracking-widest hover:text-stone-600 transition-colors cursor-default">
            Protected by Printz Guard™
          </p>
        </div>
      </div>
    </div>
  );
}
