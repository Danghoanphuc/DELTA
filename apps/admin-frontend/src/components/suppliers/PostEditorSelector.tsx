// apps/admin-frontend/src/components/suppliers/PostEditorSelector.tsx
// Selector component to choose between Rich Text and Artisan Block editor

import { useState } from "react";
import { CreatePostModal } from "./CreatePostModal";
import { CreateArtisanPostModal } from "./CreateArtisanPostModal";
import { FileText, Layers, X } from "lucide-react";

interface PostEditorSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  supplierInfo?: {
    name: string;
    email?: string;
    type?:
      | "manufacturer"
      | "distributor"
      | "printer"
      | "dropshipper"
      | "artisan";
  };
  // If provided, skip selector and use this mode directly
  defaultMode?: "richtext" | "artisan";
}

type EditorMode = "richtext" | "artisan" | null;

export function PostEditorSelector({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  supplierInfo,
  defaultMode,
}: PostEditorSelectorProps) {
  // If editing existing post, determine mode from data
  const getInitialMode = (): EditorMode => {
    if (defaultMode) return defaultMode;
    if (initialData?.blocks?.length > 0) return "artisan";
    if (initialData?.content) return "richtext";
    return null; // Show selector
  };

  const [selectedMode, setSelectedMode] = useState<EditorMode>(
    getInitialMode()
  );

  const handleClose = () => {
    setSelectedMode(getInitialMode());
    onClose();
  };

  if (!isOpen) return null;

  // Show mode selector if no mode selected
  if (selectedMode === null) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in zoom-in-95 duration-300">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Chọn kiểu soạn thảo
            </h2>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Options */}
          <div className="p-6 space-y-4">
            {/* Rich Text Option */}
            <button
              onClick={() => setSelectedMode("richtext")}
              className="w-full p-5 border-2 border-gray-200 rounded-xl hover:border-orange-400 hover:bg-orange-50/50 transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Rich Text Editor
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Soạn thảo tự do như Word. Phù hợp cho bài viết dài, blog
                    thông thường.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                      Tự do format
                    </span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                      Chèn ảnh inline
                    </span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                      HTML output
                    </span>
                  </div>
                </div>
              </div>
            </button>

            {/* Artisan Block Option */}
            <button
              onClick={() => setSelectedMode("artisan")}
              className="w-full p-5 border-2 border-gray-200 rounded-xl hover:border-orange-400 hover:bg-orange-50/50 transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                  <Layers className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">
                      Artisan Block
                    </h3>
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded uppercase">
                      Mới
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Lắp ghép từ các khối nội dung. Phù hợp cho bài review sản
                    phẩm, showcase nghệ nhân.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-600 text-xs rounded">
                      Ảnh Macro
                    </span>
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-600 text-xs rounded">
                      Audio
                    </span>
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-600 text-xs rounded">
                      Video Loop
                    </span>
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-600 text-xs rounded">
                      Bảng so sánh
                    </span>
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-xs rounded">
                      Góc Giám Tuyển
                    </span>
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Footer hint */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              💡 Bạn có thể đổi kiểu soạn thảo cho bài viết mới. Bài đã tạo sẽ
              giữ nguyên format.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render selected editor
  if (selectedMode === "artisan") {
    return (
      <CreateArtisanPostModal
        isOpen={isOpen}
        onClose={handleClose}
        onSubmit={onSubmit}
        initialData={initialData}
        supplierInfo={supplierInfo}
      />
    );
  }

  return (
    <CreatePostModal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={onSubmit}
      initialData={initialData}
      supplierInfo={supplierInfo}
    />
  );
}
