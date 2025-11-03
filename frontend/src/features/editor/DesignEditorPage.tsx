// src/features/editor/DesignEditorPage.tsx (ĐÃ LÀM SẠCH)
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { FabricCanvasEditor } from "./components/FabricCanvasEditor";
import ProductViewer3D from "./components/ProductViewer3D";
import { EditorToolbar } from "./components/EditorToolbar";
import { useDesignEditor } from "./hooks/useDesignEditor"; // <-- Import hook
import { CanvasLoadingSkeleton } from "./components/LoadingSkeleton"; // Giả sử bạn có

// Skeleton
const EditorLoadingSkeleton = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gray-100">
    <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
    <p className="ml-4 text-gray-600">Đang tải dữ liệu sản phẩm...</p>
  </div>
);

export function DesignEditorPage() {
  const navigate = useNavigate();

  // Toàn bộ logic được lấy từ hook
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
  } = useDesignEditor();

  // ==================== RENDER ====================
  if (isLoading || !product) {
    return <EditorLoadingSkeleton />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <EditorToolbar
        editorRef={{ current: getActiveEditorRef() }}
        onImageUpload={handleToolbarImageUpload}
      />

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
                    <FabricCanvasEditor
                      ref={(el) => (editorRefs.current[surface.key] = el)}
                      // @ts-ignore - Sửa logic handleSurfaceUpdate trong hook nếu cần
                      onCanvasUpdate={(dataUrl) =>
                        handleSurfaceUpdate(surface.materialName, dataUrl)
                      }
                      dielineImageUrl={surface.dielineSvgUrl}
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
          <div className="w-full h-full bg-gray-100">
            <ProductViewer3D
              modelUrl={product.assets.modelUrl!}
              textures={textures}
              onModelLoaded={() => setIsModelLoaded(true)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
