// apps/admin-frontend/src/components/suppliers/artisan-blocks/InteractiveBlockEditor.tsx
// Interactive Block - Audio Player, Zoom Viewer, Comparison Slider

import { useRef, useState } from "react";
import { InteractiveBlock, InteractiveType } from "@/types/artisan-block.types";
import { Volume2, ZoomIn, Columns, Upload, X, Loader2 } from "lucide-react";

interface InteractiveBlockEditorProps {
  block: InteractiveBlock;
  onChange: (block: InteractiveBlock) => void;
  onFileUpload?: (file: File) => Promise<{ preview: string }>;
}

const INTERACTIVE_TYPES: {
  type: InteractiveType;
  label: string;
  icon: any;
  desc: string;
}[] = [
  { type: "audio", label: "Audio", icon: Volume2, desc: "Tiếng gõ, chất liệu" },
  { type: "zoom", label: "Zoom", icon: ZoomIn, desc: "Ảnh macro chi tiết" },
  {
    type: "comparison_slider",
    label: "So sánh",
    icon: Columns,
    desc: "Before/After slider",
  },
];

export function InteractiveBlockEditor({
  block,
  onChange,
  onFileUpload,
}: InteractiveBlockEditorProps) {
  const audioInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const {
    interactiveType,
    audioUrl,
    audioLabel,
    zoomImageUrl,
    zoomCaption,
    beforeImageUrl,
    afterImageUrl,
    comparisonLabel,
  } = block.data;

  const updateData = (updates: Partial<InteractiveBlock["data"]>) => {
    onChange({ ...block, data: { ...block.data, ...updates } });
  };

  const handleFileUpload = async (
    file: File,
    field: "audioUrl" | "zoomImageUrl" | "beforeImageUrl" | "afterImageUrl"
  ) => {
    if (!onFileUpload) return;

    setIsUploading(true);
    try {
      const { preview } = await onFileUpload(file);
      updateData({ [field]: preview });
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Type Selector */}
      <div className="grid grid-cols-3 gap-2">
        {INTERACTIVE_TYPES.map(({ type, label, icon: Icon, desc }) => (
          <button
            key={type}
            type="button"
            onClick={() => updateData({ interactiveType: type })}
            className={`p-3 rounded-lg border-2 transition-all text-left ${
              interactiveType === type
                ? "border-orange-500 bg-orange-50"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <Icon
              className={`w-5 h-5 mb-1 ${
                interactiveType === type ? "text-orange-600" : "text-gray-400"
              }`}
            />
            <p
              className={`text-xs font-medium ${
                interactiveType === type ? "text-orange-900" : "text-gray-700"
              }`}
            >
              {label}
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">{desc}</p>
          </button>
        ))}
      </div>

      {/* Audio Player Editor */}
      {interactiveType === "audio" && (
        <div className="space-y-3">
          <input
            ref={audioInputRef}
            type="file"
            accept="audio/*"
            onChange={(e) =>
              e.target.files?.[0] &&
              handleFileUpload(e.target.files[0], "audioUrl")
            }
            className="hidden"
          />

          {audioUrl ? (
            <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Volume2 className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Audio File
                  </p>
                  <button
                    type="button"
                    onClick={() => updateData({ audioUrl: "" })}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    Xóa
                  </button>
                </div>
              </div>
              <audio src={audioUrl} controls className="w-full h-10" />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => audioInputRef.current?.click()}
              disabled={isUploading}
              className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50/50 transition-all"
            >
              {isUploading ? (
                <Loader2 className="w-8 h-8 mx-auto text-purple-500 animate-spin" />
              ) : (
                <>
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Upload file audio (MP3, WAV)
                  </p>
                </>
              )}
            </button>
          )}

          <input
            type="text"
            value={audioLabel || ""}
            onChange={(e) => updateData({ audioLabel: e.target.value })}
            placeholder="Label: VD: Chạm để nghe tiếng gốm..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />
        </div>
      )}

      {/* Zoom Viewer Editor */}
      {interactiveType === "zoom" && (
        <div className="space-y-3">
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={(e) =>
              e.target.files?.[0] &&
              handleFileUpload(e.target.files[0], "zoomImageUrl")
            }
            className="hidden"
          />

          {zoomImageUrl ? (
            <div className="relative rounded-lg overflow-hidden border border-gray-200">
              <img
                src={zoomImageUrl}
                alt="Zoom"
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-1">
                <span className="px-2 py-1 bg-black/60 text-white text-xs rounded-full flex items-center gap-1">
                  <ZoomIn className="w-3 h-3" /> Macro
                </span>
                <button
                  type="button"
                  onClick={() => updateData({ zoomImageUrl: "" })}
                  className="p-1.5 bg-white/90 text-red-500 rounded-full hover:bg-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={isUploading}
              className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50/50 transition-all"
            >
              {isUploading ? (
                <Loader2 className="w-8 h-8 mx-auto text-green-500 animate-spin" />
              ) : (
                <>
                  <ZoomIn className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Upload ảnh macro (độ phân giải cao)
                  </p>
                </>
              )}
            </button>
          )}

          <input
            type="text"
            value={zoomCaption || ""}
            onChange={(e) => updateData({ zoomCaption: e.target.value })}
            placeholder="Caption: VD: Chi tiết vết rạn men..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
          />
        </div>
      )}

      {/* Comparison Slider Editor */}
      {interactiveType === "comparison_slider" && (
        <div className="space-y-3">
          <input
            ref={beforeInputRef}
            type="file"
            accept="image/*"
            onChange={(e) =>
              e.target.files?.[0] &&
              handleFileUpload(e.target.files[0], "beforeImageUrl")
            }
            className="hidden"
          />
          <input
            ref={afterInputRef}
            type="file"
            accept="image/*"
            onChange={(e) =>
              e.target.files?.[0] &&
              handleFileUpload(e.target.files[0], "afterImageUrl")
            }
            className="hidden"
          />

          <div className="grid grid-cols-2 gap-3">
            {/* Before Image */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                Before
              </label>
              {beforeImageUrl ? (
                <div className="relative rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={beforeImageUrl}
                    alt="Before"
                    className="w-full h-32 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => updateData({ beforeImageUrl: "" })}
                    className="absolute top-1 right-1 p-1 bg-white/90 text-red-500 rounded-full hover:bg-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => beforeInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-all flex flex-col items-center justify-center"
                >
                  <Upload className="w-5 h-5 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">Before</span>
                </button>
              )}
            </div>

            {/* After Image */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                After
              </label>
              {afterImageUrl ? (
                <div className="relative rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={afterImageUrl}
                    alt="After"
                    className="w-full h-32 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => updateData({ afterImageUrl: "" })}
                    className="absolute top-1 right-1 p-1 bg-white/90 text-red-500 rounded-full hover:bg-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => afterInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-all flex flex-col items-center justify-center"
                >
                  <Upload className="w-5 h-5 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">After</span>
                </button>
              )}
            </div>
          </div>

          <input
            type="text"
            value={comparisonLabel || ""}
            onChange={(e) => updateData({ comparisonLabel: e.target.value })}
            placeholder="Label: VD: Trước/Sau khi nung..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      )}

      {/* Hint */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <p className="text-xs text-amber-700">
          💡 Interactive block tạo trải nghiệm tương tác. Người dùng có thể nghe
          âm thanh, zoom ảnh, hoặc kéo slider so sánh.
        </p>
      </div>
    </div>
  );
}
