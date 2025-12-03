// src/components/EventProductBadge.tsx
import { useEventTheme } from "../hooks/useEventTheme";

interface EventProductBadgeProps {
  productName?: string;
  productTags?: string[];
  className?: string;
}

export const EventProductBadge = ({
  productName = "",
  productTags = [],
  className = "",
}: EventProductBadgeProps) => {
  const { activeEvent, hasActiveEvent } = useEventTheme();

  if (!hasActiveEvent || !activeEvent) {
    return null;
  }

  const { theme } = activeEvent;

  // Logic check keywords giữ nguyên
  const isRelevant = theme.keywords.some((keyword) => {
    const lowerKeyword = keyword.toLowerCase();
    const nameMatch = productName.toLowerCase().includes(lowerKeyword);
    const tagMatch = productTags.some((tag) =>
      tag.toLowerCase().includes(lowerKeyword)
    );
    return nameMatch || tagMatch;
  });

  if (!isRelevant) {
    return null;
  }

  return (
    // STYLE: Minimal Luxury Tag
    // Nền rất nhạt (tint), chữ đậm màu, border mảnh.
    <div
      className={`inline-flex items-center gap-2 py-1 px-3 border transition-all duration-300 hover:brightness-95 ${className}`}
      style={{
        borderColor: theme.primaryColor, // Viền cùng màu chủ đạo
        backgroundColor: `${theme.primaryColor}08`, // Alpha 08 (~3%)
        color: theme.primaryColor,
      }}
    >
      {/* Dấu chấm tròn tạo điểm nhấn */}
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: theme.primaryColor }}
      />

      <span className="text-[10px] font-medium uppercase tracking-widest leading-none font-sans">
        Limited Edition
      </span>
    </div>
  );
};
