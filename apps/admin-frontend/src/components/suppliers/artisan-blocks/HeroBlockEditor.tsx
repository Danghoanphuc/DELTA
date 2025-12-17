// apps/admin-frontend/src/components/suppliers/artisan-blocks/HeroBlockEditor.tsx
// Hero Block - Visual Hook with Video/Image and Title Overlay

import { useRef, useState } from "react";
import { HeroBlock, BLOCK_LIMITS } from "@/types/artisan-block.types";
import { Film, Image, Upload, X, Loader2 } from "lucide-react";

interface HeroBlockEditorProps {
  block: HeroBlock;
  onChange: (block: HeroBlock) => void;
  onFileUpload?: (file: File) => Promise<{ preview: string }>;
}

export function HeroBlockEditor({
  block,
  onChange,
  onFileUpload,
}: HeroBlockEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const {
    mediaType,
    mediaUrl,
    title,
    subtitle,
    overlayOpacity = 50,
  } = block.data;

  const updateData = (updates: Partial<HeroBlock["data"]>) => {
    onChange({ ...block, data: { ...block.data, ...updates } });
  };

  const handleFileSelect = async (file: File) => {
    if (!onFileUpload) return;

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isVideo && !isImage) {
      alert("Vui lòng chọn file video hoặc ảnh");
      return;
    }

    setIsUploading(true);
    try {
      const { preview } = await onFileUpload(file);
      updateData({
        mediaUrl: preview,
        mediaType: isVideo ? "video" : "image",
      });
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  return (
    <div className="space-y-4">
      {/* Media Type Toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => updateData({ mediaType: "video", mediaUrl: "" })}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border-2 transition-all ${
            mediaType === "video"
              ? "border-orange-500 bg-orange-50 text-orange-700"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <Film className="w-4 h-4" />
          <span className="text-sm font-medium">Video</span>
        </button>
        <button
          type="button"
          onClick={() => updateData({ mediaType: "image", mediaUrl: "" })}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border-2 transition-all ${
            mediaType === "image"
              ? "border-orange-500 bg-orange-50 text-orange-700"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <Image className="w-4 h-4" />
          <span className="text-sm font-medium">Ảnh</span>
        </button>
      </div>

      {/* Media Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept={mediaType === "video" ? "video/*" : "image/*"}
        onChange={(e) =>
          e.target.files?.[0] && handleFileSelect(e.target.files[0])
        }
        className="hidden"
      />

      {mediaUrl ? (
        <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-black">
          {mediaType === "video" ? (
            <video
              src={mediaUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full aspect-video object-cover"
            />
          ) : (
            <img
              src={mediaUrl}
              alt="Hero"
              className="w-full aspect-video object-cover"
            />
          )}

          {/* Title Overlay Preview */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4"
            style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity / 100})` }}
          >
            <h2 className="text-xl font-bold">{title || "Tiêu đề..."}</h2>
            {subtitle && <p className="text-sm mt-1 opacity-80">{subtitle}</p>}
          </div>

          <button
            type="button"
            onClick={() => updateData({ mediaUrl: "" })}
            className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-500 rounded-full shadow hover:bg-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-all aspect-video ${
            dragOver
              ? "border-orange-500 bg-orange-50"
              : "border-gray-300 hover:border-orange-400 hover:bg-gray-50"
          }`}
        >
          {isUploading ? (
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 font-medium">
                Kéo thả hoặc click để upload
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {mediaType === "video"
                  ? "MP4, WebM (khuyên dùng loop ngắn)"
                  : "JPG, PNG, WebP"}
              </p>
            </>
          )}
        </div>
      )}

      {/* Title Input */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">
          Tiêu đề (H1)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) =>
            updateData({
              title: e.target.value.slice(0, BLOCK_LIMITS.HERO_TITLE_MAX_CHARS),
            })
          }
          placeholder="Tiêu đề bài viết..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
        />
        <p className="text-[10px] text-gray-400 mt-1 text-right">
          {title.length}/{BLOCK_LIMITS.HERO_TITLE_MAX_CHARS}
        </p>
      </div>

      {/* Subtitle Input */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">
          Phụ đề (tùy chọn)
        </label>
        <input
          type="text"
          value={subtitle || ""}
          onChange={(e) => updateData({ subtitle: e.target.value })}
          placeholder="Mô tả ngắn..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
        />
      </div>

      {/* Overlay Opacity */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">
          Độ tối overlay: {overlayOpacity}%
        </label>
        <input
          type="range"
          min="0"
          max="80"
          value={overlayOpacity}
          onChange={(e) =>
            updateData({ overlayOpacity: parseInt(e.target.value) })
          }
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
        />
      </div>

      {/* Hint */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-700">
          💡 Hero block tạo ấn tượng đầu tiên. Video auto-play/loop hoặc ảnh
          full-width. Không có CTA - chỉ cảm xúc thuần túy.
        </p>
      </div>
    </div>
  );
}
