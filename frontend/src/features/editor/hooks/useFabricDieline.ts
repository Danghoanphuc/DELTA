// frontend/src/features/editor/hooks/useFabricDieline.ts
// ✅ CẬP NHẬT: Logic Artboard "CONTAIN" (đặt lọt thỏm)

import { useState, useEffect, useRef } from "react";
import { Canvas, Image as FabricImage, Rect } from "fabric";
import { Canvg } from "canvg";
import { toast } from "sonner";

interface DielineOptions {
  dielineSvgUrl: string;
  isReadyToLoad: boolean;
  saveState: () => void;
}

// Artboard (và texture) LUÔN LUÔN là hình vuông.
const ARTBOARD_SIZE = 800; // 800x800 pixels

/**
 * (Helper) Đọc file SVG text để tìm kích thước gốc
 */
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
  // Mặc định trả về 1:1 nếu không tìm thấy
  return { width: ARTBOARD_SIZE, height: ARTBOARD_SIZE };
};

export const useFabricDieline = (
  fabricCanvas: React.RefObject<Canvas | null>,
  containerRef: React.RefObject<HTMLDivElement | null>,
  options: DielineOptions
) => {
  const { dielineSvgUrl, isReadyToLoad, saveState } = options;
  const [isDielineLoaded, setIsDielineLoaded] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  const artboardRef = useRef<Rect | null>(null);
  const dielineRef = useRef<FabricImage | null>(null);

  useEffect(() => {
    const canvas = fabricCanvas.current;
    const container = containerRef.current;
    if (!canvas || !container || !dielineSvgUrl) return;

    if (!isReadyToLoad) {
      // (Logic chờ 3D giữ nguyên)
      setIsDielineLoaded(false);
      setLoadFailed(false);
      return;
    }

    const loadArtboardAndDieline = async () => {
      setIsDielineLoaded(false);
      setLoadFailed(false);
      canvas.clear();

      try {
        // --- 1. Tạo Artboard (Bảng vẽ) HÌNH VUÔNG ---
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
        canvas.centerObject(artboard); // Căn giữa Artboard vào Viewport

        // --- 2. Tải SVG (dưới dạng text) để đọc kích thước ---
        const response = await fetch(dielineSvgUrl);
        if (!response.ok) throw new Error("Network response was not ok");
        const svgText = await response.text();
        const svgDims = getSvgDimensions(svgText);

        // --- 3. Tải Dieline (SVG) bằng Canvg ---
        // (Chúng ta KHÔNG dùng offscreenCanvas ở đây vì Canvg
        // sẽ tự động render đúng kích thước của SVG)
        const ctx = document.createElement("canvas").getContext("2d");
        if (!ctx) throw new Error("Không thể tạo 2D context");

        const v = await Canvg.from(ctx, svgText);
        await v.render();
        const pngDataUrl = ctx.canvas.toDataURL("image/png");
        const dielineImg = await FabricImage.fromURL(pngDataUrl, {
          crossOrigin: "anonymous",
        });

        if (!fabricCanvas.current || !artboardRef.current) return;

        // --- 4. SỬA LỖI: Áp dụng logic "CONTAIN" ---
        // Tính toán tỷ lệ để "đặt lọt thỏm" Dieline vào Artboard
        const scaleX = ARTBOARD_SIZE / dielineImg.width;
        const scaleY = ARTBOARD_SIZE / dielineImg.height;
        const scale = Math.min(scaleX, scaleY); // Lấy tỷ lệ nhỏ nhất

        dielineImg.scale(scale); // Scale Dieline
        dielineImg.set({
          left: artboardRef.current.left, // Đặt Dieline trùng vị trí Artboard
          top: artboardRef.current.top,
          originX: "left", // Căn theo Artboard
          originY: "top",
          selectable: false,
          evented: false,
          opacity: 0.5,
        });

        // Căn giữa Dieline (đã scale) bên trong Artboard
        canvas.centerObject(dielineImg);

        dielineRef.current = dielineImg;
        canvas.add(dielineImg);

        // (Đã loại bỏ clipPath ở bước trước)

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

    // Xử lý ResizeObserver (Giữ nguyên - chỉ căn giữa Artboard)
    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;

      if (fabricCanvas.current) {
        fabricCanvas.current.setWidth(width);
        fabricCanvas.current.setHeight(height);

        // Luôn căn giữa Artboard
        if (artboardRef.current) {
          fabricCanvas.current.centerObject(artboardRef.current);
        }
        // Căn Dieline theo Artboard
        if (dielineRef.current && artboardRef.current) {
          dielineRef.current.set({
            left: artboardRef.current.left,
            top: artboardRef.current.top,
          });
          // Căn giữa Dieline (đã scale) bên trong Artboard
          fabricCanvas.current.centerObject(dielineRef.current);
        }
        fabricCanvas.current.renderAll();
      }
    });

    observer.observe(container);

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, [fabricCanvas, containerRef, dielineSvgUrl, isReadyToLoad, saveState]);

  return {
    isDielineLoaded,
    loadFailed,
    artboardRef,
    dielineRef,
  };
};
