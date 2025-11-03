// src/features/editor/components/DesignSurfaceEditor.tsx
// ✅ ĐÃ SỬA: Dùng canvg để tải SVG thay vì fabric.loadSVGFromURL

import React, {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useState,
} from "react";
import * as fabric from "fabric";
import debounce from "lodash.debounce";
import { toast } from "sonner";
import { useFabricHistory } from "../hooks/useFabricHistory";
import { useFabricKeyboardShortcuts } from "../hooks/useFabricKeyboardShortcuts";
import { useFabricZoom } from "../hooks/useFabricZoom";
import * as fabricApi from "../core/fabricApi";

// ==================== TYPES ====================
interface DesignSurfaceEditorProps {
  materialKey: string;
  dielineSvgUrl: string;
  onCanvasUpdate: (materialKey: string, base64DataUrl: string) => void;
  onObjectChange?: () => void;
  width?: number;
  height?: number;
  isReadyToLoad?: boolean;
}

export interface FabricCanvasEditorRef {
  addText: (text: string) => void;
  addImage: (imageUrl: string) => void;
  addShape: (shape: "rect" | "circle" | "triangle" | "line") => void;
  getJSON: () => string;
  getCanvas: () => fabric.Canvas | null;
  undo: () => void;
  redo: () => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  setZoom: (zoom: number) => void;
}

// ==================== MAIN COMPONENT ====================
export const DesignSurfaceEditor = forwardRef<
  FabricCanvasEditorRef,
  DesignSurfaceEditorProps
