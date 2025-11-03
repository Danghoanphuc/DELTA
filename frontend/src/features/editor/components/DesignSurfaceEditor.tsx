// src/features/editor/components/DesignSurfaceEditor.tsx
// ✅ FINAL FIX: CHUYỂN SANG PNG VÀ MULTIPLIER 2X ĐỂ TỐI ĐA CHẤT LƯỢNG TEXTURE 2D (LOSSLESS)

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
  /** Key định danh cho bề mặt này, vd: 'Material_Lid' */
  materialKey: string;

  /** URL đến file Dieline (khuôn) 2D, BẮT BUỘC phải là SVG. */
  dielineSvgUrl: string;

  /** (Tùy chọn) URL đến file PNG/JPG của dieline để làm overlay mờ. */
  dielineOverlayUrl?: string;

  /** Callback khi canvas thay đổi, trả về texture base64 */
  onCanvasUpdate: (materialKey: string, base64DataUrl: string) => void;

  /** Callback khi các đối tượng (layers) thay đổi */
  onObjectChange?: () => void;
  width?: number;
  height?: number;
  isReadyToLoad?: boolean;
}

export interface FabricCanvasEditorRef {
  addText: (text: string) => void;
  addImage: (imageUrl: string) => void;
  addShape: (shape: "rect" | "circle" | "triangle" | "line") => void;
  // ... (tất cả các hàm khác giữ nguyên)
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
      dielineOverlayUrl, // (Prop mới)
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

    // --- 1. Texture Generation (Đã cập nhật) ---
    const generateTexture = useCallback(() => {
      if (!fabricCanvas.current) return;
      const canvas = fabricCanvas.current;
      if (!canvas || !dielineSvgUrl || !isReadyToLoad) {
        return; // Chờ cho đến khi 3D báo "sẵn sàng"
      }
      const overlay = canvas.overlayImage;

      canvas.overlayImage = undefined;
      canvas.renderAll(); // Render không có overlay

      // ✅ CHỈNH SỬA TẠI ĐÂY: Dùng PNG (lossless) và multiplier 2x
      const dataURL = canvas.toDataURL({
        format: "png", // <-- THAY ĐỔI ĐỂ SỬ DỤNG LOSSLESS
        quality: 1, // <-- MAX QUALITY
        multiplier: 2, // <-- TĂNG ĐỘ PHÂN GIẢI
      });

      onCanvasUpdate(materialKey, dataURL);

      canvas.overlayImage = overlay;
      canvas.renderAll(); // Trả lại overlay
    }, [onCanvasUpdate, materialKey]);

    const debouncedCanvasUpdate = useRef(
      debounce(() => generateTexture(), 500) // <-- TĂNG DEBOUNCE ĐỂ BÙ ĐẮP FILE LỚN
    ).current;

    // --- 2. Gọi các Custom Hooks (Giữ nguyên) ---
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

    // --- 3. LOGIC KHỞI TẠO VÀ TẢI DIELINE (Giữ nguyên) ---

    // useEffect 1: Khởi tạo Canvas (Chỉ chạy 1 LẦN)
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

    // useEffect 2: Tải Dieline (Giữ nguyên)
    useEffect(() => {
      const canvas = fabricCanvas.current;
      if (!canvas || !dielineSvgUrl) return;

      if (!isReadyToLoad) {
        console.log(
          `[Editor] Waiting for 3D model to load before loading dieline...`
        );
        return;
      }

      setIsDielineLoaded(false);
      setLoadFailed(false);

      // Reset canvas
      canvas.clear();
      canvas.setClipPath(undefined);

      canvas.overlayImage = undefined;
      canvas.renderAll();

      console.log(`[Editor] Loading Dieline SVG: ${dielineSvgUrl}`);

      fabric.loadSVGFromURL(
        dielineSvgUrl,
        (objects, options) => {
          if (!canvas) return;

          const dielineGroup = fabric.util.groupSVGElements(
            objects,
            options
          ) as fabric.Group;

          // Căn giữa và scale dieline cho vừa canvas
          dielineGroup.scaleToWidth(canvas.width || width);
          dielineGroup.center();

          // 1. Dùng Dieline làm MẶT NẠ CẮT (CLIPPATH)
          canvas.setClipPath(dielineGroup);

          // 2. Dùng Dieline làm OVERLAY (HIỂN THỊ)
          dielineGroup.clone((overlay: fabric.Group) => {
            overlay.set({
              opacity: 0.3, // Làm mờ
              selectable: false,
              evented: false,
            });
            canvas.overlayImage = overlay;
            canvas.renderAll();
          });

          canvas.renderAll();
          setIsDielineLoaded(true);
          console.log(
            `[Editor] Dieline ${materialKey} loaded and set as clipPath.`
          );
          saveState();
        },
        undefined,
        { crossOrigin: "anonymous" }
      );
    }, [dielineSvgUrl, materialKey, width, height, saveState, isReadyToLoad]);

    // useEffect 3: Gán Event Listeners (Giữ nguyên)
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
          // ... (off tất cả events)
        }
      };
    }, [saveState, debouncedCanvasUpdate, isDielineLoaded, onObjectChange]);

    // --- 4. IMPERATIVE METHODS (API) (Giữ nguyên) ---
    useImperativeHandle(ref, () => ({
      // ... (toàn bộ hàm: addText, addImage, ... giữ nguyên)
      addText: (text: string) =>
        fabricCanvas.current && fabricApi.addText(fabricCanvas.current, text),
      addImage: (imageUrl: string) =>
        fabricCanvas.current &&
        fabricApi.addImage(fabricCanvas.current, imageUrl),
      addShape: (shapeType) =>
        fabricCanvas.current &&
        fabricApi.addShape(fabricCanvas.current, shapeType),
      // ...
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

    // --- 5. RENDER (Giữ nguyên) ---
    return (
      <div className="w-full h-full relative">
        {!isDielineLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-10">
            <p className="text-gray-500">
              {!isReadyToLoad
                ? "Đang chờ phôi 3D tải xong..."
                : "Đang tải khuôn 2D (SVG)..."}
            </p>
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
