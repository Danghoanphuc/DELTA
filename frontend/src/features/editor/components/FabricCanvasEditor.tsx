// src/features/editor/components/FabricCanvasEditor.tsx

import React, {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useState,
} from "react";
import { Canvas, Group, loadSVGFromURL } from "fabric";
import debounce from "lodash.debounce";

// Import các hooks và API
import { useFabricHistory } from "../hooks/useFabricHistory";
import { useFabricKeyboardShortcuts } from "../hooks/useFabricKeyboardShortcuts";
import { useFabricZoom } from "../hooks/useFabricZoom";
import * as fabricApi from "../hooks/core/fabricApi";

// ==================== TYPES (Giữ nguyên) ====================
interface FabricCanvasEditorProps {
  dielineUrl: string;
  onCanvasUpdate: (base64DataUrl: string) => void;
  width?: number;
  height?: number;
}
// ... (Export interface FabricCanvasEditorRef như cũ) ...
export interface FabricCanvasEditorRef {
  addText: (text: string) => void;
  addImage: (imageUrl: string) => void;
  addShape: (shape: "rect" | "circle" | "triangle" | "line") => void;
  applyFilter: (
    filter: "grayscale" | "sepia" | "blur" | "brightness" | "contrast"
  ) => void;
  align: (
    alignment: "left" | "center" | "right" | "top" | "middle" | "bottom"
  ) => void;
  updateTextStyle: (property: string, value: any) => void;
  getJSON: () => string;
  getCanvas: () => Canvas | null;
  undo: () => void;
  redo: () => void;
  exportCanvas: (format: "png" | "jpg" | "svg") => Promise<void>;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  setZoom: (zoom: number) => void;
}

// ==================== MAIN COMPONENT ====================
export const FabricCanvasEditor = forwardRef<
  FabricCanvasEditorRef,
  FabricCanvasEditorProps
>(({ dielineUrl, onCanvasUpdate, width = 600, height = 600 }, ref) => {
  const canvasEl = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvas = useRef<Canvas | null>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDielineLoaded, setIsDielineLoaded] = useState(false);

  // --- 1. Texture Generation (Logic riêng của component này) ---
  const generateTexture = useCallback(() => {
    // ... (Logic generateTexture như cũ) ...
  }, [onCanvasUpdate, width, height]);

  const debouncedCanvasUpdate = useRef(
    debounce(() => generateTexture(), 250)
  ).current;

  // --- 2. Gọi các Custom Hooks ---
  const { zoom, setZoom } = useFabricZoom(fabricCanvas);
  const { saveState, undo, redo } = useFabricHistory(
    fabricCanvas,
    debouncedCanvasUpdate
  );

  // Các hàm API helper cho hook phím tắt
  const deleteSelected = useCallback(() => {
    if (fabricCanvas.current) fabricApi.deleteSelected(fabricCanvas.current);
  }, []);
  const duplicateSelected = useCallback(() => {
    if (fabricCanvas.current) fabricApi.duplicateSelected(fabricCanvas.current);
  }, []);

  useFabricKeyboardShortcuts({
    canvas: fabricCanvas,
    undo,
    redo,
    deleteSelected,
    duplicateSelected,
  });

  // --- 3. Canvas Initialization ---
  useEffect(() => {
    if (canvasEl.current && !fabricCanvas.current) {
      const canvas = new Canvas(canvasEl.current, {
        width,
        height,
        backgroundColor: "#ffffff",
      });
      fabricCanvas.current = canvas;

      // Load Dieline
      loadSVGFromURL(
        dielineUrl,
        (objects, options) => {
          // ... (Logic load dieline như cũ) ...
          setIsDielineLoaded(true);
          setTimeout(() => {
            saveState(); // Lưu state ban đầu
            debouncedCanvasUpdate();
          }, 100);
        }
        // ... (Xử lý lỗi như cũ) ...
      );

      // Event listeners (đơn giản hóa)
      // Bất kỳ thay đổi nào cũng sẽ save state và update texture
      const handleChange = () => {
        saveState();
        debouncedCanvasUpdate();
      };

      canvas.on("object:modified", handleChange);
      canvas.on("text:changed", handleChange);
      canvas.on("object:added", handleChange);
      canvas.on("object:removed", handleChange);

      // Cleanup
      return () => {
        debouncedCanvasUpdate.cancel();
        canvas.dispose();
        fabricCanvas.current = null;
      };
    }
  }, [dielineUrl, debouncedCanvasUpdate, saveState, width, height]);

  // --- 4. IMPERATIVE METHODS (API) ---
  useImperativeHandle(ref, () => ({
    // Gọi các hàm từ fabricApi
    addText: (text: string) =>
      fabricCanvas.current && fabricApi.addText(fabricCanvas.current, text),
    addImage: (imageUrl: string) =>
      fabricCanvas.current &&
      fabricApi.addImage(fabricCanvas.current, imageUrl),
    addShape: (shapeType) =>
      fabricCanvas.current &&
      fabricApi.addShape(fabricCanvas.current, shapeType),
    applyFilter: (filterType) =>
      fabricCanvas.current &&
      fabricApi.applyFilter(fabricCanvas.current, filterType),
    align: (alignment) =>
      fabricCanvas.current && fabricApi.align(fabricCanvas.current, alignment),
    updateTextStyle: (property, value) =>
      fabricCanvas.current &&
      fabricApi.updateTextStyle(fabricCanvas.current, property, value),
    exportCanvas: (format) =>
      fabricCanvas.current
        ? fabricApi.exportCanvas(fabricCanvas.current, format)
        : Promise.resolve(),
    deleteSelected,
    duplicateSelected,

    // Gọi các hàm từ hooks
    undo,
    redo,
    setZoom,

    // Các hàm nội tại
    getJSON: (): string => {
      if (!fabricCanvas.current) return "{}";
      return JSON.stringify(fabricCanvas.current.toJSON());
    },
    getCanvas: (): Canvas | null => {
      return fabricCanvas.current;
    },
  }));

  // --- 5. RENDER ---
  return (
    <div className="w-full h-full relative">
      {!isDielineLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-10">
          <p className="text-gray-500">Đang tải khuôn 2D...</p>
        </div>
      )}
      <canvas ref={canvasEl} className="shadow-lg" />

      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 bg-white px-3 py-1 rounded shadow text-sm">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );
});

FabricCanvasEditor.displayName = "FabricCanvasEditor";
