import { useEventTheme } from "../hooks/useEventTheme";
import { Palette, X } from "lucide-react";
import { useState } from "react";

/**
 * EventThemeDemo - Component demo nhỏ gọn
 * Chỉ hiển thị trong dev mode
 */
export const EventThemeDemo = () => {
  const { activeEvent, hasActiveEvent } = useEventTheme();
  const [isMinimized, setIsMinimized] = useState(false);

  if (!hasActiveEvent || !activeEvent) {
    return null;
  }

  const { theme } = activeEvent;

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all z-50"
        style={{ borderColor: theme.primaryColor, borderWidth: 2 }}
      >
        <Palette size={20} style={{ color: theme.primaryColor }} />
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-4 right-4 bg-white rounded-lg shadow-xl p-4 max-w-xs border-2 z-50"
      style={{ borderColor: theme.primaryColor }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Palette size={16} style={{ color: theme.primaryColor }} />
          <h3 className="font-bold text-sm">Event Theme</h3>
        </div>
        <button
          onClick={() => setIsMinimized(true)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X size={14} />
        </button>
      </div>

      <div className="space-y-2 text-xs">
        <div>
          <span className="font-semibold">{activeEvent.name}</span>
        </div>

        <div className="flex gap-2">
          <div
            className="w-8 h-8 rounded border-2 border-gray-200"
            style={{ backgroundColor: theme.primaryColor }}
            title="Primary"
          />
          <div
            className="w-8 h-8 rounded border-2 border-gray-200"
            style={{ backgroundColor: theme.secondaryColor }}
            title="Secondary"
          />
          <div
            className="w-8 h-8 rounded border-2 border-gray-200"
            style={{ backgroundColor: theme.accentColor }}
            title="Accent"
          />
        </div>

        <div className="text-xs text-gray-500">
          Layout không đổi, chỉ màu sắc thay đổi
        </div>
      </div>
    </div>
  );
};
