// frontend/src/features/printer/printer-studio/PrinterStudio.tsx
// ✅ PATCH 3: SỬA PROP NAME VÀ LOẠI BỎ texturesForViewer

import React from "react";
import { Loader2, Save, GripVertical } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Rnd } from "react-rnd";

// 1. Import Hook
import { usePrinterStudio } from "./usePrinterStudio";

// 2. Import Modules
import { EditorToolbar } from "@/features/editor/components/EditorToolbar";
import { PrinterStudioCanvas } from "./PrinterStudioCanvas";
import { PrinterStudioSidebar } from "./PrinterStudioSidebar";
import ProductViewer3D from "@/features/editor/components/ProductViewer3D";

// Loading Skeleton
const FullPageLoader = () => (
  <div className="flex h-screen items-center justify-center bg-gray-50">
    <div className="text-center">
      <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
      <p className="text-gray-600">Đang tải Studio và dữ liệu Phôi...</p>
    </div>
  </div>
);

export function PrinterStudio() {
  // 3. Sử dụng "bộ não"
  const {
    editorRef,
    baseProduct,
    phoiAssets,
    isLoading,
    is3DMainLoaded,
    selectedObject,
    layers,
    activeObjectId,
    productId,
    handleImageUpload,
    handleSelectLayer,
    handleMoveLayer,
    handleToggleVisibility,
    handleDeleteLayer,
    handleCanvasUpdate,
    handlePropertiesUpdate,
    handleSaveAndExit,
    setIs3DMainLoaded,
    navigate,
    textures, // ✅ FIX: Lấy canvasElements thay vì texturesForViewer
    updateLayers,
  } = usePrinterStudio();

  // 4. Render (Loading)
  if (isLoading || !phoiAssets) {
    return <FullPageLoader />;
  }

  // 5. Render (Main Layout)
  return (
    <div className="flex h-screen bg-gray-100 relative overflow-hidden">
      {/* CENTER: EDITOR */}
      <div className="w-full flex flex-col">
        <PrinterStudioCanvas
          editorRef={editorRef}
          phoiAssets={phoiAssets}
          onCanvasUpdate={handleCanvasUpdate}
          onObjectChange={updateLayers}
          is3DMainLoaded={is3DMainLoaded}
        />
      </div>

      {/* TOOLBAR NỔI */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-60 h-[700px]">
        <EditorToolbar
          editorRef={editorRef}
          onImageUpload={handleImageUpload}
          layers={layers}
          activeObjectId={activeObjectId}
          onSelectLayer={handleSelectLayer}
          onMoveLayer={handleMoveLayer}
          onToggleVisibility={handleToggleVisibility}
          onDeleteLayer={handleDeleteLayer}
          selectedObject={selectedObject}
          onPropertiesUpdate={handlePropertiesUpdate}
        />
      </div>

      {/* SIDEBAR NỔI */}
      <div className="absolute right-0 top-0 h-full z-10 w-96">
        <PrinterStudioSidebar
          selectedObject={selectedObject}
          onPropertiesUpdate={handlePropertiesUpdate}
          baseProduct={baseProduct}
          phoiAssets={phoiAssets}
          productId={productId}
          modelUrl={phoiAssets.modelUrl}
          onModelLoaded={() => setIs3DMainLoaded(true)}
        />
      </div>

      {/* NÚT SAVE NỔI */}
      <div className="absolute bottom-4 right-4 z-20">
        <Button
          type="button"
          onClick={handleSaveAndExit}
          className="bg-orange-500 hover:bg-orange-600"
        >
          <Save size={18} className="mr-2" />
          Lưu & Tiếp tục
        </Button>
      </div>

      {/* POPUP 3D PREVIEW */}
      <Rnd
        default={{
          x: window.innerWidth - 400,
          y: 100,
          width: 350,
          height: 400,
        }}
        minWidth={250}
        minHeight={300}
        bounds="parent"
        className="bg-white rounded-lg shadow-xl overflow-hidden z-30"
        cancel=".no-drag"
      >
        <div className="w-full h-full flex flex-col">
          <div className="h-10 bg-gray-100 flex items-center justify-between px-3 cursor-move">
            <span className="text-sm font-semibold">
              Xem trước 3D (Real-time)
            </span>
            <GripVertical className="text-gray-400" size={18} />
          </div>
          <div className="flex-1 no-drag">
            {/* ✅ FIX: Đổi prop name từ "textures" sang "canvasElements" */}
            <ProductViewer3D
              modelUrl={phoiAssets.modelUrl}
              textures={textures}
              onModelLoaded={() => setIs3DMainLoaded(true)}
            />
          </div>
        </div>
      </Rnd>
    </div>
  );
}
