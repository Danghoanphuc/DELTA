// apps/admin-frontend/src/components/products/form-sections/HeroSection.tsx
// Section 2: Hero & Tagline

import { Upload, X, Image as ImageIcon, Video } from "lucide-react";
import { StorytellingProductFormData } from "../../../types/storytelling-product";

interface HeroSectionProps {
  formData: StorytellingProductFormData;
  updateFormData: (updates: Partial<StorytellingProductFormData>) => void;
  errors: Record<string, string>;
}

export function HeroSection({
  formData,
  updateFormData,
  errors,
}: HeroSectionProps) {
  const handleMediaUpload = (type: "image" | "video") => {
    // TODO: Implement actual upload to Cloudinary/R2
    const mockUrl = `https://placehold.co/1920x1080?text=${type}`;
    updateFormData({
      heroMedia: {
        type,
        url: mockUrl,
        thumbnail: type === "video" ? mockUrl : undefined,
      },
    });
  };

  const removeMedia = () => {
    updateFormData({ heroMedia: undefined });
  };

  return (
    <div className="space-y-6">
      {/* Tagline */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tagline (Câu khẩu hiệu)
        </label>
        <input
          type="text"
          value={formData.tagline}
          onChange={(e) => updateFormData({ tagline: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
          placeholder="VD: Năng lượng từ đất mẹ - Vững chãi tựa bàn thạch"
          maxLength={100}
        />
        <p className="mt-1 text-xs text-gray-500">
          Câu ngắn gọn, ấn tượng (tối đa 100 ký tự)
        </p>
      </div>

      {/* Hero Media */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ảnh/Video Hero
        </label>

        {!formData.heroMedia ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Chọn ảnh hoặc video cho Hero section
              </p>
              <div className="mt-4 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleMediaUpload("image")}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <ImageIcon className="w-4 h-4 inline mr-2" />
                  Upload Ảnh
                </button>
                <button
                  type="button"
                  onClick={() => handleMediaUpload("video")}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Video className="w-4 h-4 inline mr-2" />
                  Upload Video
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              {formData.heroMedia.type === "image" ? (
                <img
                  src={formData.heroMedia.url}
                  alt="Hero"
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="relative w-full h-64 bg-gray-900 flex items-center justify-center">
                  <Video className="w-16 h-16 text-white" />
                  <span className="absolute bottom-4 left-4 px-2 py-1 bg-black/70 text-white text-xs rounded">
                    Video
                  </span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={removeMedia}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
