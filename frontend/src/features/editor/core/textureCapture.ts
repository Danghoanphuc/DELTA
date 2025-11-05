// frontend/src/features/editor/core/textureCapture.ts
// ✅ BẢN HOÀN CHỈNH: Pipeline "Zero-Cost"

import * as fabric from "fabric";

interface TextureCaptureOptions {
  outputSize?: number;
  removeBackground?: boolean;
  quality?: number;
}

let offscreenCanvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;

export function captureTextureFromCanvas(
  fabricCanvas: fabric.Canvas,
  artboardRef: fabric.Rect | null,
  dielineRef: fabric.Image | null,
  options: TextureCaptureOptions = {}
): HTMLCanvasElement | null {
  const { outputSize = 2048, removeBackground = true } = options;

  if (!fabricCanvas || !artboardRef) {
    console.warn("⚠️ [TextureCapture] Canvas hoặc Artboard không tồn tại");
    return null;
  }

  const bounds = getCaptureBounds(fabricCanvas, artboardRef, dielineRef);
  if (!bounds) {
    console.warn("⚠️ [TextureCapture] Không thể tính bounds");
    return null;
  }

  // ✅ Tái sử dụng canvas
  if (!offscreenCanvas) {
    offscreenCanvas = document.createElement("canvas");
    ctx = offscreenCanvas.getContext("2d", { alpha: removeBackground });
  }

  if (!ctx) {
    console.error("❌ [TextureCapture] Không thể tạo 2D context");
    return null;
  }

  if (
    offscreenCanvas.width !== outputSize ||
    offscreenCanvas.height !== outputSize
  ) {
    offscreenCanvas.width = outputSize;
    offscreenCanvas.height = outputSize;
  }

  const originalTransform = fabricCanvas.viewportTransform
    ? [...fabricCanvas.viewportTransform]
    : [1, 0, 0, 1, 0, 0];
  fabricCanvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

  const dielineWasVisible = dielineRef ? dielineRef.visible : false;
  if (dielineRef) {
    dielineRef.visible = false;
  }
  fabricCanvas.renderAll();

  try {
    if (removeBackground) {
      ctx.clearRect(0, 0, outputSize, outputSize);
    } else {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, outputSize, outputSize);
    }

    const sourceCanvas = fabricCanvas.getElement();
    ctx.drawImage(
      sourceCanvas,
      bounds.left,
      bounds.top,
      bounds.width,
      bounds.height,
      0,
      0,
      outputSize,
      outputSize
    );
  } catch (err) {
    console.error("❌ [TextureCapture] Error:", err);
  } finally {
    if (dielineRef) {
      dielineRef.visible = dielineWasVisible;
    }
    fabricCanvas.setViewportTransform(
      originalTransform as [number, number, number, number, number, number]
    );
    fabricCanvas.renderAll();
  }

  return offscreenCanvas;
}

function getCaptureBounds(
  fabricCanvas: fabric.Canvas,
  artboardRef: fabric.Rect,
  dielineRef: fabric.Image | null
): { left: number; top: number; width: number; height: number } | null {
  if (dielineRef && dielineRef.width && dielineRef.height) {
    const dielineBounds = dielineRef.getBoundingRect();
    const artboardBounds = artboardRef.getBoundingRect();
    const left = Math.max(dielineBounds.left, artboardBounds.left);
    const top = Math.max(dielineBounds.top, artboardBounds.top);
    const right = Math.min(
      dielineBounds.left + dielineBounds.width,
      artboardBounds.left + artboardBounds.width
    );
    const bottom = Math.min(
      dielineBounds.top + dielineBounds.height,
      artboardBounds.top + artboardBounds.height
    );
    return { left, top, width: right - left, height: bottom - top };
  }

  if (artboardRef) {
    const artboardBounds = artboardRef.getBoundingRect();
    return { ...artboardBounds };
  }

  return {
    left: 0,
    top: 0,
    width: fabricCanvas.width || 800,
    height: fabricCanvas.height || 800,
  };
}
