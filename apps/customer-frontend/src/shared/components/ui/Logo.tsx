// apps/customer-frontend/src/shared/components/ui/Logo.tsx

import { cn } from "@/shared/lib/utils";
import { Link } from "react-router-dom";

interface LogoProps {
  className?: string;
  variant?: "full" | "symbol";
  color?: "default" | "white";
}

export const Logo = ({
  className,
  variant = "full",
  color = "default",
}: LogoProps) => {
  // 🎨 DESIGN SYSTEM: 60-30-10 Rule
  // 60% Nền: Giấy Dó (bg-background)
  // 30% Chữ: Mực Tàu (text-foreground)
  // 10% Điểm nhấn: Đỏ Son (text-primary)

  const textColor = color === "white" ? "text-white" : "text-foreground"; // Mực Tàu (#1C1917)
  const symbolColor = color === "white" ? "text-white" : "text-primary"; // Đỏ Son (#C63321)

  return (
    <Link
      to="/"
      className={cn("group flex items-center gap-2.5 select-none", className)}
    >
      {/* 1. SYMBOL: REGISTRATION MARK (⊕) */}
      {/* Tao tăng độ dày nét lên 5px để nhìn "đầm" hơn, không bị yếu */}
      <div
        className={cn(
          "relative flex items-center justify-center w-9 h-9 transition-transform duration-700 ease-out group-hover:rotate-180",
          symbolColor
        )}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full fill-none stroke-current"
          style={{ strokeWidth: "5px" }}
        >
          {/* Vòng tròn nhỏ lại chút để tạo khoảng thở */}
          <circle cx="50" cy="50" r="30" />
          {/* Chữ thập cắt ngang mạnh mẽ */}
          <line x1="50" y1="8" x2="50" y2="92" strokeLinecap="square" />
          <line x1="8" y1="50" x2="92" y2="50" strokeLinecap="square" />
        </svg>
      </div>

      {/* 2. WORDMARK: PRINTZ + SUBTITLE VIỆT */}
      {variant === "full" && (
        <div className="flex flex-col justify-center">
          {/* PRINTZ: Font Serif cực đậm + Khít chữ -> Nhìn như con dấu */}
          <span
            className={cn(
              "font-serif text-[26px] font-black tracking-tight leading-none scale-y-90", // scale-y-90 làm chữ lùn xuống 1 chút -> trông chắc chắn hơn
              textColor
            )}
          >
            PRINTZ
          </span>

          {/* Subtitle: Font Sans hiện đại, Tiếng Việt rõ ràng */}
          <span
            className={cn(
              "font-sans text-[9px] font-bold uppercase tracking-[0.2em] opacity-70 leading-none mt-0.5",
              textColor
            )}
          >
            GIẢI PHÁP IN ẤN
          </span>
        </div>
      )}
    </Link>
  );
};
