// src/features/editor/hooks/useFabricKeyboardShortcuts.ts
// ✅ ĐÃ SỬA: Dùng API trung tâm, bỏ clipboard riêng

import { useEffect } from "react";
import { Canvas, ActiveSelection } from "fabric";
import * as fabricApi from "../core/fabricApi"; // ✅ Import API

interface ShortcutProps {
  canvas: React.RefObject<Canvas | null>;
  undo: () => void;
  redo: () => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
}

export const useFabricKeyboardShortcuts = ({
  canvas,
  undo,
  redo,
  deleteSelected,
  duplicateSelected,
}: ShortcutProps) => {
  // ❌ Xóa clipboardRef: useRef<any>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentCanvas = canvas.current;
      if (!currentCanvas) return;

      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      // Delete/Backspace
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteSelected();
      }

      // Undo/Redo (Ctrl+Z, Ctrl+Shift+Z)
      if (modKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }

      // ✅ SỬA: Copy (Ctrl+C)
      if (modKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        fabricApi.copySelected(currentCanvas); // Gọi API
      }

      // ✅ SỬA: Paste (Ctrl+V)
      if (modKey && e.key.toLowerCase() === "v") {
        e.preventDefault();
        fabricApi.paste(currentCanvas); // Gọi API
      }

      // Duplicate (Ctrl+D)
      if (modKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateSelected();
      }

      // Select All (Ctrl+A)
      if (modKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        currentCanvas.discardActiveObject();
        const sel = new ActiveSelection(currentCanvas.getObjects(), {
          canvas: currentCanvas,
        });
        currentCanvas.setActiveObject(sel);
        currentCanvas.requestRenderAll();
      }

      // Deselect (Escape)
      if (e.key === "Escape") {
        e.preventDefault();
        currentCanvas.discardActiveObject();
        currentCanvas.requestRenderAll();
      }

      // Movement (Arrow Keys)
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        // ... (code di chuyển giữ nguyên) ...
        e.preventDefault();
        const activeObject = currentCanvas.getActiveObject();
        if (!activeObject) return;

        const step = e.shiftKey ? 10 : 1;
        switch (e.key) {
          case "ArrowUp":
            activeObject.set({ top: (activeObject.top || 0) - step });
            break;
          case "ArrowDown":
            activeObject.set({ top: (activeObject.top || 0) + step });
            break;
          case "ArrowLeft":
            activeObject.set({ left: (activeObject.left || 0) - step });
            break;
          case "ArrowRight":
            activeObject.set({ left: (activeObject.left || 0) + step });
            break;
        }
        activeObject.setCoords();
        currentCanvas.renderAll();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canvas, undo, redo, deleteSelected, duplicateSelected]);
};
