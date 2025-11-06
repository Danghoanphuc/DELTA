// frontend/src/features/editor/core/textureCapture.ts
// ✅ BẢN VÁ HOÀN CHỈNH:
// 1. Fix lỗi chụp cả UI controls (bằng cách deselect activeObject)
// 2. Fix lỗi chụp sai vùng (bằng cách ưu tiên dielineRef.getBoundingRect())

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

  // ✅ VÁ LỖI 2: Ưu tiên ranh giới của Dieline (khuôn thật)
  // Nếu không có dieline, mới dùng artboard (vùng trắng)
  const bounds = dielineRef
    ? dielineRef.getBoundingRect()
    : artboardRef.getBoundingRect();

  console.log("📸 [TextureCapture] Capture bounds:", bounds);

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

  // --- 1. LƯU LẠI TRẠNG THÁI GỐC ---
  const originalTransform = fabricCanvas.viewportTransform
    ? [...fabricCanvas.viewportTransform]
    : [1, 0, 0, 1, 0, 0];

  // ✅ VÁ LỖI 1: Lưu lại object đang active
  const activeObject = fabricCanvas.getActiveObject();

  // Đặt lại viewport về 100%
  fabricCanvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

  // --- 2. TẠM THỜI ẨN CÁC THÀNH PHẦN KHÔNG MONG MUỐN ---
  const dielineWasVisible = dielineRef ? dielineRef.visible : false;
  if (dielineRef) {
    dielineRef.visible = false;
  }

  // ✅ VÁ LỖI 1: Bỏ chọn object để ẩn UI controls
  if (activeObject) {
    fabricCanvas.discardActiveObject();
  }

  // Render 1 frame ở trạng thái "sạch" (không dieline, không controls)
  fabricCanvas.renderAll();

  // --- 3. CHỤP ẢNH ---
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

    console.log("✅ [TextureCapture] Captured successfully");
  } catch (err) {
    console.error("❌ [TextureCapture] Error:", err);
  } finally {
    // --- 4. KHÔI PHỤC LẠI TRẠNG THÁI GỐC (LUÔN CHẠY) ---
    // Khôi phục dieline
    if (dielineRef) {
      dielineRef.visible = dielineWasVisible;
    }

    // ✅ VÁ LỖI 1: Chọn lại object
    if (activeObject) {
      fabricCanvas.setActiveObject(activeObject);
    }

    // Khôi phục viewport
    fabricCanvas.setViewportTransform(
      originalTransform as [number, number, number, number, number, number]
    );

    // Render lại lần nữa để hiện controls cho người dùng
    fabricCanvas.renderAll();
  }

  return offscreenCanvas;
}
