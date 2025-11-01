// src/features/editor/hooks/useFabricKeyboardShortcuts.ts
import { useEffect, useRef } from "react";
import { Canvas, ActiveSelection } from "fabric";

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
  const clipboardRef = useRef<any>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!canvas.current) return;

      // Bỏ qua nếu đang gõ trong input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
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
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }

      // Copy (Ctrl+C)
      if (modKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        const activeObject = canvas.current.getActiveObject();
        if (activeObject) {
          clipboardRef.current = activeObject.toObject();
        }
      }

      // Paste (Ctrl+V)
      if (modKey && e.key.toLowerCase() === "v") {
        e.preventDefault();
        if (clipboardRef.current && canvas.current) {
          // Tải đối tượng từ clipboard
          fabric.util.enlivenObjects([clipboardRef.current], (objects: any) => {
            if (!canvas.current || !objects[0]) return;
            const cloned = objects[0];
            cloned.set({
              left: (cloned.left || 0) + 10,
              top: (cloned.top || 0) + 10,
              evented: true,
            });
            canvas.current.add(cloned);
            canvas.current.setActiveObject(cloned);
            canvas.current.requestRenderAll();
          });
        }
      }

      // Duplicate (Ctrl+D)
      if (modKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateSelected();
      }

      // Select All (Ctrl+A)
      if (modKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        canvas.current.discardActiveObject();
        const sel = new ActiveSelection(canvas.current.getObjects(), {
          canvas: canvas.current,
        });
        canvas.current.setActiveObject(sel);
        canvas.current.requestRenderAll();
      }

      // Movement (Arrow Keys)
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        const activeObject = canvas.current.getActiveObject();
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
        canvas.current.renderAll();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canvas, undo, redo, deleteSelected, duplicateSelected]);
};
