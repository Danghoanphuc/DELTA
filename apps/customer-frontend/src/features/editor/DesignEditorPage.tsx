// features/editor/DesignEditorPage.tsx
// ✅ NÂNG CẤP: Sử dụng state `items` và `selectedItemIds`
// ✅ BẢN VÁ: Sửa lỗi `surfaceMapping` (lấp đầy useMemo)

import React, { useCallback, useMemo, useState } from "react";
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
import { formatPrice } from "@/features/printer/utils/formatters";
import EditorFooterToolbar from "./components/EditorFooterToolbar";
import { ContextualPropertyBar } from "./components/ContextualPropertyBar";
import { toast } from "sonner"; // ✅ Thêm toast

export function DesignEditorPage() {
  const navigate = useNavigate();

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
    selectedQuantity,
    setSelectedQuantity,
    minQuantity,
    currentPricePerUnit,
    handleSaveAndAddToCart,
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

  const handleImageFileRead = (file: File, imageUrl: string) => {
    if (imageDropQueue && imageDropQueue.file === file) {
      const dropData = { type: "image", imageUrl: imageUrl };
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
    if (
      window.confirm("Bạn có chắc muốn thoát? Mọi thay đổi chưa lưu sẽ bị mất.")
    ) {
      navigate(-1); // Quay lại trang trước đó
    }
  };

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
      <EditorFooterToolbar />
    </div>
  );
}
