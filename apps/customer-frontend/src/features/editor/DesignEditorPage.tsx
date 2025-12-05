// features/editor/DesignEditorPage.tsx
// ✅ NÂNG CẤP: Sử dụng state `items` và `selectedItemIds`
// ✅ BẢN VÁ: Sửa lỗi `surfaceMapping` (lấp đầy useMemo)

import React, {
  useCallback,
  useMemo,
  useState,
  useRef,
  useEffect,
} from "react";
import { Button } from "@/shared/components/ui/button";
import { Layers, DollarSign, ArrowLeft } from "lucide-react";
import * as THREE from "three";
import { useNavigate } from "react-router-dom";
import { Card } from "@/shared/components/ui/card";
import { NativeScrollArea } from "@/shared/components/ui/NativeScrollArea";

import ProductViewer3D from "./components/ProductViewer3D";
import { EditorToolbar } from "./components/EditorToolbar";
import { DecalList } from "./components/DecalList";
import { useDesignEditor } from "./hooks/useDesignEditor";
import { StudioLoadingSkeleton } from "./components/LoadingSkeleton";
import { InteractionResult, SurfaceDefinition } from "./hooks/use3DInteraction";
import { LiveQuotePanel } from "@/features/shop/components/LiveQuotePanel";
import { formatCurrency as formatPrice } from "@/shared/utils/formatCurrency";
import EditorFooterToolbar from "./components/EditorFooterToolbar";
import { ContextualPropertyBar } from "./components/ContextualPropertyBar";
import { EditorErrorBoundary } from "./components/EditorErrorBoundary";
import { toast } from "@/shared/utils/toast"; // ✅ Thêm toast
import { CameraControlsHandle } from "./components/ProductViewer3D";
import { ExportDialog } from "./components/ExportDialog";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { useConfirmDialog } from "@/shared/hooks/useConfirmDialog";

