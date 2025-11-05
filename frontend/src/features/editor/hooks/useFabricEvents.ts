// frontend/src/features/editor/hooks/useFabricEvents.ts
// ✅ FIX LỖI "Maximum update depth exceeded"

import React, { useEffect, useRef, useCallback, useMemo } from "react";
import * as fabric from "fabric";
import debounce from "lodash.debounce";

interface EventCallbacks {
  onCanvasUpdate: (materialKey: string, base64DataUrl: string) => void;
  onObjectChange?: () => void;
  saveState: () => void;
  artboardRef: React.RefObject<fabric.Rect | null>;
  dielineRef: React.RefObject<fabric.Image | null>;
}

export const useFabricEvents = (
  fabricCanvas: React.RefObject<fabric.Canvas | null>,
  isDielineLoaded: boolean,
  materialKey: string,
  callbacks: EventCallbacks
) => {
  const { onCanvasUpdate, onObjectChange, saveState, artboardRef, dielineRef } =
    callbacks;

  // ✅ FIX 1: Dùng useRef cho callbacks để tránh re-create
  const onCanvasUpdateRef = useRef(onCanvasUpdate);
  const onObjectChangeRef = useRef(onObjectChange);
  const saveStateRef = useRef(saveState);

  // Update refs khi callbacks thay đổi
  useEffect(() => {
    onCanvasUpdateRef.current = onCanvasUpdate;
  }, [onCanvasUpdate]);

  useEffect(() => {
    onObjectChangeRef.current = onObjectChange;
  }, [onObjectChange]);

  useEffect(() => {
    saveStateRef.current = saveState;
  }, [saveState]);

  // ✅ FIX 2: Thêm flag để ngăn vòng lặp vô hạn
  const isGeneratingRef = useRef(false);

  // ✅ FIX 3: Stable generateTexture với proper dependencies
  const generateTexture = useCallback(() => {
    // Guard: Nếu đang generate, bỏ qua request mới
    if (isGeneratingRef.current) {
      console.log("[useFabricEvents] Skipping duplicate texture generation");
      return;
    }

    const canvas = fabricCanvas.current;
    const artboard = artboardRef.current;
    const dieline = dielineRef.current;

    if (!canvas || !artboard) {
      console.warn("[useFabricEvents] Canvas or artboard not ready");
      return;
    }

    try {
      // Set flag để ngăn concurrent calls
      isGeneratingRef.current = true;

      // --- 1. LƯU LẠI TRẠNG THÁI VIEWPORT ---
      const originalTransform = canvas.viewportTransform?.slice() || [
        1, 0, 0, 1, 0, 0,
      ];
      const dielineWasVisible = dieline ? dieline.visible : false;

      // --- 2. TẠM THỜI RESET VIEWPORT VỀ 100% ---
      canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

      // --- 3. TÍNH TOÁN CROP Ở 100% ZOOM ---
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

      // --- 5. CHỤP ẢNH ---
      const dataURL = canvas.toDataURL({
        format: "png",
        quality: 1,
        left: cropLeft,
        top: cropTop,
        width: cropWidth,
        height: cropHeight,
        multiplier: 1,
      });

      // --- 6. GỬI ẢNH ĐI ---
      onCanvasUpdateRef.current(materialKey, dataURL);

      // --- 7. KHÔI PHỤC LẠI TRẠNG THÁI GỐC ---
      if (dieline) {
        dieline.visible = dielineWasVisible;
      }
      canvas.setViewportTransform(originalTransform as [number, number, number, number, number, number]);
      canvas.renderAll();
    } catch (error) {
      console.error("[useFabricEvents] Error generating texture:", error);
    } finally {
      // Reset flag sau khi hoàn thành
      isGeneratingRef.current = false;
    }
  }, [fabricCanvas, artboardRef, dielineRef, materialKey]);

  // ✅ FIX 4: Tạo debounced function một lần duy nhất với useMemo
  const debouncedCanvasUpdate = useMemo(
    () =>
      debounce(() => {
        generateTexture();
      }, 500),
    [generateTexture]
  );

  // ✅ FIX 5: Cleanup debounce khi unmount
  useEffect(() => {
    return () => {
      debouncedCanvasUpdate.cancel();
    };
  }, [debouncedCanvasUpdate]);

  // ✅ FIX 6: Optimize event listeners attachment
  useEffect(() => {
    const canvas = fabricCanvas.current;

    if (!canvas || !isDielineLoaded) {
      return;
    }

    // Initial object change callback
    onObjectChangeRef.current?.();

    // ✅ Tạo stable handlers
    const handleChange = () => {
      saveStateRef.current();
      debouncedCanvasUpdate();
      onObjectChangeRef.current?.();
    };

    const handleSelection = () => {
      onObjectChangeRef.current?.();
    };

    // Attach events
    canvas.on("object:modified", handleChange);
    canvas.on("text:changed", handleChange);
    canvas.on("object:added", handleChange);
    canvas.on("object:removed", handleChange);
    canvas.on("selection:created", handleSelection);
    canvas.on("selection:updated", handleSelection);
    canvas.on("selection:cleared", handleSelection);

    // ✅ FIX 7: Proper cleanup - remove specific handlers
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
      // Cancel pending debounced calls
      debouncedCanvasUpdate.cancel();
    };
  }, [isDielineLoaded, fabricCanvas, debouncedCanvasUpdate]);
};
