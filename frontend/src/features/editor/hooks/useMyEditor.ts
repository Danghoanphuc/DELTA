// src/features/editor/hooks/useMyEditor.ts
import { useState, useRef, useCallback } from "react";
import { fabric } from "fabric";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { FabricCanvasEditorRef } from "../components/FabricCanvasEditor";

// Helper gán ID
const ensureObjectId = (obj: fabric.Object) => {
  if (!(obj as any).id) {
    (obj as any).id = uuidv4();
  }
};

export function useMyEditor() {
  const editorRef = useRef<FabricCanvasEditorRef>(null);
  const [textureData, setTextureData] = useState<string | null>(null);
  const [layers, setLayers] = useState<fabric.Object[]>([]);
  const [activeObjectId, setActiveObjectId] = useState<string | null>(null);

  // Cập nhật state của LayersPanel
  const updateLayers = useCallback(() => {
    const canvas = editorRef.current?.getCanvas();
    if (canvas) {
      const objects = canvas.getObjects();
      objects.forEach(ensureObjectId);
      setLayers([...objects]);

      const activeObj = canvas.getActiveObject();
      if (activeObj) {
        ensureObjectId(activeObj);
        setActiveObjectId((activeObj as any).id);
      } else {
        setActiveObjectId(null);
      }
    }
  }, []);

  // Callback từ canvas
  const handleCanvasUpdate = (base64DataUrl: string) => {
    setTextureData(base64DataUrl);
  };

  const handleImageUpload = (file: File) => {
    toast.success(`Đã tải ảnh lên: ${file.name}`);
  };

  // Handlers cho LayersPanel
  const handleSelectLayer = (obj: fabric.Object) => {
    const canvas = editorRef.current?.getCanvas();
    if (canvas) {
      canvas.setActiveObject(obj);
      canvas.renderAll();
      updateLayers();
    }
  };

  const handleMoveLayer = (
    obj: fabric.Object,
    direction: "up" | "down" | "top" | "bottom"
  ) => {
    const canvas = editorRef.current?.getCanvas();
    if (!canvas) return;
    switch (direction) {
      case "up":
        canvas.bringForward(obj);
        break;
      case "down":
        canvas.sendBackwards(obj);
        break;
      case "top":
        canvas.bringToFront(obj);
        break;
      case "bottom":
        canvas.sendToBack(obj);
        break;
    }
    canvas.renderAll();
    // updateLayers() sẽ được gọi bởi onObjectChange
  };

  const handleToggleVisibility = (obj: fabric.Object) => {
    obj.set("visible", !obj.visible);
    editorRef.current?.getCanvas()?.renderAll();
    updateLayers();
  };

  const handleDeleteLayer = (obj: fabric.Object) => {
    editorRef.current?.getCanvas()?.remove(obj);
    // updateLayers() sẽ được gọi bởi onObjectChange
  };

  return {
    editorRef,
    textureData,
    layers,
    activeObjectId,
    handleCanvasUpdate,
    handleImageUpload,
    updateLayers,
    handleSelectLayer,
    handleMoveLayer,
    handleToggleVisibility,
    handleDeleteLayer,
  };
}
