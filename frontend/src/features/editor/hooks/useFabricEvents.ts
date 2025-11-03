// frontend/src/features/editor/hooks/useFabricEvents.ts
// ✅ SỬA LỖI TRIỆT ĐỂ: Reset viewport về 100% khi chụp ảnh

import React, { useEffect, useRef, useCallback } from "react";
import { Canvas, Rect, Image as FabricImage } from "fabric";
import debounce from "lodash.debounce";

interface EventCallbacks {
  onCanvasUpdate: (materialKey: string, base64DataUrl: string) => void;
  onObjectChange?: () => void;
  saveState: () => void;
  artboardRef: React.RefObject<Rect | null>;
  dielineRef: React.RefObject<FabricImage | null>;
}

export const useFabricEvents = (
  fabricCanvas: React.RefObject<Canvas | null>,
  isDielineLoaded: boolean,
  materialKey: string,
  callbacks: EventCallbacks
) => {
  const { onCanvasUpdate, onObjectChange, saveState, artboardRef, dielineRef } =
    callbacks;

  // Refs cho callbacks (Giữ nguyên)
  const onCanvasUpdateRef = useRef(onCanvasUpdate);
  const onObjectChangeRef = useRef(onObjectChange);
  const saveStateRef = useRef(saveState);
  useEffect(() => {
    onCanvasUpdateRef.current = onCanvasUpdate;
  }, [onCanvasUpdate]);
  useEffect(() => {
    onObjectChangeRef.current = onObjectChange;
  }, [onObjectChange]);
  useEffect(() => {
    saveStateRef.current = saveState;
  }, [saveState]);

  // ✅ SỬA LỖI LOGIC TẠO TEXTURE
  const generateTexture = useCallback(() => {
    const canvas = fabricCanvas.current;
    const artboard = artboardRef.current;
    const dieline = dielineRef.current;

    if (!canvas || !artboard) {
      console.warn("generateTexture: Artboard chưa sẵn sàng.");
      return;
    }

    // --- 1. LƯU LẠI TRẠNG THÁI VIEWPORT ---
    // (Lưu lại [zoom, 0, 0, zoom, panX, panY])
    const originalTransform = canvas.viewportTransform;
    const dielineWasVisible = dieline ? dieline.visible : false;

    // --- 2. TẠM THỜI RESET VIEWPORT VỀ 100% ---
    // Đây là mấu chốt: chúng ta đưa canvas về trạng thái gốc
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

    // --- 3. TÍNH TOÁN CROP Ở 100% ZOOM ---
    // Giờ đây, artboard.left/top là tọa độ tuyệt đối,
    // không bị ảnh hưởng bởi pan/zoom của người dùng.
    const cropLeft = artboard.left || 0;
    const cropTop = artboard.top || 0;
    const cropWidth = artboard.width || 800;
    const cropHeight = artboard.height || 800;

    // --- 4. TẠM THỜI ẨN DIELINE ---
    if (dieline) {
      dieline.visible = false;
    }

    // Render 1 frame ở 100% để áp dụng các thay đổi
    canvas.renderAll();

    // --- 5. CHỤP ẢNH (BỎ MULTIPLIER) ---
    // Vì canvas đã ở 100% zoom, chúng ta không cần multiplier nữa.
    // Artboard (Rect nền trắng) đảm bảo ảnh không bị trong suốt.
    const dataURL = canvas.toDataURL({
      format: "png",
      quality: 1,
      left: cropLeft,
      top: cropTop,
      width: cropWidth,
      height: cropHeight,
    });

    // --- 6. GỬI ẢNH ĐI (Giữ nguyên) ---
    onCanvasUpdateRef.current(materialKey, dataURL);

    // --- 7. KHÔI PHỤC LẠI TRẠNG THÁI GỐC ---
    if (dieline) {
      dieline.visible = dielineWasVisible;
    }
    // Trả lại zoom/pan cho người dùng
    canvas.setViewportTransform(originalTransform);
    canvas.renderAll();
  }, [fabricCanvas, artboardRef, dielineRef, materialKey]);

  // Debounce (Giữ nguyên)
  const debouncedCanvasUpdate = useRef(
    debounce(() => generateTexture(), 500)
  ).current;

  // Gán Event Listeners (Giữ nguyên)
  useEffect(() => {
    const canvas = fabricCanvas.current;

    if (!canvas || !isDielineLoaded) {
      return;
    }

    onObjectChangeRef.current?.();

    const handleChange = () => {
      saveStateRef.current();
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

    return () => {
      if (canvas) {
        canvas.off();
      }
    };
  }, [isDielineLoaded, fabricCanvas, debouncedCanvasUpdate]);
};
