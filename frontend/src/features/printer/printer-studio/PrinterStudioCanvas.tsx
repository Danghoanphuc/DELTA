// frontend/src/features/printer/printer-studio/PrinterStudioCanvas.tsx
// ✅ BẢN FULL 100%: Bọc React.memo để chặn vòng lặp

import React, { memo } from "react"; // ✅ THÊM 'memo'
import { Loader2 } from "lucide-react";
import {
  EditorCanvas,
  EditorCanvasRef,
} from "@/features/editor/components/EditorCanvas";

// Skeleton
const CanvasWaitingSkeleton = () => (
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
    dielineUrl: string; // ✅ (Fix) Đổi tên từ dielineSvgUrl
    materialName: string;
  } | null;
  // ✅ (Fix) Đổi từ base64Image sang canvasElement
  onCanvasUpdate: (
    materialKey: string,
    canvasElement: HTMLCanvasElement
  ) => void;
  onObjectChange: () => void;
  is3DMainLoaded: boolean;
}

// ==================================================
// ✅✅✅ SỬA LỖI VÒNG LẶP (Context Lost) ✅✅✅
// ==================================================
// Bọc component trong React.memo
// Nó sẽ KHÔNG re-render trừ khi props (phoiAssets, v.v.)
// thực sự thay đổi, phá vỡ vòng lặp.
export const PrinterStudioCanvas: React.FC<PrinterStudioCanvasProps> = memo(
  ({
    editorRef,
    phoiAssets,
    onCanvasUpdate,
    onObjectChange,
    is3DMainLoaded,
  }) => {
    if (!phoiAssets) return <CanvasWaitingSkeleton />;

    return (
      <div className="flex-1 overflow-auto">
        <div className="w-full h-full relative">
          {!is3DMainLoaded ? (
            <CanvasWaitingSkeleton />
          ) : (
            <EditorCanvas
              ref={editorRef}
              materialKey={phoiAssets.materialName}
              dielineSvgUrl={phoiAssets.dielineUrl} // ✅ (Fix) Dùng dielineUrl
              onCanvasUpdate={onCanvasUpdate} // ✅ Prop đã ổn định
              onObjectChange={onObjectChange} // ✅ Prop đã ổnle
              // ✅ Gỡ bỏ prop isReadyToLoad (từ Điểm nghẽn 3)
            />
          )}
        </div>
      </div>
    );
  }
);

PrinterStudioCanvas.displayName = "PrinterStudioCanvas";
