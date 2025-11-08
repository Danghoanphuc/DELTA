// frontend/src/features/printer/printer-studio/PrinterStudio.tsx
// ✅ SỬA LỖI: Bổ sung 'activeToolbarTab' và 'setActiveToolbarTab' từ hook

import React, { useCallback, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import * as THREE from "three";
import { usePrinterStudio } from "./usePrinterStudio";
import ProductViewer3D from "@/features/editor/components/ProductViewer3D";
import { PrinterStudioHeader } from "./PrinterStudioHeader";
import { StudioLoadingSkeleton } from "@/features/editor/components/LoadingSkeleton";
import { InteractionResult } from "@/features/editor/hooks/use3DInteraction";
import { PrinterStudioToolbar } from "./PrinterStudioToolbar";
import { DecalList } from "@/features/editor/components/DecalList";
import { DecalItem, GroupItem } from "@/features/editor/types/decal.types";

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
  } = usePrinterStudio(); //

  // State image drop (Giữ nguyên)
  const [imageDropQueue, setImageDropQueue] = useState<{
    file: File;
    interactionResult: InteractionResult;
  } | null>(null);

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

  // Render (Loading)
  if (isLoading || !phoiAssets) {
    return <FullPageLoader />;
  }

  const filteredDecals = useMemo(() => {
    return decals.filter((decal) => decal.type === "decal") as DecalItem[];
  }, [decals]);

  // Render (Main Layout)
  return (
    <div className="flex h-screen w-full bg-gray-100 relative overflow-hidden">
      {/* 1. HEADER (Giữ nguyên) */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <PrinterStudioHeader
          baseProduct={baseProduct}
          productId={productId}
          onSaveAndExit={handleSaveAndExit}
          onGoBack={() => navigate("/printer/dashboard/products")}
        />
      </div>

      {/* 2. TOOLBAR BÊN TRÁI (Giữ nguyên) */}
      <div className="z-10 w-80 h-full pt-16">
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

      {/* 3. VÙNG 3D EDITOR (TRUNG TÂM) (Giữ nguyên) */}
      <div className="flex-1 h-full pt-16 relative">
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
        />
      </div>

      {/* 4. DECAL LIST (BÊN PHẢI) (Giữ nguyên) */}
      <div className="z-10 w-72 h-full pt-16">
        <DecalList
          items={decals}
          selectedItemIds={selectedDecalId ? [selectedDecalId] : []}
          onSelect={(id, isMultiSelect) => setSelectedDecalId(id)}
          onDelete={deleteDecal}
          onUpdate={updateDecal}
          onReorder={() => {
            console.warn("Reorder not implemented in PrinterStudio");
          }}
        />
      </div>
    </div>
  );
}
