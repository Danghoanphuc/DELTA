// frontend/src/features/editor/DesignEditorPage.tsx
// ✅ PHIÊN BẢN CẢI TIẾN - Áp dụng chuẩn 2D-3D + LayersPanel

import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { DesignSurfaceEditor } from "./components/DesignSurfaceEditor";
import ProductViewer3D from "./components/ProductViewer3D";
import { EditorToolbar } from "./components/EditorToolbar";
import { LayersPanel } from "./components/LayersPanel";
import { useDesignEditor } from "./hooks/useDesignEditor";
import { CanvasLoadingSkeleton } from "./components/LoadingSkeleton";

// Skeleton
const EditorLoadingSkeleton = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gray-100">
    <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
    <p className="ml-4 text-gray-600">Đang tải dữ liệu sản phẩm...</p>
  </div>
);

export function DesignEditorPage() {
  const navigate = useNavigate();

  // ✅ SỬA: Sử dụng hook cải tiến
  const {
    product,
    activeSurfaceKey,
    setActiveSurfaceKey,
    textures,
    editorRefs,
    isLoading,
    isSaving,
    isModelLoaded,
    setIsModelLoaded,
    handleSurfaceUpdate,
    handleToolbarImageUpload,
    getActiveEditorRef,
    handleSaveAndAddToCart,
    // ✅ THÊM: Layers state & handlers
    layers,
    activeObjectId,
    updateLayers,
    handleSelectLayer,
    handleMoveLayer,
    handleToggleVisibility,
    handleDeleteLayer,
  } = useDesignEditor();

  // ✅ QUAN TRỌNG: Tạo textures object cho 3D Viewer
  // Chỉ chứa những textures đã có data
  const texturesFor3D = useMemo(() => {
    const result: Record<string, string> = {};
    for (const [materialName, textureData] of Object.entries(textures)) {
      if (textureData) {
        result[materialName] = textureData;
      }
    }
    console.log("[DesignEditorPage] Textures for 3D:", Object.keys(result));
    return result;
  }, [textures]);

  // ==================== RENDER ====================
  if (isLoading || !product) {
    return <EditorLoadingSkeleton />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* LEFT: TOOLBAR */}
      <EditorToolbar
        editorRef={{ current: getActiveEditorRef() }}
        onImageUpload={handleToolbarImageUpload}
      />

      {/* CENTER: MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-16 bg-white border-b flex items-center justify-between px-6 flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft />
          </Button>
          <h1 className="text-lg font-semibold">{product.name}</h1>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSaveAndAddToCart}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
            Lưu & Thêm vào giỏ
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* 2D Editor */}
          <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-auto bg-gray-200">
            <Tabs
              value={activeSurfaceKey || ""}
              onValueChange={setActiveSurfaceKey}
              className="w-full max-w-[600px] flex flex-col"
            >
              <TabsList className="mb-2">
                {product.assets.surfaces.map((surface) => (
                  <TabsTrigger key={surface.key} value={surface.key}>
                    {surface.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {product.assets.surfaces.map((surface) => (
                <TabsContent
                  key={surface.key}
                  value={surface.key}
                  className="m-0"
                  style={{ width: 600, height: 600 }}
                >
                  {!isModelLoaded ? (
                    <CanvasLoadingSkeleton />
                  ) : (
                    <DesignSurfaceEditor
                      ref={(el) => (editorRefs.current[surface.key] = el)}
                      materialKey={surface.materialName}
                      dielineSvgUrl={surface.dielineSvgUrl}
                      onCanvasUpdate={handleSurfaceUpdate}
                      onObjectChange={updateLayers}
                      width={600}
                      height={600}
                      isReadyToLoad={isModelLoaded}
                    />
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* 3D Viewer */}
          <div className="w-1/3 h-full bg-gray-100">
            <ProductViewer3D
              modelUrl={product.assets.modelUrl!}
              textures={texturesFor3D}
              onModelLoaded={() => setIsModelLoaded(true)}
            />
          </div>
        </div>
      </div>

      {/* RIGHT: LAYERS PANEL */}
      <LayersPanel
        className="w-72"
        layers={layers}
        activeObjectId={activeObjectId}
        onSelectLayer={handleSelectLayer}
        onMoveLayer={handleMoveLayer}
        onToggleVisibility={handleToggleVisibility}
        onDeleteLayer={handleDeleteLayer}
      />
    </div>
  );
}
