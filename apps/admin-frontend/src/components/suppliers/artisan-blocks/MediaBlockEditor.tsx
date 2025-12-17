// apps/admin-frontend/src/components/suppliers/artisan-blocks/MediaBlockEditor.tsx
// Media block: Image Macro, Audio, or Video Loop

import { useRef, useState } from "react";
import { MediaBlock, MediaType } from "@/types/artisan-block.types";
import {
  Music,
  Upload,
  X,
  Loader2,
  ZoomIn,
  Volume2,
  RotateCw,
} from "lucide-react";

interface MediaBlockEditorProps {
  block: MediaBlock;
  onChange: (block: MediaBlock) => void;
  onFileUpload?: (file: File) => Promise<{ preview: string }>;
}

const MEDIA_TYPES: {
  type: MediaType;
  label: string;
  icon: any;
  desc: string;
}[] = [
  {
    type: "image",
    label: "Ảnh Macro",
    icon: ZoomIn,
    desc: "Zoom chi tiết sản phẩm",
  },
  { type: "audio", label: "Audio", icon: Volume2, desc: "Tiếng gõ, chất liệu" },
  {
    type: "video_loop",
    label: "Video Loop",
    icon: RotateCw,
    desc: "GIF 5s xoay sản phẩm",
  },
];

export function MediaBlockEditor({
  block,
  onChange,
  onFileUpload,
}: MediaBlockEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const mediaType = block.content.mediaType;
  const hasMedia = block.content.url || block.content.preview;

  const handleMediaTypeChange = (type: MediaType) => {
    onChange({
      ...block,
      content: {
        ...block.content,
        mediaType: type,
        url: undefined,
        preview: undefined,
        file: undefined,
      },
    });
  };

  const handleFileSelect = async (file: File) => {
    if (!onFileUpload) return;

    // Validate file type
    const isImage = file.type.startsWith("image/");
    const isAudio = file.type.startsWith("audio/");
    const isVideo = file.type.startsWith("video/");

    if (mediaType === "image" && !isImage) {
      alert("Vui lòng chọn file ảnh");
      return;
    }
    if (mediaType === "audio" && !isAudio) {
      alert("Vui lòng chọn file audio (MP3, WAV...)");
      return;
    }
    if (mediaType === "video_loop" && !isVideo && !isImage) {
      alert("Vui lòng chọn file video hoặc GIF");
      return;
    }

    setIsUploading(true);
    try {
      const { preview } = await onFileUpload(file);
      onChange({
        ...block,
        content: {
          ...block.content,
          preview,
          file,
        },
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

  const handleRemoveMedia = () => {
    onChange({
      ...block,
      content: {
        ...block.content,
        url: undefined,
        preview: undefined,
        file: undefined,
      },
    });
  };

  const handleCaptionChange = (caption: string) => {
    onChange({
      ...block,
      content: { ...block.content, caption },
    });
  };

  const getAcceptType = () => {
    switch (mediaType) {
      case "image":
        return "image/*";
      case "audio":
        return "audio/*";
      case "video_loop":
        return "video/*,image/gif";
      default:
        return "*/*";
    }
  };

  return (
    <div className="space-y-4">
      {/* Media Type Selector */}
      <div className="grid grid-cols-3 gap-2">
        {MEDIA_TYPES.map(({ type, label, icon: Icon, desc }) => (
          <button
            key={type}
            type="button"
            onClick={() => handleMediaTypeChange(type)}
            className={`p-3 rounded-lg border-2 transition-all text-left ${
              mediaType === type
                ? "border-orange-500 bg-orange-50"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <Icon
              className={`w-5 h-5 mb-1 ${
                mediaType === type ? "text-orange-600" : "text-gray-400"
              }`}
            />
            <p
              className={`text-xs font-medium ${
                mediaType === type ? "text-orange-900" : "text-gray-700"
              }`}
            >
              {label}
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">{desc}</p>
          </button>
        ))}
      </div>

      {/* Upload Area */}
      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptType()}
        onChange={(e) =>
          e.target.files?.[0] && handleFileSelect(e.target.files[0])
        }
        className="hidden"
      />

      {hasMedia ? (
        <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
          {/* Preview based on media type */}
          {mediaType === "image" && (
            <img
              src={block.content.preview || block.content.url}
              alt={block.content.alt || "Preview"}
              className="w-full h-48 object-contain bg-white"
            />
          )}
          {mediaType === "audio" && (
            <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Music className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Audio File
                  </p>
                  <p className="text-xs text-gray-500">
                    {block.content.file?.name || "Uploaded"}
                  </p>
                </div>
              </div>
              <audio
                src={block.content.preview || block.content.url}
                controls
                className="w-full h-10"
              />
            </div>
          )}
          {mediaType === "video_loop" && (
            <video
              src={block.content.preview || block.content.url}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-48 object-contain bg-black"
            />
          )}

          {/* Remove Button */}
          <button
            type="button"
            onClick={handleRemoveMedia}
            className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-500 rounded-full shadow hover:bg-white transition-all"
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
          className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
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
                {mediaType === "image" &&
                  "JPG, PNG, WebP (khuyên dùng ảnh macro)"}
                {mediaType === "audio" && "MP3, WAV, OGG"}
                {mediaType === "video_loop" && "MP4, WebM, GIF (tối đa 5s)"}
              </p>
            </>
          )}
        </div>
      )}

      {/* Caption */}
      {hasMedia && (
        <input
          type="text"
          value={block.content.caption || ""}
          onChange={(e) => handleCaptionChange(e.target.value)}
          placeholder="Chú thích media (tùy chọn)..."
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-orange-500/30"
        />
      )}
    </div>
  );
}
