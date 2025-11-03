// frontend/src/features/printer/pages/PrinterStudioCanvas.tsx
// ✅ CẬP NHẬT: Xóa bỏ giới hạn, cho phép EditorCanvas chiếm 100%

import React from "react";
import { Loader2 } from "lucide-react";
import {
  EditorCanvas,
  EditorCanvasRef,
} from "@/features/editor/components/EditorCanvas";

// Skeleton (Giữ nguyên)
const CanvasWaitingSkeleton = () => (
  // ✅ Sửa: Xóa 'min-h-[600px]' và 'rounded-lg'
  <div className="w-full h-full flex items-center justify-center bg-gray-50 shadow-inner">
    <div className="text-center space-y-3">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
      <p className="text-sm text-gray-600">Đang chờ phôi 3D tải xong...</p>
    </div>
  </div>
);

interface PrinterStudioCanvasProps {
  editorRef: React.RefObject<EditorCanvasRef | null>;
  phoiAssets: {
    modelUrl: string;
    dielineUrl: string;
    materialName: string;
  } | null;
  onCanvasUpdate: (materialKey: string, base64Image: string) => void;
  onObjectChange: () => void;
  is3DMainLoaded: boolean;
}

export const PrinterStudioCanvas: React.FC<PrinterStudioCanvasProps> = ({
  editorRef,
  phoiAssets,
  onCanvasUpdate,
  onObjectChange,
  is3DMainLoaded,
}) => {
  if (!phoiAssets) return <CanvasWaitingSkeleton />;

  // ✅ 1. SỬA LỖI: Xóa 'p-8', 'items-center', 'justify-center'.
  // Div này giờ sẽ là container full-screen (flex-1)
  return (
    <div className="flex-1 overflow-auto">
      {/* ✅ 2. SỬA LỖI: Xóa div giới hạn 'max-w-4xl max-h-[800px]' */}
      {/* Div này sẽ là container 100% cho EditorCanvas */}
      <div className="w-full h-full relative">
        {!is3DMainLoaded ? (
          <CanvasWaitingSkeleton />
        ) : (
          // ✅ 3. EditorCanvas (full-screen) sẽ được render tại đây
          // (Nó đã có logic w-full h-full bên trong)
          <EditorCanvas
            ref={editorRef}
            materialKey={phoiAssets.materialName}
            dielineSvgUrl={phoiAssets.dielineUrl}
            onCanvasUpdate={onCanvasUpdate}
            onObjectChange={onObjectChange}
            isReadyToLoad={is3DMainLoaded}
          />
        )}
      </div>
    </div>
  );
};
