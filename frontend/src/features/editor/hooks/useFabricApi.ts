// frontend/src/features/editor/hooks/useFabricApi.ts
import { useCallback } from "react";
import * as fabric from "fabric";
import * as fabricApi from "../core/fabricApi"; //

export const useFabricApi = (
  fabricCanvas: React.RefObject<fabric.Canvas | null>
) => {
  const addText = (text: string) =>
    fabricCanvas.current && fabricApi.addText(fabricCanvas.current, text);

  const addImage = (imageUrl: string) =>
    fabricCanvas.current && fabricApi.addImage(fabricCanvas.current, imageUrl);

  const addShape = (shapeType: "rect" | "circle" | "triangle" | "line") =>
    fabricCanvas.current && fabricApi.addShape(fabricCanvas.current, shapeType);

  const applyFilter = (
    filterType: "grayscale" | "sepia" | "blur" | "brightness" | "contrast"
  ) =>
    fabricCanvas.current &&
    fabricApi.applyFilter(fabricCanvas.current, filterType);

  const align = (
    alignment: "left" | "center" | "right" | "top" | "middle" | "bottom"
  ) => fabricCanvas.current && fabricApi.align(fabricCanvas.current, alignment);

  const updateTextStyle = (property: string, value: any) =>
    fabricCanvas.current &&
    fabricApi.updateTextStyle(fabricCanvas.current, property, value);

  const exportCanvas = (format: "png" | "jpg" | "svg") =>
    fabricCanvas.current
      ? fabricApi.exportCanvas(fabricCanvas.current, format)
      : Promise.resolve();

  const getJSON = (): string => {
    if (!fabricCanvas.current) return "{}";
    return JSON.stringify(fabricCanvas.current.toJSON());
  };

  const getCanvas = (): fabric.Canvas | null => fabricCanvas.current;

  // Sử dụng useCallback để ổn định các hàm
  const deleteSelected = useCallback(() => {
    if (fabricCanvas.current) fabricApi.deleteSelected(fabricCanvas.current);
  }, [fabricCanvas]);

  const duplicateSelected = useCallback(() => {
    if (fabricCanvas.current) fabricApi.duplicateSelected(fabricCanvas.current);
  }, [fabricCanvas]);

  const copySelected = useCallback(() => {
    if (fabricCanvas.current) fabricApi.copySelected(fabricCanvas.current);
  }, [fabricCanvas]);

  const bringToFront = useCallback(() => {
    if (fabricCanvas.current) fabricApi.bringToFront(fabricCanvas.current);
  }, [fabricCanvas]);

  const bringForward = useCallback(() => {
    if (fabricCanvas.current) fabricApi.bringForward(fabricCanvas.current);
  }, [fabricCanvas]);

  const sendToBack = useCallback(() => {
    if (fabricCanvas.current) fabricApi.sendToBack(fabricCanvas.current);
  }, [fabricCanvas]);

  const sendBackwards = useCallback(() => {
    if (fabricCanvas.current) fabricApi.sendBackwards(fabricCanvas.current);
  }, [fabricCanvas]);

  const toggleLock = useCallback(() => {
    if (fabricCanvas.current) fabricApi.toggleLock(fabricCanvas.current);
  }, [fabricCanvas]);

  const toggleVisibility = useCallback(() => {
    if (fabricCanvas.current) fabricApi.toggleVisibility(fabricCanvas.current);
  }, [fabricCanvas]);

  return {
    addText,
    addImage,
    addShape,
    applyFilter,
    align,
    updateTextStyle,
    exportCanvas,
    getJSON,
    getCanvas,
    deleteSelected,
    duplicateSelected,
    copySelected,
    bringToFront,
    bringForward,
    sendToBack,
    sendBackwards,
    toggleLock,
    toggleVisibility,
  };
};
