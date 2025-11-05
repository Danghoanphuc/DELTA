// frontend/src/features/editor/hooks/useFabricDieline.ts
// ✅ BẢN VÁ 100%: Gỡ bỏ isReadyToLoad (Điểm nghẽn 3)

import { useState, useEffect, useRef } from "react";
import { Canvas, Image as FabricImage, Rect } from "fabric";
import { Canvg } from "canvg";
import { toast } from "sonner";

interface DielineOptions {
  dielineSvgUrl: string;
  // isReadyToLoad: boolean; // ❌ XÓA BỎ
  saveState: () => void;
}

const ARTBOARD_SIZE = 800;

// ... (getSvgDimensions giữ nguyên) ...
const getSvgDimensions = (
  svgText: string
): { width: number; height: number } => {
  const viewBoxMatch = svgText.match(
    /viewBox="[0-9.]+\s+[0-9.]+\s+([0-9.]+)\s+([0-9.]+)"/
  );
  if (viewBoxMatch && viewBoxMatch[1] && viewBoxMatch[2]) {
    return {
      width: parseFloat(viewBoxMatch[1]),
      height: parseFloat(viewBoxMatch[2]),
    };
  }
  const widthMatch = svgText.match(/width="([0-9.]+)"/);
  const heightMatch = svgText.match(/height="([0-9.]+)"/);
  if (widthMatch && widthMatch[1] && heightMatch && heightMatch[1]) {
    return {
      width: parseFloat(widthMatch[1]),
      height: parseFloat(heightMatch[1]),
    };
  }
  return { width: ARTBOARD_SIZE, height: ARTBOARD_SIZE };
};

export const useFabricDieline = (
  fabricCanvas: React.RefObject<Canvas | null>,
  containerRef: React.RefObject<HTMLDivElement | null>,
  options: DielineOptions
) => {
  const { dielineSvgUrl, saveState } = options; // ❌ XÓA BỎ isReadyToLoad
  const [isDielineLoaded, setIsDielineLoaded] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  const artboardRef = useRef<Rect | null>(null);
  const dielineRef = useRef<FabricImage | null>(null);

  useEffect(() => {
    const canvas = fabricCanvas.current;
    const container = containerRef.current;
    if (!canvas || !container || !dielineSvgUrl) return;

    // ❌ XÓA BỎ: logic if (!isReadyToLoad)

    // ✅ FIX: Logic 2D tự chạy
    const loadArtboardAndDieline = async () => {
      setIsDielineLoaded(false);
      setLoadFailed(false);
      canvas.clear();

      try {
        const artboard = new Rect({
          width: ARTBOARD_SIZE,
          height: ARTBOARD_SIZE,
          fill: "white",
          selectable: false,
          evented: false,
          hoverCursor: "default",
        });
        artboardRef.current = artboard;
        canvas.add(artboard);
        canvas.centerObject(artboard);

        const response = await fetch(dielineSvgUrl);
        if (!response.ok) throw new Error("Network response was not ok");
        const svgText = await response.text();
        const svgDims = getSvgDimensions(svgText);

        const ctx = document.createElement("canvas").getContext("2d");
        if (!ctx) throw new Error("Không thể tạo 2D context");

        const v = await Canvg.from(ctx, svgText);
        await v.render();
        const pngDataUrl = ctx.canvas.toDataURL("image/png");
        const dielineImg = await FabricImage.fromURL(pngDataUrl, {
          crossOrigin: "anonymous",
        });

        if (!fabricCanvas.current || !artboardRef.current) return;

        const scaleX = ARTBOARD_SIZE / (dielineImg.width || ARTBOARD_SIZE);
        const scaleY = ARTBOARD_SIZE / (dielineImg.height || ARTBOARD_SIZE);
        const scale = Math.min(scaleX, scaleY);

        dielineImg.scale(scale);
        dielineImg.set({
          left: artboardRef.current.left,
          top: artboardRef.current.top,
          originX: "left",
          originY: "top",
          selectable: false,
          evented: false,
          opacity: 0.5,
        });

        canvas.centerObject(dielineImg);

        dielineRef.current = dielineImg;
        canvas.add(dielineImg);

        canvas.renderAll();
        setIsDielineLoaded(true);
        saveState();
      } catch (error) {
        console.error("[Editor] Lỗi tải SVG/Artboard:", error);
        toast.error("Tải file SVG thất bại.");
        setLoadFailed(true);
      }
    };

    loadArtboardAndDieline();

    // ... (ResizeObserver giữ nguyên) ...
    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      if (fabricCanvas.current) {
        fabricCanvas.current.setWidth(width);
        fabricCanvas.current.setHeight(height);
        if (artboardRef.current) {
          fabricCanvas.current.centerObject(artboardRef.current);
        }
        if (dielineRef.current && artboardRef.current) {
          dielineRef.current.set({
            left: artboardRef.current.left,
            top: artboardRef.current.top,
          });
          fabricCanvas.current.centerObject(dielineRef.current);
        }
        fabricCanvas.current.renderAll();
      }
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [fabricCanvas, containerRef, dielineSvgUrl, saveState]); // ❌ XÓA BỎ isReadyToLoad

  return {
    isDielineLoaded,
    loadFailed,
    artboardRef,
    dielineRef,
  };
};
