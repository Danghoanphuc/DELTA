// src/features/editor/hooks/useFabricHistory.ts
// ✅ BẢN SỬA LỖI RACE CONDITION

import { useState, useCallback, useRef, useEffect } from "react";
import { Canvas } from "fabric";

const MAX_HISTORY_SIZE = 100;

export const useFabricHistory = (
  canvas: React.RefObject<Canvas | null>,
  onHistoryUpdate: () => void // Hàm để gọi khi undo/redo
) => {
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isHistoryAction, setIsHistoryAction] = useState(false);

  // --- 1. Dùng Ref để lưu trữ các giá trị động ---
  // Điều này giúp các hàm callback (như saveState) luôn
  // truy cập được giá trị mới nhất mà không cần
  // đưa chúng vào dependency list của useCallback.
  const historyRef = useRef(history);
  const historyIndexRef = useRef(historyIndex);
  const canvasRef = useRef(canvas);
  const isHistoryActionRef = useRef(isHistoryAction);

  // --- 2. Đồng bộ state vào ref ---
  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  useEffect(() => {
    historyIndexRef.current = historyIndex;
  }, [historyIndex]);

  useEffect(() => {
    canvasRef.current = canvas;
  }, [canvas]);

  useEffect(() => {
    isHistoryActionRef.current = isHistoryAction;
  }, [isHistoryAction]);

  /**
   * Lưu trạng thái canvas hiện tại vào lịch sử
   * ✅ HÀM NÀY GIỜ ĐÂY ỔN ĐỊNH (STABLE) VÀ KHÔNG CÓ DEPENDENCY
   */
  const saveState = useCallback(() => {
    if (isHistoryActionRef.current) {
      setIsHistoryAction(false); // Reset cờ
      return;
    }
    if (!canvasRef.current.current) return;

    const json = JSON.stringify(canvasRef.current.current.toJSON());

    // Lấy giá trị mới nhất từ ref
    const currentHistory = historyRef.current;
    const currentIndex = historyIndexRef.current;

    const newHistory = currentHistory.slice(0, currentIndex + 1);
    newHistory.push(json);

    if (newHistory.length > MAX_HISTORY_SIZE) {
      newHistory.shift();
    }

    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, []); // <-- 3. Dependency rỗng!

  /**
   * Quay lại (Undo)
   * ✅ HÀM NÀY CŨNG ỔN ĐỊNH (STABLE)
   */
  const undo = useCallback(() => {
    const currentIndex = historyIndexRef.current;
    const currentHistory = historyRef.current;
    const currentCanvas = canvasRef.current.current;

    if (currentIndex <= 0 || !currentCanvas) return;

    setIsHistoryAction(true); // Đặt cờ
    const prevState = currentHistory[currentIndex - 1];

    currentCanvas.loadFromJSON(prevState, () => {
      currentCanvas?.renderAll();
      setHistoryIndex(currentIndex - 1);
      onHistoryUpdate();
    });
  }, [onHistoryUpdate]); // Chỉ phụ thuộc vào onHistoryUpdate

  /**
   * Làm lại (Redo)
   * ✅ HÀM NÀY CŨNG ỔN ĐỊNH (STABLE)
   */
  const redo = useCallback(() => {
    const currentIndex = historyIndexRef.current;
    const currentHistory = historyRef.current;
    const currentCanvas = canvasRef.current.current;

    if (currentIndex >= currentHistory.length - 1 || !currentCanvas) return;

    setIsHistoryAction(true); // Đặt cờ
    const nextState = currentHistory[currentIndex + 1];

    currentCanvas.loadFromJSON(nextState, () => {
      currentCanvas?.renderAll();
      setHistoryIndex(currentIndex + 1);
      onHistoryUpdate();
    });
  }, [onHistoryUpdate]); // Chỉ phụ thuộc vào onHistoryUpdate

  return {
    saveState,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
  };
};
