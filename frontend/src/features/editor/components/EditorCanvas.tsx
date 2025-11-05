import * as fabric from "fabric";
// frontend/src/features/editor/components/EditorCanvas.tsx
// ✅ PHIÊN BẢN HOÀN CHỈNH: Pipeline "Zero-Cost"

import React, {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useMemo,
} from "react";
import * as THREE from "three";
import debounce from "lodash.debounce";

import { useCanvasTexture } from "../hooks/useCanvasTexture";
import { captureTextureFromCanvas } from "../core/textureCapture";
import { useFabricDieline } from "../hooks/useFabricDieline";
import { useFabricPanning } from "../hooks/useFabricPanning";
import { useFabricJSApi } from "../hooks/useFabricJSApi";
import { useFabricHistory } from "../hooks/useFabricHistory";
import { useFabricKeyboardShortcuts } from "../hooks/useFabricKeyboardShortcuts";
import { useFabricZoom } from "../hooks/useFabricZoom";
import { ContextMenu, useFabricContextMenu } from "./ContextMenu";
import { CanvasControls } from "./CanvasControls";

const TEXTURE_OUTPUT_SIZE = 2048;

interface EditorCanvasProps {
  materialKey: string;
  dielineSvgUrl: string;
  onCanvasUpdate: (materialKey: string, texture: THREE.CanvasTexture) => void;
  onObjectChange?: () => void;
  isReadyToLoad?: boolean;
}

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

    // === 1. KHỞI TẠO CANVAS ===
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

    // === 2. HOOKS CƠ BẢN ===
    const { isPanning, setIsPanning } = useFabricPanning(fabricCanvas);
    const { zoom, setZoom } = useFabricZoom(fabricCanvas);
    const { saveState, undo, redo, canUndo, canRedo } = useFabricHistory(
      fabricCanvas,
      onObjectChange || (() => {})
    );
    const api = useFabricJSApi(fabricCanvas);
    const { isDielineLoaded, loadFailed, artboardRef, dielineRef } =
      useFabricDieline(fabricCanvas, containerRef, {
        dielineSvgUrl,
        saveState,
      });

    // === 3. ✅ PIPELINE "ZERO-COST" ===
    const onTextureReady = useCallback(
      (tex: THREE.CanvasTexture) => {
        tex.needsUpdate = true;
        onCanvasUpdate(materialKey, tex);
      },
      [onCanvasUpdate, materialKey]
    );

    const { updateTexture: updateThreeTexture } = useCanvasTexture({
      materialKey,
      onTextureReady,
    });

    const debouncedCanvasUpdate = useMemo(
      () =>
        debounce(() => {
          const canvas = fabricCanvas.current;
          const artboard = artboardRef.current;
          const dieline = dielineRef.current;

          if (!canvas || !artboard || !updateThreeTexture) return;

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

    // === 4. ✅ TÍCH HỢP EVENTS ===
    useEffect(() => {
      const canvas = fabricCanvas.current;
      if (!canvas || !isDielineLoaded) return;
      console.log(
        `🔗 [EditorCanvas] Binding events for material: ${materialKey}`
      );

      const notifyParent = () => {
        if (onObjectChange) onObjectChange();
      };

      const handleChange = () => {
        console.log(`🎨 [EditorCanvas] Canvas modified, triggering updates...`);
        saveState();
        debouncedCanvasUpdate(); // ✅ Đã debounced - safe
        notifyParent();
      };

      canvas.on("object:modified", handleChange);
      canvas.on("text:changed", handleChange);
      canvas.on("object:added", handleChange);
      canvas.on("object:removed", handleChange);
      canvas.on("selection:created", notifyParent);
      canvas.on("selection:updated", notifyParent);
      canvas.on("selection:cleared", notifyParent);

      // handleChange(); // Trigger lần đầu - Removed to prevent infinite loop

      return () => {
        if (canvas) {
          canvas.off("object:modified", handleChange);
          canvas.off("text:changed", handleChange);
          canvas.off("object:added", handleChange);
          canvas.off("object:removed", handleChange);
          canvas.off("selection:created", notifyParent);
          canvas.off("selection:updated", notifyParent);
          canvas.off("selection:cleared", notifyParent);
        }
        // ✅ Cancel pending debounced calls
        debouncedCanvasUpdate.cancel();
      };
    }, [
      isDielineLoaded,
      materialKey, // ✅ Chỉ re-bind khi material thay đổi
      saveState,
      debouncedCanvasUpdate,
      onObjectChange,
    ]);

    // === 5. KEYBOARD & CONTEXT MENU ===
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

    // === 6. EXPOSE API ===
    useImperativeHandle(ref, () => ({ ...api, undo, redo, setZoom }));

    // === 7. RENDER ===
    return (
      <div
        ref={containerRef}
        className="w-full h-full relative overflow-hidden bg-gray-200"
      >
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

        <canvas ref={canvasEl} />

        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          isOpen={contextMenu.show}
          onClose={closeContextMenu}
          items={menuItems}
        />

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

        <div className="absolute bottom-4 left-4 bg-white px-3 py-1 rounded shadow text-xs text-gray-500">
          <kbd className="px-1 bg-gray-100 border rounded">Space</kbd> + Kéo
        </div>
      </div>
    );
  }
);

EditorCanvas.displayName = "EditorCanvas";
