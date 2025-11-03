// src/features/editor/hooks/useFabricZoom.ts
import { useState, useEffect, useCallback } from "react";
import * as fabric from "fabric";

export const useFabricZoom = (
  canvas: React.RefObject<fabric.Canvas | null>
) => {
  const [zoom, setZoomState] = useState(1);

  // Lắng nghe sự kiện lăn chuột
  useEffect(() => {
    if (!canvas.current) return;
    const canvasInstance = canvas.current;

    const handleWheel = (opt: fabric.TEvent<WheelEvent>) => {
      const delta = opt.e.deltaY;
      let newZoom = canvasInstance.getZoom();
      newZoom *= 0.999 ** delta;

      if (newZoom > 4) newZoom = 4;
      if (newZoom < 0.1) newZoom = 0.1;

      canvasInstance.zoomToPoint(
        new fabric.Point(opt.e.offsetX, opt.e.offsetY),
        newZoom
      );
      setZoomState(newZoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    };

    canvasInstance.on("mouse:wheel", handleWheel);

    return () => {
      // Make sure canvasInstance is still available
      if (canvasInstance) {
        canvasInstance.off("mouse:wheel", handleWheel);
      }
    };
  }, [canvas]);

  // Hàm set zoom (dùng cho slider/button)
  const setZoom = useCallback(
    (newZoom: number) => {
      if (!canvas.current) return;
      const center = canvas.current.getCenter();
      canvas.current.zoomToPoint(
        new fabric.Point(center.left, center.top),
        newZoom
      );
      setZoomState(newZoom);
    },
    [canvas]
  );

  return { zoom, setZoom };
};
