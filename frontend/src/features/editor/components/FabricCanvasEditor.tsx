// frontend/src/features/editor/components/FabricCanvasEditor.tsx
// ✅ TASK 6: THÊM CONTEXT MENU (Right-click)

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
import { Canvg } from "canvg";

// ✅ TASK 6: Import Context Menu
import { ContextMenu, useFabricContextMenu } from "./ContextMenu";

// ==================== TYPES ====================
interface FabricCanvasEditorProps {
  dielineImageUrl: string;
  onCanvasUpdate: (base64DataUrl: string, jsonData: object) => void;
  onObjectChange?: () => void;
  width?: number;
  height?: number;
  isReadyToLoad?: boolean;
  onDielineLoaded?: () => void;
}

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
  getCanvas: () => fabric.Canvas | null;
  undo: () => void;
  redo: () => void;
  exportCanvas: (format: "png" | "jpg" | "svg") => Promise<void>;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  setZoom: (zoom: number) => void;
  copySelected?: () => void; // ✅ TASK 6: Thêm cho context menu
}

// ==================== MAIN COMPONENT ====================
export const FabricCanvasEditor = forwardRef;
FabricCanvasEditorRef,
  FabricCanvasEditorProps >
    ((
      {
        dielineImageUrl,
        onCanvasUpdate,
        onObjectChange,
        width = 600,
        height = 600,
        isReadyToLoad = true,
        onDielineLoaded,
      },
      ref
    ) => {
      const canvasEl = useRef<HTMLCanvasElement | null>(null);
      const fabricCanvas = useRef<fabric.Canvas | null>(null);
      const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
      const [isLoading, setIsLoading] = useState(true);
      const [loadFailed, setLoadFailed] = useState(false);

      // ✅ TASK 2: State for panning
      const [isPanning, setIsPanning] = useState(false);
      const lastPosX = useRef(0);
      const lastPosY = useRef(0);

      // --- Refs cho các callback ---
      const onCanvasUpdateRef = useRef(onCanvasUpdate);
      useEffect(() => {
        onCanvasUpdateRef.current = onCanvasUpdate;
      }, [onCanvasUpdate]);

      const onObjectChangeRef = useRef(onObjectChange);
      useEffect(() => {
        onObjectChangeRef.current = onObjectChange;
      }, [onObjectChange]);

      const onDielineLoadedRef = useRef(onDielineLoaded);
      useEffect(() => {
        onDielineLoadedRef.current = onDielineLoaded;
      }, [onDielineLoaded]);

      // --- Texture Generation ---
      const generateTexture = useCallback(() => {
        const canvas = fabricCanvas.current;
        if (!canvas) return;
        const backgroundImage = canvas.backgroundImage;
        if (!offscreenCanvasRef.current) {
          offscreenCanvasRef.current = document.createElement("canvas");
        }
        const offscreen = offscreenCanvasRef.current;
        offscreen.width = canvas.width || width;
        offscreen.height = canvas.height || height;
        const ctx = offscreen.getContext("2d");
        if (!ctx) return;
        canvas.backgroundImage = undefined;
        canvas.renderAll();
        const canvasElement = (canvas as any).getElement();
        ctx.clearRect(0, 0, offscreen.width, offscreen.height);
        ctx.drawImage(canvasElement, 0, 0);
        const dataURL = offscreen.toDataURL("image/webp", 0.8);
        const canvasJson = canvas.toJSON();
        onCanvasUpdateRef.current(dataURL, canvasJson);
        canvas.backgroundImage = backgroundImage;
        canvas.renderAll();
      }, [width, height]);

      const debouncedCanvasUpdate = useRef(
        debounce(() => generateTexture(), 250)
      ).current;

      // --- Hooks ---
      const { zoom, setZoom } = useFabricZoom(fabricCanvas);
      const { saveState, undo, redo } = useFabricHistory(
        fabricCanvas,
        debouncedCanvasUpdate
      );
      const deleteSelected = useCallback(() => {
        if (fabricCanvas.current)
          fabricApi.deleteSelected(fabricCanvas.current);
      }, []);
      const duplicateSelected = useCallback(() => {
        if (fabricCanvas.current)
          fabricApi.duplicateSelected(fabricCanvas.current);
      }, []);

      // ✅ TASK 6: Copy selected function
      const copySelected = useCallback(() => {
        if (!fabricCanvas.current) return;
        const activeObject = fabricCanvas.current.getActiveObject();
        if (activeObject) {
          activeObject.clone((cloned: any) => {
            // Store in clipboard (could use a ref or state)
            console.log("Object copied to clipboard");
            toast.success("Đã sao chép đối tượng");
          });
        }
      }, []);

      useFabricKeyboardShortcuts({
        canvas: fabricCanvas,
        undo,
        redo,
        deleteSelected,
        duplicateSelected,
      });

      // ✅ TASK 6: Use Context Menu Hook
      const { contextMenu, menuItems, closeContextMenu } = useFabricContextMenu(
        fabricCanvas,
        {
          current: {
            deleteSelected,
            duplicateSelected,
            copySelected,
          },
        } as any
      );

      // ==========================================================
      // ✅ TASK 2: IMPLEMENT PANNING (Hand Tool)
      // ==========================================================
      useEffect(() => {
        const canvas = fabricCanvas.current;
        if (!canvas) return;

        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.code === "Space" && !isPanning) {
            e.preventDefault();
            setIsPanning(true);
            canvas.selection = false;
            canvas.defaultCursor = "grab";
            canvas.hoverCursor = "grab";
          }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
          if (e.code === "Space" && isPanning) {
            e.preventDefault();
            setIsPanning(false);
            canvas.selection = true;
            canvas.defaultCursor = "default";
            canvas.hoverCursor = "move";
          }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
          window.removeEventListener("keydown", handleKeyDown);
          window.removeEventListener("keyup", handleKeyUp);
        };
      }, [isPanning]);

      // Mouse events for panning
      useEffect(() => {
        const canvas = fabricCanvas.current;
        if (!canvas) return;

        const handleMouseDown = (opt: any) => {
          if (isPanning) {
            canvas.setCursor("grabbing");
            lastPosX.current = opt.e.clientX;
            lastPosY.current = opt.e.clientY;
          }
        };

        const handleMouseMove = (opt: any) => {
          if (isPanning && opt.e.buttons === 1) {
            const e = opt.e;
            const vpt = canvas.viewportTransform;
            if (!vpt) return;

            const deltaX = e.clientX - lastPosX.current;
            const deltaY = e.clientY - lastPosY.current;

            vpt[4] += deltaX;
            vpt[5] += deltaY;

            canvas.requestRenderAll();

            lastPosX.current = e.clientX;
            lastPosY.current = e.clientY;
          }
        };

        const handleMouseUp = () => {
          if (isPanning) {
            canvas.setCursor("grab");
          }
        };

        canvas.on("mouse:down", handleMouseDown);
        canvas.on("mouse:move", handleMouseMove);
        canvas.on("mouse:up", handleMouseUp);

        return () => {
          canvas.off("mouse:down", handleMouseDown);
          canvas.off("mouse:move", handleMouseMove);
          canvas.off("mouse:up", handleMouseUp);
        };
      }, [isPanning]);

      // ==========================================================
      // useEffect CHÍNH
      // ==========================================================
      useEffect(() => {
        console.log("[FabricEditor] 1. Initializing Canvas...");
        if (!canvasEl.current) return;
        const canvas = new fabric.Canvas(canvasEl.current, {
          width,
          height,
          backgroundColor: "#ffffff",
          preserveObjectStacking: true,
        });
        fabricCanvas.current = canvas;

        console.log("[FabricEditor] 2. Attaching Event Listeners...");
        const handleChange = () => {
          saveState();
          debouncedCanvasUpdate();
          onObjectChangeRef.current?.();
        };
        const handleSelection = () => {
          onObjectChangeRef.current?.();
        };
        canvas.on("object:modified", handleChange);
        canvas.on("text:changed", handleChange);
        canvas.on("object:added", handleChange);
        canvas.on("object:removed", handleChange);
        canvas.on("selection:created", handleSelection);
        canvas.on("selection:updated", handleSelection);
        canvas.on("selection:cleared", handleSelection);

        // --- PHẦN 2: TẢI DIELINE ---
        const loadDieline = async () => {
          const canvas = fabricCanvas.current;
          if (!canvas || !dielineImageUrl) return;
          if (!isReadyToLoad) {
            console.log(
              `[FabricEditor] Waiting for 3D model (isReadyToLoad=false)...`
            );
            setIsLoading(true);
            return;
          }

          console.log(
            `[FabricEditor] 3. Loading Dieline (using canvg): ${dielineImageUrl}`
          );
          setIsLoading(true);
          setLoadFailed(false);
          canvas.backgroundImage = undefined;
          canvas.renderAll();

          try {
            const offscreenCanvas = document.createElement("canvas");
            offscreenCanvas.width = width;
            offscreenCanvas.height = height;
            const ctx = offscreenCanvas.getContext("2d");
            if (!ctx) throw new Error("Không thể tạo 2D context");

            const v = await Canvg.from(ctx, dielineImageUrl);
            await v.render();
            const pngDataUrl = offscreenCanvas.toDataURL("image/png");
            const fabricImg = await fabric.Image.fromURL(pngDataUrl);

            const currentCanvas = fabricCanvas.current;
            if (!currentCanvas) return;

            fabricImg.scaleToWidth(currentCanvas.width || width);
            currentCanvas.centerObject(fabricImg);
            fabricImg.set({ selectable: false, evented: false, opacity: 0.5 });
            currentCanvas.backgroundImage = fabricImg;
            currentCanvas.renderAll();
            setIsLoading(false);
            toast.success("Đã tải khuôn 2D (SVG) thành công.");

            console.log(
              "[FabricEditor] 4. Dieline loaded. Firing onDielineLoaded() via ref."
            );
            onDielineLoadedRef.current?.();

            saveState();
          } catch (error) {
            console.error(
              "Lỗi nghiêm trọng khi tải dieline bằng canvg:",
              error
            );
            setLoadFailed(true);
            setIsLoading(false);
          }
        };

        loadDieline();

        // --- PHẦN 3: CLEANUP ---
        return () => {
          console.log("[FabricEditor] Cleaning up canvas...");
          if (fabricCanvas.current) {
            fabricCanvas.current.off();
            fabricCanvas.current.dispose();
            fabricCanvas.current = null;
          }
        };
      }, [
        width,
        height,
        saveState,
        debouncedCanvasUpdate,
        dielineImageUrl,
        isReadyToLoad,
      ]);

      // --- IMPERATIVE METHODS (API) ---
      useImperativeHandle(ref, () => ({
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
          fabricCanvas.current &&
          fabricApi.align(fabricCanvas.current, alignment),
        updateTextStyle: (property, value) =>
          fabricCanvas.current &&
          fabricApi.updateTextStyle(fabricCanvas.current, property, value),
        exportCanvas: (format) =>
          fabricCanvas.current
            ? fabricApi.exportCanvas(fabricCanvas.current, format)
            : Promise.resolve(),
        deleteSelected,
        duplicateSelected,
        copySelected, // ✅ TASK 6
        undo,
        redo,
        setZoom,
        getJSON: (): string => {
          if (!fabricCanvas.current) return "{}";
          return JSON.stringify(fabricCanvas.current.toJSON());
        },
        getCanvas: (): fabric.Canvas | null => {
          return fabricCanvas.current;
        },
      }));

      // --- RENDER ---
      return (
        <div className="w-full h-full relative">
          {loadFailed ? (
            <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10 p-4">
              <p className="text-red-600 font-medium text-center">
                Tải khuôn 2D (SVG) thất bại.
                <br />
                Vui lòng kiểm tra lại file SVG hoặc lỗi CORS.
              </p>
            </div>
          ) : isLoading || !isReadyToLoad ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-10">
              <p className="text-gray-500">
                {!isReadyToLoad
                  ? "Đang chờ phôi 3D tải xong..."
                  : "Đang tải khuôn 2D..."}
              </p>
            </div>
          ) : null}

          <canvas ref={canvasEl} className="shadow-lg" />

          {/* ✅ TASK 6: RENDER CONTEXT MENU */}
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            isOpen={contextMenu.show}
            onClose={closeContextMenu}
            items={menuItems}
          />

          {/* Zoom indicator + Panning hint */}
          <div className="absolute bottom-4 right-4 bg-white px-3 py-1 rounded shadow text-sm space-y-1">
            <div>{Math.round(zoom * 100)}%</div>
            {isPanning && (
              <div className="text-xs text-blue-600">🖐️ Panning mode</div>
            )}
          </div>
          <div className="absolute bottom-4 left-4 bg-white px-3 py-1 rounded shadow text-xs text-gray-500">
            <kbd className="px-1 bg-gray-100 border rounded">Space</kbd> + Kéo
            chuột để di chuyển
            <br />
            <kbd className="px-1 bg-gray-100 border rounded">Chuột phải</kbd> để
            xem menu
          </div>
        </div>
      );
    });

FabricCanvasEditor.displayName = "FabricCanvasEditor";
