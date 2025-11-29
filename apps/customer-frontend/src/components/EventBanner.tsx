import { useEventTheme } from "../hooks/useEventTheme";
import { useEffect } from "react";

/**
 * EventBanner - KHÔNG render banner nào cả
 * Chỉ inject CSS variables vào :root để theme hoạt động
 * Không phá vỡ layout hiện tại - chỉ thay đổi màu sắc
 */
export const EventBanner = () => {
  const { activeEvent, hasActiveEvent } = useEventTheme();

  useEffect(() => {
    if (!hasActiveEvent || !activeEvent) {
      // Reset về màu mặc định
      const root = document.documentElement;
      root.style.removeProperty("--color-theme-primary");
      root.style.removeProperty("--color-theme-secondary");
      root.style.removeProperty("--color-theme-accent");
      root.style.removeProperty("--color-theme-bg");
      root.style.removeProperty("--color-theme-text");
      return;
    }

    const { theme } = activeEvent;

    // Inject CSS variables vào document root
    const root = document.documentElement;
    root.style.setProperty(
      "--color-theme-primary",
      hexToRgb(theme.primaryColor)
    );
    root.style.setProperty(
      "--color-theme-secondary",
      hexToRgb(theme.secondaryColor)
    );
    root.style.setProperty("--color-theme-accent", hexToRgb(theme.accentColor));
    root.style.setProperty("--color-theme-bg", theme.backgroundColor);
    root.style.setProperty("--color-theme-text", theme.textColor);
  }, [hasActiveEvent, activeEvent]);

  // Không render gì cả - chỉ inject CSS variables
  return null;
};

// Helper: Convert hex to RGB for Tailwind opacity support
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(
        result[3],
        16
      )}`
    : "0 0 0";
}
