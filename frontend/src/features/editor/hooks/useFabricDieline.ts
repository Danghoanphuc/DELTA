// frontend/src/features/editor/hooks/useFabricDieline.ts
// ✅ FIX: Artboard khớp 100% với dieline dimensions

import { useState, useEffect, useRef } from "react";
import { Canvas, Image as FabricImage, Rect } from "fabric";
import { Canvg } from "canvg";
import { toast } from "sonner";

interface DielineOptions {
  dielineSvgUrl: string;
  saveState: () => void;
}

// ✅ THAY ĐỔI 1: Không còn cố định artboard size
// const ARTBOARD_SIZE = 800; // ❌ XÓA DÒNG NÀY

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
  // ✅ Fallback: 800x800 nếu không parse được
  return { width: 800, height: 800 };
};

export const useFabricDieline = (
  fabricCanvas: React.RefObject<Canvas | null>,
  containerRef: React.RefObject<HTMLDivElement | null>,
  options: DielineOptions
) => {
  const { dielineSvgUrl, saveState } = options;
  const [isDielineLoaded, setIsDielineLoaded] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  const artboardRef = useRef<Rect | null>(null);
  const dielineRef = useRef<FabricImage | null>(null);

  useEffect(() => {
    const canvas = fabricCanvas.current;
    const container = containerRef.current;
    if (!canvas || !container || !dielineSvgUrl) return;

    const loadArtboardAndDieline = async () => {
      setIsDielineLoaded(false);
      setLoadFailed(false);
      canvas.clear();

      try {
        // ✅ BƯỚC 1: Parse SVG để lấy dimensions thực
        const response = await fetch(dielineSvgUrl);
        if (!response.ok) throw new Error("Network response was not ok");
        const svgText = await response.text();
        const svgDims = getSvgDimensions(svgText);

        console.log("📐 [Dieline] SVG dimensions:", svgDims);

        // ✅ THAY ĐỔI 2: Artboard size = SVG dimensions (100% match)
        const artboard = new Rect({
          width: svgDims.width, // ← Không còn cố định
          height: svgDims.height, // ← Match với SVG
          fill: "white",
          selectable: false,
          evented: false,
          hoverCursor: "default",
        });
        artboardRef.current = artboard;
        canvas.add(artboard);

        // ✅ BƯỚC 2: Convert SVG → PNG
        const ctx = document.createElement("canvas").getContext("2d");
        if (!ctx) throw new Error("Không thể tạo 2D context");

        const v = await Canvg.from(ctx, svgText);
        await v.render();
        const pngDataUrl = ctx.canvas.toDataURL("image/png");

        // ✅ BƯỚC 3: Load dieline image
        const dielineImg = await FabricImage.fromURL(pngDataUrl, {
          crossOrigin: "anonymous",
        });

        if (!fabricCanvas.current || !artboardRef.current) return;

        // ✅ THAY ĐỔI 3: Dieline không scale, set size = artboard
        dielineImg.set({
          width: svgDims.width,
          height: svgDims.height,
          scaleX: 1, // ← Không scale
          scaleY: 1, // ← Không scale
          left: 0, // ← Sẽ được center sau
          top: 0, // ← Sẽ được center sau
          originX: "left",
          originY: "top",
          selectable: false,
          evented: false,
          opacity: 0.5,
        });

        dielineRef.current = dielineImg;
        canvas.add(dielineImg);

        // ✅ BƯỚC 4: Center cả artboard và dieline
        canvas.centerObject(artboard);
        canvas.centerObject(dielineImg);

        // ✅ BƯỚC 5: Calculate zoom để fit vào viewport
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        const zoomX = containerWidth / svgDims.width;
        const zoomY = containerHeight / svgDims.height;
        const fitZoom = Math.min(zoomX, zoomY) * 0.85; // 85% để có padding

        canvas.setZoom(fitZoom);

        console.log("🔍 [Dieline] Zoom level:", fitZoom);
        console.log("✅ [Dieline] Artboard = Dieline (100% match)");

        canvas.renderAll();
        setIsDielineLoaded(true);
        saveState();
      } catch (error) {
        console.error("[Dieline] Lỗi tải SVG/Artboard:", error);
        toast.error("Tải file SVG thất bại.");
        setLoadFailed(true);
      }
    };

    loadArtboardAndDieline();

    // ✅ THAY ĐỔI 4: ResizeObserver để maintain zoom khi resize
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
          // ✅ Dieline luôn trùng với artboard
          dielineRef.current.set({
            left: artboardRef.current.left,
            top: artboardRef.current.top,
          });
        }

        // ✅ Recalculate zoom
        if (artboardRef.current) {
          const zoomX = width / (artboardRef.current.width || 800);
          const zoomY = height / (artboardRef.current.height || 800);
          const fitZoom = Math.min(zoomX, zoomY) * 0.85;
          fabricCanvas.current.setZoom(fitZoom);
        }

        fabricCanvas.current.renderAll();
      }
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [fabricCanvas, containerRef, dielineSvgUrl, saveState]);

  return {
    isDielineLoaded,
    loadFailed,
    artboardRef,
    dielineRef,
  };
};
