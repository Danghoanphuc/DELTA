// editor/components/EditorCanvas.tsx
// ✅ PHIÊN BẢN NÂNG CẤP "ZERO-COST":
// Tích hợp useCanvasTexture và textureCapture, loại bỏ hoàn toàn base64
// và thay thế logic của useFabricEvents.

import React, {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import * as fabric from "fabric";
import * as THREE from "three";
import debounce from "lodash.debounce";

// Hooks tối ưu (Các file anh đã có)
import { useCanvasTexture } from "../hooks/useCanvasTexture";
import { captureTextureFromCanvas } from "../core/textureCapture";

// Hooks tùy chỉnh (Các file anh đã có)
import { useFabricDieline } from "../hooks/useFabricDieline";
import { useFabricPanning } from "../hooks/useFabricPanning";
import { useFabricApi } from "../hooks/useFabricApi";

// Hooks cũ (Các file anh đã có)
import { useFabricHistory } from "../hooks/useFabricHistory";
import { useFabricKeyboardShortcuts } from "../hooks/useFabricKeyboardShortcuts";
import { useFabricZoom } from "../hooks/useFabricZoom";

// Components con (Các file anh đã có)
import { ContextMenu, useFabricContextMenu } from "./ContextMenu";
import { CanvasControls } from "./CanvasControls";

// ==================== TYPES ====================
interface EditorCanvasProps {
  materialKey: string;
  dielineSvgUrl: string;
  // ✅ THAY ĐỔI LỚN 1: Prop này truyền THREE.CanvasTexture
  onCanvasUpdate: (materialKey: string, texture: THREE.CanvasTexture) => void;
  onObjectChange?: () => void;
  isReadyToLoad?: boolean;
}

// Ref API (Giữ nguyên)
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

const TEXTURE_OUTPUT_SIZE = 2048;

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

    // --- 1. KHỞI TẠO CANVAS (Giữ nguyên) ---
    useEffect(() => {
      const container = containerRef.current;
      if (!canvasEl.current || !container) return;

      fabricCanvas.current = new fabric.Canvas(canvasEl.current, {
        width: container.clientWidth,
        height: container.clientHeight,
        backgroundColor: "#f0f0f0",
        preserveObjectStacking: true,
      });

      return () => {
        if (fabricCanvas.current) {
          fabricCanvas.current.dispose();
          fabricCanvas.current = null;
        }
      };
    }, []);

    // --- 2. GỌI CÁC HOOKS CẦN THIẾT (Hooks cũ) ---
    const { isPanning, setIsPanning } = useFabricPanning(fabricCanvas);
    const { zoom, setZoom } = useFabricZoom(fabricCanvas);
    const { saveState, undo, redo, canUndo, canRedo } = useFabricHistory(
      fabricCanvas,
      onObjectChange || (() => {})
    );
    const api = useFabricApi(fabricCanvas);
    const { isDielineLoaded, loadFailed, artboardRef, dielineRef } =
      useFabricDieline(fabricCanvas, containerRef, {
        dielineSvgUrl,
        isReadyToLoad,
        saveState,
      });

    // --- 3. ✅ "ZERO-COST" PIPELINE ---
    const { updateTexture: updateThreeTexture } = useCanvasTexture({
      materialKey,
      onTextureReady: (tex) => {
        tex.needsUpdate = true;
        onCanvasUpdate(materialKey, tex);
      },
    });

    const debouncedCanvasUpdate = useCallback(
      debounce(() => {
        const canvas = fabricCanvas.current;
        const artboard = artboardRef.current;
        const dieline = dielineRef.current;

        if (!canvas || !artboard || !updateThreeTexture) {
          return;
        }

        const capturedCanvas = captureTextureFromCanvas(
          canvas,
          artboard,
          dieline,
          {
            outputSize: TEXTURE_OUTPUT_SIZE,
            removeBackground: false,
          }
        );

        if (capturedCanvas) {
          updateThreeTexture(capturedCanvas);
        }
      }, 250),
      [artboardRef, dielineRef, updateThreeTexture, materialKey]
    );

    // --- 4. ✅ Tích hợp logic `useFabricEvents` ---
    useEffect(() => {
      const canvas = fabricCanvas.current;
      if (!canvas || !isDielineLoaded) {
        return;
      }

      const notifyParent = () => {
        if (onObjectChange) {
          onObjectChange();
        }
      };

      const handleChange = () => {
        saveState();
        debouncedCanvasUpdate();
        notifyParent();
      };

      canvas.on("object:modified", handleChange);
      canvas.on("text:changed", handleChange);
      canvas.on("object:added", handleChange);
      canvas.on("object:removed", handleChange);
      canvas.on("selection:created", notifyParent);
      canvas.on("selection:updated", notifyParent);
      canvas.on("selection:cleared", notifyParent);

      // Trigger một lần khi tải xong
      handleChange();

      return () => {
        if (canvas) {
          canvas.off();
        }
      };
    }, [
      isDielineLoaded,
      fabricCanvas,
      saveState,
      debouncedCanvasUpdate,
      onObjectChange,
    ]);

    // --- 5. HOOKS TƯƠNG TÁC (Giữ nguyên) ---
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

    const handleZoomIn = () => setZoom(zoom * 1.2);
    const handleZoomOut = () => setZoom(zoom / 1.2);

    // --- 6. EXPOSE API (Giữ nguyên) ---
    useImperativeHandle(ref, () => ({
      ...api,
      undo,
      redo,
      setZoom,
    }));

    // --- 7. RENDER (✅ SỬA LỖI LOGIC HIỂN THỊ) ---
    return (
      <div
        ref={containerRef}
        className="w-full h-full relative overflow-hidden bg-gray-200"
      >
        {/* ✅ SỬA LỖI LOGIC: Hiển thị đúng trạng thái loading */}
        {(loadFailed || !isDielineLoaded) && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10 p-4">
            {loadFailed ? (
              <p className="text-red-600 font-medium text-center">
                ❌ Tải khuôn 2D (SVG) thất bại.
              </p>
            ) : !isReadyToLoad ? (
              // Đây là logic đúng: isReadyToLoad (từ 3D) phải là TRUE
              // Nếu nó là FALSE, chúng ta hiển thị "Đang chờ phôi 3D"
              <p className="text-gray-500">Đang chờ phôi 3D tải xong...</p>
            ) : (
              // Nếu isReadyToLoad là TRUE, nhưng !isDielineLoaded
              // có nghĩa là chúng ta đang tải SVG
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
          canRedo={canRedo}
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
