import { EventTheme } from "@/hooks/useEventTheme";

/**
 * Utility functions để làm việc với Event Theme
 */

/**
 * Tạo inline styles từ event theme
 */
export const getEventStyles = (theme: EventTheme | null) => {
  if (!theme) return {};

  return {
    "--event-primary": theme.primaryColor,
    "--event-secondary": theme.secondaryColor,
    "--event-accent": theme.accentColor,
    "--event-bg": theme.backgroundColor,
    "--event-text": theme.textColor,
  } as React.CSSProperties;
};

/**
 * Check xem text có chứa keyword của event không
 */
export const matchesEventKeywords = (
  text: string,
  keywords: string[]
): boolean => {
  const lowerText = text.toLowerCase();
  return keywords.some((keyword) => lowerText.includes(keyword.toLowerCase()));
};

/**
 * Tính relevance score của sản phẩm với event
 */
export const calculateEventRelevance = (
  productName: string,
  productTags: string[],
  eventKeywords: string[]
): number => {
  let score = 0;

  const lowerName = productName.toLowerCase();
  const lowerTags = productTags.map((tag) => tag.toLowerCase());

  eventKeywords.forEach((keyword) => {
    const lowerKeyword = keyword.toLowerCase();

    // Exact match trong tên = 3 điểm
    if (lowerName === lowerKeyword) {
      score += 3;
    }
    // Partial match trong tên = 2 điểm
    else if (lowerName.includes(lowerKeyword)) {
      score += 2;
    }

    // Match trong tags = 1 điểm mỗi tag
    lowerTags.forEach((tag) => {
      if (tag.includes(lowerKeyword)) {
        score += 1;
      }
    });
  });

  return score;
};

/**
 * Format countdown text
 */
export const formatDaysRemaining = (days: number): string => {
  if (days === 0) return "Hôm nay là ngày cuối!";
  if (days === 1) return "Còn 1 ngày";
  if (days < 0) return "Đã kết thúc";
  return `Còn ${days} ngày`;
};

/**
 * Tạo gradient background từ theme colors
 */
export const getEventGradient = (theme: EventTheme): string => {
  return `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 100%)`;
};

/**
 * Lighten/darken color (để tạo hover effects)
 */
export const adjustColor = (color: string, amount: number): string => {
  // Simple hex color adjustment
  const hex = color.replace("#", "");
  const num = parseInt(hex, 16);

  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));

  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
};
