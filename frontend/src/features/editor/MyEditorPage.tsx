//  frontend/src/features/editor/MyEditorPage.tsx

import React, { useRef, useState } from "react";
import {
  FabricCanvasEditor,
  FabricCanvasEditorRef,
} from "./components/FabricCanvasEditor";
import { EditorToolbar } from "./components/EditorToolbar";
import { LayersPanel } from "./components/LayersPanel";
import { EditorErrorBoundary } from "./components/EditorErrorBoundary";
import { toast } from "sonner";

// Bạn cần một URL cho file dieline (khuôn) SVG của bạn
const SAMPLE_DIELINE_URL = "/dielines/sample_box.svg";

export function MyEditorPage() {
  // Ref này là "linh hồn" của editor, dùng để điều khiển canvas
  const editorRef = useRef<FabricCanvasEditorRef>(null);

  // State để nhận base64 data URL từ canvas (để update 3D view)
  const [textureData, setTextureData] = useState<string | null>(null);

  // Xử lý khi canvas có thay đổi (tạo texture mới)
  const handleCanvasUpdate = (base64DataUrl: string) => {
    setTextureData(base64DataUrl);
  };

  // Xử lý khi toolbar tải ảnh lên (truyền vào canvas)
  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      editorRef.current?.addImage(imageUrl);
      toast.success("Đã tải ảnh lên!");
    };
    reader.readAsDataURL(file);
  };

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
            dielineUrl={SAMPLE_DIELINE_URL}
            onCanvasUpdate={handleCanvasUpdate} // <-- Lấy texture cho 3D
            width={600}
            height={600}
          />
        </div>

        {/* 3. Thanh Layers bên phải (ví dụ) */}
        <LayersPanel editorRef={editorRef} className="w-72" />

        {/* TODO: Bạn có thể thêm ProductViewer3D ở đây
          và truyền `textureData` vào nó
        */}
      </div>
    </EditorErrorBoundary>
  );
}
