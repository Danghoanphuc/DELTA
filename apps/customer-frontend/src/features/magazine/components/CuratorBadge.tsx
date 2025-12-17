// apps/customer-frontend/src/features/magazine/components/CuratorBadge.tsx
// Trusted Badge - Hiển thị quyền tác giả "kép" (Dual Authorship)

interface CuratorBadgeProps {
  variant?: "light" | "dark";
  size?: "sm" | "md";
}

/**
 * Printz Symbol SVG - The Brush Seal (Con dấu)
 * Extracted from Logo.tsx - Màu Đỏ Son (Vermilion) #C63321
 */
function PrintzSymbol({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* NÉT CỌ VÒNG TRÒN (Enso Style) */}
      <path
        d="M50,90 C27.9,90,10,72.1,10,50 C10,27.9,27.9,10,50,10 C65.5,10,79.8,18.8,86.5,32.5 C87.6,34.8,86.6,37.5,84.3,38.6 C82,39.7,79.3,38.7,78.2,36.4 C73.3,26.4,62.1,19.2,50,19.2 C33,19.2,19.2,33,19.2,50 C19.2,67,33,80.8,50,80.8 C62.6,80.8,73.5,73.2,78.2,62.5 L83.5,65 C77.5,79.5,64.6,90,50,90 Z"
        opacity="0.9"
      />
      {/* NÉT NGANG */}
      <path d="M15,50 C15,48.5,16.5,47,20,47 L80,47 C83.5,47,85,48.5,85,50 C85,51.5,83.5,53,80,53 L20,53 C16.5,53,15,51.5,15,50 Z" />
      {/* NÉT DỌC */}
      <path d="M50,15 C48.5,15,47,16.5,47,20 L47,80 C47,83.5,48.5,85,50,85 C51.5,85,53,83.5,53,80 L53,20 C53,16.5,51.5,15,50,15 Z" />
    </svg>
  );
}

/**
 * CuratorBadge - Huy hiệu tín nhiệm cho bài viết được biên tập bởi Printz
 * Hiển thị "Dual Authorship" - Nghệ nhân là tác giả ý tưởng, Printz là người biên tập
 */
export function CuratorBadge({
  variant = "light",
  size = "sm",
}: CuratorBadgeProps) {
  const isLight = variant === "light";
  const isMd = size === "md";

  return (
    <div
      className={`
        flex items-center gap-2 py-1.5 px-3 rounded-full w-fit
        ${
          isLight
            ? "bg-amber-50 border border-amber-100"
            : "bg-white/10 border border-white/20 backdrop-blur-sm"
        }
      `}
    >
      {/* Printz Symbol - The Brush Seal */}
      <div
        className={`
          shrink-0 flex items-center justify-center
          ${isMd ? "w-5 h-5" : "w-4 h-4"}
        `}
      >
        <PrintzSymbol
          className={`w-full h-full fill-current ${
            isLight ? "text-[#C63321]" : "text-white"
          }`}
        />
      </div>
      <span
        className={`
          font-medium uppercase tracking-wide
          ${isLight ? "text-amber-800" : "text-white/90"}
          ${isMd ? "text-xs" : "text-[10px]"}
        `}
      >
        Biên tập bởi Printz Curators
      </span>
    </div>
  );
}

export default CuratorBadge;
