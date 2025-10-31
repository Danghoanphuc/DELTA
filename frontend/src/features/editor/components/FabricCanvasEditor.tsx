// src/features/editor/components/FabricCanvasEditor.tsx (✅ PRODUCTION-READY VERSION)
import React, {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
} from "react";
import { Canvas, IText, FabricImage, loadSVGFromURL, Group } from "fabric";
import debounce from "lodash.debounce";
import { toast } from "sonner";

interface FabricCanvasEditorProps {
  dielineUrl: string;
  onCanvasUpdate: (base64DataUrl: string) => void;
}

export interface FabricCanvasEditorRef {
  addText: (text: string) => void;
  addImage: (imageUrl: string) => void;
  getJSON: () => string;
  getCanvas: () => Canvas | null;
}

export const FabricCanvasEditor = forwardRef<
  FabricCanvasEditorRef,
  FabricCanvasEditorProps
>(({ dielineUrl, onCanvasUpdate }, ref) => {
  const canvasEl = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvas = useRef<Canvas | null>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDielineLoaded, setIsDielineLoaded] = useState(false);

  // ✅ FIX 1: OPTIMIZED TEXTURE GENERATION WITH OFFSCREEN CANVAS
  const generateTexture = useCallback(() => {
    if (!fabricCanvas.current) return;

    const canvas = fabricCanvas.current;
    const backgroundImage = canvas.backgroundImage;

    // Create offscreen canvas if not exists
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement("canvas");
    }

    const offscreen = offscreenCanvasRef.current;
    offscreen.width = canvas.width || 600;
    offscreen.height = canvas.height || 600;
    const ctx = offscreen.getContext("2d");

    if (!ctx) return;

    canvas.setBackgroundImage(null, () => {
      const canvasElement = canvas.getElement();
      ctx.clearRect(0, 0, offscreen.width, offscreen.height);
      ctx.drawImage(canvasElement, 0, 0);

      // ✅ Use WebP for 50-70% size reduction
      const dataURL = offscreen.toDataURL("image/webp", 0.8);
      onCanvasUpdate(dataURL);

      canvas.setBackgroundImage(backgroundImage, canvas.renderAll.bind(canvas));
    });
  }, [onCanvasUpdate]);

  // ✅ FIX 2: DEBOUNCED UPDATE
  const debouncedCanvasUpdate = useRef(
    debounce((canvas: Canvas) => {
      generateTexture();
    }, 250)
  ).current;

  // ✅ FIX 3: PROPER INITIALIZATION WITH ERROR HANDLING
  useEffect(() => {
    if (canvasEl.current && !fabricCanvas.current) {
      const canvas = new Canvas(canvasEl.current, {
        width: 600,
        height: 600,
        backgroundColor: "#ffffff",
      });
      fabricCanvas.current = canvas;

      // ✅ Load SVG with error handling
      loadSVGFromURL(
        dielineUrl,
        (objects, options) => {
          try {
            const dieline = new Group(objects, {
              selectable: false,
              evented: false,
            });

            canvas.setBackgroundImage(dieline, canvas.renderAll.bind(canvas), {
              originX: "center",
              originY: "center",
              top: canvas.height / 2,
              left: canvas.width / 2,
            });
            
            canvas.renderAll();
            setIsDielineLoaded(true);
            
            // Generate initial texture
            setTimeout(() => debouncedCanvasUpdate(canvas), 100);
          } catch (error) {
            console.error("Error setting dieline:", error);
            toast.error("Lỗi: Không thể tải khuôn 2D (dieline).");
            setIsDielineLoaded(true);
          }
        },
        null,
        {
          crossOrigin: "anonymous",
          onError: (error) => {
            console.error("Lỗi không tải được SVG Dieline:", error);
            toast.error("Lỗi: Không thể tải khuôn 2D (dieline).");
            setIsDielineLoaded(true);
          },
        }
      );

      // ✅ FIX 4: OPTIMIZED EVENT LISTENERS
      const handleChange = () => debouncedCanvasUpdate(canvas);
      
      canvas.on("object:modified", handleChange);
      canvas.on("text:changed", handleChange);
      canvas.on("object:added", handleChange);
      canvas.on("object:removed", handleChange);

      // ✅ FIX 5: PROPER CLEANUP
      return () => {
        debouncedCanvasUpdate.cancel();
        canvas.off("object:modified", handleChange);
        canvas.off("text:changed", handleChange);
        canvas.off("object:added", handleChange);
        canvas.off("object:removed", handleChange);
        canvas.dispose();
        fabricCanvas.current = null;
      };
    }
  }, [dielineUrl, debouncedCanvasUpdate]);

  // ✅ FIX 6: IMPERATIVE METHODS
  useImperativeHandle(ref, () => ({
    addText: (text: string) => {
      if (!fabricCanvas.current) return;
      const textObj = new IText(text, {
        left: 100,
        top: 100,
        fontSize: 24,
        fill: "#000000",
      });
      fabricCanvas.current.add(textObj);
      fabricCanvas.current.setActiveObject(textObj);
      fabricCanvas.current.renderAll();
    },

    addImage: async (imageUrl: string) => {
      if (!fabricCanvas.current) return;
      try {
        const img = await FabricImage.fromURL(imageUrl, {
          crossOrigin: "anonymous",
        });
        img.scaleToWidth(150);
        fabricCanvas.current.add(img);
        fabricCanvas.current.centerObject(img);
        fabricCanvas.current.setActiveObject(img);
        fabricCanvas.current.renderAll();
      } catch (error) {
        console.error("Lỗi khi tải ảnh vào Fabric:", error);
        toast.error("Không thể tải ảnh");
      }
    },

    getJSON: (): string => {
      if (!fabricCanvas.current) return "{}";
      return JSON.stringify(fabricCanvas.current.toJSON());
    },

    getCanvas: (): Canvas | null => {
      return fabricCanvas.current;
    },
  }));

  return (
    <div className="w-full h-full relative">
      {!isDielineLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-10">
          <p className="text-gray-500">Đang tải khuôn 2D...</p>
        </div>
      )}
      <canvas ref={canvasEl} className="shadow-lg" />
    </div>
  );
});

FabricCanvasEditor.displayName = "FabricCanvasEditor";
