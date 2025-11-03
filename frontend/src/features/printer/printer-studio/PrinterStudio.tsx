// frontend/src/features/printer/pages/PrinterStudio.tsx
// ✅ ĐÃ SỬA LỖI DEADLOCK
import React from "react";
import { Loader2 } from "lucide-react";

// 1. Import Hook
import { usePrinterStudio } from "./usePrinterStudio";

// 2. Import Modules
import { EditorToolbar } from "@/features/editor/components/EditorToolbar";
import { PrinterStudioHeader } from "./PrinterStudioHeader";
import { PrinterStudioCanvas } from "./PrinterStudioCanvas";
import { PrinterStudioSidebar } from "./PrinterStudioSidebar";

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
    // Refs
    editorRef,
    // State
    baseProduct,
    phoiAssets,
    textureData,
    isLoading,
    is3DMainLoaded,
    // is2DReady, // ❌ XÓA
    selectedObject,
    layers,
    activeObjectId,
    productId,
    // Handlers
    handleImageUpload,
    handleSelectLayer,
    handleMoveLayer,
    handleToggleVisibility,
    handleDeleteLayer,
    handleCanvasUpdate,
    // handleDielineLoaded, // ❌ XÓA
    handlePropertiesUpdate,
    handleSaveAndExit,
    setIs3DMainLoaded,
    navigate,
    // Memos
    texturesForViewer,
    updateLayers,
  } = usePrinterStudio();

  // 4. Render (Loading)
  if (isLoading || !phoiAssets) {
    return <FullPageLoader />;
  }

  // 5. Render (Main Layout)
  return (
    <div className="flex h-screen bg-gray-100">
      {/* LEFT: TOOLBAR */}
      <EditorToolbar
        editorRef={editorRef}
        onImageUpload={handleImageUpload}
        layers={layers}
        activeObjectId={activeObjectId}
        onSelectLayer={handleSelectLayer}
        onMoveLayer={handleMoveLayer}
        onToggleVisibility={handleToggleVisibility}
        onDeleteLayer={handleDeleteLayer}
      />

      {/* CENTER: EDITOR */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <PrinterStudioHeader
          baseProduct={baseProduct}
          productId={productId}
          textureData={textureData}
          onSaveAndExit={handleSaveAndExit}
          onGoBack={() => {
            localStorage.removeItem("tempProductAssets");
            navigate("/printer/dashboard/products");
          }}
        />

        {/* Canvas */}
        <PrinterStudioCanvas
          editorRef={editorRef}
          phoiAssets={phoiAssets}
          onCanvasUpdate={handleCanvasUpdate}
          onObjectChange={updateLayers}
          // onDielineLoaded={handleDielineLoaded} // ❌ XÓA
          is3DMainLoaded={is3DMainLoaded}
          // onModelLoaded={() => setIs3DMainLoaded(true)} // ❌ XÓA
        />
      </div>

      {/* RIGHT: SIDEBAR */}
      <PrinterStudioSidebar
        selectedObject={selectedObject}
        onPropertiesUpdate={handlePropertiesUpdate}
        baseProduct={baseProduct}
        phoiAssets={phoiAssets}
        // is2DReady={is2DReady} // ❌ XÓA
        texturesForViewer={texturesForViewer}
        productId={productId}
        modelUrl={phoiAssets.modelUrl}
        onModelLoaded={() => setIs3DMainLoaded(true)} // ✅ THÊM: Gắn callback
      />
    </div>
  );
}
