// apps/admin-frontend/src/components/suppliers/artisan-blocks/ArtifactBlockEditor.tsx
// Artifact Block - Contextual Product Display (B2B focused)

import { useRef, useState } from "react";
import { ArtifactBlock } from "@/types/artisan-block.types";
import { Package, Upload, X, Loader2, ExternalLink } from "lucide-react";

interface ArtifactBlockEditorProps {
  block: ArtifactBlock;
  onChange: (block: ArtifactBlock) => void;
  onFileUpload?: (file: File) => Promise<{ preview: string }>;
}

export function ArtifactBlockEditor({
  block,
  onChange,
  onFileUpload,
}: ArtifactBlockEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { imageUrl, name, material, dimensions, detailUrl } = block.data;

  const updateData = (updates: Partial<ArtifactBlock["data"]>) => {
    onChange({ ...block, data: { ...block.data, ...updates } });
  };

  const handleFileUpload = async (file: File) => {
    if (!onFileUpload) return;

    setIsUploading(true);
    try {
      const { preview } = await onFileUpload(file);
      updateData({ imageUrl: preview });
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-gray-700">
        <Package className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wide">
          Artifact (Sản phẩm B2B)
        </span>
      </div>

      {/* Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) =>
          e.target.files?.[0] && handleFileUpload(e.target.files[0])
        }
        className="hidden"
      />

      {imageUrl ? (
        <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
          <img
            src={imageUrl}
            alt={name || "Product"}
            className="w-full h-48 object-contain"
          />
          <button
            type="button"
            onClick={() => updateData({ imageUrl: "" })}
            className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-500 rounded-full shadow hover:bg-white"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded">
            Ảnh sản phẩm + packaging
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50/50 transition-all"
        >
          {isUploading ? (
            <Loader2 className="w-8 h-8 mx-auto text-orange-500 animate-spin" />
          ) : (
            <>
              <Package className="w-10 h-10 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 font-medium">
                Upload ảnh sản phẩm
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Khuyên dùng: Ảnh sản phẩm kèm packaging/hộp
              </p>
            </>
          )}
        </button>
      )}

      {/* Product Info */}
      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">
            Tên sản phẩm *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => updateData({ name: e.target.value })}
            placeholder="VD: Bình gốm Bát Tràng cao cấp"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              Chất liệu
            </label>
            <input
              type="text"
              value={material || ""}
              onChange={(e) => updateData({ material: e.target.value })}
              placeholder="VD: Gốm sứ cao cấp"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              Kích thước
            </label>
            <input
              type="text"
              value={dimensions || ""}
              onChange={(e) => updateData({ dimensions: e.target.value })}
              placeholder="VD: 15x10x8 cm"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            Link chi tiết (tùy chọn)
          </label>
          <input
            type="text"
            value={detailUrl || ""}
            onChange={(e) => updateData({ detailUrl: e.target.value })}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>
      </div>

      {/* B2B Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-700">
          💼 <strong>B2B Focus:</strong> Artifact block hiển thị sản phẩm trong
          ngữ cảnh doanh nghiệp. Không hiển thị giá - khách hàng sẽ liên hệ để
          báo giá.
        </p>
      </div>
    </div>
  );
}
