// frontend/src/features/printer/pages/PrinterStudioCanvas.tsx
// ✅ ĐÃ SỬA LỖI DEADLOCK
import React from "react";
// ❌ XÓA: Import 3D viewer, không cần nữa
// import ProductViewer3D from "@/features/editor/components/ProductViewer3D";
import { Loader2 } from "lucide-react";
import { DesignSurfaceEditor } from "@/features/editor/components/DesignSurfaceEditor";
import { DesignSurfaceEditorRef } from "@/features/editor/hooks/useDesignEditor";

// Skeleton
const CanvasWaitingSkeleton = () => (
  <div className="w-full h-full min-h-[600px] flex items-center justify-center bg-gray-50 shadow-inner rounded-lg">
    <div className="text-center space-y-3">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
      <p className="text-sm text-gray-600">Đang chờ phôi 3D tải xong...</p>
    </div>
  </div>
);

interface PrinterStudioCanvasProps {
  editorRef: React.RefObject<DesignSurfaceEditorRef>;
  phoiAssets: {
    modelUrl: string;
    dielineUrl: string;
    materialName: string;
  } | null;
  onCanvasUpdate: (materialKey: string, base64Image: string) => void;
  onObjectChange: () => void;
  // onDielineLoaded: () => void; // ❌ XÓA
  is3DMainLoaded: boolean;
  // onModelLoaded: () => void; // ❌ XÓA
}

export const PrinterStudioCanvas: React.FC<PrinterStudioCanvasProps> = ({
  editorRef,
  phoiAssets,
  onCanvasUpdate,
  onObjectChange,
  // onDielineLoaded, // ❌ XÓA
  is3DMainLoaded,
  // onModelLoaded, // ❌ XÓA
}) => {
  if (!phoiAssets) return <CanvasWaitingSkeleton />;

  return (
    <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
      <div className="w-full h-full max-w-4xl max-h-[800px] relative">
        {!is3DMainLoaded ? (
          <CanvasWaitingSkeleton />
        ) : (
          <div
            style={{
              width: "600px",
              height: "600px",
              margin: "0 auto",
            }}
          >
            <DesignSurfaceEditor
              ref={editorRef}
              materialKey={phoiAssets.materialName}
              dielineSvgUrl={phoiAssets.dielineUrl}
              onCanvasUpdate={onCanvasUpdate}
              onObjectChange={onObjectChange}
              width={600}
              height={600}
              isReadyToLoad={is3DMainLoaded} // <-- Chỉ cần prop này
              // onDielineLoaded={onDielineLoaded} // ❌ XÓA
            />
          </div>
        )}

        {/* ❌ XÓA: Loại bỏ 3D viewer ẩn gây lỗi */}
      </div>
    </div>
  );
};
