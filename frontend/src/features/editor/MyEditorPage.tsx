//  frontend/src/features/editor/MyEditorPage.tsx

import React, { useRef, useState, useCallback } from "react";
import { fabric } from "fabric"; // Import fabric
import {
  FabricCanvasEditor,
  FabricCanvasEditorRef,
} from "./components/FabricCanvasEditor";
import { EditorToolbar } from "./components/EditorToolbar";
import { LayersPanel } from "./components/LayersPanel";
import { EditorErrorBoundary } from "./components/EditorErrorBoundary";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid"; // Thêm uuid để tạo ID

// Bạn cần một URL cho file dieline (khuôn) SVG của bạn
const SAMPLE_DIELINE_URL =
  "https://www.svgrepo.com/show/532921/rectangle-2.svg";

// Hàm gán ID cho đối tượng (quan trọng cho React key và tracking)
const ensureObjectId = (obj: fabric.Object) => {
  if (!(obj as any).id) {
    (obj as any).id = uuidv4();
  }
};

export function MyEditorPage() {
  // Ref này là "linh hồn" của editor, dùng để điều khiển canvas
  const editorRef = useRef<FabricCanvasEditorRef>(null);

  // State để nhận base64 data URL từ canvas (để update 3D view)
  const [textureData, setTextureData] = useState<string | null>(null);

  // === THAY ĐỔI: State cho LayersPanel ===
  const [layers, setLayers] = useState<fabric.Object[]>([]);
  const [activeObjectId, setActiveObjectId] = useState<string | null>(null);

  // === THAY ĐỔI: Hàm cập nhật state cho layers ===
  const updateLayers = useCallback(() => {
    const canvas = editorRef.current?.getCanvas();
    if (canvas) {
      const objects = canvas.getObjects();
      objects.forEach(ensureObjectId); // Đảm bảo mọi đối tượng đều có ID
      setLayers([...objects]); // Tạo mảng mới để React re-render

      const activeObj = canvas.getActiveObject();
      if (activeObj) {
        ensureObjectId(activeObj); // Đảm bảo đối tượng được chọn cũng có ID
        setActiveObjectId((activeObj as any).id);
      } else {
        setActiveObjectId(null);
      }
    }
  }, []);
  // ==========================================

  // Xử lý khi canvas có thay đổi (tạo texture mới)
  const handleCanvasUpdate = (base64DataUrl: string) => {
    setTextureData(base64DataUrl);
  };

  // Xử lý khi toolbar tải ảnh lên (truyền vào canvas)
  const handleImageUpload = (file: File) => {
    // EditorToolbar đã tự thêm ảnh, chỉ cần log hoặc toast
    toast.success("Đã tải ảnh lên!");
  };

  // ==================== THAY ĐỔI: Layer Panel Handlers ====================
  const handleSelectLayer = (obj: fabric.Object) => {
    const canvas = editorRef.current?.getCanvas();
    if (canvas) {
      canvas.setActiveObject(obj);
      canvas.renderAll();
      updateLayers(); // Cập nhật trạng thái active
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
    // Không cần gọi updateLayers() ở đây vì event 'object:modified'
    // trong FabricCanvasEditor sẽ tự động gọi nó.
  };

  const handleToggleVisibility = (obj: fabric.Object) => {
    obj.set("visible", !obj.visible);
    editorRef.current?.getCanvas()?.renderAll();
    updateLayers(); // Cập nhật UI của layer
  };

  const handleDeleteLayer = (obj: fabric.Object) => {
    editorRef.current?.getCanvas()?.remove(obj);
    // Không cần gọi updateLayers() ở đây vì event 'object:removed'
    // trong FabricCanvasEditor sẽ tự động gọi nó.
  };
  // ===================================================================

  return (
    // Bọc tất cả bằng Error Boundary xịn của bạn
    <EditorErrorBoundary>
      <div className="flex h-screen w-full bg-gray-100">
        {/* 1. Thanh công cụ bên trái */}
        <EditorToolbar
          editorRef={editorRef}
          onImageUpload={handleImageUpload}
        />

        {/* 2. Vùng canvas chính */}
        <div className="flex-1 flex items-center justify-center p-4">
          <FabricCanvasEditor
            ref={editorRef} // <-- Gắn ref điều khiển
            dielineImageUrl={SAMPLE_DIELINE_URL} // <-- SỬA TÊN PROP
            onCanvasUpdate={handleCanvasUpdate} // <-- Lấy texture cho 3D
            onObjectChange={updateLayers} // <-- THÊM PROP: Kết nối với LayersPanel
            width={600}
            height={600}
          />
        </div>

        {/* 3. Thanh Layers bên phải (ví dụ) */}
        <LayersPanel
          className="w-72"
          layers={layers}
          activeObjectId={activeObjectId}
          onSelectLayer={handleSelectLayer}
          onMoveLayer={handleMoveLayer}
          onToggleVisibility={handleToggleVisibility}
          onDeleteLayer={handleDeleteLayer}
        />

        {/* TODO: Bạn có thể thêm ProductViewer3D ở đây
          và truyền `textureData` vào nó
        */}
      </div>
    </EditorErrorBoundary>
  );
}
