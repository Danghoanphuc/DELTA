// editor/DesignEditorPage.tsx
// ✅ SỬA LỖI GỐC:
// Đã sử dụng hàm `handleModelLoaded` (đã được bọc `useCallback`)
// và truyền nó vào `onModelLoaded` của `ProductViewer3D`.

import React, { useMemo, useCallback } from "react"; // <-- Đã import useCallback
import { Button } from "@/shared/components/ui/button";
import { Save, Loader2, GripVertical, Download } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import * as THREE from "three";

import { EditorCanvas } from "./components/EditorCanvas";
import ProductViewer3D from "./components/ProductViewer3D";
import { EditorToolbar } from "./components/EditorToolbar";
import { useDesignEditor } from "./hooks/useDesignEditor";
import { CanvasLoadingSkeleton } from "./components/LoadingSkeleton";
import { Rnd } from "react-rnd";

import { PropertiesPanel } from "./components/PropertiesPanel";
import { ExportDialog } from "./components/ExportDialog";

// Skeleton (giữ nguyên)
const EditorLoadingSkeleton = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gray-100">
    <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
    <p className="ml-4 text-gray-600">Đang tải dữ liệu sản phẩm...</p>
  </div>
);

export function DesignEditorPage() {
  const {
    product,
    activeSurfaceKey,
    setActiveSurfaceKey,
    textures,
    editorRefs,
    isLoading,
    isSaving,
    isModelLoaded,
    setIsModelLoaded, // <-- Lấy hàm setState
    handleSurfaceUpdate,
    handleToolbarImageUpload,
    getActiveEditorRef,
    handleSaveAndAddToCart,
    layers,
    activeObjectId,
    updateLayers,
    handleSelectLayer,
    handleMoveLayer,
    handleToggleVisibility,
    handleDeleteLayer,
    selectedObject,
    isExportDialogOpen,
    setIsExportDialogOpen,
  } = useDesignEditor();

  // Ổn định (stabilize) hàm callback
  const handleModelLoaded = useCallback(() => {
    setIsModelLoaded(true);
  }, [setIsModelLoaded]); // Phụ thuộc vào `setIsModelLoaded` (đã ổn định)

  // useMemo cho textures (giữ nguyên)
  const texturesFor3D = useMemo(() => {
    const result: Record<string, THREE.CanvasTexture> = {};
    for (const [materialName, textureData] of Object.entries(textures)) {
      if (textureData) {
        result[materialName] = textureData;
      }
    }
    return result;
  }, [textures]);

  if (isLoading || !product) {
    return <EditorLoadingSkeleton />;
  }

  // Bố cục (giữ nguyên)
  return (
    <div className="flex h-screen bg-gray-100 relative overflow-hidden">
      {/* (Toàn bộ các panel, button... giữ nguyên) */}
      <div className="absolute top-4 left-4 z-20 w-80 bg-white rounded-lg shadow-xl">
        <EditorToolbar
          editorRef={{ current: getActiveEditorRef() }}
          onImageUpload={handleToolbarImageUpload}
          layers={layers}
          activeObjectId={activeObjectId}
          onSelectLayer={handleSelectLayer}
          onMoveLayer={handleMoveLayer}
          onToggleVisibility={handleToggleVisibility}
          onDeleteLayer={handleDeleteLayer}
          selectedObject={selectedObject}
          onPropertiesUpdate={updateLayers}
        />
      </div>
      <div className="absolute top-4 right-4 z-20 w-72">
        <PropertiesPanel
          selectedObject={selectedObject}
          editorRef={{ current: getActiveEditorRef() }}
          onUpdate={updateLayers}
        />
      </div>
      <div className="absolute top-4 left-[21rem] z-20 bg-white p-3 rounded-lg shadow-xl">
        <h3 className="text-sm font-semibold">Upload & Design</h3>
        <p className="text-xs text-gray-600">{product.name}</p>
      </div>
      <div className="absolute bottom-4 right-4 z-20 flex gap-2">
        <Button
          variant="outline"
          className="bg-white"
          onClick={() => setIsExportDialogOpen(true)}
        >
          <Download size={16} className="mr-2" />
          Export
        </Button>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={handleSaveAndAddToCart}
          disabled={isSaving}
        >
          {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
          Lưu & Tiếp tục
        </Button>
      </div>

      {/* Vùng 2D Editor (giữ nguyên) */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-auto">
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
                <EditorCanvas
                  ref={(el) => {
                    editorRefs.current[surface.key] = el;
                  }}
                  materialKey={surface.materialName}
                  dielineSvgUrl={surface.dielineSvgUrl}
                  onCanvasUpdate={handleSurfaceUpdate}
                  onObjectChange={updateLayers}
                  isReadyToLoad={isModelLoaded}
                />
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* 5. Preview 3D (Floating Popup) */}
      <Rnd
        default={{ x: window.innerWidth - 680, y: 20, width: 350, height: 400 }}
        minWidth={250}
        minHeight={300}
        bounds="parent"
        className="bg-white rounded-lg shadow-xl overflow-hidden"
      >
        <div className="w-full h-full flex flex-col">
          <div className="h-10 bg-gray-100 flex items-center justify-between px-3 cursor-move">
            <span className="text-sm font-semibold">Package Color</span>
            <GripVertical className="text-gray-400" size={18} />
          </div>
          <div className="p-3 border-b text-center">
            <p className="text-xs text-gray-400">(Các nút chọn màu ở đây)</p>
          </div>
          <div className="flex-1">
            {/* ✅ SỬA LỖI TẠI ĐÂY:
                Truyền hàm `handleModelLoaded` đã được ổn định,
                thay vì hàm ẩn danh `() => setIsModelLoaded(true)`
            */}
            <ProductViewer3D
              modelUrl={product.assets.modelUrl!}
              textures={texturesFor3D}
              onModelLoaded={handleModelLoaded}
            />
          </div>
        </div>
      </Rnd>

      {/* 6. Dialog xuất file (giữ nguyên) */}
      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        editorRef={{ current: getActiveEditorRef() }}
      />
    </div>
  );
}
