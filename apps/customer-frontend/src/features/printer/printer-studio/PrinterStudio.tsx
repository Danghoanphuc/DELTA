// frontend/src/features/printer/printer-studio/PrinterStudio.tsx
// ✅ SỬA LỖI: Bổ sung 'activeToolbarTab' và 'setActiveToolbarTab' từ hook

import React, { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import * as THREE from "three";
import { usePrinterStudio } from "./usePrinterStudio";
import ProductViewer3D, { CameraControlsHandle } from "@/features/editor/components/ProductViewer3D";
import { PrinterStudioHeader } from "./PrinterStudioHeader";
import { StudioLoadingSkeleton } from "@/features/editor/components/LoadingSkeleton";
import { InteractionResult } from "@/features/editor/hooks/use3DInteraction";
import { PrinterStudioToolbar } from "./PrinterStudioToolbar";
import { DecalList } from "@/features/editor/components/DecalList";
import { DecalItem, GroupItem } from "@/features/editor/types/decal.types";
import EditorFooterToolbar from "@/features/editor/components/EditorFooterToolbar";
import { ExportDialog } from "@/features/editor/components/ExportDialog";
import { Card } from "@/shared/components/ui/card";
import { Layers } from "lucide-react";

// (Loading Skeleton giữ nguyên)
const FullPageLoader = () => (
  <div className="flex h-screen items-center justify-center bg-gray-50">
    <div className="text-center">
      <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
      <p className="text-gray-600">Đang tải Studio và dữ liệu Phôi...</p>
    </div>
  </div>
);

export function PrinterStudio() {
  // Camera controls ref
  const cameraControlsRef = useRef<CameraControlsHandle | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [toolMode, setToolMode] = useState<"select" | "pan">("select");
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  // Lấy TẤT CẢ state/handler từ hook
  const {
    baseProduct,
    phoiAssets,
    isLoading,
    is3DMainLoaded,
    productId,
    handleSaveAndExit,
    setIs3DMainLoaded,
    navigate,
    decals,
    addDecal,
    deleteDecal,
    updateDecal,
    reorderDecals, // ✅ THÊM: Lấy reorderDecals từ hook

    // ✅ SỬA LỖI: Bổ sung 2 state còn thiếu
    activeToolbarTab,
    setActiveToolbarTab,

    selectedDecalId,
    setSelectedDecalId,
    uploadedImages,
    handleToolbarImageUpload,
    gizmoMode,
    setGizmoMode,
    isSnapping,
    undo,
    redo,
    canUndo,
    canRedo,
  } = usePrinterStudio(); //

  // State image drop (Giữ nguyên)
  const [imageDropQueue, setImageDropQueue] = useState<{
    file: File;
    interactionResult: InteractionResult;
  } | null>(null);

  // Camera controls handlers
  const handleZoomIn = useCallback(() => {
    cameraControlsRef.current?.zoomIn();
    setTimeout(() => {
      const level = cameraControlsRef.current?.getZoomLevel() || 100;
      setZoomLevel(level);
    }, 100);
  }, []);

  const handleZoomOut = useCallback(() => {
    cameraControlsRef.current?.zoomOut();
    setTimeout(() => {
      const level = cameraControlsRef.current?.getZoomLevel() || 100;
      setZoomLevel(level);
    }, 100);
  }, []);

  const handleResetCamera = useCallback(() => {
    cameraControlsRef.current?.reset();
    setZoomLevel(100);
  }, []);

  // Update zoom level periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (cameraControlsRef.current) {
        const level = cameraControlsRef.current.getZoomLevel();
        setZoomLevel(level);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Export handler
  const handleExport = useCallback(async (format: "png" | "jpg" | "svg") => {
    if (format === "svg") {
      // toast.error("SVG export chưa được hỗ trợ cho 3D scene");
      return;
    }
    if (cameraControlsRef.current?.exportCanvas) {
      await cameraControlsRef.current.exportCanvas(format as "png" | "jpg");
    } else {
      // toast.error("Không thể xuất file");
    }
  }, []);

  /**
   * Xử lý khi có drop 3D (Giữ nguyên)
   */
  const handle3DDrop = useCallback(
    (dropData: any, interactionResult: InteractionResult) => {
      if (dropData.type === "imageFile") {
        setImageDropQueue({ file: dropData.file, interactionResult });
      } else {
        addDecal(dropData, interactionResult);
      }
    },
    [addDecal]
  );

  /**
   * Xử lý khi file đã được đọc (Sửa lỗi "mất ảnh")
   */
  const handleImageFileRead = (file: File, imageUrl: string) => {
    if (imageDropQueue && imageDropQueue.file === file) {
      // Tình huống 1: Kéo từ Desktop -> Thả vào 3D
      const dropData = { type: "image", imageUrl: imageUrl };
      addDecal(dropData, imageDropQueue.interactionResult);
      handleToolbarImageUpload(file); // Thêm vào toolbar
      setImageDropQueue(null);
    } else {
      // Tình huống 2: Upload từ nút/dropzone của Toolbar
      handleToolbarImageUpload(file);
    }
  }; //

  // Lấy surfaceMapping (Giữ nguyên)
  const surfaceMapping = useMemo(() => {
    if (!phoiAssets) return [];
    return [
      {
        materialName: phoiAssets.materialName,
        surfaceKey: phoiAssets.surfaceKey,
        artboardSize: { width: 100, height: 100 },
      },
    ];
  }, [phoiAssets]); //

  // ✅ SỬA: Di chuyển useMemo lên trước early return để tuân thủ Rules of Hooks
  const filteredDecals = useMemo(() => {
    return decals.filter((decal) => decal.type === "decal") as DecalItem[];
  }, [decals]);

  // Render (Loading) - Phải đặt SAU tất cả hooks
  if (isLoading || !phoiAssets) {
    return <FullPageLoader />;
  }

  // Render (Main Layout)
  return (
    <div className="flex h-screen w-full bg-gray-100 relative overflow-hidden">
      {/* 1. HEADER (Giữ nguyên) */}
      <div className="absolute top-0 left-0 right-0 z-20 h-16">
        <PrinterStudioHeader
          baseProduct={baseProduct}
          productId={productId}
          onSaveAndExit={handleSaveAndExit}
          onGoBack={() => navigate("/printer/dashboard?tab=products")}
        />
      </div>

      {/* 2. TOOLBAR BÊN TRÁI (Sửa layout để không bị che bởi footer) */}
      <div className="absolute left-0 top-16 bottom-24 z-10 w-80">
        <PrinterStudioToolbar
          activeTab={activeToolbarTab} // ✅ Biến 'activeTab' giờ đã tồn tại
          onTabChange={setActiveToolbarTab} // ✅ 'setActiveToolbarTab' giờ đã tồn tại
          uploadedImages={uploadedImages}
          onImageUpload={handleToolbarImageUpload}
          onImageFileRead={handleImageFileRead}
          imageDropQueue={imageDropQueue?.file || null}
          decals={decals}
          selectedDecalId={selectedDecalId}
          onDecalUpdate={updateDecal}
          gizmoMode={gizmoMode}
          onGizmoModeChange={setGizmoMode}
          isSnapping={isSnapping}
        />
      </div>

      {/* 3. VÙNG 3D EDITOR (TRUNG TÂM) (Sửa layout để không bị che bởi footer) */}
      <div className="absolute left-80 right-72 top-16 bottom-24 z-0">
        <ProductViewer3D
          modelUrl={phoiAssets.modelUrl}
          decals={filteredDecals}
          surfaceMapping={surfaceMapping}
          onDrop={handle3DDrop}
          selectedDecalId={selectedDecalId}
          onDecalSelect={setSelectedDecalId}
          onDecalUpdate={updateDecal}
          gizmoMode={gizmoMode}
          isSnapping={isSnapping}
          cameraControlsRef={cameraControlsRef}
          toolMode={toolMode}
        />
      </div>

      {/* 4. DECAL LIST (BÊN PHẢI) - Panel quản lý Layers */}
      <Card className="absolute right-4 top-20 bottom-24 z-10 w-72 flex flex-col overflow-hidden border-gray-200/50 shadow-2xl bg-white/95 backdrop-blur-md">
        {/* Header "Lớp" */}
        <div className="p-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between flex-shrink-0">
          <h3 className="font-semibold text-xs text-gray-500 uppercase flex items-center">
            <Layers size={14} className="mr-1.5" />
            Lớp ({decals.length})
          </h3>
        </div>
        
        {/* DecalList với scroll */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <DecalList
            items={decals}
            selectedItemIds={selectedDecalId ? [selectedDecalId] : []}
            onSelect={(id, isMultiSelect) => setSelectedDecalId(id)}
            onDelete={deleteDecal}
            onUpdate={updateDecal}
            onReorder={reorderDecals} // ✅ SỬA: Sử dụng reorderDecals thực sự
          />
        </div>
      </Card>

      {/* 5. FOOTER TOOLBAR (Thanh công cụ ở dưới) */}
      <EditorFooterToolbar
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetCamera={handleResetCamera}
        zoomLevel={zoomLevel}
        toolMode={toolMode}
        onToolModeChange={setToolMode}
        onExport={() => setIsExportDialogOpen(true)}
      />

      {/* 6. EXPORT DIALOG */}
      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        onExport={handleExport}
      />
    </div>
  );
}
