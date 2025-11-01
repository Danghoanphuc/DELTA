// src/features/editor/hooks/useFabricHistory.ts
import { useState, useCallback } from "react";
import { Canvas } from "fabric";

// Tăng giới hạn lịch sử
const MAX_HISTORY_SIZE = 100;

export const useFabricHistory = (
  canvas: React.RefObject<Canvas | null>,
  onHistoryUpdate: () => void // Hàm để gọi khi undo/redo (vd: debouncedCanvasUpdate)
) => {
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isHistoryAction, setIsHistoryAction] = useState(false); // Cờ để tránh lưu state khi undo/redo

  /**
   * Lưu trạng thái canvas hiện tại vào lịch sử
   */
  const saveState = useCallback(() => {
    if (isHistoryAction) {
      setIsHistoryAction(false); // Reset cờ
      return;
    }
    if (!canvas.current) return;

    const json = JSON.stringify(canvas.current.toJSON());
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(json);

    // Giới hạn kích thước lịch sử
    if (newHistory.length > MAX_HISTORY_SIZE) {
      newHistory.shift();
    }

    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex, canvas, isHistoryAction]);

  /**
   * Quay lại (Undo)
   */
  const undo = useCallback(() => {
    if (historyIndex <= 0 || !canvas.current) return;

    setIsHistoryAction(true); // Đặt cờ
    const prevState = history[historyIndex - 1];
    canvas.current.loadFromJSON(prevState, () => {
      canvas.current?.renderAll();
      setHistoryIndex(historyIndex - 1);
      onHistoryUpdate();
    });
  }, [history, historyIndex, canvas, onHistoryUpdate]);

  /**
   * Làm lại (Redo)
   */
  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1 || !canvas.current) return;

    setIsHistoryAction(true); // Đặt cờ
    const nextState = history[historyIndex + 1];
    canvas.current.loadFromJSON(nextState, () => {
      canvas.current?.renderAll();
      setHistoryIndex(historyIndex + 1);
      onHistoryUpdate();
    });
  }, [history, historyIndex, canvas, onHistoryUpdate]);

  return {
    saveState,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
  };
};
