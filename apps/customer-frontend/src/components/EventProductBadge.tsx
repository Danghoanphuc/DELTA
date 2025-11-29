import { useEventTheme } from "../hooks/useEventTheme";
import { Sparkles } from "lucide-react";

interface EventProductBadgeProps {
  productName?: string;
  productTags?: string[];
  className?: string;
}

/**
 * EventProductBadge - Badge nhỏ gọn cho sản phẩm liên quan đến event
 * Dùng theme colors, không phá vỡ layout
 */
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

  // Check xem sản phẩm có match với keywords của event không
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
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold shadow-sm ${className}`}
      style={{
        backgroundColor: theme.primaryColor,
        color: "#FFFFFF",
      }}
    >
      <Sparkles size={10} />
      <span>Hot</span>
    </div>
  );
};