function DesignEditorPageContent() {
  const navigate = useNavigate();
  const cameraControlsRef = useRef<CameraControlsHandle | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const confirmDialog = useConfirmDialog();

  // 1. Hook đã được cập nhật
  const {
    product,
    isLoading,
    isSaving,
    isModelLoaded,
    setIsModelLoaded,

    // State mới
    items,
    flatDecalItems,
    selectedItemIds,

    // Handlers mới
    handleSelectItem,
    deselectAll,
    addItem,
    deleteSelectedItems,
    updateItemProperties,
    handleGroupSelection,
    handleUngroupSelection,
    reorderItems,

    // State/Handlers cũ
    activeToolbarTab,
    setActiveToolbarTab,
    uploadedImages,
    handleToolbarImageUpload,
    gizmoMode,
    setGizmoMode,
    isSnapping,
    toolMode,
    setToolMode,
    selectedQuantity,
    setSelectedQuantity,
    minQuantity,
    currentPricePerUnit,
    handleSaveAndAddToCart,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useDesignEditor();

  // (imageDropQueue và các handler file/drop giữ nguyên,
  // nhưng gọi `addItem` thay vì `addDecal`)
  const [imageDropQueue, setImageDropQueue] = useState<{
    file: File;
    interactionResult: InteractionResult;
  } | null>(null);

  const handle3DDrop = useCallback(
    (dropData: any, interactionResult: InteractionResult) => {
      if (dropData.type === "imageFile") {
        setImageDropQueue({ file: dropData.file, interactionResult });
      } else {
        addItem("decal", dropData, interactionResult); // ✅ SỬA
      }
    },
    [addItem] // ✅ SỬA
  );

  const handleImageFileRead = (
    file: File,
    imageUrl: string,
    qualityStatus?: "good" | "warning" | "bad"
  ) => {
    if (imageDropQueue && imageDropQueue.file === file) {
      const dropData = { type: "image", imageUrl: imageUrl, qualityStatus };
      addItem("decal", dropData, imageDropQueue.interactionResult); // ✅ SỬA
      setImageDropQueue(null);
    } else {
      handleToolbarImageUpload(file);
    }
  };

  // ✅✅✅ SỬA LỖI TẠI ĐÂY ✅✅✅
  // (Lấp đầy logic cho useMemo)
  const surfaceMapping = useMemo((): SurfaceDefinition[] => {
    if (!product?.assets?.surfaces) return [];
    return product.assets.surfaces.map((s) => ({
      materialName: s.materialName,
      surfaceKey: s.surfaceKey,
      // Tạm thời, sau này sẽ lấy từ CSDL
      artboardSize: { width: 1024, height: 1024 },
    }));
  }, [product]); // ✅ Phụ thuộc vào product

  const handleExit = () => {
    confirmDialog.confirm(
      {
        title: "Thoát khỏi trình chỉnh sửa?",
        description: "Mọi thay đổi chưa lưu sẽ bị mất. Bạn có chắc muốn thoát?",
        confirmText: "Thoát",
        cancelText: "Ở lại",
        variant: "warning",
      },
      () => {
        navigate(-1); // Quay lại trang trước đó
      }
    );
  };

  // Camera controls handlers
  const handleZoomIn = useCallback(() => {
    cameraControlsRef.current?.zoomIn();
    // Update zoom level after a short delay
    setTimeout(() => {
      const level = cameraControlsRef.current?.getZoomLevel() || 100;
      setZoomLevel(level);
    }, 100);
  }, []);

  const handleZoomOut = useCallback(() => {
    cameraControlsRef.current?.zoomOut();
    // Update zoom level after a short delay
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
      toast.error("SVG export chưa được hỗ trợ cho 3D scene");
      return;
    }
    if (cameraControlsRef.current?.exportCanvas) {
      await cameraControlsRef.current.exportCanvas(format as "png" | "jpg");
    } else {
      toast.error("Không thể xuất file");
    }
  }, []);

  if (isLoading || !product) {
    return <StudioLoadingSkeleton />;
  }

  // === RENDER ===
  return (
    <div className="flex h-screen w-full bg-gray-100 relative overflow-hidden">
      {/* 1. VÙNG 3D (NỀN) */}
      <div className="absolute inset-0 z-0" onClick={deselectAll}>
        <ProductViewer3D
          modelUrl={product.assets.modelUrl!}
          onModelLoaded={() => setIsModelLoaded(true)}
          decals={flatDecalItems}
          surfaceMapping={surfaceMapping} // ✅ Đã có dữ liệu
          onDrop={handle3DDrop}
          selectedDecalId={
            selectedItemIds.length === 1 ? selectedItemIds[0] : null
          }
          onDecalSelect={handleSelectItem}
          onDecalUpdate={updateItemProperties} // ✅ Prop tên 'onDecalUpdate'
          gizmoMode={gizmoMode}
          isSnapping={isSnapping}
          cameraControlsRef={cameraControlsRef}
          toolMode={toolMode}
        />
      </div>

      {/* 2. HEADER (Nút Thoát) */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleExit}
        className="absolute top-4 left-4 z-30 bg-white/80 backdrop-blur-md shadow-lg"
      >
        <ArrowLeft size={20} />
      </Button>

      {/* 3. Thanh thuộc tính nổi (Header) */}
      <ContextualPropertyBar
        selectedItemIds={selectedItemIds}
        items={items}
        onItemUpdate={updateItemProperties}
        onGroup={handleGroupSelection}
        onUngroup={handleUngroupSelection}
        onDelete={deleteSelectedItems}
        gizmoMode={gizmoMode}
        onGizmoModeChange={setGizmoMode}
        isSnapping={isSnapping}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      {/* 4. PANEL TRÁI (Toolbar + Layers) */}
      <Card
        className="absolute left-4 top-20 bottom-24 z-10 w-80 flex flex-col overflow-hidden 
                   border-gray-200/50 shadow-2xl bg-white/95 backdrop-blur-md transition-all"
      >
        {/* 4.1 Toolbar (Giữ nguyên) */}
        <div className="flex-shrink-0">
          <EditorToolbar
            activeTab={activeToolbarTab}
            onTabChange={setActiveToolbarTab}
            uploadedImages={uploadedImages}
            onImageUpload={handleToolbarImageUpload}
            onImageFileRead={handleImageFileRead}
            imageDropQueue={imageDropQueue?.file || null}
          />
        </div>

        {/* 4.2 Layers */}
        <div className="flex-1 flex flex-col min-h-0 border-t border-gray-100">
          <div className="p-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between flex-shrink-0">
            <h3 className="font-semibold text-xs text-gray-500 uppercase flex items-center">
              <Layers size={14} className="mr-1.5" />
              Lớp ({items.length})
            </h3>
          </div>
          <DecalList
            items={items}
            selectedItemIds={selectedItemIds}
            onSelect={handleSelectItem}
            onDelete={deleteSelectedItems}
            onUpdate={updateItemProperties}
            onReorder={reorderItems}
          />
        </div>
      </Card>

      {/* 5. PANEL PHẢI (Báo giá) */}
      <Card
        className="absolute right-4 top-4 bottom-24 z-10 w-80 overflow-hidden
                   border-gray-200/50 shadow-2xl bg-white/95 backdrop-blur-md"
      >
        <NativeScrollArea className="flex-1">
          <div className="p-4">
            <LiveQuotePanel
              product={product}
              decals={flatDecalItems}
              basePrice={currentPricePerUnit}
              minQuantity={minQuantity}
              formatPrice={formatPrice}
              isSaving={isSaving}
              onSaveAndAddToCart={handleSaveAndAddToCart}
              selectedQuantity={selectedQuantity}
              onQuantityChange={setSelectedQuantity}
            />
          </div>
        </NativeScrollArea>
      </Card>

      {/* 6. FOOTER TOOLBAR */}
      {(() => {
        // Debug: Log để kiểm tra handlers
        console.log(
          "🔍 DesignEditorPage - Passing props to EditorFooterToolbar",
          {
            hasUndo: !!undo,
            hasRedo: !!redo,
            hasZoomIn: !!handleZoomIn,
            hasZoomOut: !!handleZoomOut,
            hasReset: !!handleResetCamera,
            hasToolModeChange: !!setToolMode,
            toolMode,
            zoomLevel,
          }
        );
        return null;
      })()}
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

      {/* 7. EXPORT DIALOG */}
      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        onExport={handleExport}
      />

      {/* 8. CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={confirmDialog.handleClose}
        onConfirm={confirmDialog.handleConfirm}
        title={confirmDialog.options.title}
        description={confirmDialog.options.description}
        confirmText={confirmDialog.options.confirmText}
        cancelText={confirmDialog.options.cancelText}
        variant={confirmDialog.options.variant}
      />
    </div>
  );
}

// ✅ Wrap với ErrorBoundary
export function DesignEditorPage() {
  return (
    <EditorErrorBoundary>
      <DesignEditorPageContent />
    </EditorErrorBoundary>
  );
}
