// apps/customer-frontend/src/features/auth/components/AuthLayout.tsx
import React from "react";
import { cn } from "@/shared/lib/utils";
import { Link } from "react-router-dom";
import { ImageWithFallback } from "@/features/figma/ImageWithFallback";
import { Gem } from "lucide-react"; // Dùng icon đá quý/tinh hoa

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
    // MASTER CONTAINER: Màu nền giấy dó ấm áp
    <div className="fixed inset-0 w-full h-[100dvh] bg-[#F5F2EB] font-sans grid lg:grid-cols-2 overflow-hidden">
      {/* --- LEFT PANEL: KHÔNG GIAN CẢM HỨNG --- */}
      <div className="relative hidden lg:flex flex-col justify-between p-16 bg-[#2C1810] text-[#F5F2EB] h-full overflow-hidden border-r border-[#8B4513]/20">
        {/* Background Image: Thay bằng ảnh nghệ thuật (Trà/Gốm/Trầm) */}
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1620311499971-7eb927237077?q=80&w=2000&auto=format&fit=crop" // Ảnh gốm/không gian tối
            className="w-full h-full object-cover opacity-40 mix-blend-overlay sepia-[0.3]"
            alt="Heritage Background"
          />
          {/* Gradient để làm nổi bật text */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2C1810] via-transparent to-[#2C1810]/50 pointer-events-none" />

          {/* Texture Giấy Dó phủ lên */}
          <div
            className="absolute inset-0 opacity-20 mix-blend-multiply pointer-events-none"
            style={{
              backgroundImage: `url("https://www.transparenttextures.com/patterns/cream-paper.png")`,
            }}
          />
        </div>

        {/* Brand Header */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            {/* Logo text đơn giản */}
            <span className="font-serif text-2xl font-bold tracking-tighter text-[#F5F2EB]">
              Printz
            </span>
            <span className="h-4 w-[1px] bg-amber-500/50"></span>
            <span className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-amber-500 group-hover:text-white transition-colors">
              Curator
            </span>
          </Link>
        </div>

        {/* Typography: Triết lý */}
        <div className="relative z-10 space-y-8 mt-auto mb-16 max-w-lg">
          <h1 className="font-serif text-5xl xl:text-7xl leading-[1.1] text-[#F5F2EB]">
            Nơi Di sản <br />
            <span className="italic text-amber-600 font-light">
              Gặp gỡ Vị thế.
            </span>
          </h1>

          <div className="space-y-4 border-l border-amber-800/50 pl-6">
            <p className="font-light text-[#F5F2EB]/80 text-lg leading-relaxed">
              "Mỗi món quà là một sứ giả ngoại giao. Chúng tôi giúp bạn kể câu
              chuyện về sự trân trọng và đẳng cấp thông qua những tuyệt tác thủ
              công."
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="relative z-10 flex justify-between items-end pt-6 border-t border-white/10">
          <div className="flex gap-8 font-mono text-[10px] text-amber-500/60 uppercase tracking-widest">
            <span>Heritage Gifting</span>
            <span>Est. 2025</span>
          </div>
          <span className="font-mono text-[10px] text-amber-500 flex items-center gap-2">
            <Gem className="w-3 h-3" />
            MEMBERS ONLY
          </span>
        </div>
      </div>

      {/* --- RIGHT PANEL: FORM NHẬP LIỆU (SẠCH & SANG) --- */}
      <div className="relative w-full h-full flex items-center justify-center bg-[#F5F2EB] overflow-hidden">
        {/* Texture Noise nhẹ */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-0"></div>

        {/* Header Mobile */}
        <div className="absolute top-0 left-0 w-full p-6 lg:p-12 z-20 pointer-events-none">
          <div className="lg:hidden pointer-events-auto inline-block">
            <Link
              to="/"
              className="font-serif text-xl font-bold text-[#2C1810]"
            >
              Printz
            </Link>
          </div>
        </div>

        {/* Main Form Container */}
        <div className="w-full px-6 flex justify-center z-30">
          <div
            className={cn(
              "w-full max-w-[420px] bg-white p-8 md:p-12 shadow-2xl shadow-[#2C1810]/5 border border-[#E5E0D8]",
              "animate-in fade-in slide-in-from-bottom-4 duration-700", // Hiệu ứng trượt lên nhẹ nhàng
              className
            )}
          >
            {children}
          </div>
        </div>

        {/* Footer Links */}
        <div className="absolute bottom-0 left-0 w-full p-8 text-center z-20 space-y-4">
          <div className="font-sans text-sm text-stone-500">
            {mode === "customer" && (
              <>
                {window.location.pathname === "/signin" ? (
                  <span>
                    Chưa là thành viên?{" "}
                    <Link
                      to="/signup"
                      className="text-amber-800 font-bold hover:text-[#2C1810] transition-colors underline decoration-1 underline-offset-4"
                    >
                      Đăng ký tư cách Doanh nghiệp
                    </Link>
                  </span>
                ) : (
                  <span>
                    Đã có tài khoản?{" "}
                    <Link
                      to="/signin"
                      className="text-amber-800 font-bold hover:text-[#2C1810] transition-colors underline decoration-1 underline-offset-4"
                    >
                      Đăng nhập
                    </Link>
                  </span>
                )}
              </>
            )}
          </div>

          <p className="font-mono text-[9px] text-stone-300 uppercase tracking-widest cursor-default">
            Secured by An Nam Curator
          </p>
        </div>
      </div>
    </div>
  );
}
