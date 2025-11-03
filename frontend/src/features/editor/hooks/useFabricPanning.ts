// frontend/src/features/editor/hooks/useFabricPanning.ts
import { useState, useEffect, useRef } from "react";
import * as fabric from "fabric";

export const useFabricPanning = (
  fabricCanvas: React.RefObject<fabric.Canvas | null>
) => {
  const [isPanning, setIsPanning] = useState(false);
  const lastPosX = useRef(0);
  const lastPosY = useRef(0);

  // Xử lý phím Space
  useEffect(() => {
    const canvas = fabricCanvas.current;
    if (!canvas) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputFocused =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (e.code === "Space" && !isPanning && !isInputFocused) {
        e.preventDefault();
        setIsPanning(true);
        canvas.selection = false;
        canvas.defaultCursor = "grab";
        canvas.hoverCursor = "grab";
        canvas.renderAll();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" && isPanning) {
        e.preventDefault();
        setIsPanning(false);
        canvas.selection = true;
        canvas.defaultCursor = "default";
        canvas.hoverCursor = "move";
        canvas.renderAll();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isPanning, fabricCanvas]);

  // Xử lý kéo chuột khi Panning
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
      if (canvas) {
        canvas.off("mouse:down", handleMouseDown);
        canvas.off("mouse:move", handleMouseMove);
        canvas.off("mouse:up", handleMouseUp);
      }
    };
  }, [isPanning, fabricCanvas]);

  return { isPanning, setIsPanning };
};
