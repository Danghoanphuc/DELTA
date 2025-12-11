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
  // 🎨 DESIGN SYSTEM UPDATE: Ink & Art
  const textColor = color === "white" ? "text-white" : "text-stone-900";
  const symbolColor = color === "white" ? "text-white" : "text-[#C63321]"; // Đỏ Son (Vermilion)

  return (
    <Link
      to="/"
      className={cn("group flex items-center gap-3 select-none", className)}
    >
      {/* 1. SYMBOL: THE BRUSH REGISTRATION MARK */}
      {/* Kết hợp: Vòng tròn Enso (Thủ công/Sáng tạo) + Tâm điểm Crosshair (Chính xác/Kỹ thuật) */}
      <div
        className={cn(
          "relative flex items-center justify-center w-10 h-10 transition-transform duration-700 ease-out group-hover:rotate-6", // Xoay nhẹ tự nhiên hơn
          symbolColor
        )}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full fill-current"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* NÉT CỌ VÒNG TRÒN (Enso Style) - Tạo cảm giác mực loang, không đều */}
          <path
            d="M50,90 C27.9,90,10,72.1,10,50 C10,27.9,27.9,10,50,10 C65.5,10,79.8,18.8,86.5,32.5 C87.6,34.8,86.6,37.5,84.3,38.6 C82,39.7,79.3,38.7,78.2,36.4 C73.3,26.4,62.1,19.2,50,19.2 C33,19.2,19.2,33,19.2,50 C19.2,67,33,80.8,50,80.8 C62.6,80.8,73.5,73.2,78.2,62.5 L83.5,65 C77.5,79.5,64.6,90,50,90 Z"
            opacity="0.9"
          />

          {/* NÉT NGANG: Đậm ở đầu, vuốt nhọn ở đuôi (Brush feel) */}
          <path d="M15,50 C15,48.5,16.5,47,20,47 L80,47 C83.5,47,85,48.5,85,50 C85,51.5,83.5,53,80,53 L20,53 C16.5,53,15,51.5,15,50 Z" />

          {/* NÉT DỌC: Tương tự nét ngang */}
          <path d="M50,15 C48.5,15,47,16.5,47,20 L47,80 C47,83.5,48.5,85,50,85 C51.5,85,53,83.5,53,80 L53,20 C53,16.5,51.5,15,50,15 Z" />
        </svg>
      </div>

      {/* 2. WORDMARK: BRAND & TAGLINE */}
      {variant === "full" && (
        <div className="flex flex-col justify-center -mt-1">
          {/* PRINTZ: Serif Font - Giữ nguyên sự sang trọng */}
          <span
            className={cn(
              "font-serif text-[28px] font-black tracking-tighter leading-none text-stone-900",
              textColor
            )}
          >
            Printz
          </span>

          {/* TAGLINE MỚI: Mạnh mẽ - Hệ thống - Quy mô */}
          <div className="flex flex-col gap-[1px] mt-1">
            <span
              className={cn(
                "font-sans text-[1px] font-extrabold uppercase tracking-[0.4em] leading-none opacity-80",
                textColor
              )}
            >
              ẤN PHẨM & QUÀ TẶNG
            </span>
          </div>
        </div>
      )}
    </Link>
  );
};