>(
  (
    {
      materialKey,
      dielineSvgUrl,
      onCanvasUpdate,
      onObjectChange,
      width = 600,
      height = 600,
      isReadyToLoad = false,
    },
    ref
  ) => {
    const canvasEl = useRef<HTMLCanvasElement | null>(null);
    const fabricCanvas = useRef<fabric.Canvas | null>(null);
    const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

    const [isDielineLoaded, setIsDielineLoaded] = useState(false);
    const [loadFailed, setLoadFailed] = useState(false);

    // --- 1. Texture Generation ---
    const generateTexture = useCallback(() => {
      if (!fabricCanvas.current) return;
      const canvas = fabricCanvas.current;
      if (!canvas || !dielineSvgUrl || !isReadyToLoad) {
        return;
      }
      const backgroundImage = canvas.backgroundImage;
      canvas.backgroundImage = undefined;
      canvas.renderAll();

      const dataURL = canvas.toDataURL({
        format: "png",
        quality: 1,
        multiplier: 2,
      });

      onCanvasUpdate(materialKey, dataURL);
      canvas.backgroundImage = backgroundImage;
      canvas.renderAll();
    }, [onCanvasUpdate, materialKey, dielineSvgUrl, isReadyToLoad]);

    const debouncedCanvasUpdate = useRef(
      debounce(() => generateTexture(), 500)
    ).current;

    // --- 2. Gọi các Custom Hooks ---
    const { zoom, setZoom } = useFabricZoom(fabricCanvas);
    const { saveState, undo, redo } = useFabricHistory(
      fabricCanvas,
      debouncedCanvasUpdate
    );
    const deleteSelected = useCallback(() => {
      if (fabricCanvas.current) fabricApi.deleteSelected(fabricCanvas.current);
    }, []);
    const duplicateSelected = useCallback(() => {
      if (fabricCanvas.current)
        fabricApi.duplicateSelected(fabricCanvas.current);
    }, []);
    useFabricKeyboardShortcuts({
      canvas: fabricCanvas,
      undo,
      redo,
      deleteSelected,
      duplicateSelected,
    });

    // --- 3. LOGIC KHỞI TẠO VÀ TẢI DIELINE ---

    // useEffect 1: Khởi tạo Canvas
    useEffect(() => {
      if (canvasEl.current && !fabricCanvas.current) {
        fabricCanvas.current = new fabric.Canvas(canvasEl.current, {
          width,
          height,
          backgroundColor: "#ffffff",
          preserveObjectStacking: true,
        });
      }
      const canvasInstance = fabricCanvas.current;
      return () => {
        if (canvasInstance) {
          canvasInstance.dispose();
          fabricCanvas.current = null;
        }
      };
    }, [width, height]);

    // useEffect 2: ✅ SỬA ĐỔI - Tải Dieline bằng canvg
    useEffect(() => {
      const canvas = fabricCanvas.current;
      if (!canvas || !dielineSvgUrl) return;

      if (!isReadyToLoad) {
        console.log(
          `[Editor] Waiting for 3D model to load before loading dieline...`
        );
        setIsDielineLoaded(false);
        setLoadFailed(false);
        return;
      }

      // ✅ SỬA: Dùng async function để load SVG bằng canvg
      const loadDielineWithCanvg = async () => {
        setIsDielineLoaded(false);
        setLoadFailed(false);

        canvas.clear();
        canvas.backgroundImage = undefined;
        canvas.set("backgroundColor", "#ffffff");
        canvas.renderAll();

        console.log(
          `[Editor] Loading Dieline SVG with canvg: ${dielineSvgUrl}`
        );

        try {
          // Tạo offscreen canvas để render SVG
          const offscreenCanvas = document.createElement("canvas");
          offscreenCanvas.width = width;
          offscreenCanvas.height = height;
          const ctx = offscreenCanvas.getContext("2d");

          if (!ctx) {
            throw new Error("Không thể tạo 2D context");
          }

          // Dùng canvg để render SVG → Canvas
          const { Canvg } = await import("canvg");
          const v = await Canvg.from(ctx, dielineSvgUrl);
          await v.render();

          // Convert canvas → PNG data URL
          const pngDataUrl = offscreenCanvas.toDataURL("image/png");

          // Load PNG vào Fabric.js
          const fabricImg = await fabric.Image.fromURL(pngDataUrl, {
            crossOrigin: "anonymous",
          });

          // Kiểm tra canvas còn tồn tại
          const currentCanvas = fabricCanvas.current;
          if (!currentCanvas) return;

          // Scale và center
          fabricImg.scaleToWidth(currentCanvas.width || width);
          currentCanvas.centerObject(fabricImg);
          fabricImg.set({
            selectable: false,
            evented: false,
            opacity: 0.5, // Dieline hiện mờ để thấy design phía trên
          });

          // Set làm background
          currentCanvas.backgroundImage = fabricImg;
          currentCanvas.renderAll();

          setIsDielineLoaded(true);
          toast.success("✅ Đã tải khuôn 2D (SVG) thành công.");
          console.log(`[Editor] Dieline ${materialKey} loaded successfully.`);
          saveState();
        } catch (error) {
          console.error(
            "[Editor] Lỗi nghiêm trọng khi tải SVG bằng canvg:",
            error
          );
          toast.error("Tải file SVG thất bại. Vui lòng kiểm tra file.");
          setLoadFailed(true);
        }
      };

      loadDielineWithCanvg();
    }, [dielineSvgUrl, materialKey, width, height, saveState, isReadyToLoad]);

    // useEffect 3: Gán Event Listeners
    useEffect(() => {
      const canvas = fabricCanvas.current;
      if (!canvas || !saveState || !debouncedCanvasUpdate || !isDielineLoaded) {
        return;
      }
      onObjectChange?.();
      const handleChange = () => {
        saveState();
        debouncedCanvasUpdate();
        onObjectChange?.();
      };
      const handleSelection = () => {
        onObjectChange?.();
      };
      canvas.on("object:modified", handleChange);
      canvas.on("text:changed", handleChange);
      canvas.on("object:added", handleChange);
      canvas.on("object:removed", handleChange);
      canvas.on("selection:created", handleSelection);
      canvas.on("selection:updated", handleSelection);
      canvas.on("selection:cleared", handleSelection);
      return () => {
        if (canvas) {
          canvas.off("object:modified", handleChange);
          canvas.off("text:changed", handleChange);
          canvas.off("object:added", handleChange);
          canvas.off("object:removed", handleChange);
          canvas.off("selection:created", handleSelection);
          canvas.off("selection:updated", handleSelection);
          canvas.off("selection:cleared", handleSelection);
        }
      };
    }, [saveState, debouncedCanvasUpdate, isDielineLoaded, onObjectChange]);

    // --- 4. IMPERATIVE METHODS (API) ---
    useImperativeHandle(ref, () => ({
      addText: (text: string) =>
        fabricCanvas.current && fabricApi.addText(fabricCanvas.current, text),
      addImage: (imageUrl: string) =>
        fabricCanvas.current &&
        fabricApi.addImage(fabricCanvas.current, imageUrl),
      addShape: (shapeType) =>
        fabricCanvas.current &&
        fabricApi.addShape(fabricCanvas.current, shapeType),
      getJSON: (): string => {
        if (!fabricCanvas.current) return "{}";
        return JSON.stringify(fabricCanvas.current.toJSON());
      },
      getCanvas: (): fabric.Canvas | null => fabricCanvas.current,
      undo,
      redo,
      deleteSelected,
      duplicateSelected,
      setZoom,
    }));

    // --- 5. RENDER ---
    return (
      <div className="w-full h-full relative">
        {(loadFailed || !isDielineLoaded) && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10 p-4">
            {loadFailed ? (
              <p className="text-red-600 font-medium text-center">
                ❌ Tải khuôn 2D (SVG) thất bại.
                <br />
                Vui lòng kiểm tra file SVG và Console.
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

        <canvas ref={canvasEl} className="shadow-lg" />

        <div className="absolute bottom-4 right-4 bg-white px-3 py-1 rounded shadow text-sm">
          {Math.round(zoom * 100)}%
        </div>
      </div>
    );
  }
);

DesignSurfaceEditor.displayName = "DesignSurfaceEditor";
