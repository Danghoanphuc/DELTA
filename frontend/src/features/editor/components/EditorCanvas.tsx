// editor/components/EditorCanvas.tsx
// ✅ PHIÊN BẢN ĐÃ REFACTOR: Chỉ làm nhiệm vụ "lắp ráp" logic Artboard
// ✅ SỬA LỖI: Cập nhật interface 'onCanvasUpdate' để nhận HTMLCanvasElement

import React, {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import * as fabric from "fabric";

// Hooks tùy chỉnh mới (Bạn cần có các file này)
import { useFabricDieline } from "../hooks/useFabricDieline";
import { useFabricPanning } from "../hooks/useFabricPanning";
import { useFabricApi } from "../hooks/useFabricApi";
import { useFabricEvents } from "../hooks/useFabricEvents";

// Hooks cũ (Bạn đã có)
import { useFabricHistory } from "../hooks/useFabricHistory";
import { useFabricKeyboardShortcuts } from "../hooks/useFabricKeyboardShortcuts";
import { useFabricZoom } from "../hooks/useFabricZoom";

// Components con (Bạn đã có)
import { ContextMenu, useFabricContextMenu } from "./ContextMenu";
import { CanvasControls } from "./CanvasControls";

// ==================== TYPES ====================
interface EditorCanvasProps {
  materialKey: string;
  dielineSvgUrl: string;
  // ✅ SỬA LỖI TẠI ĐÂY:
  // Đổi 'base64DataUrl: string' thành 'canvasElement: HTMLCanvasElement'
  onCanvasUpdate: (
    materialKey: string,
    canvasElement: HTMLCanvasElement
  ) => void;
  onObjectChange?: () => void;
  isReadyToLoad?: boolean;
}

// ✅ Ref API đầy đủ
export interface EditorCanvasRef {
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
  getCanvas: () => fabric.Canvas | null;
  undo: () => void;
  redo: () => void;
  exportCanvas: (format: "png" | "jpg" | "svg") => Promise<void>;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  setZoom: (zoom: number) => void;
  copySelected?: () => void;
  bringToFront: () => void;
  bringForward: () => void;
  sendToBack: () => void;
  sendBackwards: () => void;
  toggleLock: () => void;
  toggleVisibility: () => void;
}

// ==================== MAIN COMPONENT ====================
export const EditorCanvas = forwardRef<EditorCanvasRef, EditorCanvasProps>(
  (
    {
      materialKey,
      dielineSvgUrl,
      onCanvasUpdate,
      onObjectChange,
      isReadyToLoad = false,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const canvasEl = useRef<HTMLCanvasElement | null>(null);
    const fabricCanvas = useRef<fabric.Canvas | null>(null);

    // --- 1. KHỞI TẠO CANVAS (Chỉ logic này giữ lại) ---
    useEffect(() => {
      const container = containerRef.current;
      if (!canvasEl.current || !container) return;

      // Khởi tạo canvas full-screen
      fabricCanvas.current = new fabric.Canvas(canvasEl.current, {
        width: container.clientWidth,
        height: container.clientHeight,
        backgroundColor: "#f0f0f0", // Nền xám để thấy Artboard
        preserveObjectStacking: true,
      });

      return () => {
        if (fabricCanvas.current) {
          fabricCanvas.current.dispose();
          fabricCanvas.current = null;
        }
      };
    }, []); // Chạy 1 lần duy nhất

    // --- 2. GỌI TẤT CẢ CÁC HOOKS ---

    // Hooks quản lý State (Zoom, Pan, History)
    const { isPanning, setIsPanning } = useFabricPanning(fabricCanvas);
    const { zoom, setZoom } = useFabricZoom(fabricCanvas);
    const { saveState, undo, redo, canUndo, canRedo } = useFabricHistory(
      fabricCanvas,
      () => {} // Callback trống, vì useFabricEvents sẽ xử lý
    );

    // Hook quản lý API
    const api = useFabricApi(fabricCanvas);

    // Hook quản lý Dieline (Quan trọng: Artboard logic)
    const { isDielineLoaded, loadFailed, artboardRef, dielineRef } =
      useFabricDieline(fabricCanvas, containerRef, {
        dielineSvgUrl,
        isReadyToLoad,
        saveState,
      });

    // Hook quản lý Events (Quan trọng: Artboard logic)
    // Giờ 'onCanvasUpdate' đã có kiểu dữ liệu đúng
    useFabricEvents(fabricCanvas, isDielineLoaded, materialKey, {
      onCanvasUpdate,
      onObjectChange,
      saveState,
      artboardRef,
      dielineRef,
    });

    // Hooks tương tác (Phím tắt, Chuột phải)
    useFabricKeyboardShortcuts({
      canvas: fabricCanvas,
      undo,
      redo,
      deleteSelected: api.deleteSelected,
      duplicateSelected: api.duplicateSelected,
    });

    const { contextMenu, menuItems, closeContextMenu } = useFabricContextMenu(
      fabricCanvas,
      {
        current: { ...api, getCanvas: api.getCanvas },
      } as any
    );

    // Handlers cho Controls
    const handleZoomIn = () => setZoom(zoom * 1.2);
    const handleZoomOut = () => setZoom(zoom / 1.2);

    // --- 3. EXPOSE API RA BÊN NGOÀI (Giữ nguyên) ---
    useImperativeHandle(ref, () => ({
      ...api, // Phơi bày tất cả các hàm từ useFabricApi
      undo,
      redo,
      setZoom,
    }));

    // --- 4. RENDER ---
    return (
      <div
        ref={containerRef}
        className="w-full h-full relative overflow-hidden bg-gray-200" // Nền viewport
      >
        {/* Loading/Error overlay */}
        {(loadFailed || !isDielineLoaded) && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10 p-4">
            {loadFailed ? (
              <p className="text-red-600 font-medium text-center">
                ❌ Tải khuôn 2D (SVG) thất bại.
              </p>
            ) : !isReadyToLoad ? (
              <p className="text-gray-500">Đang chờ phôi 3D tải xong...</p>
            ) : (
              <div className="text-center space-y-2">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
                <p className="text-gray-500">Đang tải khuôn 2D (SVG)...</p>
              </div>
            )}
          </div>
        )}

        {/* Canvas element */}
        <canvas ref={canvasEl} />

        {/* Context Menu (nổi) */}
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          isOpen={contextMenu.show}
          onClose={closeContextMenu}
          items={menuItems}
        />

        {/* Thanh công cụ (nổi) */}
        <CanvasControls
          isPanning={isPanning}
          setIsPanning={setIsPanning}
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedf={canRedo}
        />

        {/* Hint cho người dùng (nổi) */}
        <div className="absolute bottom-4 left-4 bg-white px-3 py-1 rounded shadow text-xs text-gray-500">
          <kbd className="px-1 bg-gray-100 border rounded">Space</kbd> + Kéo
          <br />
          <kbd className="px-1 bg-gray-100 border rounded">Chuột phải</kbd>
        </div>
      </div>
    );
  }
);

EditorCanvas.displayName = "EditorCanvas";
