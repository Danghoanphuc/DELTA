// frontend/src/features/editor/hooks/useFabricEvents.ts
// ✅ NHIỆM VỤ 1: Loại bỏ toDataURL(), sử dụng THREE.CanvasTexture trực tiếp

import React, { useEffect, useRef, useCallback } from "react";
import * as fabric from "fabric";
import debounce from "lodash.debounce";

interface EventCallbacks {
  onCanvasUpdate: (materialKey: string, canvasElement: HTMLCanvasElement) => void;
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

  // Refs cho callbacks
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

  // ✅ LOGIC MỚI: Gửi canvas element thay vì base64
  const updateTexture = useCallback(() => {
    const canvas = fabricCanvas.current;
    const artboard = artboardRef.current;
    const dieline = dielineRef.current;

    if (!canvas || !artboard) {
      console.warn("[useFabricEvents] Artboard chưa sẵn sàng");
      return;
    }

    // Lưu trạng thái viewport
    const originalTransform = canvas.viewportTransform;
    const dielineWasVisible = dieline ? dieline.visible : false;

    // Reset viewport về 100%
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

    // Ẩn dieline tạm thời
    if (dieline) {
      dieline.visible = false;
    }

    // Render canvas
    canvas.renderAll();

    // ✅ MẤU CHỐT: Lấy canvas element thực, KHÔNG tạo base64
    const canvasElement = canvas.getElement();

    // Gửi canvas element trực tiếp
    onCanvasUpdateRef.current(materialKey, canvasElement);

    // Khôi phục trạng thái
    if (dieline) {
      dieline.visible = dielineWasVisible;
    }
    canvas.setViewportTransform(originalTransform);
    canvas.renderAll();

    console.log(`🔄 [useFabricEvents] Texture updated (no base64)`);
  }, [fabricCanvas, artboardRef, dielineRef, materialKey]);

  // Debounce update
  const debouncedUpdate = useRef(
    debounce(() => updateTexture(), 100) // ✅ Giảm delay xuống 100ms
  ).current;

  // Gán Event Listeners
  useEffect(() => {
    const canvas = fabricCanvas.current;

    if (!canvas || !isDielineLoaded) {
      return;
    }

    onObjectChangeRef.current?.();

    const handleChange = () => {
      saveStateRef.current();
      debouncedUpdate(); // ✅ Update texture realtime
      onObjectChangeRef.current?.();
    };

    const handleSelection = () => {
      onObjectChangeRef.current?.();
    };

    // Listen to all canvas events
    canvas.on("object:modified", handleChange);
    canvas.on("object:moving", handleChange); // ✅ Update khi đang di chuyển
    canvas.on("object:scaling", handleChange); // ✅ Update khi đang scale
    canvas.on("object:rotating", handleChange); // ✅ Update khi đang xoay
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
  }, [isDielineLoaded, fabricCanvas, debouncedUpdate]);
};
