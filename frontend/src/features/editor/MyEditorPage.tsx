// frontend/src/features/editor/MyEditorPage.tsx (ĐÃ LÀM SẠCH)
import { FabricCanvasEditor } from "./components/FabricCanvasEditor";
import { EditorToolbar } from "./components/EditorToolbar";
import { LayersPanel } from "./components/LayersPanel";
import { EditorErrorBoundary } from "./components/EditorErrorBoundary";
import { useMyEditor } from "./hooks/useMyEditor"; // <-- Import hook

const SAMPLE_DIELINE_URL =
  "https://www.svgrepo.com/show/532921/rectangle-2.svg";

export function MyEditorPage() {
  // Toàn bộ logic được lấy từ hook
  const {
    editorRef,
    layers,
    activeObjectId,
    handleCanvasUpdate,
    handleImageUpload,
    updateLayers,
    handleSelectLayer,
    handleMoveLayer,
    handleToggleVisibility,
    handleDeleteLayer,
  } = useMyEditor();

  return (
    <EditorErrorBoundary>
      <div className="flex h-screen w-full bg-gray-100">
        {/* 1. Thanh công cụ bên trái */}
        <EditorToolbar
          editorRef={editorRef}
          onImageUpload={handleImageUpload}
        />

        {/* 2. Vùng canvas chính */}
        <div className="flex-1 flex items-center justify-center p-4">
          <FabricCanvasEditor
            ref={editorRef}
            dielineImageUrl={SAMPLE_DIELINE_URL}
            onCanvasUpdate={handleCanvasUpdate}
            onObjectChange={updateLayers} // <-- Kết nối với hook
            width={600}
            height={600}
          />
        </div>

        {/* 3. Thanh Layers bên phải */}
        <LayersPanel
          className="w-72"
          layers={layers}
          activeObjectId={activeObjectId}
          onSelectLayer={handleSelectLayer}
          onMoveLayer={handleMoveLayer}
          onToggleVisibility={handleToggleVisibility}
          onDeleteLayer={handleDeleteLayer}
        />

        {/* (Bạn có thể thêm 3D viewer và `textureData` ở đây) */}
      </div>
    </EditorErrorBoundary>
  );
}
