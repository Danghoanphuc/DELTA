// src/features/editor/components/DesignSurfaceEditor.tsx
// ✅ GIẢI QUYẾT DỨT ĐIỂM (V7):
// Sửa lỗi đánh máy 'useImperdativeHandle' -> 'useImperativeHandle'

import React, {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle, // <--- ĐÃ SỬA LỖI ĐÁNH MÁY
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

    // --- 1. Texture Generation (Giữ nguyên) ---
    const generateTexture = useCallback(() => {
      if (!fabricCanvas.current) return;
      const canvas = fabricCanvas.current;
      if (!canvas || !dielineSvgUrl || !isReadyToLoad) {
        return;
      }
      const overlay = canvas.overlayImage;
      canvas.overlayImage = undefined;
      canvas.renderAll();

      const dataURL = canvas.toDataURL({
        format: "png",
        quality: 1,
        multiplier: 2,
      });

      onCanvasUpdate(materialKey, dataURL);
      canvas.overlayImage = overlay;
      canvas.renderAll();
    }, [onCanvasUpdate, materialKey, dielineSvgUrl, isReadyToLoad]);

    const debouncedCanvasUpdate = useRef(
      debounce(() => generateTexture(), 500)
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

    // --- 3. LOGIC KHỞI TẠO VÀ TẢI DIELINE ---

    // useEffect 1: Khởi tạo Canvas (Giữ nguyên)
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

    // useEffect 2: Tải Dieline (Logic V5 - Đã sửa lỗi async)
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

      setIsDielineLoaded(false);
      setLoadFailed(false);

      canvas.clear();
      canvas.clipPath = undefined;
      canvas.overlayImage = undefined;
      canvas.set("backgroundColor", "#ffffff");
      canvas.renderAll();

      console.log(`[Editor] Loading Dieline SVG: ${dielineSvgUrl}`);

      fabric.loadSVGFromURL(
        dielineSvgUrl,
        (objects, options) => {
          if (!canvas) return;

          if (!objects || objects.length === 0) {
            console.error("[Editor] Lỗi: SVG rỗng hoặc không thể phân tích.");
            toast.error("File SVG rỗng hoặc không thể phân tích.");
            setLoadFailed(true);
            return;
          }

          // 1. TẠO OVERLAY (Tất cả đối tượng)
          const overlayGroup = fabric.util.groupSVGElements(objects, options);

          // 2. TÌM CLIPPATH (Chỉ vùng trắng)
          const clipPathSource = objects.find(
            (obj) =>
              obj.type === "path" &&
              obj.fill &&
              (obj.fill.toLowerCase() === "white" ||
                obj.fill.toLowerCase() === "#ffffff")
          );

          if (!clipPathSource) {
            console.error(
              "[Editor] Lỗi: SVG không có <path fill='white'> để làm clipPath."
            );
            toast.error(
              "Lỗi SVG: Không tìm thấy vùng thiết kế (path fill='white')."
            );
            setLoadFailed(true);
            return;
          }

          // 3. CLONE (Bất đồng bộ)
          clipPathSource.clone((clonedClipPath: fabric.Object) => {
            // 4. Căn chỉnh (BÊN TRONG CALLBACK)
            clonedClipPath.scaleToWidth(canvas.width || width);
            clonedClipPath.center();

            overlayGroup.scaleToWidth(canvas.width || width);
            overlayGroup.center();
            overlayGroup.set({
              opacity: 0.3,
              selectable: false,
              evented: false,
            });

            // 5. Gán (BÊN TRONG CALLBACK)
            canvas.clipPath = clonedClipPath;
            canvas.overlayImage = overlayGroup;
            canvas.renderAll();

            // 6. HOÀN TẤT (BÊN TRONG CALLBACK)
            setIsDielineLoaded(true);
            console.log(
              `[Editor] Dieline ${materialKey} loaded and set as clipPath.`
            );
            saveState();
          });
        },
        null, // reviver
        {
          crossOrigin: "anonymous",
          onError: (error) => {
            console.error(
              `[Editor] Lỗi nghiêm trọng khi tải SVG (Network/CORS/Parse):`,
              error
            );
            toast.error("Tải file SVG thất bại (Network/CORS).");
            setLoadFailed(true);
          },
        }
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
          canvas.off("text:changed", handleChange);
          canvas.off("object:added", handleChange);
          canvas.off("object:removed", handleChange);
          canvas.off("selection:created", handleSelection);
          canvas.off("selection:updated", handleSelection);
          canvas.off("selection:cleared", handleSelection);
        }
      };
    }, [saveState, debouncedCanvasUpdate, isDielineLoaded, onObjectChange]);

    // --- 4. IMPERATIVE METHODS (API) (Giữ nguyên) ---
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

    // --- 5. RENDER (ĐÃ SỬA LỖI ĐÁNH MÁY 'className_name') ---
    return (
      <div className="w-full h-full relative">
        {(loadFailed || !isDielineLoaded) && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10 p-4">
            {loadFailed ? (
              <p className="text-red-600 font-medium text-center">
                Tải khuôn 2D (SVG) thất bại.
                <br />
                Vui lòng kiểm tra file SVG và Console.
              </p>
            ) : !isReadyToLoad ? (
              <p className="text-gray-500">Đang chờ phôi 3D tải xong...</p>
            ) : (
              <p className="text-gray-500">Đang tải khuôn 2D (SVG)...</p>
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
